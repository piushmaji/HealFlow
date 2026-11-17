/**
 * Doctor Controller for HealFlow Backend
 * Manages Doctor Profiles, Availability Days, Custom Slots, Real Appointments, and Live Queue Caller
 */
import { supabase } from '../config/supabase.js';

// Default mock fallbacks if doctor table is empty
const DEFAULT_DOCTOR_HOURS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:15 AM',
  '02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM', '05:00 PM'
];

/**
 * 1. GET ALL DOCTORS
 */
export const getAllDoctors = async (req, res, next) => {
  try {
    const { specialty, is_active } = req.query;
    let query = supabase.from('doctors').select('*');

    if (specialty && specialty !== 'all') {
      query = query.ilike('specialty', `%${specialty}%`);
    }
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: doctors, error } = await query.order('rating', { ascending: false });

    if (error) throw error;
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. GET DOCTOR PROFILE BY ID (OR PROFILE_ID)
 */
export const getDoctorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if queried by doctor id or profile_id
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('*')
      .or(`id.eq.${id},profile_id.eq.${id}`)
      .maybeSingle();

    if (error) throw error;
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Also get the live queue for this doctor
    const { data: queue } = await supabase
      .from('queues')
      .select('*')
      .eq('doctor_id', doctor.id)
      .maybeSingle();

    // Get slots for this doctor
    const { data: slots } = await supabase
      .from('doctor_slots')
      .select('*')
      .eq('doctor_id', doctor.id)
      .order('slot_date', { ascending: true });

    res.json({
      success: true,
      data: {
        ...doctor,
        queue: queue || null,
        slots: slots || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. UPDATE DOCTOR PROFILE
 * Allows updating bio, specialty, hospital, consultation_fee, room_number,
 * languages, consultation_mode, accepts_new_patients, avatar_url, etc.
 */
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      title,
      specialty,
      experience_years,
      hospital,
      consultation_fee,
      room_number,
      avatar_url,
      bio,
      languages,
      consultation_mode,
      accepts_new_patients,
      is_active,
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (title !== undefined) updateFields.title = title;
    if (specialty !== undefined) updateFields.specialty = specialty;
    if (experience_years !== undefined) updateFields.experience_years = Number(experience_years);
    if (hospital !== undefined) updateFields.hospital = hospital;
    if (consultation_fee !== undefined) updateFields.consultation_fee = Number(consultation_fee);
    if (room_number !== undefined) updateFields.room_number = room_number;
    if (avatar_url !== undefined) updateFields.avatar_url = avatar_url;
    if (bio !== undefined) updateFields.bio = bio;
    if (languages !== undefined) updateFields.languages = languages;
    if (consultation_mode !== undefined) updateFields.consultation_mode = consultation_mode;
    if (accepts_new_patients !== undefined) updateFields.accepts_new_patients = accepts_new_patients;
    if (is_active !== undefined) updateFields.is_active = is_active;

    let updatedDoc = null;
    const { data, error } = await supabase
      .from('doctors')
      .update(updateFields)
      .or(`id.eq.${id},profile_id.eq.${id}`)
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      updatedDoc = data[0];
    } else {
      // Record doesn't exist yet in doctors table! Insert a new row (UPSERT by profile_id / id)
      const insertPayload = {
        profile_id: id,
        name: name || 'Doctor',
        title: title || null,
        specialty: specialty || 'General Medicine',
        hospital: hospital || null,
        room_number: room_number || null,
        consultation_fee: consultation_fee ? Number(consultation_fee) : 0,
        experience_years: experience_years ? Number(experience_years) : 0,
        bio: bio || null,
        avatar_url: avatar_url || null,
        languages: languages || ['English'],
        consultation_mode: consultation_mode || ['In-person'],
        accepts_new_patients: accepts_new_patients ?? true,
        is_active: is_active ?? true,
      };

      const { data: insertData, error: insertErr } = await supabase
        .from('doctors')
        .upsert(insertPayload, { onConflict: 'profile_id' })
        .select();

      if (insertErr) {
        // If conflict on profile_id wasn't set, try plain insert
        const { data: directInsert, error: directErr } = await supabase
          .from('doctors')
          .insert([insertPayload])
          .select();
        if (directErr) throw directErr;
        updatedDoc = directInsert && directInsert[0];
      } else {
        updatedDoc = insertData && insertData[0];
      }
    }
    if (updatedDoc?.profile_id) {
      const profileUpdates = {};
      if (name) profileUpdates.full_name = name;
      if (avatar_url) profileUpdates.avatar_url = avatar_url;
      if (Object.keys(profileUpdates).length > 0) {
        await supabase.from('profiles').update(profileUpdates).eq('id', updatedDoc.profile_id);
      }
    }

    res.json({ success: true, message: 'Doctor profile updated successfully', data: updatedDoc });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. GET DOCTOR APPOINTMENTS & QUEUE (FOR DOCTOR DASHBOARD)
 */
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, status } = req.query;

    // Resolve doctor ID (in case id is profile_id)
    const { data: doc } = await supabase
      .from('doctors')
      .select('id, name, specialty, room_number')
      .or(`id.eq.${id},profile_id.eq.${id}`)
      .maybeSingle();

    const targetDocId = doc?.id || id;

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', targetDocId);

    if (date) {
      query = query.eq('slot_date', date);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: appointments, error } = await query.order('slot_date', { ascending: true }).order('token_index', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      doctor: doc || null,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. UPDATE APPOINTMENT STATUS (e.g. Mark 'In Session', 'Completed', 'Cancelled')
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!['Scheduled', 'Checked In', 'In Session', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status' });
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select();

    if (error) throw error;
    res.json({ success: true, message: `Appointment marked as ${status}`, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * 6. LIVE QUEUE CALLER: CALL NEXT PATIENT OR ADVANCE TOKEN
 */
export const callNextPatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Resolve doctor
    const { data: doc } = await supabase
      .from('doctors')
      .select('id, specialty, room_number')
      .or(`id.eq.${id},profile_id.eq.${id}`)
      .maybeSingle();

    const docId = doc?.id || id;
    const prefix = (doc?.specialty || 'OPD').substring(0, 4).toUpperCase();

    // Get current queue
    const { data: currentQueue } = await supabase
      .from('queues')
      .select('*')
      .eq('doctor_id', docId)
      .maybeSingle();

    let nextToken = `${prefix}-001`;
    let remainingQueue = 0;

    // 1. Fetch all today's appointments for this doctor sorted by token_index or created_at
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: doctorApts } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', docId)
      .order('token_index', { ascending: true });

    // Look for scheduled or in-waiting appointment
    const waitingApt = (doctorApts || []).find((a) => a.status === 'Scheduled' || a.status === 'Checked In');

    if (waitingApt) {
      nextToken = waitingApt.token_number;
    } else if (currentQueue) {
      const parts = (currentQueue.current_token || `${prefix}-000`).split('-');
      const currentNum = parseInt(parts[1] || '0', 10);
      const nextNum = currentNum + 1;
      nextToken = `${prefix}-${String(nextNum).padStart(3, '0')}`;
    }

    if (currentQueue) {
      remainingQueue = Math.max(0, (currentQueue.total_in_queue || 1) - 1);

      await supabase
        .from('queues')
        .update({
          current_token: nextToken,
          serving_patient: waitingApt ? waitingApt.patient_name : `Patient Token #${nextToken}`,
          total_in_queue: remainingQueue,
          last_updated: new Date().toISOString(),
        })
        .eq('id', currentQueue.id);
    } else {
      await supabase.from('queues').insert({
        doctor_id: docId,
        current_token: nextToken,
        serving_patient: waitingApt ? waitingApt.patient_name : 'Patient Token #1',
        total_in_queue: 0,
        status: 'ACTIVE',
      });
    }

    // Automatically transition the appointment with this token to 'In Session'
    let updatedAppointment = null;
    if (waitingApt) {
      const { data: updatedAptData } = await supabase
        .from('appointments')
        .update({ status: 'In Session' })
        .eq('id', waitingApt.id)
        .select();
      updatedAppointment = updatedAptData?.[0] || waitingApt;
    } else {
      const { data: updatedAptData } = await supabase
        .from('appointments')
        .update({ status: 'In Session' })
        .eq('doctor_id', docId)
        .eq('token_number', nextToken)
        .select();
      updatedAppointment = updatedAptData?.[0] || null;
    }

    res.json({
      success: true,
      message: `Token ${nextToken} called successfully`,
      current_token: nextToken,
      remaining_in_queue: remainingQueue,
      appointment: updatedAppointment,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 7. REAL-TIME CONSULTATION CHAT MESSAGES (SECURE APPOINTMENT ISOLATION)
 */
export const getConsultationMessages = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .contains('metadata', { appointment_id: appointmentId })
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    next(err);
  }
};

export const sendConsultationMessage = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { sender, content, sender_email, sender_role, image_url, file_name, file_type } = req.body;

    if (!content && !image_url) {
      return res.status(400).json({ success: false, message: 'Message content or image attachment required' });
    }

    const messageText = (content || '').trim() || (image_url ? (sender_role === 'doctor' ? '[Prescription / Clinical Rx Image]' : '[Medical Report / Prescription Image]') : '');

    // 1. Ensure chat session exists for this appointment
    const { data: existingSessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('title', `Consultation-${appointmentId}`)
      .limit(1);

    let sessionId = existingSessions?.[0]?.id;

    if (!sessionId) {
      const { data: newSession, error: sessErr } = await supabase
        .from('chat_sessions')
        .insert({
          title: `Consultation-${appointmentId}`,
        })
        .select();

      if (sessErr) throw sessErr;
      sessionId = newSession[0].id;
    }

    // 2. Insert chat message into chat_messages
    const msgMetadata = {
      appointment_id: appointmentId,
      sender_name: sender,
      sender_email: sender_email || '',
      sender_role: sender_role || 'patient',
      created_at: new Date().toISOString(),
    };

    if (image_url) {
      msgMetadata.type = 'image';
      msgMetadata.image_url = image_url;
      msgMetadata.file_name = file_name || 'prescription.jpg';
      msgMetadata.file_type = file_type || 'image/jpeg';
    }

    const { data: newMsg, error: msgErr } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender: sender_role === 'doctor' ? 'system' : 'user', // DB constraint check ('user', 'ai', 'system')
        content: messageText,
        metadata: msgMetadata,
      })
      .select();

    if (msgErr) throw msgErr;

    res.json({ success: true, message: 'Message delivered', data: newMsg[0] });
  } catch (err) {
    next(err);
  }
};

// In-memory active call signaling store for WebRTC / Call Presence
const activeCallSessions = new Map();

/**
 * 8. GET & UPDATE REAL-TIME CALL SIGNALING / WEBRTC PEER CONNECTION
 */
export const getCallSignal = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const sessionData = activeCallSessions.get(appointmentId) || {
      callState: 'IDLE', // 'RINGING' | 'CONNECTED' | 'ENDED'
      callType: null,   // 'audio' | 'video'
      caller: null,     // { role: 'doctor'|'patient', name: string }
      participants: {}, // { doctor: true, patient: true }
      offers: {},       // { doctor: sdpOffer, patient: sdpOffer }
      answers: {},      // { doctor: sdpAnswer, patient: sdpAnswer }
      iceCandidates: { doctor: [], patient: [] },
      updatedAt: Date.now(),
    };
    res.json({ success: true, data: sessionData });
  } catch (err) {
    next(err);
  }
};

export const updateCallSignal = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { action, callType, senderRole, senderName, offer, answer, candidate } = req.body;

    let current = activeCallSessions.get(appointmentId) || {
      callState: 'IDLE',
      callType: null,
      caller: null,
      participants: {},
      offers: {},
      answers: {},
      iceCandidates: { doctor: [], patient: [] },
      updatedAt: Date.now(),
    };

    if (action === 'START_CALL') {
      current = {
        callState: 'RINGING',
        callType: callType || 'video',
        caller: { role: senderRole, name: senderName },
        participants: { [senderRole]: true },
        offers: offer && senderRole ? { [senderRole]: offer } : {},
        answers: {},
        iceCandidates: { doctor: [], patient: [] },
        updatedAt: Date.now(),
      };
    } else if (action === 'OFFER') {
      if (!current.offers) current.offers = {};
      current.offers[senderRole] = offer;
      current.updatedAt = Date.now();
    } else if (action === 'ACCEPT_CALL') {
      current.callState = 'CONNECTED';
      current.participants[senderRole] = true;
      if (answer && senderRole) {
        if (!current.answers) current.answers = {};
        current.answers[senderRole] = answer;
      }
      current.updatedAt = Date.now();
    } else if (action === 'ANSWER') {
      if (!current.answers) current.answers = {};
      current.answers[senderRole] = answer;
      current.updatedAt = Date.now();
    } else if (action === 'ICE_CANDIDATE') {
      if (!current.iceCandidates) current.iceCandidates = { doctor: [], patient: [] };
      if (senderRole && candidate) {
        if (!current.iceCandidates[senderRole]) current.iceCandidates[senderRole] = [];
        current.iceCandidates[senderRole].push(candidate);
      }
      current.updatedAt = Date.now();
    } else if (action === 'END_CALL') {
      current = {
        callState: 'IDLE',
        callType: null,
        caller: null,
        participants: {},
        offers: {},
        answers: {},
        iceCandidates: { doctor: [], patient: [] },
        updatedAt: Date.now(),
      };
    } else if (action === 'HEARTBEAT') {
      current.participants[senderRole] = true;
      current.updatedAt = Date.now();
    }

    activeCallSessions.set(appointmentId, current);
    res.json({ success: true, data: current });
  } catch (err) {
    next(err);
  }
};

/**
 * 7. MANAGE DOCTOR AVAILABILITY & SLOTS
 * Set custom available dates and time slots in doctor_slots
 */
export const getDoctorSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const { data: doc } = await supabase
      .from('doctors')
      .select('id')
      .or(`id.eq.${id},profile_id.eq.${id}`)
      .maybeSingle();

    const docId = doc?.id || id;

    let query = supabase.from('doctor_slots').select('*').eq('doctor_id', docId);
    if (date) {
      query = query.eq('slot_date', date);
    }

    const { data: slots, error } = await query.order('slot_date', { ascending: true });
    if (error) throw error;

    res.json({ success: true, count: slots.length, data: slots });
  } catch (err) {
    next(err);
  }
};

export const createDoctorSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, slots } = req.body; // slots: ['09:00 AM', '10:00 AM']

    const { data: doc } = await supabase
      .from('doctors')
      .select('id')
      .or(`id.eq.${id},profile_id.eq.${id}`)
      .maybeSingle();

    const docId = doc?.id || id;
    const slotTimes = Array.isArray(slots) && slots.length > 0 ? slots : DEFAULT_DOCTOR_HOURS;

    const slotRecords = slotTimes.map((time) => ({
      doctor_id: docId,
      slot_date: date || new Date().toISOString().split('T')[0],
      slot_time: time,
      is_booked: false,
    }));

    const { data, error } = await supabase.from('doctor_slots').insert(slotRecords).select();
    if (error) throw error;

    res.json({ success: true, message: `Created ${data.length} slots for ${date}`, data });
  } catch (err) {
    next(err);
  }
};

/**
 * 8. GET LIVE DOCTOR BUSY & QUEUE STATUS FOR APPOINTMENT BOOKING
 * Tells patient if doctor is currently on a call, in a consultation, or available,
 * and calculates dynamic estimated waiting time.
 */
export const getDoctorLiveWorkload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Resolve doctor ID
    const { data: doc } = await supabase
      .from('doctors')
      .select('id, name, specialty, room_number')
      .or(`id.eq.${id},profile_id.eq.${id}`)
      .maybeSingle();

    const docId = doc?.id || id;

    // 1. Fetch appointments for this doctor on targetDate
    const { data: appointments, error: aptErr } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', docId)
      .eq('slot_date', targetDate);

    if (aptErr) throw aptErr;

    // 2. Fetch live queue status from public.queues
    const { data: queueRow } = await supabase
      .from('queues')
      .select('*')
      .eq('doctor_id', docId)
      .maybeSingle();

    const activeApts = (appointments || []).filter(
      (a) => a.status === 'Scheduled' || a.status === 'In Session' || a.status === 'Checked In'
    );

    // Check if doctor is currently attending a call / in consultation session
    const currentInSessionApt = (appointments || []).find((a) => a.status === 'In Session');
    const isCurrentlyOnCall = Boolean(currentInSessionApt);

    // Calculate queue depth per slot
    const slotQueues = {};
    (activeApts || []).forEach((a) => {
      if (a.slot_time) {
        slotQueues[a.slot_time] = (slotQueues[a.slot_time] || 0) + 1;
      }
    });

    const totalBookings = activeApts.length;
    const servingToken = queueRow?.current_token || currentInSessionApt?.token_number || null;
    const waitingInQueue = queueRow?.total_in_queue ?? totalBookings;
    const estimatedWaitMins = (waitingInQueue + (isCurrentlyOnCall ? 1 : 0)) * 12; // ~12 mins average per patient

    // Status description string
    let liveStatus = 'Available';
    let statusDescription = 'Doctor is ready in OPD chamber.';

    if (isCurrentlyOnCall) {
      liveStatus = 'In Active Call / Consultation';
      statusDescription = `Currently attending patient (${currentInSessionApt.patient_name || 'In Consultation'}). Your turn will follow in queue.`;
    } else if (waitingInQueue >= 5) {
      liveStatus = 'High Demand / Busy';
      statusDescription = `${waitingInQueue} patients currently waiting in line.`;
    } else if (waitingInQueue > 0) {
      liveStatus = 'Attending Queue';
      statusDescription = `${waitingInQueue} patient(s) waiting outside room.`;
    }

    res.json({
      success: true,
      data: {
        doctor_id: docId,
        date: targetDate,
        isCurrentlyOnCall,
        currentPatientName: currentInSessionApt ? currentInSessionApt.patient_name : null,
        currentToken: servingToken,
        liveStatus,
        statusDescription,
        totalBookings,
        waitingInQueue,
        estimatedWaitMins,
        slotQueues,
        queueStatus: queueRow?.status || 'ACTIVE',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 9. CREATE APPOINTMENT (DIRECT BACKEND PERSISTENCE WITH QUEUE ADVANCE)
 */
export const bookDoctorAppointment = async (req, res, next) => {
  try {
    const {
      doctor_id,
      patient_id,
      patient_name,
      patient_email,
      patient_phone,
      specialty,
      date,
      slot_date,
      time,
      slot_time,
      reason,
      notes,
    } = req.body;

    if (!doctor_id || !patient_name) {
      return res.status(400).json({ success: false, message: 'Doctor ID and patient name are required' });
    }

    // Resolve doctor details
    const { data: doc } = await supabase
      .from('doctors')
      .select('id, name, specialty, hospital, room_number, avatar_url')
      .or(`id.eq.${doctor_id},profile_id.eq.${doctor_id}`)
      .maybeSingle();

    const docId = doc?.id || doctor_id;
    const finalDate = slot_date || date || new Date().toISOString().split('T')[0];
    const finalTime = slot_time || time || '10:30 AM';
    const spec = specialty || doc?.specialty || 'General';
    const prefix = spec.substring(0, 4).toUpperCase();

    // Query existing queue or count for this doctor
    const { data: existingQueue } = await supabase
      .from('queues')
      .select('*')
      .eq('doctor_id', docId)
      .maybeSingle();

    const currentTotalInQueue = existingQueue?.total_in_queue || 0;
    const nextTokenIndex = currentTotalInQueue + 1;
    const tokenNumber = `${prefix}-${String(nextTokenIndex).padStart(3, '0')}`;

    // Insert into appointments table
    const appointmentPayload = {
      patient_id: patient_id || null,
      doctor_id: docId,
      patient_name: patient_name.trim(),
      patient_email: (patient_email || '').trim().toLowerCase(),
      patient_phone: (patient_phone || '').trim(),
      specialty: spec,
      slot_date: finalDate,
      slot_time: finalTime,
      reason: reason || notes || null,
      token_number: tokenNumber,
      token_index: nextTokenIndex,
      status: 'Scheduled',
    };

    const { data: newAppointment, error: insertError } = await supabase
      .from('appointments')
      .insert([appointmentPayload])
      .select()
      .single();

    if (insertError) throw insertError;

    // Update or initialize queue in public.queues
    if (existingQueue) {
      await supabase
        .from('queues')
        .update({
          total_in_queue: (existingQueue.total_in_queue || 0) + 1,
          last_updated: new Date().toISOString(),
        })
        .eq('id', existingQueue.id);
    } else {
      await supabase.from('queues').insert({
        doctor_id: docId,
        current_token: `${prefix}-001`,
        serving_patient: 'Regular Walk-in',
        total_in_queue: 1,
        status: 'ACTIVE',
        last_updated: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        ...newAppointment,
        doctor_name: doc?.name || 'Dr. Specialist',
        doctor_avatar: doc?.avatar_url || '',
        hospital: doc?.hospital || 'HealFlow Medical Center',
        room_number: doc?.room_number || 'Room 101',
      },
    });
  } catch (err) {
    next(err);
  }
};


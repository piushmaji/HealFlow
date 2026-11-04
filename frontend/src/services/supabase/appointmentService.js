import { supabase, isSupabaseConfigured } from './client';
import { formatTokenNumber } from '../../utils/formatters';
import { bookDoctorAppointmentInBackend } from '../doctorBackendService';

const isValidUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

/**
 * Create a new appointment in public.appointments table
 */
export const createAppointment = async (appointmentData) => {
  // First, attempt booking via Node.js Backend for guaranteed atomic queue and database persistence
  try {
    const backendResult = await bookDoctorAppointmentInBackend(appointmentData);
    if (backendResult && backendResult.id) {
      return backendResult;
    }
  } catch (err) {
    console.warn('[appointmentService] Backend booking fallback to direct Supabase:', err.message);
  }

  const tokenIndex = appointmentData.token_index || Math.floor(Math.random() * 15) + 1;
  const tokenNumber =
    appointmentData.token_number ||
    formatTokenNumber(appointmentData.specialty || 'CLN', tokenIndex);

  const slotDate =
    appointmentData.slot_date ||
    appointmentData.date ||
    new Date().toISOString().split('T')[0];

  const slotTime =
    appointmentData.slot_time ||
    appointmentData.time ||
    '10:00 AM';

  const appointmentRecord = {
    patient_id: isValidUUID(appointmentData.patient_id) ? appointmentData.patient_id : null,
    doctor_id: isValidUUID(appointmentData.doctor_id) ? appointmentData.doctor_id : null,
    patient_name: appointmentData.patient_name || 'Patient',
    patient_email: appointmentData.patient_email || '',
    patient_phone: appointmentData.patient_phone || '',
    specialty: appointmentData.specialty || 'General',
    slot_date: slotDate,
    slot_time: slotTime,
    reason: appointmentData.reason || appointmentData.notes || null,
    token_number: tokenNumber,
    token_index: tokenIndex,
    status: 'Scheduled',
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentRecord])
        .select(`
          *,
          doctors (
            id,
            name,
            title,
            specialty,
            hospital,
            room_number,
            avatar_url
          )
        `)
        .single();

      if (!error && data) {
        return {
          ...data,
          doctor_name: data.doctors?.name || appointmentData.doctor_name || 'Dr. Specialist',
          doctor_avatar: data.doctors?.avatar_url || appointmentData.doctor_avatar || '',
          room_number: data.doctors?.room_number || appointmentData.room_number || 'Room 101',
          hospital: data.doctors?.hospital || appointmentData.hospital || 'Smart Clinic',
          date: data.slot_date,
          time: data.slot_time,
        };
      }
      if (error) {
        console.warn('Supabase createAppointment DB error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase createAppointment exception:', err.message);
    }
  }

  // Fallback in-memory object if Supabase insert fails or offline
  return {
    id: `apt-${Date.now()}`,
    ...appointmentRecord,
    doctor_name: appointmentData.doctor_name || 'Dr. Specialist',
    doctor_avatar: appointmentData.doctor_avatar || '',
    room_number: appointmentData.room_number || 'Room 101',
    hospital: appointmentData.hospital || 'Smart Clinic',
    date: slotDate,
    time: slotTime,
    created_at: new Date().toISOString(),
  };
};

/**
 * Fetch patient's appointments from public.appointments table
 * Returns an empty array if none found - NO STATIC FAKE DATA!
 */
export const getPatientAppointments = async ({ patientId = null, patientEmail = null } = {}) => {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctors (
          id,
          name,
          title,
          specialty,
          hospital,
          room_number,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (patientId && isValidUUID(patientId)) {
      query = query.eq('patient_id', patientId);
    } else if (patientEmail) {
      query = query.eq('patient_email', patientEmail);
    } else {
      // If neither is provided, don't return random data
      return [];
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getPatientAppointments error:', error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((apt) => ({
        ...apt,
        doctor_name: apt.doctors?.name || apt.doctor_name || 'Dr. Specialist',
        doctor_avatar: apt.doctors?.avatar_url || apt.doctor_avatar || '',
        room_number: apt.doctors?.room_number || apt.room_number || 'Room 101',
        hospital: apt.doctors?.hospital || apt.hospital || 'Smart Clinic',
        date: apt.slot_date,
        time: apt.slot_time,
      }));
    }

    return [];
  } catch (err) {
    console.warn('Supabase getPatientAppointments exception:', err.message);
    return [];
  }
};

/**
 * Update appointment status in public.appointments table
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  if (isSupabaseConfigured && isValidUUID(appointmentId)) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select();

      if (!error && data) return data[0];
    } catch (err) {
      console.warn('Supabase updateAppointmentStatus exception:', err.message);
    }
  }

  return { id: appointmentId, status };
};

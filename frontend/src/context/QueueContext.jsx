import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import {
  createAppointment as createAppointmentService,
  getPatientAppointments,
  updateAppointmentStatus as updateAppointmentStatusService,
} from '../services/supabase/appointmentService';
import { getDoctors } from '../services/supabase/doctorService';
import { fetchDoctorAppointmentsFromBackend } from '../services/doctorBackendService';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const { showToast } = useToast();
  const { isDoctor, activeDoctor, patientUser, currentUser, isAuthenticated } = useAuth();

  const [queues, setQueues] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [activeTrackingAppointment, setActiveTrackingAppointment] = useState(null);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);

  // Automatically clean up any stale legacy cached appointments on load
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('healflow_patient_apts')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
  }, []);
  useEffect(() => {
    let isMounted = true;
    const fetchQueuesAndDoctors = async () => {
      try {
        const docs = await getDoctors();
        if (isMounted && Array.isArray(docs)) {
          setDoctorsList(docs);
        }

        if (isSupabaseConfigured) {
          const { data: dbQueues, error } = await supabase.from('queues').select('*');
          if (!error && Array.isArray(dbQueues) && isMounted) {
            const queueMap = {};
            dbQueues.forEach((q) => {
              queueMap[q.doctor_id] = q;
            });
            setQueues(queueMap);
          }
        }
      } catch (e) {
        console.warn('[QueueContext] Failed to fetch live queues/doctors:', e.message);
      }
    };

    fetchQueuesAndDoctors();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real patient appointments OR active doctor's patient appointments from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadAppointments = async () => {
      // 1. If currently in Doctor mode: Fetch all appointments booked for this specific doctor!
      if (isDoctor && activeDoctor?.id) {
        setIsLoadingAppointments(true);
        try {
          let docApts = [];
          if (isSupabaseConfigured) {
            const { data: dbApts } = await supabase
              .from('appointments')
              .select('*')
              .eq('doctor_id', activeDoctor.id)
              .order('created_at', { ascending: true });
            if (Array.isArray(dbApts)) docApts = dbApts;
          }
          if (docApts.length === 0) {
            const backendApts = await fetchDoctorAppointmentsFromBackend(activeDoctor.id);
            if (Array.isArray(backendApts)) docApts = backendApts;
          }
          if (isMounted) {
            const formatted = docApts.map((apt) => ({
              ...apt,
              doctor_name: activeDoctor.name || 'Dr. Specialist',
              doctor_avatar: activeDoctor.avatar_url || '',
              room_number: activeDoctor.room_number || 'Room 101',
              hospital: activeDoctor.hospital || 'HealFlow Clinic',
              date: apt.slot_date,
              time: apt.slot_time,
            }));
            setAppointments(formatted);
            const inSession = formatted.find((a) => a.status === 'In Session');
            setActiveTrackingAppointment(inSession || formatted[0] || null);
          }
        } catch (err) {
          console.warn('[QueueContext] Failed to load doctor appointments:', err.message);
        } finally {
          if (isMounted) setIsLoadingAppointments(false);
        }
        return;
      }

      // 2. If in Patient mode:
      const pId = patientUser?.id || currentUser?.id;
      const pEmail = patientUser?.email || currentUser?.email;

      // No local fake cache - strictly use real Supabase DB data
      if (isAuthenticated && (pId || pEmail)) {
        setIsLoadingAppointments(true);
        try {
          const list = await getPatientAppointments({ patientId: pId, patientEmail: pEmail });
          if (isMounted) {
            const dbList = Array.isArray(list) ? list : [];
            setAppointments(dbList);
            const active = dbList.find((a) => a.status === 'Scheduled' || a.status === 'In Session');
            setActiveTrackingAppointment(active || dbList[0] || null);

            // Clean up any stale legacy cached appointments
            if (pId) {
              localStorage.removeItem(`healflow_patient_apts_${pId}`);
            }
          }
        } catch (err) {
          console.warn('[QueueContext] Failed to load appointments:', err.message);
          if (isMounted) {
            setAppointments([]);
            setActiveTrackingAppointment(null);
          }
        } finally {
          if (isMounted) setIsLoadingAppointments(false);
        }
      } else {
        if (isMounted) {
          setAppointments([]);
          setActiveTrackingAppointment(null);
        }
      }
    };

    loadAppointments();
    return () => {
      isMounted = false;
    };
  }, [isDoctor, activeDoctor?.id, isAuthenticated, patientUser?.id, patientUser?.email, currentUser?.id, currentUser?.email, doctorsList]);

  // Real-time automatic queue and appointments sync from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('public:queues:all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues' },
        (payload) => {
          if (payload.new && payload.new.doctor_id) {
            setQueues((prev) => ({
              ...prev,
              [payload.new.doctor_id]: payload.new,
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.new && payload.new.id) {
            setAppointments((prev) => {
              const idx = prev.findIndex((a) => a.id === payload.new.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], ...payload.new };
                return updated;
              }
              return [payload.new, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add new appointment & generate live ticket (saved directly to public.appointments table)
  const addAppointment = async (newAppointmentData) => {
    const docId = newAppointmentData.doctor_id;
    const targetDoc =
      doctorsList.find((d) => d.id === docId || d.specialty?.toLowerCase() === newAppointmentData.specialty?.toLowerCase()) || {
        name: newAppointmentData.doctor_name || 'Dr. Specialist',
        specialty: newAppointmentData.specialty || 'General Medicine',
        hospital: newAppointmentData.hospital || 'HealFlow Medical Center',
        room_number: newAppointmentData.room_number || 'Room 101',
        avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      };

    const docName = newAppointmentData.doctor_name && newAppointmentData.doctor_name !== 'Dr. Specialist'
      ? newAppointmentData.doctor_name
      : targetDoc.name;

    const docAvatar = newAppointmentData.doctor_avatar || targetDoc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';
    const docRoom = newAppointmentData.room_number || targetDoc.room_number || 'Room 101';
    const docHospital = newAppointmentData.hospital || targetDoc.hospital || 'Smart Clinic';

    const prefix = (newAppointmentData.specialty || targetDoc.specialty || 'CLN')
      .substring(0, 4)
      .toUpperCase();

    const tokenIndex = (queues[docId]?.total_in_queue || 0) + 1;
    const tokenNumber =
      newAppointmentData.token_number || `${prefix}-${String(tokenIndex).padStart(3, '0')}`;

    const appointmentPayload = {
      patient_id: patientUser?.id || currentUser?.id || null,
      doctor_id: docId || null,
      patient_name: newAppointmentData.patient_name || patientUser?.name || 'Patient',
      patient_email: newAppointmentData.patient_email || patientUser?.email || '',
      patient_phone: newAppointmentData.patient_phone || patientUser?.phone || '',
      specialty: newAppointmentData.specialty || targetDoc.specialty || 'General',
      slot_date: newAppointmentData.date || newAppointmentData.slot_date || new Date().toISOString().split('T')[0],
      slot_time: newAppointmentData.time || newAppointmentData.slot_time || '10:00 AM',
      reason: newAppointmentData.reason || newAppointmentData.notes || null,
      token_number: tokenNumber,
      token_index: tokenIndex,
      doctor_name: docName,
      doctor_avatar: docAvatar,
      hospital: docHospital,
      room_number: docRoom,
    };

    const savedApt = await createAppointmentService(appointmentPayload);

    // Save with guaranteed real doctor name and avatar
    const enrichedApt = {
      ...savedApt,
      doctor_name: docName,
      doctor_avatar: docAvatar,
      hospital: docHospital,
      room_number: docRoom,
      date: savedApt.slot_date || savedApt.date || appointmentPayload.slot_date,
      time: savedApt.slot_time || savedApt.time || appointmentPayload.slot_time,
    };

    setAppointments((prev) => [enrichedApt, ...prev.filter((a) => a.id !== enrichedApt.id)]);
    setActiveTrackingAppointment(enrichedApt);

    // Persist to local storage as patient's active booking cache
    if (patientUser?.id) {
      try {
        const cacheKey = `healflow_patient_apts_${patientUser.id}`;
        const existingCached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        localStorage.setItem(cacheKey, JSON.stringify([enrichedApt, ...existingCached.filter((a) => a.id !== enrichedApt.id)]));
      } catch (e) {}
    }

    if (docId) {
      setQueues((prev) => {
        const existingQueue = prev[docId] || {
          doctor_id: docId,
          current_token: `${prefix}-001`,
          serving_patient: 'Regular Patient',
          total_in_queue: 1,
          status: 'ACTIVE',
          last_updated: new Date().toISOString(),
        };

        return {
          ...prev,
          [docId]: {
            ...existingQueue,
            total_in_queue: existingQueue.total_in_queue + 1,
            last_updated: new Date().toISOString(),
          },
        };
      });
    }

    return savedApt;
  };

  // Doctor Action: Call Next Patient
  const callNextPatient = (doctorId, explicitToken = null) => {
    setQueues((prev) => {
      const current = prev[doctorId] || {
        doctor_id: doctorId,
        current_token: 'OPD-001',
        serving_patient: 'Regular Walk-in',
        total_in_queue: 1,
        status: 'ACTIVE',
      };
      const parts = (current.current_token || 'OPD-000').split('-');
      const prefix = parts[0] || 'OPD';
      const currentNum = parseInt(parts[1] || '0', 10);
      const nextNum = currentNum + 1;
      const nextToken = explicitToken || `${prefix}-${String(nextNum).padStart(3, '0')}`;

      const updated = {
        ...current,
        current_token: nextToken,
        serving_patient: `Patient Token #${nextToken}`,
        total_in_queue: Math.max(0, (current.total_in_queue || 1) - 1),
        last_updated: new Date().toISOString(),
      };

      return {
        ...prev,
        [doctorId]: updated,
      };
    });

    // Also update any matching appointment in appointments list to 'In Session'
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.doctor_id === doctorId) {
          if (explicitToken && apt.token_number === explicitToken) {
            return { ...apt, status: 'In Session' };
          }
        }
        return apt;
      })
    );

    showToast(`Called next patient token! Queue advanced for doctor.`, 'info');
  };

  // Doctor Action: Mark Appointment Completed
  const completeAppointment = async (appointmentId) => {
    await updateAppointmentStatusService(appointmentId, 'Completed');
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'Completed' } : apt))
    );
    showToast('Appointment marked as completed.', 'success');
  };

  // Calculate live position ahead for a given token
  const getPatientsAhead = (doctorId, patientToken) => {
    const queue = queues[doctorId];
    if (!queue || !patientToken) return 0;

    const currentParts = (queue.current_token || '').split('-');
    const patientParts = patientToken.split('-');

    const currentNum = parseInt(currentParts[1] || '1', 10);
    const patientNum = parseInt(patientParts[1] || '1', 10);

    const ahead = patientNum - currentNum;
    return ahead > 0 ? ahead : 0;
  };

  // Refresh appointments from Supabase
  const refreshAppointments = async () => {
    const pId = patientUser?.id || currentUser?.id;
    const pEmail = patientUser?.email || currentUser?.email;

    if (isAuthenticated && (pId || pEmail)) {
      try {
        const list = await getPatientAppointments({ patientId: pId, patientEmail: pEmail });
        const dbList = Array.isArray(list) ? list : [];
        setAppointments(dbList);
        const active = dbList.find((a) => a.status === 'Scheduled');
        setActiveTrackingAppointment(active || dbList[0] || null);
        return dbList;
      } catch (err) {
        console.warn('[QueueContext] refreshAppointments error:', err.message);
      }
    }
    return appointments;
  };

  return (
    <QueueContext.Provider
      value={{
        queues,
        appointments,
        isLoadingAppointments,
        activeTrackingAppointment,
        setActiveTrackingAppointment,
        addAppointment,
        createAppointment: addAppointment,
        callNextPatient,
        completeAppointment,
        getPatientsAhead,
        refreshAppointments,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueue must be used within QueueProvider');
  return context;
};

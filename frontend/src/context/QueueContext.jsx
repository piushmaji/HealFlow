import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_QUEUES, INITIAL_PATIENT_APPOINTMENTS, MOCK_DOCTORS } from '../utils/mockData';
import { useToast } from './ToastContext';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const { showToast } = useToast();
  const [queues, setQueues] = useState(INITIAL_QUEUES);
  const [appointments, setAppointments] = useState(INITIAL_PATIENT_APPOINTMENTS);

  // Active appointment being tracked in live queue view
  const [activeTrackingAppointment, setActiveTrackingAppointment] = useState(INITIAL_PATIENT_APPOINTMENTS[0]);

  // Real-time automatic queue progression ticker (Advances room token every 4 seconds in frontend)
  useEffect(() => {
    const timer = setInterval(() => {
      setQueues((prev) => {
        const nextQueues = { ...prev };
        let hasAdvanced = false;

        Object.keys(nextQueues).forEach((docId) => {
          const current = nextQueues[docId];
          const parts = (current.current_token || 'CLN-001').split('-');
          const prefix = parts[0] || 'CLN';
          const currentNum = parseInt(parts[1] || '1', 10);

          // Find the target patient appointment for this doctor to see max token limit
          const targetApt = appointments.find((a) => a.doctor_id === docId && a.status === 'Scheduled');
          const maxNum = targetApt ? parseInt((targetApt.token_number || '').split('-')[1] || '7', 10) : 7;

          if (currentNum < maxNum) {
            const nextNum = currentNum + 1;
            const nextToken = `${prefix}-${String(nextNum).padStart(3, '0')}`;
            nextQueues[docId] = {
              ...current,
              current_token: nextToken,
              serving_patient: `Patient #${nextNum}`,
              last_updated: new Date().toISOString(),
            };
            hasAdvanced = true;
          }
        });

        return hasAdvanced ? nextQueues : prev;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [appointments]);

  // Add new appointment & generate live ticket
  const addAppointment = (newAppointmentData) => {
    const docId = newAppointmentData.doctor_id || 'doc-1';
    const targetDoc = MOCK_DOCTORS.find((d) => d.id === docId) || MOCK_DOCTORS[0];
    const prefix = (targetDoc.specialty || newAppointmentData.specialty || 'CLN').substring(0, 4).toUpperCase();
    const tokenIndex = (queues[docId]?.total_in_queue || 6) + 1;
    const tokenNumber = newAppointmentData.token_number || `${prefix}-${String(tokenIndex).padStart(3, '0')}`;

    const newApt = {
      id: `apt-${Date.now()}`,
      token_number: tokenNumber,
      token_index: tokenIndex,
      doctor_avatar: targetDoc.avatar_url,
      doctor_name: targetDoc.name,
      specialty: targetDoc.specialty,
      hospital: targetDoc.hospital || 'Apollo Super Speciality Hospital',
      room_number: targetDoc.room_number || 'Room 302',
      ...newAppointmentData,
      status: 'Scheduled',
      created_at: new Date().toISOString(),
    };

    setAppointments((prev) => [newApt, ...prev]);
    setActiveTrackingAppointment(newApt);

    // Update queue total for the target doctor
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

    showToast(`Appointment Confirmed! Token ${newApt.token_number} Issued.`, 'success');
    return newApt;
  };

  // Doctor Action: Call Next Patient
  const callNextPatient = (doctorId) => {
    setQueues((prev) => {
      const current = prev[doctorId] || INITIAL_QUEUES[doctorId];
      const parts = (current.current_token || 'CLN-001').split('-');
      const prefix = parts[0] || 'CLN';
      const currentNum = parseInt(parts[1] || '1', 10);
      const nextNum = currentNum + 1;
      const nextToken = `${prefix}-${String(nextNum).padStart(3, '0')}`;

      const updated = {
        ...current,
        current_token: nextToken,
        serving_patient: `Patient #${nextNum}`,
        total_in_queue: Math.max(0, current.total_in_queue - 1),
        last_updated: new Date().toISOString(),
      };

      return {
        ...prev,
        [doctorId]: updated,
      };
    });

    showToast(`Called next patient token! Queue advanced for doctor.`, 'info');
  };

  // Doctor Action: Mark Appointment Completed
  const completeAppointment = (appointmentId) => {
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

  return (
    <QueueContext.Provider
      value={{
        queues,
        appointments,
        activeTrackingAppointment,
        setActiveTrackingAppointment,
        addAppointment,
        createAppointment: addAppointment,
        callNextPatient,
        completeAppointment,
        getPatientsAhead,
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

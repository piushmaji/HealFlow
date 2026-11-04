import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Ticket, User, Phone, CheckCircle2, Calendar, MessageSquare, Video } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { useToast } from '../../context/ToastContext';
import { fetchDoctorAppointmentsFromBackend, updateAppointmentStatusInBackend } from '../../services/doctorBackendService';

export const DailySchedule = ({ doctorId }) => {
  const navigate = useNavigate();
  const { appointments, completeAppointment } = useQueue();
  const { showToast } = useToast();
  const [dbAppointments, setDbAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load real appointments from backend/Supabase for this doctor
  useEffect(() => {
    if (!doctorId) return;
    setIsLoading(true);
    fetchDoctorAppointmentsFromBackend(doctorId)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbAppointments(data);
        }
      })
      .catch((err) => console.warn('Failed to fetch doctor appointments:', err))
      .finally(() => setIsLoading(false));
  }, [doctorId]);

  // Combine queue context appointments and dbAppointments
  const mergedMap = new Map();
  dbAppointments.forEach((a) => mergedMap.set(a.id, a));
  appointments.filter((a) => a.doctor_id === doctorId).forEach((a) => mergedMap.set(a.id, a));

  const scheduleItems = Array.from(mergedMap.values());

  const handleMarkComplete = async (aptId, patientName) => {
    try {
      await updateAppointmentStatusInBackend(aptId, 'Completed');
    } catch (e) {}
    completeAppointment(aptId);
    setDbAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status: 'Completed' } : a))
    );
    showToast(`Consultation for ${patientName} marked complete.`, 'success');
  };

  const handleAttendPatient = (aptId) => {
    navigate(`/patients/consultation/${aptId}`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-0 shadow-xs space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#1F1F1F] font-heading">
            Today's Patient Schedule & Visits
          </h3>
          <p className="text-xs text-[#6B6E84] font-medium">
            Confirmed appointment queue & consultation status
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#F2F5FF] text-[#4C5BBD] shadow-xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>{scheduleItems.length} Scheduled</span>
        </span>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3 font-sans">
        {scheduleItems.length === 0 ? (
          <div className="p-8 text-center bg-[#F8FAFE] rounded-2xl border-0 shadow-xs space-y-2">
            <Ticket className="w-8 h-8 text-[#4C5BBD] mx-auto opacity-40" />
            <h4 className="text-xs font-bold text-[#1F1F1F]">No Appointments Scheduled Yet</h4>
            <p className="text-[11px] text-[#6B6E84]">New patient bookings and queue queries will appear here in real-time.</p>
          </div>
        ) : (
          scheduleItems.map((apt) => {
          const isCompleted = apt.status === 'Completed';
          const isInSession = apt.status === 'In Session';

          return (
            <div
              key={apt.id}
              className="p-4 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F2F5FF] transition-all"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="px-3 py-1.5 rounded-xl bg-white border-0 text-center font-sans text-xs font-black text-[#4C5BBD] shadow-xs shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#4C5BBD] mx-auto mb-0.5" />
                  <span>{apt.time || apt.slot_time}</span>
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black text-[#1F1F1F] font-heading">{apt.patient_name}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-sans font-black bg-white text-[#4C5BBD] rounded-md shadow-xs">
                      {apt.token_number}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6E84] font-medium leading-tight truncate">{apt.notes || apt.reason || 'Routine Consultation'}</p>
                  <p className="text-[10px] text-[#6B6E84] font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#4C5BBD]" />
                    <span>{apt.patient_phone || 'No phone provided'}</span>
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700'
                      : isInSession
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-[#F2F5FF] text-[#4C5BBD]'
                  }`}
                >
                  {apt.status}
                </span>

                {/* Pick Chat / Video Consultation */}
                <button
                  type="button"
                  onClick={() => handleAttendPatient(apt.id)}
                  style={{ outline: 'none' }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold shadow-xs transition-all border-0 cursor-pointer"
                  title="Pick Chat & Attend consultation"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Pick Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAttendPatient(apt.id)}
                  style={{ outline: 'none' }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all border-0 cursor-pointer"
                  title="Launch Call with Patient"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(apt.id, apt.patient_name)}
                    style={{ outline: 'none' }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all border-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                )}
              </div>
            </div>
          );
        }))}
      </div>

    </div>
  );
};

import React from 'react';
import { Clock, Ticket, User, Phone, CheckCircle2, Calendar } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { useToast } from '../../context/ToastContext';

export const DailySchedule = ({ doctorId }) => {
  const { appointments, completeAppointment } = useQueue();
  const { showToast } = useToast();

  const doctorAppointments = appointments.filter((a) => a.doctor_id === doctorId);

  const scheduleItems = doctorAppointments.length > 0 ? doctorAppointments : [
    {
      id: 'apt-sample-1',
      patient_name: 'Rahul Sharma',
      patient_phone: '+91 98765 43210',
      time: '09:00 AM',
      token_number: 'CARD-001',
      notes: 'Hypertension follow-up & blood pressure check',
      status: 'Completed',
    },
    {
      id: 'apt-sample-2',
      patient_name: 'Priya Verma',
      patient_phone: '+91 98450 11223',
      time: '09:30 AM',
      token_number: 'CARD-002',
      notes: 'Chest pressure evaluation during exercise',
      status: 'In Session',
    },
    {
      id: 'apt-sample-3',
      patient_name: 'Amit Patel',
      patient_phone: '+91 97110 55443',
      time: '10:30 AM',
      token_number: 'CARD-007',
      notes: 'Routine ECG checkup & lipid telemetry',
      status: 'Scheduled',
    },
  ];

  const handleMarkComplete = (aptId, patientName) => {
    completeAppointment(aptId);
    showToast(`Consultation for ${patientName} marked complete.`, 'success');
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
        {scheduleItems.map((apt) => {
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
                  <span>{apt.time}</span>
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black text-[#1F1F1F] font-heading">{apt.patient_name}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-sans font-black bg-white text-[#4C5BBD] rounded-md shadow-xs">
                      {apt.token_number}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6E84] font-medium leading-tight truncate">{apt.notes || apt.reason}</p>
                  <p className="text-[10px] text-[#6B6E84] font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#4C5BBD]" />
                    <span>{apt.patient_phone}</span>
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
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

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(apt.id, apt.patient_name)}
                    style={{ outline: 'none' }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all border-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Complete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

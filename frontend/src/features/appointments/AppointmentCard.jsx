import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Calendar, Clock, MapPin, Ticket, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useQueue } from '../../context/QueueContext';

export const AppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();
  const { setActiveTrackingAppointment } = useQueue();
  const [imgError, setImgError] = useState(false);

  const handleTrackQueue = () => {
    setActiveTrackingAppointment(appointment);
    navigate(`/patients/live-queue/${appointment.id}`);
  };

  const doctorPhoto =
    !imgError && appointment.doctor_avatar
      ? appointment.doctor_avatar
      : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

  const isCompleted = appointment.status === 'Completed';
  const isInSession = appointment.status === 'In Session';

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 font-sans flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
        isCompleted
          ? 'bg-slate-50/80 border-slate-200/60 opacity-75'
          : isInSession
          ? 'bg-emerald-50/50 border-emerald-200 shadow-xs'
          : 'bg-white border-slate-200/80 shadow-2xs hover:border-[#4C5BBD]/60 hover:shadow-xs'
      }`}
    >
      
      {/* 1. Left Section: Avatar, Doctor Info & Token */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs shrink-0 bg-[#EEF2FF] flex items-center justify-center">
          <img
            src={doctorPhoto}
            alt={appointment.doctor_name || 'Doctor'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold font-sans rounded-md border flex items-center gap-1 ${
                isCompleted
                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : isInSession
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 font-black'
                  : 'bg-[#F2F5FF] text-[#4C5BBD] border-[#DCE5FA]'
              }`}
            >
              <Ticket className="w-3 h-3" />
              <span>Token {appointment.token_number}</span>
            </span>

            <StatusBadge status={appointment.status} />
          </div>

          <h4
            className={`text-sm sm:text-base font-bold font-sans truncate ${
              isCompleted ? 'text-slate-600' : 'text-[#1F1F1F]'
            }`}
          >
            {appointment.doctor_name}
          </h4>

          <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#4C5BBD]">{appointment.specialty}</span>
            <span>•</span>
            <MapPin className="w-3 h-3 text-[#6B6E84] shrink-0" />
            <span>{appointment.room_number || 'Room 101'}</span>
            {appointment.hospital && (
              <>
                <span>•</span>
                <span className="truncate">{appointment.hospital}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* 2. Middle Section: Date & Time */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 px-3 py-2 bg-[#F8FAFE] rounded-xl border border-slate-200/70 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F1F1F]">
          <Calendar className="w-3.5 h-3.5 text-[#6B6E84]" />
          <span>{formatDate(appointment.date || appointment.slot_date)}</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-[#4C5BBD]">
          <Clock className="w-3.5 h-3.5 text-[#4C5BBD]" />
          <span>{appointment.time || appointment.slot_time || 'Scheduled Slot'}</span>
        </div>
      </div>

      {/* 3. Right Section: Action Button */}
      <div className="shrink-0">
        {isCompleted ? (
          <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Finished</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleTrackQueue}
            style={{ outline: 'none' }}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold transition-all shadow-xs border-0 cursor-pointer ${
              isInSession
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-[#4C5BBD] hover:bg-[#3B489E] text-white'
            }`}
          >
            <span>{isInSession ? 'Enter Room' : 'Track Queue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};

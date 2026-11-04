import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Calendar, Clock, MapPin, Ticket, ArrowRight, User } from 'lucide-react';
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

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 border-0 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all duration-200 font-sans group ${
        isCompleted
          ? 'bg-slate-50/70 opacity-60 filter grayscale-[30%]'
          : 'bg-[#F8FAFE] hover:bg-[#F2F5FF]'
      }`}
    >
      
      {/* 1. Left Section: Avatar, Doctor Info, Token & Status */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xs shrink-0 group-hover:scale-105 transition-transform bg-[#EEF2FF] flex items-center justify-center">
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
              className={`px-2.5 py-0.5 text-[10px] font-black font-sans rounded-lg border-0 shadow-xs flex items-center gap-1 ${
                isCompleted ? 'bg-slate-200 text-slate-500' : 'bg-[#F2F5FF] text-[#4C5BBD]'
              }`}
            >
              <Ticket className="w-3 h-3" />
              <span>{appointment.token_number}</span>
            </span>

            <StatusBadge status={appointment.status} />
          </div>

          <h4
            className={`text-sm sm:text-base font-black font-sans truncate ${
              isCompleted ? 'text-slate-500 line-through' : 'text-[#1F1F1F]'
            }`}
          >
            {appointment.doctor_name}
          </h4>

          <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#4C5BBD]">{appointment.specialty}</span>
            <span>•</span>
            <MapPin className="w-3 h-3 text-[#6B6E84] shrink-0" />
            <span>{appointment.room_number || 'Room 101'}</span>
          </p>
        </div>
      </div>

      {/* 2. Middle Section: Scheduled Date & Time Telemetry Pill */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 px-3.5 py-2 sm:py-2.5 bg-white rounded-2xl shadow-xs shrink-0 border-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F1F1F]">
          <Calendar className="w-3.5 h-3.5 text-[#6B6E84]" />
          <span>{formatDate(appointment.date)}</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-[#4C5BBD]">
          <Clock className="w-3.5 h-3.5 text-[#4C5BBD]" />
          <span>{appointment.time} (IST)</span>
        </div>
      </div>

      {/* 3. Right Section: Action Button */}
      <div className="shrink-0">
        {isCompleted ? (
          <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold bg-slate-200/80 text-slate-600 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Consultation Finished</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleTrackQueue}
            style={{ outline: 'none' }}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-full text-xs font-black transition-all shadow-xs border-0 cursor-pointer ${
              appointment.status === 'Scheduled' || appointment.status === 'In Session'
                ? 'bg-[#4C5BBD] text-white hover:bg-[#3B489E]'
                : 'bg-white text-[#1F1F1F] hover:bg-[#F2F5FF]'
            }`}
          >
            <span>{appointment.status === 'In Session' ? 'Enter Chamber' : 'Track Live Queue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};

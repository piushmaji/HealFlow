import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Calendar, Clock, MapPin, Ticket, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useQueue } from '../../context/QueueContext';

export const AppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();
  const { setActiveTrackingAppointment } = useQueue();

  const handleTrackQueue = () => {
    setActiveTrackingAppointment(appointment);
    navigate(`/patients/live-queue/${appointment.id}`);
  };

  return (
    <div className="bg-[#F8FAFE] hover:bg-[#F2F5FF] rounded-3xl p-4 sm:p-5 border-0 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all duration-200 font-sans group">
      
      {/* 1. Left Section: Avatar, Doctor Info, Token & Status */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <img
          src={appointment.doctor_avatar}
          alt={appointment.doctor_name}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-0 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
        />

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-black font-sans bg-[#F2F5FF] text-[#4C5BBD] rounded-lg border-0 shadow-xs flex items-center gap-1">
              <Ticket className="w-3 h-3 text-[#4C5BBD]" />
              <span>{appointment.token_number}</span>
            </span>

            <StatusBadge status={appointment.status} />
          </div>

          <h4 className="text-sm sm:text-base font-black text-[#1F1F1F] font-sans truncate">
            {appointment.doctor_name}
          </h4>

          <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#4C5BBD]">{appointment.specialty}</span>
            <span>•</span>
            <MapPin className="w-3 h-3 text-[#6B6E84] shrink-0" />
            <span>{appointment.room_number || 'Room 302'}</span>
          </p>
        </div>
      </div>

      {/* 2. Middle Section: Scheduled Date & Time Telemetry Pill (Soft White Contrast) */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 px-3.5 py-2 sm:py-2.5 bg-white sm:bg-white rounded-2xl sm:rounded-2xl shadow-xs shrink-0 border-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F1F1F]">
          <Calendar className="w-3.5 h-3.5 text-[#6B6E84]" />
          <span>{formatDate(appointment.date)}</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-[#4C5BBD]">
          <Clock className="w-3.5 h-3.5 text-[#4C5BBD]" />
          <span>{appointment.time}</span>
        </div>
      </div>

      {/* 3. Right Section: Direct Track Queue Action Pill Button */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={handleTrackQueue}
          style={{ outline: 'none' }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-full text-xs font-black transition-all shadow-xs border-0 ${
            appointment.status === 'Scheduled'
              ? 'bg-[#4C5BBD] text-white hover:bg-[#3B489E]'
              : 'bg-white text-[#1F1F1F] hover:bg-[#F2F5FF]'
          }`}
        >
          <span>{appointment.status === 'Scheduled' ? 'Track Live Queue' : 'View Details'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Sparkles, Clock, ArrowRight, CalendarX } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';

export const PatientStats = () => {
  const navigate = useNavigate();
  const { appointments, activeTrackingAppointment } = useQueue();

  const totalUpcoming = appointments.filter((a) => a.status === 'Scheduled').length;

  return (
    <div className="space-y-6 mb-8">
      
      {/* 1. Primary Live Token Hero Banner */}
      {activeTrackingAppointment ? (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#CEDEFF] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5B81FA] text-white flex items-center justify-center font-bold shrink-0 shadow-material-1">
              <Ticket className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active OPD Queue Token
                </span>
                <span className="text-[10px] font-bold text-[#6B6E84]">
                  {activeTrackingAppointment.room_number || 'Room 101'}
                </span>
              </div>
              <h2 className="text-3xl font-black text-[#1F1F1F] font-sans tracking-wide mt-1">
                {activeTrackingAppointment.token_number}
              </h2>
              <p className="text-xs text-[#6B6E84] font-medium mt-0.5">
                Doctor: <span className="font-bold text-[#1F1F1F]">{activeTrackingAppointment.doctor_name || 'Dr. Specialist'}</span> • {activeTrackingAppointment.specialty || 'General'} OPD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate(`/patients/live-queue/${activeTrackingAppointment.id}`)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#5B81FA] text-white text-xs font-black shadow-material-1 hover:bg-[#4C5BBD] transition-all cursor-pointer border-0"
            >
              <Clock className="w-4 h-4" />
              <span>Track Live Queue</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#CEDEFF] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
              <CalendarX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1F1F1F]">No Active Consultation Token</h3>
              <p className="text-xs text-[#6B6E84] mt-0.5">
                You have {totalUpcoming} upcoming appointments. Book a doctor slot to receive a live OPD token.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4C5BBD] text-white text-xs font-bold hover:bg-[#3B489E] transition-all border-0 cursor-pointer shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      )}

      {/* 2. Essential Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Book Doctor Card */}
        <div
          onClick={() => navigate('/doctors')}
          className="bg-white rounded-3xl p-5 border border-[#CEDEFF] hover:border-[#5B81FA] cursor-pointer transition-all hover:shadow-card-hover group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F2F5FF] text-[#5B81FA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#1F1F1F] font-heading">Book Doctor Appointment</h4>
              <p className="text-xs text-[#6B6E84] mt-0.5">Find specialist doctors & instant queue slots</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#5B81FA] group-hover:translate-x-1 transition-transform" />
        </div>

        {/* AI Medical Assistant Card */}
        <div
          onClick={() => navigate('/ai-assistant')}
          className="bg-white rounded-3xl p-5 border border-[#CEDEFF] hover:border-[#5B81FA] cursor-pointer transition-all hover:shadow-card-hover group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#1F1F1F] font-heading">AI Symptom Guide</h4>
              <p className="text-xs text-[#6B6E84] mt-0.5">Ask medical questions & instant guidance 24/7</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </div>

      </div>

    </div>
  );
};

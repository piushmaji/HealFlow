import React from 'react';
import { Users, CalendarCheck, CheckCircle2, Ticket } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';

export const DoctorStats = () => {
  const { activeDoctor } = useAuth();
  const { queues, appointments } = useQueue();

  const queue = queues[activeDoctor?.id] || { current_token: 'None', total_in_queue: 0 };
  const doctorAppointments = appointments.filter((a) => a.doctor_id === activeDoctor?.id);

  const completedCount = doctorAppointments.filter((a) => a.status === 'Completed').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
      
      {/* 1. Today's Total Bookings */}
      <div className="p-4 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Today's Bookings</span>
          <div className="p-1.5 rounded-xl bg-[#F2F5FF] text-[#4C5BBD]">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-[#1F1F1F] font-sans">{doctorAppointments.length}</p>
        <p className="text-[10px] text-[#6B6E84] font-medium">Confirmed Appointments</p>
      </div>

      {/* 2. Now Serving Token */}
      <div className="p-4 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Serving Token</span>
          <div className="p-1.5 rounded-xl bg-[#F2F5FF] text-[#4C5BBD]">
            <Ticket className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black font-sans text-[#4C5BBD] tracking-wide">{queue.current_token || 'None'}</p>
        <p className="text-[10px] text-[#6B6E84] font-medium">Live Patient in Room</p>
      </div>

      {/* 3. Waiting Queue */}
      <div className="p-4 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#6B6E84] uppercase">OPD Waiting</span>
          <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-amber-600 font-sans">{queue.total_in_queue || 0}</p>
        <p className="text-[10px] text-[#6B6E84] font-medium">Patients in Waiting Hall</p>
      </div>

      {/* 4. Completed Consultations */}
      <div className="p-4 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Completed</span>
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-emerald-600 font-sans">{completedCount}</p>
        <p className="text-[10px] text-[#6B6E84] font-medium">Visits Finished Today</p>
      </div>

    </div>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { DoctorStats } from '../features/dashboard/DoctorStats';
import { QueueControlPanel } from '../features/queue/QueueControlPanel';
import { DailySchedule } from '../features/dashboard/DailySchedule';
import { Stethoscope, MapPin, Radio, ShieldCheck, UserCheck } from 'lucide-react';

export const DoctorDashboardPage = () => {
  const { activeDoctor } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      
      {/* 1. Doctor Profile Hero Banner (Borderless) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-0 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={activeDoctor.avatar_url}
              alt={activeDoctor.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-0 shadow-xs shrink-0"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] shadow-xs">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{activeDoctor.specialty}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 shadow-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Senior Consultant</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading tracking-wide">
                {activeDoctor.name}
              </h1>
              <p className="text-xs text-[#6B6E84] font-medium">{activeDoctor.title}</p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#6B6E84]">
                <div className="flex items-center gap-1.5 font-bold text-[#1F1F1F]">
                  <MapPin className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>{activeDoctor.hospital || 'Smart Clinic Central'} ({activeDoctor.room_number || 'Room 302'})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active OPD Status Pill */}
          <div className="w-full sm:w-auto p-4 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center justify-between sm:justify-start gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#6B6E84]">OPD Status</p>
                <p className="text-xs font-black text-[#1F1F1F] font-heading">Active & Live Caller</p>
              </div>
            </div>
            <span className="text-xs font-sans font-black text-[#4C5BBD] bg-white px-2.5 py-1 rounded-lg shadow-xs">
              {activeDoctor.room_number || 'Room 302'}
            </span>
          </div>
        </div>

        {/* Doctor Stats Widgets */}
        <DoctorStats />
      </div>

      {/* 2. Live Queue Caller System */}
      <QueueControlPanel />

      {/* 3. Daily Appointment Schedule List */}
      <DailySchedule doctorId={activeDoctor.id} />

    </div>
  );
};

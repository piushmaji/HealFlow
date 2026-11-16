import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QueueControlPanel } from '../features/queue/QueueControlPanel';
import {
  Stethoscope,
  MapPin,
  Radio,
  CheckCircle2,
  Calendar,
  Users,
  Clock,
  PlayCircle,
  PauseCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const { activeDoctor, setActiveDoctor } = useAuth();
  const [isOPDActive, setIsOPDActive] = useState(true);

  const toggleOPDStatus = () => {
    setIsOPDActive((prev) => !prev);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* =========================================================================
          1. COMPACT DOCTOR OVERVIEW HEADER
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Doctor Identity & Specialty */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={
                activeDoctor?.avatar_url ||
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
              }
              alt={activeDoctor?.name || 'Doctor'}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white shadow-2xs"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isOPDActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-[#1F1F1F] font-heading truncate">
                {activeDoctor?.name || 'Doctor'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] border border-[#DCE5FA]">
                <Stethoscope className="w-3 h-3" />
                <span>{activeDoctor?.specialty || 'General Medicine'}</span>
              </span>
            </div>

            <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-2 flex-wrap">
              <span>{activeDoctor?.hospital || 'HealFlow Hospital'}</span>
              <span>•</span>
              <span className="font-bold text-[#1F1F1F]">{activeDoctor?.room_number || 'Room 101'}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">
                Fee: {activeDoctor?.consultation_fee ? formatCurrency(activeDoctor.consultation_fee) : '₹500'}
              </span>
            </p>
          </div>
        </div>

        {/* OPD Status & Availability Toggle */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={toggleOPDStatus}
            style={{ outline: 'none' }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
              isOPDActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isOPDActive ? (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>OPD Active & Calling</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>OPD Paused</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/doctor/profile')}
            style={{ outline: 'none' }}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold border border-slate-200/90 shadow-2xs cursor-pointer transition-colors"
          >
            Profile & Settings →
          </button>
        </div>

      </div>

      {/* =========================================================================
          2. LIVE OPD CONTROL & SINGLE UNIFIED PATIENT QUEUE (Primary Focus)
          ========================================================================= */}
      <QueueControlPanel />

    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { DoctorStats } from '../features/dashboard/DoctorStats';
import { QueueControlPanel } from '../features/queue/QueueControlPanel';
import { DailySchedule } from '../features/dashboard/DailySchedule';
import { DoctorProfileEditModal } from '../features/dashboard/DoctorProfileEditModal';
import { Stethoscope, MapPin, Radio, ShieldCheck, UserCheck, Edit3, Calendar, HelpCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const { activeDoctor, setActiveDoctor } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      
      {/* 1. Doctor Profile Hero Banner (Borderless) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={activeDoctor.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
              alt={activeDoctor.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-white shadow-xs shrink-0"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] shadow-xs border border-slate-200/80">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{activeDoctor.specialty || 'Specialty Pending'}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 shadow-xs border border-emerald-100">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Consultant</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading tracking-wide">
                {activeDoctor.name || 'Doctor'}
              </h1>
              <p className="text-xs text-[#6B6E84] font-medium">{activeDoctor.title || 'Qualifications not configured'}</p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#6B6E84]">
                <div className="flex items-center gap-1.5 font-bold text-[#1F1F1F]">
                  <MapPin className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>{activeDoctor.hospital || 'Hospital not set'} ({activeDoctor.room_number || 'Room not assigned'})</span>
                </div>
                <span>•</span>
                <span className="font-bold text-emerald-700">Fee: {activeDoctor.consultation_fee ? formatCurrency(activeDoctor.consultation_fee) : 'Not Set'}</span>
              </div>
            </div>
          </div>

          {/* Active OPD Status Pill */}
          <div className="w-full sm:w-auto p-4 rounded-2xl bg-[#F8FAFE] border border-slate-200/80 shadow-xs flex items-center justify-between sm:justify-start gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#6B6E84]">OPD Status</p>
                <p className="text-xs font-black text-[#1F1F1F] font-heading">Active & Live Caller</p>
              </div>
            </div>
            <span className="text-xs font-sans font-black text-[#4C5BBD] bg-white px-2.5 py-1 rounded-lg shadow-xs border border-slate-200/80">
              {activeDoctor.room_number || 'Room 101'}
            </span>
          </div>
        </div>

        {/* Doctor Stats Widgets */}
        <DoctorStats />
      </div>

      {/* 2. Doctor Availability & Pre-Consultation Intake Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Working Days & Schedule Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4C5BBD]" />
              <span>Available OPD Days & Slots</span>
            </h3>
            <span
              onClick={() => navigate('/doctor/profile')}
              className="text-[11px] font-bold text-[#4C5BBD] hover:underline bg-transparent border-0 cursor-pointer"
            >
              View on Profile
            </span>
          </div>

          <p className="text-xs text-[#6B6E84]">
            Days when patients can discover your profile and book appointment slots:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {(activeDoctor.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).map((day) => (
              <span
                key={day}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#F2F5FF] text-[#4C5BBD] shadow-xs border border-slate-200/80"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="p-3 bg-[#F8FAFE] border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs mt-3">
            <span className="text-[#6B6E84] font-medium">Consultation Channels:</span>
            <div className="flex items-center gap-2">
              {(activeDoctor.consultation_mode || ['In-person', 'Online']).map((mode) => (
                <span key={mode} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-700 shadow-xs border border-emerald-100">
                  {mode}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pre-Consultation Intake Questions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#4C5BBD]" />
              <span>Patient Pre-Consultation Intake Questions</span>
            </h3>
            <span
              onClick={() => navigate('/doctor/profile')}
              className="text-[11px] font-bold text-[#4C5BBD] hover:underline bg-transparent border-0 cursor-pointer"
            >
              View on Profile
            </span>
          </div>

          <p className="text-xs text-[#6B6E84]">
            Configured questions answered by patient during appointment booking or chat check-in:
          </p>

          <div className="space-y-2 pt-1">
            {(activeDoctor.intake_questions || [
              'What are your primary symptoms or concerns today?',
              'How long have you been experiencing these symptoms?',
              'Are you currently taking any regular medications or have drug allergies?'
            ]).map((q, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#F8FAFE] border border-slate-200/80 text-xs font-medium text-[#1F1F1F] shadow-xs flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#F2F5FF] text-[#4C5BBD] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Live Queue Caller System */}
      <QueueControlPanel />

      {/* 4. Daily Appointment Schedule List */}
      <DailySchedule doctorId={activeDoctor.id} />

    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  DollarSign,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  Check,
  User,
  Award,
  Video,
  ShieldCheck,
  CalendarDays,
  Edit3,
  HelpCircle,
  Activity,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { DoctorProfileEditModal } from '../features/dashboard/DoctorProfileEditModal';

export const DoctorProfilePage = () => {
  const navigate = useNavigate();
  const { activeDoctor, setActiveDoctor } = useAuth();
  const { showToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans">
      
      {/* 1. Header Banner & Action Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[#4C5BBD] tracking-wider font-heading">
            Doctor Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading">
            Doctor Profile & Clinical Overview
          </h1>
          <p className="text-xs text-[#6B6E84] font-medium mt-0.5">
            Review your public clinical credentials, OPD hospital schedule, and pre-consultation intake questions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            style={{ outline: 'none' }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white font-black text-xs border-0 shadow-md shadow-[#4C5BBD]/25 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile Details</span>
          </button>
        </div>
      </div>

      {/* 2. Doctor Identity Card (Clean Modern View Mode) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1F1F1F] font-heading">
                Professional Identity & Credentials
              </h3>
              <p className="text-xs text-[#6B6E84] font-medium">
                Your public credentials displayed to patients on HealFlow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Consultant</span>
            </span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{ outline: 'none' }}
              className="p-1.5 rounded-xl bg-[#F2F5FF] hover:bg-[#E5EDFF] text-[#4C5BBD] cursor-pointer transition-colors border-0"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Doctor Details Body */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              {activeDoctor.avatar_url ? (
                <img
                  src={activeDoctor.avatar_url}
                  alt={activeDoctor.name}
                  className="w-28 h-28 rounded-3xl object-cover border-2 border-white shadow-md shadow-[#4C5BBD]/15 shrink-0"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-[#4C5BBD] text-white flex items-center justify-center font-bold text-3xl shadow-md">
                  {activeDoctor.name?.[0] || 'D'}
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] shadow-xs border border-slate-200/80">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{activeDoctor.specialty || 'Cardiology'}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-slate-700 bg-[#F8FAFE] shadow-xs border border-slate-200/80">
                  <Award className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>{activeDoctor.experience_years || 8}+ Years Experience</span>
                </span>

                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-xs border ${
                  activeDoctor.accepts_new_patients ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeDoctor.accepts_new_patients ? 'Accepting Patients' : 'Temporarily Full'}</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading tracking-tight">
                {activeDoctor.name || 'Dr. Specialist'}
              </h2>
              <p className="text-xs text-[#6B6E84] font-semibold">{activeDoctor.title || 'Specialist Physician'}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-[#6B6E84]">
                <div className="flex items-center gap-1.5 font-bold text-[#1F1F1F]">
                  <MapPin className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>{activeDoctor.hospital || 'Apollo Super Speciality Hospital'}</span>
                </div>
                <span>•</span>
                <div className="font-bold text-[#1F1F1F]">
                  OPD: <span className="text-[#4C5BBD] font-black">{activeDoctor.room_number || 'Room 302'}</span>
                </div>
                <span>•</span>
                <div className="font-bold text-emerald-700">
                  Fee: <span className="font-black">{formatCurrency(activeDoctor.consultation_fee || 500)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Bio Section */}
          <div className="p-5 rounded-2xl bg-[#F8FAFE] border border-slate-200/80 space-y-1.5">
            <h4 className="text-[11px] font-black uppercase text-[#4C5BBD] tracking-wider font-heading">
              Clinical Biography & Approach
            </h4>
            <p className="text-xs text-[#1F1F1F] font-medium leading-relaxed">
              {activeDoctor.bio || 'Senior medical specialist dedicated to providing empathetic, evidence-based clinical care and thorough diagnosis.'}
            </p>
          </div>
        </div>

      </div>

      {/* 3. Availability Days & Schedule Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1F1F1F] font-heading">
                Working OPD Days & Consultation Channels
              </h3>
              <p className="text-xs text-[#6B6E84] font-medium">
                Days and channels currently open for patient booking
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#4C5BBD] bg-[#F2F5FF] px-3 py-1 rounded-full shadow-xs border border-slate-200/80">
            {(activeDoctor.available_days || []).length} Days Active
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold text-[#6B6E84] uppercase tracking-wider mb-2">Available OPD Days</p>
            <div className="flex flex-wrap gap-2">
              {(activeDoctor.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).map((day) => (
                <span
                  key={day}
                  className="px-4 py-2 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] font-black text-xs shadow-xs border border-slate-200/80"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-bold text-[#6B6E84] uppercase tracking-wider mb-2">Consultation Modes</p>
            <div className="flex flex-wrap gap-2.5">
              {(activeDoctor.consultation_mode || ['In-person', 'Online']).map((mode) => (
                <span
                  key={mode}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-xs shadow-xs border border-emerald-100"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{mode} Consultation</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Pre-Consultation Patient Intake Questions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1F1F1F] font-heading">
                Pre-Consultation Patient Intake Questions
              </h3>
              <p className="text-xs text-[#6B6E84] font-medium">
                Questions answered by patients during appointment booking
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#4C5BBD] bg-[#F2F5FF] px-3 py-1 rounded-full shadow-xs border border-slate-200/80">
            {(activeDoctor.intake_questions || []).length} Active Questions
          </span>
        </div>

        <div className="space-y-3">
          {(activeDoctor.intake_questions || [
            'What are your primary symptoms or concerns today?',
            'How long have you been experiencing these symptoms?',
            'Are you currently taking any regular medications or have drug allergies?'
          ]).map((question, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-[#F8FAFE] border border-slate-200/80 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#4C5BBD] text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-[#1F1F1F] leading-relaxed">
                  {question}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smooth Bottom Sheet Edit Modal (Same UX and style as Patient modal) */}
      <DoctorProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={(updated) => {
          setActiveDoctor(updated);
        }}
      />

    </div>
  );
};

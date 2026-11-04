import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById } from '../services/supabase/doctorService';
import { Loader } from '../components/ui/Loader';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Award,
  ShieldCheck,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Stethoscope,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const DoctorDetailsPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDoctorById(doctorId).then((doc) => {
      setDoctor(doc);
      setIsLoading(false);
    });
  }, [doctorId]);

  if (isLoading) return <Loader message="Loading doctor profile details..." size="lg" className="py-20" />;
  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center font-sans">
        <h2 className="text-xl font-bold text-[#1F1F1F]">Doctor Profile Not Found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="mt-4 px-5 py-2.5 rounded-full bg-[#4C5BBD] text-white text-xs font-bold shadow-xs border-0"
        >
          Return to Doctor Directory
        </button>
      </div>
    );
  }

  // Dynamic degrees parsing from doctor.title or doctor.degrees
  const degrees = Array.isArray(doctor.degrees) && doctor.degrees.length > 0
    ? doctor.degrees
    : doctor.title
    ? doctor.title.split(',').map((d) => d.trim()).filter(Boolean)
    : ['Medical Degree Registered'];

  const specializations = Array.isArray(doctor.specializations) && doctor.specializations.length > 0
    ? doctor.specializations
    : [
        doctor.specialty || 'General Practice',
        'Clinical Consultations & Diagnosis',
        'Prescription & Disease Management',
        'Preventative Healthcare & Telemetry',
      ];

  const totalPatients = doctor.review_count ? `${doctor.review_count * 15}+` : '100+';
  const bioText = doctor.bio?.trim() || `${doctor.name || 'This doctor'} is a verified medical specialist in ${doctor.specialty || 'General Medicine'} consulting at ${doctor.hospital || 'HealFlow Clinic'}.`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 font-sans">
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/doctors')}
        style={{ outline: 'none' }}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#6B6E84] hover:text-[#4C5BBD] hover:bg-[#F2F5FF] text-xs font-bold shadow-xs border-0 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors Directory</span>
      </button>

      {/* 1. Doctor Hero Profile Banner Card (Borderless & Light Soft Shadow) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-0 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-slate-100">
          <img
            src={doctor.avatar_url}
            alt={doctor.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-0 shadow-xs shrink-0"
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] shadow-xs">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{doctor.specialty}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 shadow-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Specialist</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading tracking-wide">
              {doctor.name}
            </h1>
            <p className="text-xs font-bold text-[#4C5BBD]">{doctor.title}</p>
            
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#6B6E84]">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-[#1F1F1F]">{doctor.rating}</span>
                <span>({doctor.review_count} patient reviews)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#4C5BBD]" />
                <span className="font-bold text-[#1F1F1F]">{doctor.experience_years}+ Years Experience</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#4C5BBD]" />
                <span>{doctor.hospital || 'Smart Clinic Central'} ({doctor.room_number || 'Room 302'})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Highlights Bar (Single Line Text fit) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-center">
            <p className="text-[10px] font-bold text-[#6B6E84] uppercase font-secondary">Total Consultations</p>
            <p className="text-base font-black text-[#4C5BBD] font-sans mt-0.5">{totalPatients}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-center">
            <p className="text-[10px] font-bold text-[#6B6E84] uppercase font-secondary">OPD Destination</p>
            <p className="text-sm sm:text-base font-black text-[#1F1F1F] font-sans mt-0.5 truncate">{doctor.room_number || 'Room 101'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-center">
            <p className="text-[10px] font-bold text-[#6B6E84] uppercase font-secondary">Avg Consultation</p>
            <p className="text-base font-black text-[#1F1F1F] font-sans mt-0.5">15 Mins</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-center">
            <p className="text-[10px] font-bold text-[#6B6E84] uppercase font-secondary">OPD Queue</p>
            <p className="text-base font-black text-emerald-600 font-sans mt-0.5">Live Counter</p>
          </div>
        </div>

        {/* 3. Biography & Medical Background */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading">
            Biography & Clinical Overview
          </h3>
          <p className="text-xs text-[#6B6E84] leading-relaxed font-medium font-secondary">
            {bioText}
          </p>
        </div>
      </div>

      {/* 4. Qualifications, Experience & Specializations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Medical Education & Degrees */}
        <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center gap-2 pb-2 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-[#4C5BBD]" />
            <span>Degrees & Qualifications</span>
          </h3>

          <div className="space-y-2.5">
            {degrees.map((deg, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#4C5BBD] shrink-0" />
                <span className="text-xs font-bold text-[#1F1F1F] font-secondary">{deg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Specializations */}
        <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center gap-2 pb-2 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-[#4C5BBD]" />
            <span>Key Specializations</span>
          </h3>

          <div className="space-y-2.5">
            {specializations.map((spec, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-[#1F1F1F] font-secondary">{spec}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Consultation Fee & Book Slot Action Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-0 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider font-secondary">Consultation Fee</span>
          <p className="text-3xl font-black text-[#1F1F1F] font-sans mt-0.5">{formatCurrency(doctor.consultation_fee)}</p>
          <p className="text-[11px] text-[#6B6E84] font-medium font-secondary mt-0.5">Includes live OPD queue token generation</p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/doctors/${doctor.id}/book`)}
          style={{ outline: 'none' }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#4C5BBD] text-white text-xs font-black shadow-xs hover:bg-[#3B489E] transition-all border-0"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Consultation Slot</span>
        </button>
      </div>

    </div>
  );
};

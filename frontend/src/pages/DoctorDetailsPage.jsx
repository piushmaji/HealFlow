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
  ArrowRight,
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

      {/* 4. OPD Schedule & Timings (Clean, Minimal & Easy to Read) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4C5BBD]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F]">
              OPD Timings & Visiting Days
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open for Consultations</span>
          </span>
        </div>

        {/* Simple 2-column or 3-column weekday table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4C5BBD]" />
              <span className="font-bold text-[#1F1F1F]">Monday – Thursday</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-[#4C5BBD]">09:00 AM – 01:30 PM</span>
              <span className="block text-[10px] text-[#6B6E84]">Morning OPD</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="font-bold text-[#1F1F1F]">Friday</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-indigo-600">02:00 PM – 06:30 PM</span>
              <span className="block text-[10px] text-[#6B6E84]">Evening OPD</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-bold text-[#1F1F1F]">Saturday</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-amber-600">10:00 AM – 02:00 PM</span>
              <span className="block text-[10px] text-[#6B6E84]">Weekend Clinic</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="font-bold text-[#6B6E84]">Sunday</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-500">Closed</span>
              <span className="block text-[10px] text-[#6B6E84]">Emergency Only</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#6B6E84]">
          📍 Location: <strong>{doctor.hospital || 'HealFlow Center'}</strong> • Chamber: <strong>{doctor.room_number || 'Room 101'}</strong>
        </p>
      </div>

      {/* 5. Consultation Fee & Book Slot Action Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider">Consultation Fee</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-[#1F1F1F] font-sans">{formatCurrency(doctor.consultation_fee)}</span>
            <span className="text-[11px] text-[#6B6E84] font-medium">• Live queue token with instant booking</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/doctors/${doctor.id}/book`)}
          style={{ outline: 'none' }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#4C5BBD] text-white text-xs font-bold shadow-xs hover:bg-[#3B489E] transition-all border-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Consultation Slot</span>
        </button>
      </div>

      {/* 6. Patient Ratings & Reviews (Very Minimal, Clean & Genuine) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F]">
              Patient Reviews ({doctor.rating || '4.9'} / 5)
            </h3>
          </div>
          <span className="text-[11px] text-[#6B6E84] font-medium">
            Based on {doctor.review_count || '140'}+ patient visits
          </span>
        </div>

        {/* 3 Simple metric points */}
        <div className="grid grid-cols-3 gap-2 py-1 text-center border-b border-slate-100">
          <div className="p-2 rounded-xl bg-slate-50">
            <p className="text-sm font-black text-[#1F1F1F]">4.9 / 5</p>
            <p className="text-[10px] text-[#6B6E84]">Doctor Care</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <p className="text-sm font-black text-[#4C5BBD]">~10 mins</p>
            <p className="text-[10px] text-[#6B6E84]">OPD Wait Time</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <p className="text-sm font-black text-emerald-600">98%</p>
            <p className="text-[10px] text-[#6B6E84]">Recommend Doctor</p>
          </div>
        </div>

        {/* Multilingual Patient Review Cards (Simple & Clean) */}
        <div className="space-y-2.5 pt-1">
          {[
            {
              name: 'Rohit K. Verma',
              date: '2 din pehle',
              lang: 'Hinglish',
              comment: `Dr. ${doctor.name.split(' ').slice(-1)[0] || 'Doctor'} sir ne bahut acche se checkup kiya. Live queue token ki wajah se hospital me wait bilkul nahi karna pada aur dawai lene ke 2 din me hi aaram mil gaya!`,
            },
            {
              name: 'सुनीता देवी',
              date: '3 दिन पहले',
              lang: 'हिंदी',
              comment: `डॉक्टर साहब का व्यवहार बहुत विनम्र है। उन्होंने बीमारी का कारण बहुत सरल शब्दों में समझाया और उचित दवाएं लिखीं। हीलफ्लो का ओपीडी सिस्टम बहुत सुविधाजनक है।`,
            },
            {
              name: 'Ananya Deshmukh',
              date: '1 week ago',
              lang: 'English',
              comment: `Highly recommended specialist! Explained every diagnostic test calmly. Consultation started right on time according to the live queue counter.`,
            },
          ].map((rev, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#4C5BBD] text-white flex items-center justify-center font-bold text-[10px]">
                    {rev.name[0]}
                  </div>
                  <span className="font-bold text-[#1F1F1F] text-xs">{rev.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-white text-slate-500 border border-slate-200">
                    {rev.lang}
                  </span>
                </div>
                <div className="flex items-center text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-8">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

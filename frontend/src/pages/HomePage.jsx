import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Clock,
  Sparkles,
  Search,
  ArrowRight,
  Activity,
  UserCheck,
  Calendar,
  FileText,
  Star,
  ChevronRight,
  ShieldCheck,
  Video,
  CheckCircle2,
  Users,
  Smartphone,
  MessageSquare,
  Lock,
  Building2,
  PhoneCall,
  HeartPulse,
} from 'lucide-react';
import { getDoctors } from '../services/supabase/doctorService';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDoctor } = useAuth();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);

  useEffect(() => {
    getDoctors()
      .then((docs) => {
        if (Array.isArray(docs)) {
          setFeaturedDoctors(docs.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const handleAction = (authenticatedPath) => {
    if (isAuthenticated) {
      if (isDoctor && authenticatedPath === '/doctors') {
        navigate('/doctor-dashboard');
      } else {
        navigate(authenticatedPath);
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-white font-sans text-[#1F1F1F] space-y-16 sm:space-y-24 pb-20">
      
      {/* =========================================================================
          1. HERO SECTION: Clean, High-Conversion Healthcare Platform
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF3FF] via-white to-white pt-16 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#4C5BBD] text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#4C5BBD]" />
            <span>Smart OPD Telemedicine & Zero-Wait Live Queue</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-[#1F1F1F] font-heading max-w-4xl mx-auto">
            Healthcare Consultations Without the <span className="text-[#4C5BBD]">Waiting Room</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#6B6E84] max-w-2xl mx-auto leading-relaxed font-medium">
            Book verified hospital specialists, track your live token turn in real time from mobile, and connect instantly via HD video, audio call, or chat when your doctor admits you.
          </p>

          {/* Dual Action CTAs for Patient & Doctor */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto sm:max-w-none">
            <button
              type="button"
              onClick={() => handleAction(isDoctor ? '/doctor-dashboard' : '/doctors')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] active:scale-95 text-white text-xs sm:text-sm font-black shadow-md shadow-[#4C5BBD]/20 border-0 transition-all cursor-pointer"
            >
              <span>{isDoctor ? 'Go to Doctor Workspace' : 'Book a Specialist'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-7 rounded-full bg-[#F2F5FF] hover:bg-[#EEF2FF] active:scale-95 text-[#1F1F1F] text-xs sm:text-sm font-bold border-0 shadow-xs transition-all cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-[#4C5BBD]" />
              <span>Doctor Portal Access</span>
            </button>
          </div>

          {/* Social Proof & Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-10 max-w-3xl mx-auto text-left sm:text-center">
            <div className="bg-white/80 p-3.5 rounded-2xl shadow-2xs sm:bg-transparent sm:p-0 sm:shadow-none">
              <p className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading">50,000+</p>
              <p className="text-xs text-[#6B6E84] font-medium mt-0.5">Patients Served</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-2xl shadow-2xs sm:bg-transparent sm:p-0 sm:shadow-none">
              <p className="text-2xl sm:text-3xl font-black text-[#4C5BBD] font-heading">0 Mins</p>
              <p className="text-xs text-[#6B6E84] font-medium mt-0.5">Crowded Hall Waiting</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-2xl shadow-2xs sm:bg-transparent sm:p-0 sm:shadow-none">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading">HD P2P</p>
              <p className="text-xs text-[#6B6E84] font-medium mt-0.5">Video & Voice Consult</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-2xl shadow-2xs sm:bg-transparent sm:p-0 sm:shadow-none">
              <p className="text-2xl sm:text-3xl font-black text-amber-500 font-heading">4.9 ★</p>
              <p className="text-xs text-[#6B6E84] font-medium mt-0.5">Patient Satisfaction</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. HOW IT WORKS (FOR BOTH PATIENT & DOCTOR)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#EEF2FF] text-[#4C5BBD] text-xs font-black uppercase tracking-wider">
            Seamless Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1F1F1F] font-heading">
            How HealFlow Works
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6E84] font-medium">
            Designed to bridge patients and doctors with synchronized realtime queue intelligence.
          </p>
        </div>

        {/* 2 Track Comparison: Patient Experience vs Doctor Control */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Patient Experience Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F8FAFE] to-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4C5BBD] flex items-center justify-center font-black">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#4C5BBD] tracking-wider">For Patients</span>
                <h3 className="text-lg font-black text-[#1F1F1F] font-heading">Zero-Friction OPD Visit</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#4C5BBD] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F]">Instant Specialist Booking</h4>
                  <p className="text-xs text-[#6B6E84]">Find verified doctors by symptom or specialty and get an instant digital OPD token.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#4C5BBD] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F]">Live Mobile Turn Tracker</h4>
                  <p className="text-xs text-[#6B6E84]">Watch queue progression, people ahead, and estimated wait time live on your phone.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#4C5BBD] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F]">Direct Video & Chamber Chat</h4>
                  <p className="text-xs text-[#6B6E84]">Enter the chamber when your turn is called. Consult via HD video, audio call, or live prescription chat.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAction('/doctors')}
              className="w-full py-3 px-5 rounded-full bg-white hover:bg-[#EEF2FF] text-[#4C5BBD] border border-[#4C5BBD]/30 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Explore Doctors & Book Token</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Doctor Experience Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1B2559] to-[#243374] text-white shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">For Doctors</span>
                <h3 className="text-lg font-black text-white font-heading">Dedicated OPD Control Desk</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-[#1B2559] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Full Live Queue Telemetry</h4>
                  <p className="text-xs text-white/80">Manage today's schedule, waiting list, and room queue status from a single distraction-free screen.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-[#1B2559] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">One-Click Token Calling</h4>
                  <p className="text-xs text-white/80">Call next patient and admit them into chamber with automatic queue progression and SMS/realtime notification.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-[#1B2559] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">In-Chamber Telemedicine Suite</h4>
                  <p className="text-xs text-white/80">Launch direct video/voice calls, inspect pre-consultation intake questions, and exchange clinical notes seamlessly.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 px-5 rounded-full bg-white hover:bg-slate-100 text-[#1B2559] text-xs font-black transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 border-0"
            >
              <span>Doctor Portal Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1B2559]" />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. PLATFORM CAPABILITIES GRID
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#EEF2FF] text-[#4C5BBD] text-xs font-black uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading">
            Built for Modern Hospital & Clinic Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Live Queue Tracking',
              desc: 'Patients monitor queue position and wait times in real time from anywhere.',
              icon: Clock,
              badge: 'Real-time',
            },
            {
              title: 'HD Video & Audio Call',
              desc: 'WebRTC powered low-latency encrypted clinical video and voice consultations.',
              icon: Video,
              badge: 'Encrypted',
            },
            {
              title: 'AI Specialty Guide',
              desc: 'Triage symptoms via voice or text to find the exact doctor specialty needed.',
              icon: Sparkles,
              badge: 'AI Powered',
            },
            {
              title: 'Digital Prescriptions',
              desc: 'Seamless document and prescription upload right inside the consultation chamber.',
              icon: FileText,
              badge: 'Instant Sync',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#F8FAFE] hover:bg-white border border-slate-200/80 hover:border-[#4C5BBD]/40 shadow-2xs hover:shadow-sm transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-white text-[#4C5BBD] shadow-2xs flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4C5BBD]">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#1F1F1F] font-heading">{item.title}</h3>
                  <p className="text-xs text-[#6B6E84] leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. AI ASSISTANT PROMINENT BANNER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#1B2559] via-[#243374] to-[#4C5BBD] text-white p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Specialist Guide • Live RAG</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-black font-heading text-white">
              Not sure which specialist to consult?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
              Describe your symptoms, send a voice note, or paste doctor notes. Our AI Guide analyzes your clinical concerns and matches verified doctors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleAction('/patients/ai-assistant')}
            className="w-full md:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#1B2559] text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer border-0 shrink-0 flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#4C5BBD]" />
            <span>Launch AI Specialist Guide</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURED DOCTORS PREVIEW
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#4C5BBD]">Verified Consultants</span>
            <h2 className="text-xl sm:text-3xl font-black text-[#1F1F1F] font-heading mt-0.5">
              Featured Clinic Specialists
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="px-4 py-2 rounded-full bg-[#F2F5FF] hover:bg-[#EEF2FF] text-[#4C5BBD] text-xs font-bold transition-all border-0 shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            View All Doctors →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {featuredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-[#4C5BBD]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                    alt={doc.name}
                    className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-[#4C5BBD] bg-[#EEF2FF] px-2 py-0.5 rounded-md">
                      {doc.specialty}
                    </span>
                    <h3 className="text-sm font-black text-[#1F1F1F] font-heading truncate mt-1">{doc.name}</h3>
                    <p className="text-xs text-[#6B6E84] font-medium">{doc.hospital || 'HealFlow Clinic'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{doc.rating || 4.9}</span>
                    <span className="text-slate-400 font-normal">({doc.review_count || 50}+)</span>
                  </div>
                  <span className="font-black text-[#4C5BBD]">₹{doc.consultation_fee || 500}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAction(`/book/${doc.id}`)}
                className="w-full py-2.5 px-4 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold transition-all border-0 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Token Slot</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. BOTTOM CTA: JOIN HEALFLOW
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1F1F1F] rounded-3xl p-8 sm:p-12 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
              Ready for a smarter consultation experience?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Join thousands of patients and doctors experiencing instant appointments and live digital queue telemetry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto py-3.5 px-7 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs border-0 transition-all cursor-pointer"
            >
              Sign In as Patient →
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto py-3.5 px-7 rounded-full bg-white hover:bg-slate-100 text-[#1F1F1F] text-xs font-black shadow-xs border-0 transition-all cursor-pointer"
            >
              Doctor Workspace Portal →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

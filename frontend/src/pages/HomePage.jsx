import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
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
} from 'lucide-react';
import { getDoctors } from '../services/supabase/doctorService';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);

  useEffect(() => {
    getDoctors().then((docs) => {
      if (Array.isArray(docs)) {
        setFeaturedDoctors(docs.slice(0, 3));
      }
    }).catch(() => {});
  }, []);

  const handleAction = (authenticatedPath) => {
    if (isAuthenticated) {
      navigate(authenticatedPath);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-white font-sans text-[#1F1F1F] space-y-20 pb-20">
      
      {/* 1. Hero Section - Static Informational Landing Page */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F2F5FF]/80 via-white to-white py-24 px-4 sm:px-6 lg:px-8 border-0">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#5B81FA] border-0 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#5B81FA]" />
            <span>Smart OPD Appointments & Real-Time Live Queue</span>
          </div>

          {/* Static Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-[#1F1F1F] font-heading max-w-3xl mx-auto">
            Smart Healthcare Appointments & <span className="text-[#5B81FA]">Live Queue Tracking</span>
          </h1>

          {/* Static Short Description */}
          <p className="text-sm sm:text-base text-[#6B6E84] max-w-2xl mx-auto leading-relaxed font-medium">
            Book verified hospital specialists, receive an instant digital OPD queue token, and track your consultation turn in real time without standing in crowded waiting rooms.
          </p>

          {/* Clean Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleAction('/doctors')}
              style={{ outline: 'none' }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-[#5B81FA] hover:bg-[#486de8] text-white text-sm font-black shadow-xs border-0 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleAction('/doctors')}
              style={{ outline: 'none' }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-[#F2F5FF] hover:bg-[#EBF1FF] text-[#1F1F1F] text-sm font-black border-0 shadow-xs transition-all"
            >
              <Search className="w-4 h-4 text-[#5B81FA]" />
              <span>Find Doctors</span>
            </button>
          </div>

          {/* Static Metrics Bar */}
          <div className="grid grid-cols-3 gap-6 pt-10 border-0 max-w-2xl mx-auto text-xs">
            <div>
              <p className="text-2xl font-black text-[#1F1F1F] font-heading">50,000+</p>
              <p className="text-[#6B6E84] font-medium mt-0.5">Appointments Booked</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#5B81FA] font-heading">15+ Mins</p>
              <p className="text-[#6B6E84] font-medium mt-0.5">Saved per Visit</p>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-500 font-heading">4.9 ★</p>
              <p className="text-[#6B6E84] font-medium mt-0.5">Patient Satisfaction</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Static Services Showcase */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#F2F5FF] text-[#5B81FA] border-0 text-xs font-extrabold uppercase tracking-wider shadow-xs">
            Our Healthcare Services
          </span>
          <h2 className="text-3xl font-black text-[#1F1F1F] font-heading">How HealFlow Elevates Your Care</h2>
          <p className="text-xs text-[#6B6E84] font-medium">
            Comprehensive digital healthcare telemetry connecting patients, doctors, and hospital OPD counters seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Instant OPD Booking',
              desc: 'Book verified specialist appointments in under 60 seconds with live slot availability.',
              icon: Calendar,
              tag: 'Smart Slots',
            },
            {
              title: 'Live Queue Tracking',
              desc: 'Monitor real-time patient queue turns directly from your smartphone without waiting rooms.',
              icon: Clock,
              tag: 'Real-Time Sync',
            },
            {
              title: 'AI Specialty Guide',
              desc: 'Describe symptoms in plain text to receive instant recommendations for the right specialist.',
              icon: Sparkles,
              tag: 'AI Powered',
            },
            {
              title: 'Digital Health Records',
              desc: 'Access verified prescriptions, digital tokens, and consultation history anytime.',
              icon: FileText,
              tag: 'HIPAA Safe',
            },
          ].map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                onClick={() => handleAction('/doctors')}
                className="p-6 rounded-3xl bg-[#F8FAFE] border-0 shadow-xs flex flex-col justify-between group cursor-pointer hover:bg-[#F2F5FF] transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#5B81FA] border-0 shadow-xs flex items-center justify-center group-hover:bg-[#5B81FA] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#5B81FA] border-0 shadow-xs">
                      {service.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1F1F1F] font-heading group-hover:text-[#5B81FA] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#6B6E84] leading-relaxed mt-1.5 font-medium">
                      {service.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-0 flex items-center text-xs font-bold text-[#5B81FA] gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Sign in to view</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Static AI Assistant Callout */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F2F5FF] rounded-3xl p-8 sm:p-12 border-0 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-[#5B81FA] border-0 text-xs font-extrabold shadow-xs">
              <Sparkles className="w-4 h-4 text-[#5B81FA]" />
              <span>Smart Medical Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#1F1F1F]">Unsure Which Doctor Specialty You Need?</h2>
            <p className="text-xs text-[#6B6E84] leading-relaxed font-medium">
              Describe your symptoms or health queries. Our AI Assistant identifies potential medical specialties and connects you directly with top rated doctors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleAction('/ai-assistant')}
            style={{ outline: 'none' }}
            className="shrink-0 flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-[#5B81FA] hover:bg-[#486de8] text-white text-xs font-black shadow-xs border-0 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sign In for AI Assistant</span>
          </button>
        </div>
      </section>

      {/* 4. Static Featured Specialists Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-[#5B81FA] uppercase tracking-wider">Top Specialists</span>
            <h2 className="text-2xl font-black text-[#1F1F1F] font-heading mt-0.5">Featured Clinic Specialists</h2>
          </div>
          <button
            type="button"
            onClick={() => handleAction('/doctors')}
            style={{ outline: 'none' }}
            className="px-4 py-2 rounded-full bg-[#F2F5FF] text-[#5B81FA] hover:bg-[#EBF1FF] text-xs font-bold border-0 shadow-xs transition-all"
          >
            View All Doctors
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDoctors.map((doc) => (
            <div key={doc.id} className="p-5 rounded-3xl bg-[#F8FAFE] border-0 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <img
                    src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                    alt={doc.name}
                    className="w-12 h-12 rounded-full object-cover border-0 shadow-xs"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#5B81FA] bg-white px-2.5 py-0.5 rounded-full border-0 shadow-xs">
                      {doc.specialty}
                    </span>
                    <h3 className="text-sm font-bold text-[#1F1F1F] mt-1 font-heading">{doc.name}</h3>
                    <p className="text-xs text-[#6B6E84] font-medium">{doc.title}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-0">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{doc.rating}</span>
                    <span className="text-[#6B6E84] font-normal">({doc.review_count || doc.reviews_count || 120})</span>
                  </div>
                  <span className="font-extrabold text-[#5B81FA]">₹{doc.consultation_fee || 800} / visit</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAction('/doctors')}
                style={{ outline: 'none' }}
                className="mt-4 w-full py-2.5 px-4 rounded-full bg-[#5B81FA] hover:bg-[#486de8] text-white text-xs font-black shadow-xs border-0 transition-all"
              >
                Sign In to Book Slot
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Static Bottom CTA Banner */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#29318A] rounded-3xl p-8 sm:p-12 text-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left border-0">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide">
              Ready to Experience Waiting-Free OPD Visits?
            </h2>
            <p className="text-xs sm:text-sm text-[#CEDEFF] font-medium leading-relaxed">
              Join thousands of patients saving hours every week with HealFlow digital queue telemetry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ outline: 'none' }}
              className="py-3.5 px-8 rounded-full bg-[#5B81FA] hover:bg-[#486de8] text-white text-xs font-black shadow-xs border-0 transition-all"
            >
              <span>Sign In as Patient →</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ outline: 'none' }}
              className="py-3.5 px-8 rounded-full bg-white hover:bg-[#F2F5FF] text-[#29318A] text-xs font-black shadow-xs border-0 transition-all"
            >
              <span>Doctor Portal Access →</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { CLINIC_INFO } from '../../utils/constants';

export const Footer = () => {
  return (
    <footer className="bg-white text-[#6B6E84] text-xs border-t border-slate-200 pt-12 pb-8 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#5B81FA] flex items-center justify-center text-white font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-[#1F1F1F] font-poppins">Smart Clinic</span>
            </div>
            <p className="text-[#6B6E84] text-xs leading-relaxed">
              Modern digital appointment scheduling and real-time live queue management platform built for modern clinics & patient care.
            </p>
            <div className="flex items-center gap-2 text-[#5B81FA] text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant & Secure Architecture</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-[#1F1F1F] uppercase tracking-wider mb-3 text-[11px] font-poppins">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#5B81FA] transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-[#5B81FA] transition-colors">Find Specialists & Doctors</Link>
              </li>
              <li>
                <Link to="/live-queue" className="hover:text-[#5B81FA] transition-colors">Live Patient Queue Tracker</Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-[#5B81FA] transition-colors">AI Specialist Recommender</Link>
              </li>
            </ul>
          </div>

          {/* Clinic Hours & Location */}
          <div>
            <h4 className="font-bold text-[#1F1F1F] uppercase tracking-wider mb-3 text-[11px] font-poppins">Clinic Information</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#5B81FA] shrink-0 mt-0.5" />
                <span>{CLINIC_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#5B81FA] shrink-0" />
                <span>{CLINIC_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#5B81FA] shrink-0" />
                <span>{CLINIC_INFO.email}</span>
              </li>
            </ul>
          </div>

          {/* Important Medical Disclaimer */}
          <div className="p-3.5 bg-[#F2F5FF] rounded-2xl border border-[#CEDEFF]">
            <h4 className="font-bold text-[#29318A] uppercase tracking-wider mb-1 text-[11px] font-poppins">Medical Disclaimer</h4>
            <p className="text-[11px] leading-relaxed text-[#1F1F1F]">
              Smart Clinic services and AI specialist recommendations are for scheduling & information purposes only. They do not constitute formal medical diagnosis or emergency treatment. In medical emergencies, call emergency services immediately.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#6B6E84] text-[11px]">
          <p>© {new Date().getFullYear()} Smart Clinic Care Systems. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[#6B6E84]">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Healthcare Quality</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

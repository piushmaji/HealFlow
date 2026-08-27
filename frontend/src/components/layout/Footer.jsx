import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { HealFlowLogo } from '../common/HealFlowLogo';
import { HealFlowIcon } from '../common/HealFlowIcon';
import { CLINIC_INFO } from '../../utils/constants';

export const Footer = () => {
  return (
    <footer className="bg-white text-[#6B6E84] text-xs border-0 pt-12 pb-8 mt-auto font-sans shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand info */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-3 group shrink-0 outline-none" style={{ outline: 'none' }}>
              <HealFlowIcon variant="dark" size={36} className="shrink-0 group-hover:scale-105 transition-transform" />

              <div>
                <div className="flex items-center gap-1 font-heading font-black text-xl text-[#1F1F1F] tracking-wide">
                  <span>HEAL</span>
                  <span className="text-[#5B81FA]">FLOW</span>
                </div>
                <p className="text-[9px] text-[#6B6E84] font-extrabold tracking-wider uppercase">
                  Care That Flows
                </p>
              </div>
            </Link>

            <p className="text-[#6B6E84] text-xs leading-relaxed font-medium">
              Modern digital appointment scheduling and real-time live queue management platform built for modern clinics & patient care.
            </p>

            <div className="flex items-center gap-2 text-[#5B81FA] text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant & Secure Architecture</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-black text-[#1F1F1F] uppercase tracking-wider mb-3 text-[11px] font-heading">Quick Navigation</h4>
            <ul className="space-y-2 font-medium">
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
            <h4 className="font-black text-[#1F1F1F] uppercase tracking-wider mb-3 text-[11px] font-heading">Clinic Information</h4>
            <ul className="space-y-2 font-medium">
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
          <div className="p-4 bg-[#F8FAFE] rounded-2xl border-0 shadow-xs space-y-1">
            <h4 className="font-black text-[#29318A] uppercase tracking-wider text-[11px] font-heading">Medical Disclaimer</h4>
            <p className="text-[11px] leading-relaxed text-[#1F1F1F] font-medium">
              HealFlow services and AI recommendations are for scheduling & info only. In medical emergencies, call emergency services immediately.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-0 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#6B6E84] text-[11px] font-medium">
          <p>© {new Date().getFullYear()} HealFlow Healthcare Telemetry Systems. All rights reserved.</p>
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

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  Stethoscope,
  Users,
  Settings,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const { isDoctor, activeDoctor, patientUser } = useAuth();

  const patientLinks = [
    { name: 'Dashboard', path: '/patient-dashboard', icon: LayoutDashboard },
    { name: 'Live Queue Status', path: '/live-queue', icon: Clock },
    { name: 'Find Doctors', path: '/doctors', icon: Stethoscope },
    { name: 'AI Symptom Guide', path: '/ai-assistant', icon: Sparkles },
  ];

  const doctorLinks = [
    { name: 'Doctor Control Room', path: '/doctor-dashboard', icon: LayoutDashboard },
    { name: 'Patient Queue', path: '/live-queue', icon: Users },
    { name: 'Appointments', path: '/doctors', icon: Calendar },
    { name: 'Schedule Settings', path: '#', icon: Sliders },
  ];

  const links = isDoctor ? doctorLinks : patientLinks;

  return (
    <aside className="w-64 shrink-0 hidden md:block bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 shadow-sm">
      {/* Profile Overview Card */}
      <div className="p-3.5 mb-6 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
        <img
          src={isDoctor ? activeDoctor.avatar_url : patientUser.avatar}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border border-brand-500"
        />
        <div className="overflow-hidden">
          <h4 className="text-xs font-bold text-slate-900 truncate">
            {isDoctor ? activeDoctor.name : patientUser.name}
          </h4>
          <p className="text-[11px] text-teal-700 font-semibold truncate">
            {isDoctor ? activeDoctor.specialty : 'Verified Patient'}
          </p>
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
        {isDoctor ? 'Doctor Workspace' : 'Patient Portal'}
      </p>

      {/* Nav list */}
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

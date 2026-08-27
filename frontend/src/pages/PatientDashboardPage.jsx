import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { AppointmentList } from '../features/appointments/AppointmentList';
import {
  Calendar,
  Sparkles,
  Ticket,
  Clock,
  ArrowRight,
  PhoneCall,
  Activity,
  CheckCircle2,
  Stethoscope,
  Palette,
} from 'lucide-react';

export const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const { patientUser } = useAuth();
  const { appointments, activeTrackingAppointment } = useQueue();

  const scheduledAppointments = appointments.filter((a) => a.status === 'Scheduled');
  const completedAppointments = appointments.filter((a) => a.status === 'Completed');

  const sideQuickActions = [
    {
      title: 'Book Doctor Slot',
      desc: 'Find specialist doctors & instant slots',
      icon: Stethoscope,
      path: '/doctors',
      color: 'bg-[#F2F5FF] text-[#4C5BBD]',
    },
    {
      title: 'Live OPD Queue Status',
      desc: 'Track your token wait time live',
      icon: Clock,
      path: '/live-queue',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'AI Symptom Assistant',
      desc: '24/7 medical guidance & Q&A',
      icon: Sparkles,
      path: '/ai-assistant',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'UI Design Style Guide',
      desc: 'Explore UI components & tokens',
      icon: Palette,
      path: '/style-guide',
      color: 'bg-blue-50 text-[#5B81FA]',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8 font-sans">
      
      {/* Structured 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left / Main Workspace Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Queue Token Hero Card (Primary Focal Point) */}
          <div className="bg-white rounded-3xl p-6 border-0 shadow-xs relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center font-bold shadow-xs">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border-0 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live OPD Queue Token
                  </span>
                  <p className="text-xs font-bold text-[#6B6E84] mt-0.5">
                    Room 302 • Cardiology OPD
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/live-queue')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4C5BBD] text-white text-xs font-black hover:bg-[#3B489E] transition-all shadow-xs border-0"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Track Live Queue</span>
              </button>
            </div>

            {/* Token Number Display */}
            <div className="p-4 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Your Assigned Token</p>
                <h2 className="text-3xl font-black text-[#4C5BBD] font-sans tracking-wide mt-0.5">
                  {activeTrackingAppointment?.token_number || 'CARD-007'}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Assigned Doctor</p>
                <p className="text-xs font-black text-[#1F1F1F] mt-0.5">
                  {activeTrackingAppointment?.doctor_name || 'Dr. Rajesh Sharma'}
                </p>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#1F1F1F] font-heading">My Appointments</h3>
                <p className="text-xs text-[#6B6E84]">Scheduled consultations and past visit history</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="text-xs font-bold text-[#4C5BBD] hover:underline flex items-center gap-1"
              >
                <span>Find Doctors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <AppointmentList
              appointments={appointments}
              onBookNew={() => navigate('/doctors')}
            />
          </div>

        </div>

        {/* Right Sidebar Information Panel (1/3 width) - Exactly 2 Balanced Cards */}
        <div className="space-y-6">
          
          {/* Card 1: Quick Actions */}
          <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-[#1F1F1F] font-heading uppercase tracking-wider pb-2 border-b border-slate-100">
              Quick Actions
            </h4>

            <div className="space-y-2.5">
              {sideQuickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    onClick={() => navigate(item.path)}
                    className="p-3 rounded-2xl bg-[#F8FAFE] border-0 hover:bg-[#F2F5FF] cursor-pointer transition-all shadow-xs group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-[#1F1F1F] font-heading group-hover:text-[#4C5BBD] transition-colors">
                          {item.title}
                        </h5>
                        <p className="text-[10px] text-[#6B6E84] font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B6E84] group-hover:text-[#4C5BBD] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Combined Health Summary & Integrated Clinic Support */}
          <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4">
            <h4 className="text-xs font-black text-[#1F1F1F] font-heading uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4C5BBD]" />
              <span>Health Summary & Support</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center justify-between">
                <span className="text-[#6B6E84] font-medium">Upcoming Visits</span>
                <span className="font-black text-[#4C5BBD] text-sm">{scheduledAppointments.length}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center justify-between">
                <span className="text-[#6B6E84] font-medium">Completed Visits</span>
                <span className="font-black text-emerald-600 text-sm">{completedAppointments.length}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center justify-between">
                <span className="text-[#6B6E84] font-medium">Primary Clinic</span>
                <span className="font-bold text-[#1F1F1F]">Apollo Super Speciality</span>
              </div>
            </div>

            {/* Integrated Helpline Banner inside Health Summary Card */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider mb-2">OPD Helpdesk Support</p>
              <a
                href="tel:1800432535"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-rose-50 text-rose-600 border-0 text-xs font-bold hover:bg-rose-100 transition-colors shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Helpline: +91 1800-432-535</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

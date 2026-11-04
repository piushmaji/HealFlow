import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { AppointmentList } from '../features/appointments/AppointmentList';
import { PatientOnboardingModal } from '../features/patient/PatientOnboardingModal';
import { PatientDiscoverySection } from '../features/dashboard/PatientDiscoverySection';
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
  User,
  CalendarX,
  AlertCircle,
} from 'lucide-react';

export const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const { patientUser, isPatient } = useAuth();
  const { appointments, activeTrackingAppointment } = useQueue();

  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Automatically prompt new patients who haven't completed their required medical details
  useEffect(() => {
    if (isPatient && patientUser?.id) {
      const hasDismissed = sessionStorage.getItem(`healflow_onboard_prompt_dismissed_${patientUser.id}`);
      if (!patientUser.hasCompletedMedicalDetails && !hasDismissed) {
        // Show after brief entrance delay
        const timer = setTimeout(() => {
          setIsOnboardingModalOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [isPatient, patientUser?.id, patientUser?.hasCompletedMedicalDetails]);

  const handleCloseOnboardingModal = () => {
    if (patientUser?.id) {
      sessionStorage.setItem(`healflow_onboard_prompt_dismissed_${patientUser.id}`, 'true');
    }
    setIsOnboardingModalOpen(false);
  };

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
      
      {/* Required Medical Profile Completion Popup */}
      <PatientOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={handleCloseOnboardingModal}
      />

      {/* Medical Profile Pending Alert Banner (If not completed) */}
      {!patientUser?.hasCompletedMedicalDetails && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-950 font-heading">
                Complete Your Medical Profile
              </h4>
              <p className="text-[11px] text-amber-800 font-medium">
                Add your Date of Birth & Gender to unlock automated OPD token prioritization.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOnboardingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600 text-white text-xs font-black hover:bg-amber-700 transition-all shadow-xs border-0 cursor-pointer self-end sm:self-auto"
          >
            <span>Complete Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Structured 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left / Main Workspace Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Healthcare Discovery Section: Search, 4 Specialties & AI Guide */}
          <PatientDiscoverySection />

          {/* Live Queue Token Hero Card (Dynamic - only shows token when appointment exists) */}
          {activeTrackingAppointment ? (
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
                      {activeTrackingAppointment.room_number || 'Room 101'} • {activeTrackingAppointment.specialty || 'General'} OPD
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/patients/live-queue/${activeTrackingAppointment.id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4C5BBD] text-white text-xs font-black hover:bg-[#3B489E] transition-all shadow-xs border-0 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Track Live Queue</span>
                </button>
              </div>

              {/* Token Number Display */}
              <div className="p-4 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Your Assigned Token</p>
                  <h2 className="text-3xl font-black text-[#4C5BBD] font-sans tracking-wide mt-0.5">
                    {activeTrackingAppointment.token_number}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-[#4C5BBD]" />
                    <span>{activeTrackingAppointment.date || activeTrackingAppointment.slot_date}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-[#4C5BBD]" />
                    <span>{activeTrackingAppointment.time || activeTrackingAppointment.slot_time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xs shrink-0 bg-[#EEF2FF] flex items-center justify-center">
                    <img
                      src={
                        activeTrackingAppointment.doctor_avatar ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={activeTrackingAppointment.doctor_name || 'Doctor'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Assigned Doctor</p>
                    <p className="text-xs font-black text-[#1F1F1F] mt-0.5">
                      {activeTrackingAppointment.doctor_name || 'Dr. Specialist'}
                    </p>
                    <p className="text-[11px] text-[#4C5BBD] font-bold">
                      {activeTrackingAppointment.specialty || 'Consultant'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border-0 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
                  <CalendarX className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1F1F1F]">No Active OPD Queue Token</h3>
                  <p className="text-xs text-[#6B6E84] mt-0.5">
                    You do not have any consultations in progress. Book an appointment to get a live queue token.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4C5BBD] text-white text-xs font-black hover:bg-[#3B489E] transition-all shadow-xs border-0 cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>
          )}

          {/* Appointments List */}
          <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#1F1F1F] font-heading">My Appointments</h3>
                <p className="text-xs text-[#6B6E84]">Scheduled consultations and visit history</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="text-xs font-bold text-[#4C5BBD] hover:underline flex items-center gap-1 cursor-pointer border-0 bg-transparent"
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

        {/* Right Sidebar Information Panel (1/3 width) */}
        <div className="space-y-6">
          
          {/* Card 0: Patient Profile & Health Card */}
          <div className="bg-[#F2F5FF] rounded-3xl p-5 border-0 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#4C5BBD] text-white shadow-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>{patientUser.hasCompletedMedicalDetails ? 'Profile Complete' : 'Profile Active'}</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#4C5BBD]">
                {patientUser.healthId || (patientUser.id ? `HLF-${patientUser.id.slice(0, 8).toUpperCase()}` : 'HLF-PATIENT')}
              </span>
            </div>

            {/* Profile Avatar + Details */}
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0 w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xs">
                {patientUser.avatar ? (
                  <img
                    src={patientUser.avatar}
                    alt={patientUser.name || 'Patient'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#4C5BBD] text-white font-black text-lg flex items-center justify-center">
                    {(patientUser.name || 'P').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-sm font-black text-[#1F1F1F] font-heading truncate">
                  {patientUser.name || 'Set Your Name'}
                </h4>
                <p className="text-[11px] text-[#6B6E84] font-medium truncate">
                  {patientUser.email || 'No email registered'}
                </p>
                {patientUser.phone && (
                  <p className="text-[11px] text-[#6B6E84] font-medium">
                    {patientUser.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Medical Highlights pill */}
            {(patientUser.dateOfBirth || patientUser.gender || patientUser.bloodGroup) && (
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
                {patientUser.gender && (
                  <span className="px-2 py-0.5 rounded-md bg-white text-[#4C5BBD] font-bold shadow-2xs">
                    {patientUser.gender}
                  </span>
                )}
                {patientUser.bloodGroup && (
                  <span className="px-2 py-0.5 rounded-md bg-white text-rose-600 font-bold shadow-2xs">
                    Blood: {patientUser.bloodGroup}
                  </span>
                )}
                {patientUser.dateOfBirth && (
                  <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold shadow-2xs">
                    DOB: {patientUser.dateOfBirth}
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/patients/profile')}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#4C5BBD] text-xs font-bold hover:bg-[#4C5BBD] hover:text-white transition-all shadow-xs border-0 cursor-pointer"
            >
              <span>Manage Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

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
              <span>Consultation Summary & Support</span>
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
                <span className="text-[#6B6E84] font-medium">Total Appointments</span>
                <span className="font-bold text-[#1F1F1F]">{appointments.length}</span>
              </div>
            </div>

            {/* Helpline Banner */}
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

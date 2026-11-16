import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { AppointmentList } from '../features/appointments/AppointmentList';
import { PatientOnboardingModal } from '../features/patient/PatientOnboardingModal';
import { PatientDiscoverySection } from '../features/dashboard/PatientDiscoverySection';
import { isSlotActiveNowIST, formatDate } from '../utils/formatters';
import {
  Calendar,
  Sparkles,
  Ticket,
  Clock,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Stethoscope,
  AlertCircle,
  Building2,
  User,
  Users,
  Search,
  MessageSquare,
  ShieldCheck,
  CalendarCheck,
  Lock,
  DoorOpen,
  Radio,
} from 'lucide-react';

export const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const { patientUser, isPatient } = useAuth();
  const { appointments, activeTrackingAppointment } = useQueue();

  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Automatically prompt new patients who haven't completed required medical details
  useEffect(() => {
    if (isPatient && patientUser?.id) {
      const hasDismissed = sessionStorage.getItem(`healflow_onboard_prompt_dismissed_${patientUser.id}`);
      if (!patientUser.hasCompletedMedicalDetails && !hasDismissed) {
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

  const todayIso = new Date().toISOString().split('T')[0];

  // Sanitize appointment status according to real date: future appointments cannot be 'In Session'
  const normalizedAppointments = appointments.map((apt) => {
    const aptDate = apt.date || apt.slot_date;
    let status = apt.status || 'Scheduled';
    if (status === 'In Session' && aptDate && aptDate > todayIso) {
      status = 'Scheduled';
    }
    return { ...apt, status };
  });

  const scheduledAppointments = normalizedAppointments.filter((a) => a.status === 'Scheduled' || a.status === 'Checked In');
  const completedAppointments = normalizedAppointments.filter((a) => a.status === 'Completed');
  const inSessionAppointment = normalizedAppointments.find((a) => a.status === 'In Session');

  // Determine active appointment to highlight: In Session first, else today's upcoming, else next upcoming
  const primaryAppointment =
    inSessionAppointment ||
    activeTrackingAppointment ||
    scheduledAppointments[0] ||
    null;

  const isPrimaryInSession = primaryAppointment?.status === 'In Session';
  const isPrimaryDemo =
    primaryAppointment?.is_demo ||
    primaryAppointment?.is_instant ||
    /instant|demo|immediate/i.test(primaryAppointment?.slot_time || primaryAppointment?.time || '') ||
    /instant|demo|presentation/i.test(primaryAppointment?.reason || '');

  const primaryTimeCheck = primaryAppointment
    ? isSlotActiveNowIST(
        primaryAppointment.date || primaryAppointment.slot_date,
        primaryAppointment.time || primaryAppointment.slot_time,
        isPrimaryDemo
      )
    : { isActive: true };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Required Medical Profile Completion Popup */}
      <PatientOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={handleCloseOnboardingModal}
      />

      {/* =========================================================================
          TOP BAR: Identity & Quick Actions (Premium Minimal Surface)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4C5BBD] flex items-center justify-center font-black text-lg shrink-0">
            {patientUser?.name ? patientUser.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading">
                Welcome back, {patientUser?.name || 'Patient'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Verified
              </span>
            </div>
            <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-2 mt-0.5">
              <span>Health ID:</span>
              <strong className="font-mono text-[#4C5BBD]">
                {patientUser?.healthId || (patientUser?.id ? `HLF-${patientUser.id.slice(0, 8).toUpperCase()}` : 'HLF-PATIENT')}
              </strong>
              <span>•</span>
              <span>{patientUser?.phone || 'OPD Registered'}</span>
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] active:scale-95 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Book Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/patients/profile')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-[#F8FAFE] hover:bg-[#EEF2FF] text-[#4C5BBD] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Medical Profile Pending Alert Banner */}
      {!patientUser?.hasCompletedMedicalDetails && (
        <div className="p-4 rounded-2xl bg-amber-50/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 font-heading">
                Complete Your Medical Profile
              </h4>
              <p className="text-[11px] text-amber-800 font-medium">
                Add Date of Birth & Gender to unlock automated OPD token prioritization.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOnboardingModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all border-0 cursor-pointer self-end sm:self-auto"
          >
            <span>Complete Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          ACTIVE LIVE CONSULTATION / QUEUE BANNER (PREMIUM LUXURY DESIGN)
          Frameless modern surface, soft ambient glow, human craftsmanship
          ========================================================================= */}
      {primaryAppointment ? (
        <div
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 transition-all duration-300 ${
            isPrimaryInSession
              ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/15'
              : 'bg-white shadow-sm hover:shadow-md'
          }`}
        >
          {/* Subtle Ambient Background Accent */}
          {isPrimaryInSession ? (
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          ) : (
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#4C5BBD]/5 blur-2xl pointer-events-none" />
          )}

          {/* Top Pill Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/15">
            <div className="flex items-center gap-2.5 flex-wrap">
              {isPrimaryInSession ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                  <span>Doctor Admitted • Consultation Ready</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#4C5BBD]">
                  <span className="w-2 h-2 rounded-full bg-[#4C5BBD] animate-pulse" />
                  <span>Waiting in Live Queue</span>
                </span>
              )}

              {/* Minimal Clean Token Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black tracking-wide ${
                  isPrimaryInSession
                    ? 'bg-black/20 text-white'
                    : 'bg-[#F8FAFE] text-[#4C5BBD]'
                }`}
              >
                <span>Token</span>
                <span className="text-sm">#{primaryAppointment.token_number}</span>
              </span>
            </div>

            {/* Date & Time */}
            <div
              className={`flex items-center gap-2 text-xs font-medium ${
                isPrimaryInSession ? 'text-emerald-100' : 'text-[#6B6E84]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(primaryAppointment.date || primaryAppointment.slot_date)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{primaryAppointment.time || primaryAppointment.slot_time || 'Scheduled Slot'}</span>
              </span>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Doctor Info */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={
                    primaryAppointment.doctor_avatar ||
                    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                  }
                  alt={primaryAppointment.doctor_name || 'Doctor'}
                  className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${
                    isPrimaryInSession ? 'bg-emerald-300 border-emerald-700' : 'bg-emerald-500 border-white'
                  }`}
                />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    className={`text-lg sm:text-xl font-black font-heading truncate ${
                      isPrimaryInSession ? 'text-white' : 'text-[#1F1F1F]'
                    }`}
                  >
                    {primaryAppointment.doctor_name || 'Doctor Specialist'}
                  </h2>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      isPrimaryInSession
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EEF2FF] text-[#4C5BBD]'
                    }`}
                  >
                    {primaryAppointment.specialty}
                  </span>
                </div>

                <p
                  className={`text-xs flex items-center gap-2 font-medium flex-wrap ${
                    isPrimaryInSession ? 'text-emerald-100' : 'text-[#6B6E84]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{primaryAppointment.hospital || 'HealFlow OPD Clinic'}</span>
                  <span>•</span>
                  <span>Chamber: <strong>{primaryAppointment.room_number || 'Room 101'}</strong></span>
                </p>

                {primaryAppointment.reason && (
                  <p
                    className={`text-xs truncate pt-0.5 ${
                      isPrimaryInSession ? 'text-white/80' : 'text-slate-600'
                    }`}
                  >
                    <span className="opacity-70">Concern:</span> {primaryAppointment.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Direct High-Contrast Action CTAs */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => navigate(`/patients/live-queue/${primaryAppointment.id}`)}
                className={`flex-1 md:flex-initial px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border-0 ${
                  isPrimaryInSession
                    ? 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
                    : 'bg-[#F8FAFE] hover:bg-[#EEF2FF] text-[#4C5BBD]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Track Queue</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!primaryTimeCheck.isActive) {
                    alert(`Cannot enter chamber yet: ${primaryTimeCheck.message}`);
                    return;
                  }
                  if (!isPrimaryInSession) {
                    alert('Please wait outside. Chamber unlocks when doctor admits you.');
                    return;
                  }
                  navigate(`/patients/consultation/${primaryAppointment.id}`);
                }}
                className={`flex-1 md:flex-initial px-6 py-3 rounded-full text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 border-0 shadow-md active:scale-95 ${
                  isPrimaryInSession && primaryTimeCheck.isActive
                    ? 'bg-white hover:bg-slate-100 text-emerald-900 shadow-white/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isPrimaryInSession && primaryTimeCheck.isActive ? (
                  <>
                    <DoorOpen className="w-4 h-4 text-emerald-700" />
                    <span>Enter Consultation Room</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Chamber Locked</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 rounded-3xl bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">
                No active consultation today
              </h3>
              <p className="text-xs text-[#6B6E84] font-medium">
                Search specialists below to schedule an appointment and get your OPD token.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="px-5 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer shrink-0"
          >
            Find a Doctor
          </button>
        </div>
      )}

      {/* =========================================================================
          DOCTOR DISCOVERY: Search & Specialties
          ========================================================================= */}
      <PatientDiscoverySection />

      {/* =========================================================================
          MY APPOINTMENTS: Clean Table / Cards
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-[#1F1F1F] font-heading">
              My Appointments ({normalizedAppointments.length})
            </h3>
            <p className="text-xs text-[#6B6E84] font-medium mt-0.5">
              Scheduled consultations, in-progress queues, and past clinical visits
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="text-xs font-bold text-[#4C5BBD] hover:underline flex items-center gap-1 cursor-pointer border-0 bg-transparent"
          >
            <span>Book New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <AppointmentList
          appointments={normalizedAppointments}
          onBookNew={() => navigate('/doctors')}
        />
      </div>

      {/* =========================================================================
          HELP & SUPPORT FOOTER
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div className="p-4 rounded-2xl bg-white shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Health ID</span>
            <p className="text-xs font-mono font-bold text-[#4C5BBD]">
              {patientUser?.healthId || (patientUser?.id ? `HLF-${patientUser.id.slice(0, 8).toUpperCase()}` : 'HLF-PATIENT')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/patients/profile')}
            className="text-xs font-bold text-[#4C5BBD] hover:underline bg-transparent border-0 cursor-pointer"
          >
            Manage Profile →
          </button>
        </div>

        <a
          href="tel:1800432535"
          className="p-4 rounded-2xl bg-white shadow-2xs flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">OPD Helpdesk</span>
            <p className="text-xs font-bold text-[#1F1F1F]">+91 1800-432-535 (Toll Free)</p>
          </div>
          <PhoneCall className="w-4 h-4 text-[#4C5BBD]" />
        </a>
      </div>

    </div>
  );
};

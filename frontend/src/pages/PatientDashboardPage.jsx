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
          TOP BAR: Identity & Quick Actions
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] text-[#4C5BBD] border border-[#DCE5FA] flex items-center justify-center font-black text-base shrink-0 shadow-2xs">
            {patientUser?.name ? patientUser.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading">
                Welcome back, {patientUser?.name || 'Patient'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Book Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/patients/profile')}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#F8FAFE] hover:bg-[#EEF2FF] text-[#4C5BBD] border border-slate-200/80 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Medical Profile Pending Alert Banner (If not completed) */}
      {!patientUser?.hasCompletedMedicalDetails && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all border-0 cursor-pointer self-end sm:self-auto"
          >
            <span>Complete Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* =========================================================================
          ACTIVE LIVE CONSULTATION / QUEUE BANNER (Primary Focal Point)
          Redesigned clean, modern, and aligned layout
          ========================================================================= */}
      {primaryAppointment ? (
        <div
          className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-2xs space-y-4 ${
            isPrimaryInSession
              ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          {/* Header Row: Live Status Pill, Token Badge, and Date/Time */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 flex-wrap">
              {isPrimaryInSession ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Doctor Admitted — Your Turn Now!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#F2F5FF] text-[#4C5BBD] border border-[#DCE5FA]">
                  <span className="w-2 h-2 rounded-full bg-[#4C5BBD] animate-pulse" />
                  <span>In Queue</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-700 bg-slate-100/80 px-2.5 py-0.5 rounded-lg border border-slate-200">
                <Ticket className="w-3.5 h-3.5 text-[#4C5BBD]" />
                <span>Token #{primaryAppointment.token_number}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6E84]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#4C5BBD]" />
                <span>{formatDate(primaryAppointment.date || primaryAppointment.slot_date)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-[#4C5BBD]" />
                <span>{primaryAppointment.time || primaryAppointment.slot_time || 'Scheduled Slot'}</span>
              </span>
            </div>
          </div>

          {/* Main Card Body: Doctor Info + Action Buttons */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Doctor Info */}
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={
                  primaryAppointment.doctor_avatar ||
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                }
                alt={primaryAppointment.doctor_name || 'Doctor'}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-200/80 shadow-2xs shrink-0"
              />

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading truncate">
                    {primaryAppointment.doctor_name || 'Doctor Specialist'}
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#F2F5FF] text-[#4C5BBD] border border-[#DCE5FA]">
                    {primaryAppointment.specialty}
                  </span>
                </div>

                <p className="text-xs text-[#6B6E84] flex items-center gap-1.5 font-medium flex-wrap">
                  <Building2 className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
                  <span>{primaryAppointment.hospital || 'HealFlow OPD Clinic'}</span>
                  <span>•</span>
                  <span>Chamber: <strong className="text-[#1F1F1F]">{primaryAppointment.room_number || 'Room 101'}</strong></span>
                </p>

                {primaryAppointment.reason && (
                  <p className="text-xs text-slate-700 font-medium truncate">
                    <span className="text-[#6B6E84]">Concern:</span> {primaryAppointment.reason}
                  </p>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => navigate(`/patients/live-queue/${primaryAppointment.id}`)}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-[#F8FAFE] text-[#4C5BBD] border border-[#4C5BBD]/30 hover:border-[#4C5BBD] text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Track Live Turn →</span>
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
                className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                  isPrimaryInSession && primaryTimeCheck.isActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-black'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isPrimaryInSession && primaryTimeCheck.isActive ? (
                  <>
                    <DoorOpen className="w-4 h-4" />
                    <span>Enter Chamber Now</span>
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
        /* Empty Active Appointment */
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#F8FAFE] via-white to-[#F2F5FF] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
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
            className="px-4 py-2 rounded-xl bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer shrink-0"
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
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
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
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between hover:bg-slate-50 transition-colors"
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

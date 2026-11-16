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
  CheckCircle2,
  Stethoscope,
  AlertCircle,
  Building2,
  User,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Required Medical Profile Completion Popup */}
      <PatientOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={handleCloseOnboardingModal}
      />

      {/* Medical Profile Pending Alert Banner (If not completed) */}
      {!patientUser?.hasCompletedMedicalDetails && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all border-0 cursor-pointer self-end sm:self-auto"
          >
            <span>Complete Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          HIERARCHY 1: ACTIVE APPOINTMENT & QUEUE (Only shown when an appointment exists)
          ========================================================================= */}
      {primaryAppointment ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  primaryAppointment.status === 'In Session'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-[#F2F5FF] text-[#4C5BBD] border border-[#DCE5FA]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    primaryAppointment.status === 'In Session'
                      ? 'bg-emerald-500 animate-ping'
                      : 'bg-[#4C5BBD] animate-pulse'
                  }`}
                />
                <span>
                  {primaryAppointment.status === 'In Session'
                    ? 'Turn Called Now'
                    : 'Upcoming Consultation'}
                </span>
              </span>

              <span className="text-xs font-mono font-bold text-slate-500">
                Token #{primaryAppointment.token_number}
              </span>
            </div>

            <span className="text-xs font-semibold text-[#6B6E84]">
              {formatDate(primaryAppointment.date || primaryAppointment.slot_date)} • {primaryAppointment.time || primaryAppointment.slot_time || 'Scheduled'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-[#1F1F1F] font-heading">
                Consultation with {primaryAppointment.doctor_name || 'Doctor'}
              </h2>
              <p className="text-xs text-[#6B6E84] flex items-center gap-2 font-medium">
                <span className="font-bold text-[#4C5BBD]">{primaryAppointment.specialty}</span>
                <span>•</span>
                <Building2 className="w-3.5 h-3.5 text-[#4C5BBD]" />
                <span>{primaryAppointment.hospital || 'HealFlow Hospital'}</span>
                <span>•</span>
                <span className="font-bold text-[#1F1F1F]">{primaryAppointment.room_number || 'Room 101'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => navigate(`/patients/live-queue/${primaryAppointment.id}`)}
                className="w-full md:w-auto px-5 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Track Live Queue →</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/patients/consultation/${primaryAppointment.id}`)}
                className="hidden sm:inline-flex px-4 py-2.5 rounded-full bg-[#F2F5FF] hover:bg-[#E3EAFA] text-[#4C5BBD] text-xs font-bold transition-all border-0 cursor-pointer"
              >
                Doctor Chat
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Active Appointment: Calm & Actionable */
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#F8FAFE] via-white to-[#F2F5FF] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
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
          HIERARCHY 2: FIND A DOCTOR (Search & Full Specialties)
          ========================================================================= */}
      <PatientDiscoverySection />

      {/* =========================================================================
          HIERARCHY 3: MY APPOINTMENTS (Primary Appointment Workspace)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading">
              My Appointments
            </h3>
            <p className="text-xs text-[#6B6E84] font-medium mt-0.5">
              Scheduled consultations, in-progress queues and past clinical visits
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
          HIERARCHY 4: COMPACT OVERVIEW & HELPDESK
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        
        {/* Health ID card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Health ID</span>
            <p className="text-sm font-mono font-bold text-[#4C5BBD]">
              {patientUser.healthId || (patientUser.id ? `HLF-${patientUser.id.slice(0, 8).toUpperCase()}` : 'HLF-PATIENT')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/patients/profile')}
            className="text-xs font-bold text-[#4C5BBD] hover:underline bg-transparent border-0 cursor-pointer"
          >
            Profile →
          </button>
        </div>

        {/* Appointment count summary */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Visits Summary</span>
            <p className="text-xs font-semibold text-[#1F1F1F]">
              <strong className="text-[#4C5BBD]">{scheduledAppointments.length}</strong> Upcoming • <strong className="text-emerald-600">{completedAppointments.length}</strong> Completed
            </p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>

        {/* Helpdesk */}
        <a
          href="tel:1800432535"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between hover:bg-rose-50/50 transition-colors"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">OPD Helpdesk</span>
            <p className="text-xs font-bold text-[#1F1F1F]">+91 1800-432-535</p>
          </div>
          <PhoneCall className="w-4 h-4 text-rose-500" />
        </a>

      </div>

    </div>
  );
};

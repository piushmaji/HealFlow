import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Radio,
  ArrowRight,
  TrendingUp,
  Activity,
  CalendarCheck,
  PhoneCall,
  User,
  AlertCircle,
  FileText,
  Building2,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

export const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const { activeDoctor } = useAuth();
  const { appointments, queues } = useQueue();

  const [isOPDActive, setIsOPDActive] = useState(true);

  // Today's Date ISO
  const todayIso = new Date().toISOString().split('T')[0];

  // Appointments for this doctor
  const docAppointments = appointments.filter(
    (a) =>
      a.doctor_id === activeDoctor?.id ||
      (a.doctor_name && activeDoctor?.name && a.doctor_name.toLowerCase().includes(activeDoctor.name.toLowerCase()))
  );

  const todayAppointments = docAppointments.filter(
    (a) => (a.date || a.slot_date) === todayIso || (a.slot_time && /instant|demo/i.test(a.slot_time))
  );

  const totalPatientsToday = todayAppointments.length;
  const waitingPatients = todayAppointments.filter((a) => a.status === 'Scheduled' || a.status === 'Checked In');
  const inConsultationPatient = todayAppointments.find((a) => a.status === 'In Session');
  const completedPatients = todayAppointments.filter((a) => a.status === 'Completed');
  const upcomingPatients = docAppointments.filter((a) => {
    const d = a.date || a.slot_date;
    return d > todayIso && a.status !== 'Completed';
  });

  const doctorQueue = queues[activeDoctor?.id] || {
    current_token: inConsultationPatient?.token_number || 'None',
    total_in_queue: waitingPatients.length,
    serving_patient: inConsultationPatient?.patient_name || 'Chamber Ready',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* =========================================================================
          1. DOCTOR WELCOME HEADER & LIVE OPD STATUS (Overview Only)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        {/* Doctor Details */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <img
              src={
                activeDoctor?.avatar_url ||
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
              }
              alt={activeDoctor?.name || 'Doctor'}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-xs"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isOPDActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#1F1F1F] font-heading truncate">
                Welcome back, {activeDoctor?.name || 'Doctor'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] border border-[#DCE5FA]">
                <Stethoscope className="w-3 h-3" />
                <span>{activeDoctor?.specialty || 'General Medicine'}</span>
              </span>
            </div>

            <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-2 flex-wrap">
              <Building2 className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
              <span>{activeDoctor?.hospital || 'HealFlow OPD Clinic'}</span>
              <span>•</span>
              <span>Room: <strong className="text-[#1F1F1F]">{activeDoctor?.room_number || 'Room 101'}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">
                Fee: {activeDoctor?.consultation_fee ? formatCurrency(activeDoctor.consultation_fee) : '₹500'}
              </span>
            </p>
          </div>
        </div>

        {/* Master Action: OPEN LIVE OPD QUEUE WORKSPACE */}
        <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsOPDActive((p) => !p)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 ${
              isOPDActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isOPDActive ? 'text-emerald-600 animate-pulse' : 'text-amber-600'}`} />
            <span>{isOPDActive ? 'OPD Active' : 'OPD Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/live-queue')}
            style={{ outline: 'none' }}
            className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Open Live Queue Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* =========================================================================
          2. TODAY'S TELEMETRY KPI SUMMARY (Overview Cards)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Today's Total Patients */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              Today's Patients
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4C5BBD] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1F1F1F] font-sans">{totalPatientsToday}</p>
          <p className="text-[11px] text-[#6B6E84]">Scheduled for today</p>
        </div>

        {/* Metric 2: Waiting in Queue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              Waiting in Queue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 font-sans">{waitingPatients.length}</p>
          <p className="text-[11px] text-[#6B6E84]">In queue hall</p>
        </div>

        {/* Metric 3: In Consultation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              In Consultation
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 font-sans truncate">
            {inConsultationPatient ? inConsultationPatient.token_number : 'Chamber Open'}
          </p>
          <p className="text-[11px] text-[#6B6E84] truncate">
            {inConsultationPatient ? inConsultationPatient.patient_name : 'No active visit'}
          </p>
        </div>

        {/* Metric 4: Completed Visits */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              Completed Visits
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 font-sans">{completedPatients.length}</p>
          <p className="text-[11px] text-[#6B6E84]">Finished consultations</p>
        </div>

      </div>

      {/* =========================================================================
          3. LIVE OPD WORKSPACE ENTRY BANNER (Clinical Callout)
          ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#F0F4FF] via-white to-[#F8FAFE] border border-[#CEDEFF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4C5BBD] flex items-center gap-1.5">
              <span>Dedicated OPD Control Room</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading">
              Manage Patient Queue & Consultations
            </h3>
            <p className="text-xs text-[#6B6E84] font-medium max-w-xl">
              Conduct live patient calls, pick real-time chat, advance tokens, and complete consultations from the full-screen OPD Control Room.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/live-queue')}
          className="w-full md:w-auto px-6 py-3 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0 cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <span>Open Live Queue Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* =========================================================================
          4. TODAY'S SCHEDULE & UPCOMING APPOINTMENTS (Informational Overview)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Clinical Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#1F1F1F] font-heading flex items-center gap-2">
                <span>Today's Schedule ({todayAppointments.length})</span>
                <span className="text-xs font-normal text-[#6B6E84] font-sans">
                  • {formatDate(todayIso)}
                </span>
              </h3>
              <p className="text-xs text-[#6B6E84] font-medium">
                Overview of patients booked for consultation today
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/live-queue')}
              className="text-xs font-bold text-[#4C5BBD] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
            >
              <span>Manage in Live Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden">
              {todayAppointments.map((apt) => {
                const isServing = apt.status === 'In Session';
                const isDone = apt.status === 'Completed';

                return (
                  <div
                    key={apt.id}
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                      isServing ? 'bg-emerald-50/50' : isDone ? 'bg-slate-50/60 opacity-60' : 'bg-white hover:bg-[#F8FAFE]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-black font-sans shrink-0 border ${
                          isServing
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : isDone
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : 'bg-[#F2F5FF] text-[#4C5BBD] border-[#DCE5FA]'
                        }`}
                      >
                        {apt.token_number}
                      </span>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F] truncate">
                            {apt.patient_name}
                          </h4>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                              isServing
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDone
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isServing ? 'In Consultation' : isDone ? 'Completed' : 'Waiting'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B6E84] flex items-center gap-2 truncate">
                          <Clock className="w-3 h-3 text-[#6B6E84]" />
                          <span>{apt.slot_time || apt.time}</span>
                          {apt.reason && (
                            <>
                              <span>•</span>
                              <span className="truncate">{apt.reason}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/live-queue')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold border border-slate-200/90 shadow-2xs shrink-0 cursor-pointer"
                    >
                      {isServing ? 'In Chamber →' : 'View in Queue'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#6B6E84] bg-[#F8FAFE] rounded-2xl border border-slate-200/70 p-4">
              No patient visits scheduled for today.
            </div>
          )}
        </div>

        {/* Right 1 Col: Upcoming Appointments & Activity */}
        <div className="space-y-5">
          
          {/* Upcoming Schedule Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#1F1F1F] font-heading flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-[#4C5BBD]" />
                <span>Upcoming ({upcomingPatients.length})</span>
              </h3>
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Next Days</span>
            </div>

            {upcomingPatients.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingPatients.slice(0, 4).map((apt) => (
                  <div key={apt.id} className="p-3 rounded-2xl bg-[#F8FAFE] border border-slate-200/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F1F1F] truncate">{apt.patient_name}</span>
                      <span className="text-[10px] font-mono font-bold text-[#4C5BBD]">{apt.token_number}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6B6E84]">
                      <span>{formatDate(apt.date || apt.slot_date)}</span>
                      <span>{apt.slot_time || apt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#6B6E84]">
                No upcoming future appointments.
              </div>
            )}
          </div>

          {/* Quick Doctor Settings Shortcuts */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Quick Actions</span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/doctor/profile')}
                className="w-full p-3 rounded-2xl bg-[#F8FAFE] hover:bg-[#EEF2FF] text-left text-xs font-bold text-[#1F1F1F] flex items-center justify-between transition-colors cursor-pointer border-0"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4C5BBD]" />
                  <span>Configure Working Days & Slots</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B6E84]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/doctor/profile')}
                className="w-full p-3 rounded-2xl bg-[#F8FAFE] hover:bg-[#EEF2FF] text-left text-xs font-bold text-[#1F1F1F] flex items-center justify-between transition-colors cursor-pointer border-0"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4C5BBD]" />
                  <span>Pre-consultation Intake Form</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B6E84]" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

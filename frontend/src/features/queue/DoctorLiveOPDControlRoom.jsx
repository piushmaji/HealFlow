import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { useToast } from '../../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase/client';
import { callNextPatientInBackend } from '../../services/doctorBackendService';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Radio,
  ArrowLeft,
  PhoneCall,
  ExternalLink,
  RefreshCw,
  DoorOpen,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const DoctorLiveOPDControlRoom = () => {
  const navigate = useNavigate();
  const { activeDoctor } = useAuth();
  const { appointments, callNextPatient, updateAppointmentStatus, refreshAppointments } = useQueue();
  const { showToast } = useToast();

  // Top Bar State
  const [isOPDOpen, setIsOPDOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected Patient in Workspace
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Filter Doctor's appointments
  const docAppointments = appointments.filter(
    (a) =>
      a.doctor_id === activeDoctor?.id ||
      (a.doctor_name && activeDoctor?.name && a.doctor_name.toLowerCase().includes(activeDoctor.name.toLowerCase()))
  );

  // Date filtering
  const isTodaySelected = selectedDate === new Date().toISOString().split('T')[0];
  const dateAppointments = docAppointments.filter((a) => {
    const aptDate = a.date || a.slot_date;
    const isDemo = a.is_demo || a.is_instant || /instant|demo/i.test(a.slot_time || '');
    if (isTodaySelected && isDemo) return true;
    return aptDate === selectedDate;
  });

  // Search filtering
  const searchedAppointments = dateAppointments.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.patient_name && a.patient_name.toLowerCase().includes(q)) ||
      (a.token_number && a.token_number.toLowerCase().includes(q)) ||
      (a.patient_phone && a.patient_phone.includes(q))
    );
  });

  // Queue state groups
  const completedList = searchedAppointments.filter((a) => a.status === 'Completed');
  const inSessionPatient = dateAppointments.find((a) => a.status === 'In Session');
  const waitingList = searchedAppointments.filter(
    (a) => (a.status === 'Scheduled' || a.status === 'Checked In') && a.id !== inSessionPatient?.id
  );
  const nextWaitingPatient = waitingList[0] || null;

  // Selected active patient for focal panel
  const activeFocusPatient =
    dateAppointments.find((a) => a.id === selectedPatientId) ||
    inSessionPatient ||
    nextWaitingPatient ||
    dateAppointments[0] ||
    null;

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() - 1);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + 1);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (refreshAppointments) {
      await refreshAppointments().catch(() => {});
    }
    showToast('Queue updated', 'info');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Call / Admit Patient into chamber
  const handleCallPatient = async (targetApt) => {
    if (!targetApt?.id) return;
    setIsCallingNext(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.from('appointments').update({ status: 'In Session' }).eq('id', targetApt.id);

        if (activeDoctor?.id) {
          await supabase
            .from('queues')
            .update({
              current_token: targetApt.token_number,
              serving_patient: targetApt.patient_name || 'Patient',
              total_in_queue: Math.max(0, waitingList.length - 1),
              last_updated: new Date().toISOString(),
            })
            .eq('doctor_id', activeDoctor.id);
        }
      }

      try {
        if (activeDoctor?.id) {
          await callNextPatientInBackend(activeDoctor.id);
        }
      } catch (e) {}

      callNextPatient(activeDoctor?.id, targetApt.token_number);
      if (updateAppointmentStatus) {
        updateAppointmentStatus(targetApt.id, 'In Session');
      }

      setSelectedPatientId(targetApt.id);
      showToast(`Admitted Token ${targetApt.token_number} (${targetApt.patient_name})`, 'success');
      navigate(`/patients/consultation/${targetApt.id}`);
    } catch (err) {
      console.error('Call error:', err);
      showToast('Error calling patient', 'error');
    } finally {
      setIsCallingNext(false);
    }
  };

  // Determine target for "Open Consultation Chamber"
  const consultationTarget = inSessionPatient || activeFocusPatient;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      {/* =========================================================================
          1. WELCOME / QUEUE TOP BANNER (Exact Match with Doctor Dashboard)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        {/* Doctor & Chamber Details */}
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
                isOPDOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#1F1F1F] font-heading truncate">
                Live OPD Queue Control
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] border border-[#DCE5FA]">
                <Activity className="w-3 h-3" />
                <span>{activeDoctor?.room_number || 'Room 101'}</span>
              </span>
            </div>

            <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-2 flex-wrap">
              <Building2 className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
              <span>{activeDoctor?.name || 'Doctor'}</span>
              <span>•</span>
              <span>{activeDoctor?.specialty || 'General Medicine'}</span>
              <span>•</span>
              <span className="text-[#4C5BBD] font-bold">
                {dateAppointments.length} Patient{dateAppointments.length === 1 ? '' : 's'} on {isTodaySelected ? 'Today' : formatDate(selectedDate)}
              </span>
            </p>
          </div>
        </div>

        {/* Right Action Controls: Return to Dashboard & OPD Active Toggle */}
        <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsOPDOpen((p) => !p)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 ${
              isOPDOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isOPDOpen ? 'text-emerald-600 animate-pulse' : 'text-amber-600'}`} />
            <span>{isOPDOpen ? 'OPD Active' : 'OPD Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/doctor-dashboard')}
            style={{ outline: 'none' }}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[#F8FAFE] hover:bg-[#EEF2FF] text-[#4C5BBD] border border-slate-200/80 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Doctor Dashboard</span>
          </button>
        </div>

      </div>

      {/* =========================================================================
          2. KPI SUMMARY STRIP (Exact Same 4-Card Grid as Doctor Dashboard)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Patients for Selected Date */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              Total Queue
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4C5BBD] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1F1F1F] font-sans">{dateAppointments.length}</p>
          <p className="text-[11px] text-[#6B6E84]">{isTodaySelected ? 'Patients today' : formatDate(selectedDate)}</p>
        </div>

        {/* Metric 2: Waiting in Queue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              Waiting Now
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 font-sans">{waitingList.length}</p>
          <p className="text-[11px] text-[#6B6E84]">Next up in line</p>
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
          <p className="text-xl sm:text-2xl font-black text-emerald-600 font-sans truncate whitespace-nowrap">
            {inSessionPatient ? inSessionPatient.token_number : 'Chamber Open'}
          </p>
          <p className="text-[11px] text-[#6B6E84] truncate">
            {inSessionPatient ? inSessionPatient.patient_name : 'No active visit'}
          </p>
        </div>

        {/* Metric 4: Completed Visits */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 font-sans">{completedList.length}</p>
          <p className="text-[11px] text-[#6B6E84]">Finished consultations</p>
        </div>

      </div>

      {/* =========================================================================
          3. DATE SELECTOR & SEARCH TOOLBAR (Unified with Dashboard Card Style)
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Date Selector Navigation */}
        <div className="flex items-center gap-1.5 bg-[#F8FAFE] p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#4C5BBD] hover:bg-white border-0 cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTodayClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all ${
              isTodaySelected ? 'bg-[#4C5BBD] text-white shadow-2xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            {isTodaySelected ? 'Today' : formatDate(selectedDate)}
          </button>

          <button
            type="button"
            onClick={handleNextDay}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#4C5BBD] hover:bg-white border-0 cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Refresh Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, token..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-[#F8FAFE] text-xs font-medium focus:bg-white focus:outline-none focus:border-[#4C5BBD] transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="p-2 rounded-xl text-slate-600 hover:text-[#4C5BBD] hover:bg-[#F2F5FF] border border-slate-200/80 transition-colors cursor-pointer shrink-0"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#4C5BBD]' : ''}`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. MAIN 2-COLUMN CLINICAL WORKSPACE (Aligned with Dashboard Grid)
          Left 2/3 (7 cols): Patient Queue List
          Right 1/3 (5 cols): Active Patient Summary & Essential Queue Actions
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (7 cols): PATIENT QUEUE */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#1F1F1F] font-heading flex items-center gap-2">
                <span>Patient Queue ({searchedAppointments.length})</span>
                <span className="text-xs font-normal text-[#6B6E84] font-sans">
                  • {formatDate(selectedDate)}
                </span>
              </h3>
              <p className="text-xs text-[#6B6E84] font-medium">
                Live line-up of scheduled visits and chamber queue
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {waitingList.length} Waiting
              </span>
            </div>
          </div>

          {/* Patient Cards List */}
          {searchedAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden">
              {searchedAppointments.map((apt) => {
                const isSelected = apt.id === activeFocusPatient?.id;
                const isServing = apt.status === 'In Session';
                const isNext = apt.id === nextWaitingPatient?.id && !isServing;
                const isDone = apt.status === 'Completed';

                return (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedPatientId(apt.id)}
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EEF2FF]/80 ring-1 ring-[#4C5BBD]/30'
                        : isServing
                        ? 'bg-emerald-50/60'
                        : isNext
                        ? 'bg-amber-50/50'
                        : isDone
                        ? 'bg-slate-50/60 opacity-60'
                        : 'bg-white hover:bg-[#F8FAFE]'
                    }`}
                  >
                    {/* Left: Token Number + Patient Name + Scheduled Time */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Horizontal non-wrapping token badge */}
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-black font-sans shrink-0 border whitespace-nowrap ${
                          isServing
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : isNext
                            ? 'bg-amber-500 text-white border-amber-500'
                            : isSelected
                            ? 'bg-[#4C5BBD] text-white border-[#4C5BBD]'
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
                          {isNext && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              Next
                            </span>
                          )}
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

                    {/* Right: Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border whitespace-nowrap ${
                        isServing
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : isNext
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : isDone
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-blue-50 text-[#4C5BBD] border-blue-100'
                      }`}
                    >
                      {isServing ? 'In Consultation' : isNext ? 'Next in Line' : isDone ? 'Completed' : 'Waiting'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#6B6E84] bg-[#F8FAFE] rounded-2xl border border-slate-200/70 p-4">
              No patients found for this date.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (5 cols): ACTIVE PATIENT SUMMARY & ESSENTIAL QUEUE ACTIONS */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Active Patient Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
                Active Patient Summary
              </span>
              {activeFocusPatient && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    activeFocusPatient.status === 'In Session'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#F2F5FF] text-[#4C5BBD]'
                  }`}
                >
                  {activeFocusPatient.status === 'In Session' ? 'Currently Consulting' : 'Selected'}
                </span>
              )}
            </div>

            {activeFocusPatient ? (
              <div className="space-y-4">
                {/* Minimal Patient Card: Name, Token, Time */}
                <div className="p-4 rounded-2xl bg-[#F8FAFE] border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-[#1F1F1F]">
                        {activeFocusPatient.patient_name}
                      </h3>
                      <p className="text-xs text-[#6B6E84] flex items-center gap-1 mt-0.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Scheduled: <strong className="text-[#1F1F1F]">{activeFocusPatient.slot_time || activeFocusPatient.time}</strong></span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Token</span>
                      <span className="text-xl font-black text-[#4C5BBD] font-mono whitespace-nowrap">
                        {activeFocusPatient.token_number}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span>Chamber: <strong className="text-slate-800">{activeDoctor?.room_number || 'Room 101'}</strong></span>
                    <span>Status: <strong className={activeFocusPatient.status === 'In Session' ? 'text-emerald-700' : 'text-[#4C5BBD]'}>{activeFocusPatient.status || 'Waiting'}</strong></span>
                  </div>
                </div>

                {/* ESSENTIAL QUEUE ACTIONS (Exact Same Rounded Button Design) */}
                <div className="space-y-2.5 pt-1">
                  {/* Action 1: Call Next Patient */}
                  <button
                    type="button"
                    disabled={!nextWaitingPatient || isCallingNext}
                    onClick={() => handleCallPatient(nextWaitingPatient)}
                    className={`w-full py-3 px-4 rounded-full text-xs font-black shadow-xs transition-all border-0 cursor-pointer flex items-center justify-center gap-2 ${
                      nextWaitingPatient && !isCallingNext
                        ? 'bg-[#4C5BBD] hover:bg-[#3B489E] text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>
                      {nextWaitingPatient
                        ? `Call Next Patient (Token ${nextWaitingPatient.token_number})`
                        : 'No Patients Waiting in Line'}
                    </span>
                  </button>

                  {/* Action 2: Open Consultation Chamber */}
                  <button
                    type="button"
                    disabled={!consultationTarget}
                    onClick={() => {
                      if (consultationTarget) {
                        navigate(`/patients/consultation/${consultationTarget.id}`);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-full text-xs font-black shadow-xs transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                      consultationTarget
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <DoorOpen className="w-4 h-4" />
                    <span>Open Consultation Chamber</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No patient selected.
              </div>
            )}
          </div>

          {/* Quick Shortcuts (Matching Dashboard Sidebar) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">OPD Navigation</span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/doctor-dashboard')}
                className="w-full p-3 rounded-2xl bg-[#F8FAFE] hover:bg-[#EEF2FF] text-left text-xs font-bold text-[#1F1F1F] flex items-center justify-between transition-colors cursor-pointer border-0"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#4C5BBD]" />
                  <span>Return to Doctor Dashboard Overview</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B6E84]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

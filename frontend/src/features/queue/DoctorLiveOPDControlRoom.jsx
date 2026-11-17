import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { useToast } from '../../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase/client';
import { callNextPatientInBackend } from '../../services/doctorBackendService';
import {
  Users,
  Clock,
  Search,
  Radio,
  ArrowLeft,
  PhoneCall,
  RefreshCw,
  DoorOpen,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  User,
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
  const [activeFilterTab, setActiveFilterTab] = useState('all'); // 'all' | 'waiting' | 'in_session' | 'completed'

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

  // Tab filtered appointments for mobile/desktop list
  const displayAppointments = searchedAppointments.filter((a) => {
    if (activeFilterTab === 'waiting') return a.status === 'Scheduled' || a.status === 'Checked In';
    if (activeFilterTab === 'in_session') return a.status === 'In Session';
    if (activeFilterTab === 'completed') return a.status === 'Completed';
    return true;
  });

  // Selected active patient for focal panel
  const activeFocusPatient =
    dateAppointments.find((a) => a.id === selectedPatientId) ||
    inSessionPatient ||
    nextWaitingPatient ||
    dateAppointments[0] ||
    null;

  // Calendar strip dates (-1 day to +3 days)
  const getCalendarStrip = () => {
    const base = new Date();
    const days = [];
    for (let i = -1; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const count = docAppointments.filter((a) => {
        const aptDate = a.date || a.slot_date;
        const isDemo = a.is_demo || a.is_instant || /instant|demo/i.test(a.slot_time || '');
        if (i === 0 && isDemo) return true;
        return aptDate === iso;
      }).length;

      days.push({
        iso,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        count,
        isToday: i === 0,
      });
    }
    return days;
  };

  const calendarDays = getCalendarStrip();

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

  const consultationTarget = inSessionPatient || activeFocusPatient;

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-12 font-sans px-2 sm:px-4">
      
      {/* 1. TOP LIVE OPD CONTROL BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B2559] via-[#243374] to-[#3B489E] text-white p-4 sm:p-7 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5">
          {/* Doctor Info */}
          <div className="flex items-center gap-3 sm:gap-4.5 min-w-0 w-full md:w-auto">
            <div className="relative shrink-0">
              <img
                src={
                  activeDoctor?.avatar_url ||
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                }
                alt={activeDoctor?.name || 'Doctor'}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-md border-2 border-white/20"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-[#1B2559] ${
                  isOPDOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </div>

            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-2xl font-black font-heading tracking-tight truncate text-white">
                  Live OPD Queue
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{activeDoctor?.room_number || 'Room 101'}</span>
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-white/80 font-medium flex items-center gap-1.5 flex-wrap">
                <span>{activeDoctor?.name || 'Doctor'}</span>
                <span>•</span>
                <span className="text-indigo-200">{activeDoctor?.specialty || 'General Medicine'}</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">
                  {dateAppointments.length} Patient{dateAppointments.length === 1 ? '' : 's'} Total
                </span>
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-end">
            <button
              type="button"
              onClick={() => setIsOPDOpen((p) => !p)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 shadow-sm active:scale-95 ${
                isOPDOpen
                  ? 'bg-emerald-500/20 text-emerald-300 backdrop-blur-md hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 backdrop-blur-md hover:bg-rose-500/30'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isOPDOpen ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
              <span>{isOPDOpen ? 'OPD Active' : 'OPD Paused'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/doctor-dashboard')}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>

        {/* Date Selector Strip */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>Select OPD Session</span>
            </span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 text-white text-[11px] font-bold rounded-lg px-2.5 py-1 border-0 outline-none cursor-pointer hover:bg-white/20 transition-colors"
              title="Choose custom date"
            />
          </div>

          {/* Interactive Date Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {calendarDays.map((d) => {
              const isSelected = selectedDate === d.iso;
              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setSelectedDate(d.iso)}
                  className={`flex flex-col items-center justify-center min-w-[64px] sm:min-w-[84px] py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-2xl transition-all border-0 cursor-pointer text-center relative shrink-0 ${
                    isSelected
                      ? 'bg-white text-[#1B2559] shadow-md scale-102 font-black'
                      : 'bg-white/10 hover:bg-white/15 text-white/90 backdrop-blur-md'
                  }`}
                >
                  <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-[#4C5BBD]' : 'text-indigo-200'}`}>
                    {d.isToday ? 'Today' : d.dayName}
                  </span>
                  <span className="text-base sm:text-lg font-black leading-tight my-0.5">
                    {d.dayNum}
                  </span>
                  <span className={`text-[8px] sm:text-[9px] font-medium ${isSelected ? 'text-slate-600' : 'text-white/70'}`}>
                    {d.count > 0 ? `${d.count} visits` : 'None'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. RESPONSIVE TELEMETRY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3.5">
        <div
          onClick={() => setActiveFilterTab('all')}
          className={`p-3 sm:p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all border ${
            activeFilterTab === 'all' ? 'bg-blue-50/60 border-[#4C5BBD]' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider block">Total Booked</span>
            <p className="text-lg sm:text-2xl font-black text-[#1F1F1F] mt-0.5">{dateAppointments.length}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-[#4C5BBD] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setActiveFilterTab('waiting')}
          className={`p-3 sm:p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all border ${
            activeFilterTab === 'waiting' ? 'bg-amber-50/60 border-amber-500' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider block">Waiting Line</span>
            <p className="text-lg sm:text-2xl font-black text-amber-600 mt-0.5">{waitingList.length}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setActiveFilterTab('in_session')}
          className={`p-3 sm:p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all border ${
            activeFilterTab === 'in_session' ? 'bg-emerald-50/60 border-emerald-500' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider block">In Chamber</span>
            <p className="text-base sm:text-xl font-black text-emerald-600 truncate mt-0.5">
              {inSessionPatient ? inSessionPatient.token_number : 'Ready'}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div
          onClick={() => setActiveFilterTab('completed')}
          className={`p-3 sm:p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all border ${
            activeFilterTab === 'completed' ? 'bg-slate-100 border-slate-400' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider block">Completed</span>
            <p className="text-lg sm:text-2xl font-black text-slate-800 mt-0.5">{completedList.length}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & REFRESH BAR */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-4 shadow-xs border border-slate-200/80 flex items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, token, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFE] text-xs font-medium focus:bg-white focus:outline-none transition-all border-0"
          />
        </div>

        {/* Filter Tab Chips on Desktop */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-[#F8FAFE] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveFilterTab('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeFilterTab === 'all' ? 'bg-white text-[#4C5BBD] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({searchedAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab('waiting')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeFilterTab === 'waiting' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Waiting ({waitingList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab('in_session')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeFilterTab === 'in_session' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Session ({inSessionPatient ? 1 : 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab('completed')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeFilterTab === 'completed' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Done ({completedList.length})
          </button>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F8FAFE] hover:bg-[#EEF2FF] text-[#4C5BBD] text-xs font-bold transition-all border-0 cursor-pointer flex items-center gap-1.5 shrink-0"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* 4. MAIN WORKSPACE: PATIENT QUEUE (Left) & ACTIVE DESK (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        
        {/* LEFT COLUMN: Patient Queue List */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200/90 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#1F1F1F] font-heading flex items-center gap-2">
                <span>Patient Queue</span>
                <span className="text-xs font-normal text-[#6B6E84]">({displayAppointments.length})</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6B6E84] font-medium">
                Tap any patient to select, inspect history, or admit to chamber
              </p>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
              {waitingList.length} Left to Attend
            </span>
          </div>

          {displayAppointments.length > 0 ? (
            <div className="space-y-2 max-h-[550px] overflow-y-auto no-scrollbar pr-0.5">
              {displayAppointments.map((apt) => {
                const isSelected = apt.id === activeFocusPatient?.id;
                const isServing = apt.status === 'In Session';
                const isNext = apt.id === nextWaitingPatient?.id && !isServing;
                const isDone = apt.status === 'Completed';

                return (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedPatientId(apt.id)}
                    className={`p-3 sm:p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-2.5 sm:gap-3 border ${
                      isSelected
                        ? 'bg-[#EEF2FF] border-[#4C5BBD]/50 shadow-xs'
                        : isServing
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : isNext
                        ? 'bg-amber-50/60 border-amber-300'
                        : isDone
                        ? 'bg-slate-50 border-slate-200/60 opacity-60'
                        : 'bg-[#F8FAFE] border-slate-200/80 hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Patient Token & Identity */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black font-sans shrink-0 whitespace-nowrap ${
                          isServing
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isNext
                            ? 'bg-amber-500 text-white shadow-xs'
                            : isSelected
                            ? 'bg-[#4C5BBD] text-white shadow-xs'
                            : isDone
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-white text-[#4C5BBD] shadow-2xs'
                        }`}
                      >
                        {apt.token_number}
                      </span>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F] truncate">
                            {apt.patient_name}
                          </h4>
                          {isNext && (
                            <span className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 shrink-0">
                              Next
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] sm:text-[11px] text-[#6B6E84] flex items-center gap-1.5 truncate">
                          <Clock className="w-3 h-3 text-[#6B6E84] shrink-0" />
                          <span>{apt.slot_time || apt.time}</span>
                          {apt.reason && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[130px] sm:max-w-none">{apt.reason}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right Action / Status Pill */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 whitespace-nowrap ${
                          isServing
                            ? 'bg-emerald-100 text-emerald-800 font-black'
                            : isNext
                            ? 'bg-amber-100 text-amber-900 font-black'
                            : isDone
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-blue-50 text-[#4C5BBD]'
                        }`}
                      >
                        {isServing ? 'In Chamber' : isNext ? 'Next Up' : isDone ? 'Done' : 'Waiting'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#6B6E84] bg-[#F8FAFE] rounded-2xl p-6">
              No patients found matching this filter.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Patient Focal Desk */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#6B6E84] uppercase tracking-wider">
                Chamber Focal Desk
              </span>
              {activeFocusPatient && (
                <span
                  className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    activeFocusPatient.status === 'In Session'
                      ? 'bg-emerald-100 text-emerald-800 font-black'
                      : 'bg-[#F2F5FF] text-[#4C5BBD]'
                  }`}
                >
                  {activeFocusPatient.status === 'In Session' ? 'Active in Chamber' : 'Selected Patient'}
                </span>
              )}
            </div>

            {activeFocusPatient ? (
              <div className="space-y-4">
                {/* Patient Summary Surface */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFE] space-y-3 border border-slate-200/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-[#1F1F1F] truncate">
                        {activeFocusPatient.patient_name}
                      </h3>
                      <p className="text-xs text-[#6B6E84] flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
                        <span>Slot: <strong className="text-[#1F1F1F]">{activeFocusPatient.slot_time || activeFocusPatient.time}</strong></span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block">Token</span>
                      <span className="text-xl sm:text-2xl font-black text-[#4C5BBD] font-mono">
                        {activeFocusPatient.token_number}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Room</span>
                      <strong className="text-slate-800 text-[11px] sm:text-xs">{activeDoctor?.room_number || 'Room 101'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Current Status</span>
                      <strong className={activeFocusPatient.status === 'In Session' ? 'text-emerald-700 text-[11px] sm:text-xs' : 'text-[#4C5BBD] text-[11px] sm:text-xs'}>
                        {activeFocusPatient.status || 'Waiting'}
                      </strong>
                    </div>
                  </div>

                  {activeFocusPatient.patient_phone && (
                    <div className="pt-1 text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="text-[#6B6E84]">Contact:</span>
                      <strong className="text-slate-800 font-mono">{activeFocusPatient.patient_phone}</strong>
                    </div>
                  )}

                  {activeFocusPatient.reason && (
                    <div className="pt-1 text-xs text-slate-700">
                      <span className="text-[#6B6E84]">Chief Complaint:</span> {activeFocusPatient.reason}
                    </div>
                  )}
                </div>

                {/* MASTER ACTIONS: Call Next & Enter Chamber */}
                <div className="space-y-2.5 pt-1">
                  {/* Action 1: Call Next Patient */}
                  <button
                    type="button"
                    disabled={!nextWaitingPatient || isCallingNext}
                    onClick={() => handleCallPatient(nextWaitingPatient)}
                    className={`w-full py-3 sm:py-3.5 px-4 sm:px-5 rounded-full text-xs font-black transition-all border-0 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-xs ${
                      nextWaitingPatient && !isCallingNext
                        ? 'bg-[#4C5BBD] hover:bg-[#3B489E] text-white shadow-[#4C5BBD]/20'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {nextWaitingPatient
                        ? `Admit Next: Token ${nextWaitingPatient.token_number} (${nextWaitingPatient.patient_name})`
                        : 'No Waiting Patients in Line'}
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
                    className={`w-full py-3 sm:py-3.5 px-4 sm:px-5 rounded-full text-xs font-black transition-all border-0 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                      consultationTarget
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <DoorOpen className="w-4 h-4 shrink-0" />
                    <span>Enter Consultation Chamber</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#6B6E84]">
                Select a patient from the queue to manage.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. FLOATING MOBILE FAST-ACTION DOCK (Only visible on small screens for 1-tap chamber entry) */}
      {consultationTarget && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 sm:hidden z-40 flex items-center justify-between gap-3 shadow-2xl">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase">
              {inSessionPatient ? 'Currently In Chamber' : 'Selected Patient'}
            </p>
            <p className="text-xs font-black text-[#1F1F1F] truncate">
              Token #{consultationTarget.token_number} • {consultationTarget.patient_name}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/patients/consultation/${consultationTarget.id}`)}
            className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shrink-0 flex items-center gap-1.5 shadow-md active:scale-95 border-0 cursor-pointer"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Chamber</span>
          </button>
        </div>
      )}

    </div>
  );
};

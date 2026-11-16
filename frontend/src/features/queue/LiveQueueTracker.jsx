import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useToast } from '../../context/ToastContext';
import { calculateEstimatedWaitTime, isSlotActiveNowIST } from '../../utils/formatters';
import { supabase, isSupabaseConfigured } from '../../services/supabase/client';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  MessageSquare,
  Stethoscope,
  Building2,
  ArrowRight,
  Lock,
  Calendar,
  Users,
  Sparkles,
} from 'lucide-react';

export const LiveQueueTracker = ({ appointment }) => {
  const navigate = useNavigate();
  const { queues, getPatientsAhead, updateAppointmentStatus } = useQueue();
  const { showToast } = useToast();
  
  const [liveAppointment, setLiveAppointment] = useState(appointment);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setLiveAppointment(appointment);
  }, [appointment]);

  // Real-time Supabase subscription directly on this specific appointment row
  useEffect(() => {
    if (!appointment?.id || !isSupabaseConfigured) return;

    // Initial fetch to guarantee latest DB status
    supabase
      .from('appointments')
      .select('*')
      .eq('id', appointment.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLiveAppointment((prev) => ({ ...prev, ...data }));
        }
      });

    const channel = supabase
      .channel(`public:appointment_live_${appointment.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `id=eq.${appointment.id}`,
        },
        (payload) => {
          if (payload.new) {
            setLiveAppointment((prev) => ({ ...prev, ...payload.new }));
            if (updateAppointmentStatus) {
              updateAppointmentStatus(payload.new.id, payload.new.status);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appointment?.id, updateAppointmentStatus]);

  if (!liveAppointment) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs font-sans">
        <p className="text-[#6B6E84] text-sm font-medium">No active appointment selected.</p>
      </div>
    );
  }

  const currentApt = liveAppointment;
  const defaultTokenPrefix = (currentApt.specialty || 'OPD').substring(0, 4).toUpperCase();
  const doctorQueue = queues[currentApt.doctor_id] || {
    current_token: `${defaultTokenPrefix}-001`,
    serving_patient: currentApt.patient_name || 'Patient',
    total_in_queue: 1,
    status: 'ACTIVE',
  };

  const isCompleted = currentApt.status === 'Completed';
  // Patient is admitted if DB status is 'In Session' OR doctor's queue current_token matches this patient's token
  const isQueueCurrentToken = doctorQueue.current_token && doctorQueue.current_token !== 'None' && doctorQueue.current_token === currentApt.token_number;
  const isInSession = currentApt.status === 'In Session' || isQueueCurrentToken;

  const isDemo =
    currentApt.is_demo ||
    currentApt.is_instant ||
    /instant|demo|immediate/i.test(currentApt.slot_time || currentApt.time || '') ||
    /instant|demo|presentation/i.test(currentApt.reason || '');

  const timeCheck = isSlotActiveNowIST(
    currentApt.date || currentApt.slot_date,
    currentApt.time || currentApt.slot_time,
    isDemo
  );

  const patientsAhead = isCompleted ? 0 : getPatientsAhead(currentApt.doctor_id, currentApt.token_number);
  const estimatedWait = calculateEstimatedWaitTime(patientsAhead);
  // Strict admission: It is ONLY your turn to enter when doctor explicitly admits (isInSession) AND time slot has arrived (or isDemo)
  const isYourTurn = !isCompleted && isInSession && timeCheck.isActive;
  const isNextInLine = !isCompleted && !isInSession && patientsAhead <= 1;

  // Auto notification ONLY once when turn actually arrives
  useEffect(() => {
    if (isYourTurn && !isCompleted) {
      const notifiedKey = `turn_notified_${currentApt.id}_${currentApt.token_number}`;
      if (!sessionStorage.getItem(notifiedKey)) {
        sessionStorage.setItem(notifiedKey, 'true');
        showToast(`IT'S YOUR TURN NOW! Please enter ${currentApt.room_number || 'Room 101'}.`, 'success');
      }
    }
  }, [isYourTurn, isCompleted, currentApt.id, currentApt.token_number, currentApt.room_number, showToast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (isSupabaseConfigured && currentApt?.id) {
      const { data } = await supabase.from('appointments').select('*').eq('id', currentApt.id).maybeSingle();
      if (data) {
        setLiveAppointment((prev) => ({ ...prev, ...data }));
      }
    }
    showToast('Queue status refreshed live.', 'info');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Polling fallback every 2.5s to guarantee instantaneous sync across devices (mobile + laptop)
  useEffect(() => {
    if (!currentApt?.id) return;
    const interval = setInterval(async () => {
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', currentApt.id)
            .maybeSingle();
          if (data && data.status !== liveAppointment?.status) {
            setLiveAppointment((prev) => ({ ...prev, ...data }));
            if (updateAppointmentStatus) {
              updateAppointmentStatus(data.id, data.status);
            }
          }
        } catch (e) {}
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [currentApt?.id, liveAppointment?.status, updateAppointmentStatus]);

  const handleEnterConsultationRoom = () => {
    // If doctor has admitted the patient into chamber, allow entry directly
    if (!isInSession && !timeCheck.isActive) {
      showToast(`Chamber locked: ${timeCheck.message}`, 'warning');
      return;
    }
    if (!isInSession) {
      showToast('Please wait outside. Chamber unlocks when doctor admits you.', 'warning');
      return;
    }
    navigate(`/patients/consultation/${currentApt.id}`);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      
      {/* 1. TOKEN CALLED / YOUR TURN PROMINENT ALERT BANNER */}
      {isYourTurn && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-emerald-700">
                  Turn Called Now
                </span>
                <span className="text-xs text-emerald-100 font-bold">
                  {currentApt.room_number || 'Room 101'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-heading tracking-tight mt-0.5">
                Token #{currentApt.token_number} — Please Enter Doctor's Room
              </h2>
              <p className="text-xs text-emerald-50 font-medium">
                {currentApt.doctor_name} is waiting for you at {currentApt.hospital || 'HealFlow Clinic'}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEnterConsultationRoom}
            style={{ outline: 'none' }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white text-emerald-700 text-xs font-black shadow-xs hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 cursor-pointer border-0 shrink-0 self-stretch sm:self-auto"
          >
            <span>Enter Consultation Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* COMPLETED BANNER */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-slate-800">Consultation Finished</h3>
              <p className="text-[11px] text-slate-500">
                Your consultation with {currentApt.doctor_name} has ended.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/patients/dashboard')}
            className="px-3.5 py-1.5 rounded-full bg-white text-slate-700 border border-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* 2. UNIFIED LIVE OPD TRACKER CARD (Linear & Apple inspired, Clean Minimal Focus) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        
        {/* Top Header: Doctor Details & Live Status Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={currentApt.doctor_avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
              alt={currentApt.doctor_name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200/70 shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#1F1F1F] font-heading truncate">
                  {currentApt.doctor_name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2F5FF] text-[#4C5BBD] border border-slate-200/70">
                  {currentApt.specialty}
                </span>
              </div>
              <p className="text-xs text-[#6B6E84] flex items-center gap-1.5 font-medium mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
                <span>{currentApt.hospital || 'HealFlow OPD Clinic'}</span>
                <span>•</span>
                <span className="font-bold text-[#1F1F1F]">{currentApt.room_number || 'Room 101'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isCompleted
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : isYourTurn
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : patientsAhead === 1
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-[#F2F5FF] text-[#4C5BBD] border-[#DCE5FA]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCompleted
                    ? 'bg-slate-400'
                    : isYourTurn
                    ? 'bg-emerald-500 animate-ping'
                    : 'bg-[#4C5BBD] animate-pulse'
                }`}
              />
              <span>
                {isCompleted
                  ? 'Consultation Done'
                  : isYourTurn
                  ? 'Doctor Admitted — Your Turn!'
                  : isNextInLine
                  ? 'Get Ready • Next in Line'
                  : 'Waiting in Queue'}
              </span>
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              style={{ outline: 'none' }}
              className="p-2 rounded-xl text-[#6B6E84] hover:text-[#4C5BBD] hover:bg-[#F2F5FF] border border-slate-200/70 transition-colors cursor-pointer"
              title="Refresh Live Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#4C5BBD]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center: HERO TOKEN NUMBER (Main visual focus) */}
        <div className="text-center py-5 sm:py-6 bg-[#F8FAFE] rounded-2xl border border-slate-200/70 space-y-1">
          <p className="text-[11px] font-bold text-[#6B6E84] uppercase tracking-wider">
            Your OPD Token Number
          </p>
          <div className="flex items-center justify-center">
            <span
              className={`text-4xl sm:text-5xl font-black font-sans tracking-wide ${
                isYourTurn ? 'text-emerald-600' : 'text-[#4C5BBD]'
              }`}
            >
              {appointment.token_number}
            </span>
          </div>
          <p className="text-xs text-[#6B6E84] font-medium pt-0.5">
            Registered for <strong className="text-[#1F1F1F]">{appointment.patient_name}</strong>
          </p>
        </div>

        {/* Bottom: COMPACT 3-PILLAR TELEMETRY STRIP */}
        <div className="grid grid-cols-3 gap-3">
          
          {/* Pillar 1: Now Serving Token */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[#6B6E84] tracking-wider">
              Serving In Room
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#1F1F1F] font-sans">
              {doctorQueue.current_token || 'None'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Current patient</p>
          </div>

          {/* Pillar 2: People Ahead */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[#6B6E84] tracking-wider">
              People Ahead
            </span>
            <p
              className={`text-lg sm:text-2xl font-black font-sans ${
                isYourTurn ? 'text-emerald-600' : patientsAhead === 1 ? 'text-amber-600' : 'text-[#1F1F1F]'
              }`}
            >
              {patientsAhead}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {isYourTurn ? 'Your turn!' : `${patientsAhead} waiting`}
            </p>
          </div>

          {/* Pillar 3: Estimated Wait Time */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[#6B6E84] tracking-wider">
              Est. Waiting
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#4C5BBD] font-sans">
              {isYourTurn ? '0 mins' : estimatedWait}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Approximate</p>
          </div>

        </div>

      </div>

      {/* 3. COMPACT SECONDARY ACTIONS (Doctor Chat, View Appointments & Helpdesk) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        {/* Action 1: Doctor Consultation Chat */}
        <button
          type="button"
          onClick={handleEnterConsultationRoom}
          disabled={!isInSession || !timeCheck.isActive}
          style={{ outline: 'none' }}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 ${
            isInSession && timeCheck.isActive
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100 cursor-pointer'
              : 'bg-slate-50 border-slate-200/60 opacity-60 cursor-not-allowed text-[#6B6E84]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isInSession && timeCheck.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {isInSession && timeCheck.isActive ? <MessageSquare className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-bold text-xs">{isInSession && timeCheck.isActive ? 'Enter Chamber Chat' : 'Doctor Chamber Locked'}</p>
              <p className="text-[10px] text-[#6B6E84]">
                {!timeCheck.isActive
                  ? timeCheck.message
                  : isInSession
                  ? 'Admitted by doctor'
                  : 'Unlocks on doctor admission'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#6B6E84] shrink-0" />
        </button>

        {/* Action 2: View All Appointments */}
        <button
          type="button"
          onClick={() => navigate('/patients/dashboard')}
          style={{ outline: 'none' }}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-[#F2F5FF] text-left transition-all flex items-center justify-between gap-3 cursor-pointer text-[#1F1F1F]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4C5BBD] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs">My Appointments</p>
              <p className="text-[10px] text-[#6B6E84]">Back to consultations list</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#6B6E84] shrink-0" />
        </button>

        {/* Action 3: Reception Hotline */}
        <a
          href="tel:1800432535"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-rose-50 text-left transition-all flex items-center justify-between gap-3 text-[#1F1F1F]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs">OPD Helpdesk</p>
              <p className="text-[10px] text-[#6B6E84]">+91 1800-432-535</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#6B6E84] shrink-0" />
        </a>

      </div>

    </div>
  );
};

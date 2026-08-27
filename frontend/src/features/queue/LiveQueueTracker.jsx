import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useToast } from '../../context/ToastContext';
import { calculateEstimatedWaitTime } from '../../utils/formatters';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Stethoscope,
  Building2,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const LiveQueueTracker = ({ appointment }) => {
  const navigate = useNavigate();
  const { queues, getPatientsAhead } = useQueue();
  const { showToast } = useToast();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!appointment) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl border-0 shadow-xs font-sans">
        <p className="text-[#6B6E84] font-secondary text-sm font-medium">No active appointment selected.</p>
      </div>
    );
  }

  const doctorQueue = queues[appointment.doctor_id] || {
    current_token: 'CARD-004',
    serving_patient: 'Amit Gupta',
    total_in_queue: 5,
    status: 'ACTIVE',
  };

  const patientsAhead = getPatientsAhead(appointment.doctor_id, appointment.token_number);
  const estimatedWait = calculateEstimatedWaitTime(patientsAhead);

  // Auto notification when turn arrives
  useEffect(() => {
    if (patientsAhead === 0) {
      showToast(`IT'S YOUR TURN NOW! Please enter ${appointment.room_number || 'Room 302'}.`, 'success');
    }
  }, [patientsAhead]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast('OPD queue refreshed live.', 'info');
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Open consultation room on the SAME TAB
  const handleOpenDedicatedRoomSameTab = () => {
    if (patientsAhead > 0) {
      showToast(`Doctor Room locked until your turn! ${patientsAhead} patient(s) ahead.`, 'warning');
      return;
    }
    navigate(`/patients/consultation/${appointment.id}`);
  };

  // 3 DISTINCT BACKGROUND STATES with Short, Simple, Crisp Text & Secondary Font Pairing!
  let statusBanner = {
    title: `In Queue • ${patientsAhead} Ahead`,
    description: `Please rest in the lounge. Est. wait ~${estimatedWait}.`,
    badgeText: 'Queue Live',
    bgClass: 'bg-white text-[#1F1F1F] shadow-xs',
    badgeBg: 'bg-[#F2F5FF] text-[#4C5BBD]',
    dotClass: 'bg-[#4C5BBD]',
    titleColor: 'text-[#1F1F1F]',
    descColor: 'text-[#6B6E84]',
    locationBg: 'bg-[#F8FAFE] text-[#4C5BBD]',
    buttonBg: 'bg-[#4C5BBD] text-white hover:bg-[#3B489E]',
    icon: Clock,
    isYourTurn: false,
  };

  if (patientsAhead === 0) {
    // Actually Your Turn Now State: Fresh Medical Mint Green Background!
    statusBanner = {
      title: `Your Turn — Enter Room 302`,
      description: `Token ${appointment.token_number} called. Dr. Sharma is ready.`,
      badgeText: 'Token Called',
      bgClass: 'bg-[#ECFDF5] text-[#064E3B] shadow-xs border-0',
      badgeBg: 'bg-emerald-600 text-white font-black',
      dotClass: 'bg-white',
      titleColor: 'text-[#064E3B]',
      descColor: 'text-emerald-800',
      locationBg: 'bg-white text-emerald-900 font-black',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black',
      icon: CheckCircle2,
      isYourTurn: true,
    };
  } else if (patientsAhead === 1) {
    // Alert / Next in Line State: Soft Ice Blue Background!
    statusBanner = {
      title: `Get Ready • You Are Next`,
      description: `Please stand outside Room 302.`,
      badgeText: 'Next in Line',
      bgClass: 'bg-[#EBF1FF] text-[#161B33] shadow-xs border-0',
      badgeBg: 'bg-[#4C5BBD] text-white font-black',
      dotClass: 'bg-white',
      titleColor: 'text-[#161B33]',
      descColor: 'text-[#4C5BBD]',
      locationBg: 'bg-white text-[#4C5BBD] font-black',
      buttonBg: 'bg-[#4C5BBD] text-white hover:bg-[#3B489E]',
      icon: AlertCircle,
      isYourTurn: false,
    };
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* 1. Main Live OPD Status Banner Card (Short Text, Simple Words, Inter Secondary Font) */}
      <div className={`p-6 sm:p-7 rounded-3xl border-0 shadow-xs transition-all relative overflow-hidden ${statusBanner.bgClass}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-secondary ${statusBanner.badgeBg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusBanner.dotClass} animate-pulse`}></span>
                {statusBanner.badgeText}
              </span>
            </div>

            <h2 className={`text-xl sm:text-2xl font-black leading-snug tracking-tight font-sans ${statusBanner.titleColor}`}>
              {statusBanner.title}
            </h2>

            <p className={`text-xs sm:text-sm font-medium font-secondary leading-relaxed ${statusBanner.descColor}`}>
              {statusBanner.description}
            </p>

            {/* IF IT'S YOUR TURN: Horizontal Row (Location Badge & Primary Button) */}
            {statusBanner.isYourTurn ? (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold font-secondary shadow-xs border-0 shrink-0 ${statusBanner.locationBg}`}>
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Room 302 • Cardio</span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenDedicatedRoomSameTab}
                  style={{ outline: 'none' }}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-secondary shadow-xs border-0 transition-all shrink-0 ${statusBanner.buttonBg}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enter Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* BEFORE YOUR TURN: Compact Security Notice */
              <div className={`pt-1.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium font-secondary border-0 shadow-xs ${statusBanner.locationBg}`}>
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Doctor Room unlocks when your turn arrives.</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            style={{ outline: 'none' }}
            className="p-3 rounded-2xl bg-white/60 hover:bg-white text-[#4C5BBD] transition-all shrink-0 border-0 shadow-xs"
            title="Refresh OPD Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Primary 2-Card Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        
        {/* Card 1: Your Patient Token Card */}
        <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B6E84] font-secondary">
                Your Token
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#F2F5FF] text-[#4C5BBD] font-secondary">
                Verified
              </span>
            </div>

            <div className="text-center py-2.5 bg-[#F8FAFE] rounded-2xl p-3">
              <p className="text-[10px] text-[#6B6E84] font-bold uppercase tracking-wider font-secondary">Assigned OPD Token</p>
              <h1 className="text-3xl sm:text-4xl font-black text-[#4C5BBD] font-sans tracking-wide mt-0.5">
                {appointment.token_number}
              </h1>
            </div>
          </div>

          <div className="space-y-2 text-xs bg-[#F8FAFE] p-3.5 rounded-2xl font-secondary">
            <div className="flex items-center justify-between">
              <span className="text-[#6B6E84] font-medium">Patient:</span>
              <span className="font-bold text-[#1F1F1F]">{appointment.patient_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B6E84] font-medium">Doctor:</span>
              <span className="font-bold text-[#1F1F1F]">{appointment.doctor_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B6E84] font-medium">Room:</span>
              <span className="font-bold text-[#4C5BBD]">{appointment.room_number || 'Room 302'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Doctor Room Live Counter Status */}
        <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B6E84] font-secondary">
                Room Counter
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-secondary ${
                patientsAhead === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-50 text-emerald-700'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{patientsAhead === 0 ? 'Your Turn!' : 'Active Counter'}</span>
              </span>
            </div>

            <div className="text-center py-2.5 bg-[#F8FAFE] rounded-2xl p-3">
              <p className="text-[10px] text-[#6B6E84] font-bold uppercase tracking-wider font-secondary">Current Room Token</p>
              <h1 className={`text-3xl sm:text-4xl font-black font-sans tracking-wide mt-0.5 ${
                patientsAhead === 0 ? 'text-emerald-600 scale-105 transition-transform' : 'text-[#1F1F1F]'
              }`}>
                {doctorQueue.current_token}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-secondary">
            <div className="p-3 rounded-2xl bg-[#F8FAFE] text-center">
              <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Ahead</p>
              <p className="text-xl font-bold text-[#1F1F1F] font-sans mt-0.5">{patientsAhead}</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFE] text-center">
              <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Est. Wait</p>
              <p className="text-xl font-bold text-[#4C5BBD] font-sans mt-0.5">{estimatedWait}</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Communication Access Panel */}
      <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4 font-sans">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <h3 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider flex items-center gap-2 font-secondary">
            <Stethoscope className="w-4 h-4 text-[#4C5BBD]" />
            <span>Doctor Portal</span>
          </h3>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-secondary ${
            patientsAhead === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-[#6B6E84]'
          }`}>
            {patientsAhead === 0 ? 'Unlocked' : 'Locked'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Dedicated Room Access Card */}
          <button
            type="button"
            onClick={handleOpenDedicatedRoomSameTab}
            disabled={patientsAhead > 0}
            style={{ outline: 'none' }}
            className={`p-4 rounded-2xl text-left transition-all border-0 shadow-xs group ${
              patientsAhead === 0
                ? 'bg-[#ECFDF5] hover:bg-emerald-100/60 cursor-pointer'
                : 'bg-slate-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2">
              {patientsAhead === 0 ? <MessageSquare className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-400" />}
            </div>
            <h4 className="font-bold text-[#064E3B] text-xs font-secondary flex items-center gap-1.5">
              <span>Consultation Room</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </h4>
            <p className="text-[11px] text-emerald-800 mt-0.5 font-medium font-secondary">
              {patientsAhead === 0
                ? 'Access Chat, Voice & Video Call.'
                : 'Unlocks when your turn arrives.'}
            </p>
          </button>

          {/* OPD Reception Hotline */}
          <a
            href="tel:1800432535"
            className="p-4 rounded-2xl bg-[#F8FAFE] hover:bg-[#F2F5FF] text-left transition-all border-0 shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#1F1F1F] text-xs font-secondary">OPD Reception Hotline</h4>
            <p className="text-[11px] text-[#6B6E84] mt-0.5 font-medium font-secondary">Call +91 1800-432-535.</p>
          </a>

        </div>
      </div>

    </div>
  );
};

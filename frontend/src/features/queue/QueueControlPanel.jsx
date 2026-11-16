import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isSlotActiveNowIST } from '../../utils/formatters';
import {
  Users,
  PhoneCall,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Radio,
  Clock,
  MessageSquare,
  Video,
  ArrowRight,
  User,
  Calendar,
  AlertCircle,
  Ticket,
  CalendarCheck,
  Building2,
  Lock,
} from 'lucide-react';
import { callNextPatientInBackend } from '../../services/doctorBackendService';
import { supabase, isSupabaseConfigured } from '../../services/supabase/client';

export const QueueControlPanel = () => {
  const navigate = useNavigate();
  const { activeDoctor } = useAuth();
  const { queues, callNextPatient, appointments, updateAppointmentStatus } = useQueue();
  const { showToast } = useToast();
  
  const [isCalling, setIsCalling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'waiting', 'completed', 'all'

  const queue = queues[activeDoctor?.id] || {
    current_token: 'None',
    serving_patient: 'Chamber Ready',
    total_in_queue: 0,
    status: 'ACTIVE',
  };

  // 1. All Appointments strictly for this doctor
  const docAppointments = appointments.filter(
    (a) =>
      a.doctor_id === activeDoctor?.id ||
      (a.doctor_name && activeDoctor?.name && a.doctor_name.toLowerCase().includes(activeDoctor.name.toLowerCase()))
  );

  // 2. Normalize and prevent invalid conflicting queue states:
  // A patient is either Completed, In Session, or Waiting (Scheduled)
  const completedAppointments = docAppointments.filter((a) => a.status === 'Completed');
  
  // Single active patient currently in session
  const currentServingAppointment = docAppointments.find(
    (a) => a.status === 'In Session' || (queue.current_token && queue.current_token !== 'None' && a.token_number === queue.current_token && a.status !== 'Completed')
  );

  // Waiting appointments: not completed, and not currently in session
  const waitingAppointments = docAppointments.filter(
    (a) => (a.status === 'Scheduled' || a.status === 'Checked In') && a.id !== currentServingAppointment?.id
  );

  const nextWaitingPatient = waitingAppointments[0] || null;

  // 3. Actions
  const handleCallNext = async (customTargetApt = null) => {
    setIsCalling(true);
    try {
      const targetApt = customTargetApt || nextWaitingPatient || currentServingAppointment;
      const calledToken = targetApt?.token_number;

      if (targetApt && targetApt.id) {
        if (isSupabaseConfigured) {
          await supabase
            .from('appointments')
            .update({ status: 'In Session' })
            .eq('id', targetApt.id);

          if (activeDoctor?.id) {
            await supabase
              .from('queues')
              .update({
                current_token: targetApt.token_number,
                serving_patient: targetApt.patient_name || 'Patient',
                total_in_queue: Math.max(0, waitingAppointments.length - 1),
                last_updated: new Date().toISOString(),
              })
              .eq('doctor_id', activeDoctor.id);
          }
        }

        try {
          if (activeDoctor?.id) {
            await callNextPatientInBackend(activeDoctor.id);
          }
        } catch (beErr) {
          console.warn('Backend queue notice:', beErr.message);
        }

        callNextPatient(activeDoctor?.id, calledToken);
        if (updateAppointmentStatus) {
          updateAppointmentStatus(targetApt.id, 'In Session');
        }
        showToast(`Token ${calledToken} (${targetApt.patient_name}) called & admitted!`, 'success');
        navigate(`/patients/consultation/${targetApt.id}`);
        return;
      }

      showToast(`No patient available to call.`, 'info');
    } catch (err) {
      console.error('Call next patient error:', err);
      if (nextWaitingPatient?.id) {
        if (updateAppointmentStatus) {
          updateAppointmentStatus(nextWaitingPatient.id, 'In Session');
        }
        navigate(`/patients/consultation/${nextWaitingPatient.id}`);
        return;
      }
      showToast(`Token called for chamber`, 'info');
    } finally {
      setIsCalling(false);
    }
  };

  const handleMarkComplete = async (aptId) => {
    if (!aptId) return;
    setIsCompleting(true);
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('appointments')
          .update({ status: 'Completed' })
          .eq('id', aptId);
      }

      if (updateAppointmentStatus) {
        updateAppointmentStatus(aptId, 'Completed');
      }

      // Automatically advance: call & admit next waiting patient if available
      const remainingPatients = waitingAppointments.filter((a) => a.id !== aptId);
      if (remainingPatients.length > 0) {
        const nextApt = remainingPatients[0];
        if (isSupabaseConfigured) {
          await supabase
            .from('queues')
            .update({
              current_token: nextApt.token_number,
              serving_patient: nextApt.patient_name || 'Patient',
              total_in_queue: remainingPatients.length,
            })
            .eq('doctor_id', activeDoctor.id);

          await supabase
            .from('appointments')
            .update({ status: 'In Session' })
            .eq('id', nextApt.id);
        }

        callNextPatient(activeDoctor.id, nextApt.token_number);
        if (updateAppointmentStatus) {
          updateAppointmentStatus(nextApt.id, 'In Session');
        }
        showToast(`Visit completed! Next token ${nextApt.token_number} (${nextApt.patient_name}) admitted.`, 'success');
      } else {
        if (isSupabaseConfigured) {
          await supabase
            .from('queues')
            .update({
              current_token: 'None',
              serving_patient: 'Chamber Ready',
              total_in_queue: 0,
            })
            .eq('doctor_id', activeDoctor.id);
        }
        callNextPatient(activeDoctor.id, 'None');
        showToast('Consultation completed! No more waiting patients.', 'success');
      }
    } catch (err) {
      console.error('Failed to complete consultation:', err);
      showToast('Completed consultation update', 'info');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStartConsultation = async (aptId) => {
    const apt = docAppointments.find((a) => a.id === aptId);
    if (apt) {
      const isDemo = apt.is_demo || apt.is_instant || /instant|demo|immediate/i.test(apt.slot_time || '') || /instant|demo|presentation/i.test(apt.reason || '');
      const timeCheck = isSlotActiveNowIST(apt.date || apt.slot_date, apt.time || apt.slot_time, isDemo);
      if (!timeCheck.isActive) {
        showToast(`Cannot enter chamber yet: ${timeCheck.message}`, 'warning');
        return;
      }

      // If patient is not yet 'In Session', automatically admit them in Supabase & Queue!
      if (apt.status !== 'In Session') {
        try {
          if (isSupabaseConfigured) {
            await supabase.from('appointments').update({ status: 'In Session' }).eq('id', apt.id);
            if (activeDoctor?.id) {
              await supabase.from('queues').update({
                current_token: apt.token_number,
                serving_patient: apt.patient_name || 'Patient',
                last_updated: new Date().toISOString(),
              }).eq('doctor_id', activeDoctor.id);
            }
          }
          if (updateAppointmentStatus) {
            updateAppointmentStatus(apt.id, 'In Session');
          }
          callNextPatient(activeDoctor?.id, apt.token_number);
          showToast(`Admitted token ${apt.token_number} (${apt.patient_name}) into chamber!`, 'success');
        } catch (e) {
          console.warn('Admission sync notice:', e);
        }
      }
    }
    navigate(`/patients/consultation/${aptId}`);
  };

  const handleStartCall = async (aptId) => {
    const apt = docAppointments.find((a) => a.id === aptId);
    if (apt) {
      const isDemo = apt.is_demo || apt.is_instant || /instant|demo|immediate/i.test(apt.slot_time || '') || /instant|demo|presentation/i.test(apt.reason || '');
      const timeCheck = isSlotActiveNowIST(apt.date || apt.slot_date, apt.time || apt.slot_time, isDemo);
      if (!timeCheck.isActive) {
        showToast(`Cannot call yet: ${timeCheck.message}`, 'warning');
        return;
      }

      // If patient is not yet 'In Session', admit them in Supabase
      if (apt.status !== 'In Session') {
        try {
          if (isSupabaseConfigured) {
            await supabase.from('appointments').update({ status: 'In Session' }).eq('id', apt.id);
            if (activeDoctor?.id) {
              await supabase.from('queues').update({
                current_token: apt.token_number,
                serving_patient: apt.patient_name || 'Patient',
                last_updated: new Date().toISOString(),
              }).eq('doctor_id', activeDoctor.id);
            }
          }
          if (updateAppointmentStatus) {
            updateAppointmentStatus(apt.id, 'In Session');
          }
          callNextPatient(activeDoctor?.id, apt.token_number);
        } catch (e) {}
      }
    }
    navigate(`/patients/consultation/${aptId}?action=video`);
  };

  // Filter patient roster
  let filteredRoster = docAppointments;
  if (statusFilter === 'active') {
    filteredRoster = docAppointments.filter((a) => a.status === 'In Session' || a.status === 'Scheduled');
  } else if (statusFilter === 'waiting') {
    filteredRoster = waitingAppointments;
  } else if (statusFilter === 'completed') {
    filteredRoster = completedAppointments;
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* =========================================================================
          1. TODAY'S SUMMARY (4 Useful Real-time Metrics)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Today's Total Bookings */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              Today's Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4C5BBD] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1F1F1F] font-sans">{docAppointments.length}</p>
          <p className="text-[11px] text-[#6B6E84]">Confirmed appointments</p>
        </div>

        {/* Metric 2: Waiting Patients */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              Waiting Patients
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 font-sans">{waitingAppointments.length}</p>
          <p className="text-[11px] text-[#6B6E84]">In queue hall</p>
        </div>

        {/* Metric 3: Currently Consulting */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">
              In Consultation
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 font-sans">
            {currentServingAppointment ? currentServingAppointment.token_number : 'None'}
          </p>
          <p className="text-[11px] text-[#6B6E84]">
            {currentServingAppointment ? currentServingAppointment.patient_name : 'Chamber open'}
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
          <p className="text-2xl font-black text-slate-800 font-sans">{completedAppointments.length}</p>
          <p className="text-[11px] text-[#6B6E84]">Visits finished today</p>
        </div>

      </div>

      {/* =========================================================================
          2. LIVE OPD CONTROL (MAIN FOCUS: Current Serving Patient & Next Waiting)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading flex items-center gap-2">
              <span>Live OPD Control Chamber</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-xs text-[#6B6E84] font-medium">
              Chamber: <strong>{activeDoctor?.room_number || 'Room 101'}</strong> • Manage consultation calls and patient progression
            </p>
          </div>

          {/* Master CTA: Call Next Patient Token */}
          <button
            type="button"
            disabled={isCalling || !nextWaitingPatient}
            onClick={handleCallNext}
            style={{ outline: 'none' }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>
              {isCalling
                ? 'Broadcasting...'
                : nextWaitingPatient
                ? `Call Next Token (${nextWaitingPatient.token_number})`
                : 'No More Waiting Patients'}
            </span>
          </button>
        </div>

        {/* 2 Focused Cards: Currently Serving & Next in Line */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Card A: Currently Consulting Patient */}
          <div className="rounded-2xl p-5 border border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Currently In Chamber</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#4C5BBD]">
                {currentServingAppointment ? `Token ${currentServingAppointment.token_number}` : 'None'}
              </span>
            </div>

            {currentServingAppointment ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-black text-[#1F1F1F] font-heading">
                    {currentServingAppointment.patient_name}
                  </h4>
                  <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-[#6B6E84]" />
                    <span>Slot: {currentServingAppointment.slot_time || currentServingAppointment.time}</span>
                    {currentServingAppointment.patient_phone && (
                      <>
                        <span>•</span>
                        <span>{currentServingAppointment.patient_phone}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-[#4C5BBD] font-medium mt-1">
                    <strong>Reason:</strong> {currentServingAppointment.reason || 'General Health Consultation'}
                  </p>
                </div>

                {/* Primary Actions for Current Patient */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleStartConsultation(currentServingAppointment.id)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold border border-[#4C5BBD]/30 shadow-2xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Pick Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartCall(currentServingAppointment.id)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Call Patient</span>
                  </button>

                  <button
                    type="button"
                    disabled={isCompleting}
                    onClick={() => handleMarkComplete(currentServingAppointment.id)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Visit</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#6B6E84] space-y-1">
                <p className="font-bold text-[#1F1F1F]">No patient in chamber right now</p>
                <p>Click "Call Next Token" to admit the next patient.</p>
              </div>
            )}
          </div>

          {/* Card B: Next Waiting Patient */}
          <div className="rounded-2xl p-5 border border-slate-200/90 bg-[#F8FAFE] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Next in Queue</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">
                {nextWaitingPatient ? `Token ${nextWaitingPatient.token_number}` : 'No Queue'}
              </span>
            </div>

            {nextWaitingPatient ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-black text-[#1F1F1F] font-heading">
                    {nextWaitingPatient.patient_name}
                  </h4>
                  <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-[#6B6E84]" />
                    <span>Scheduled: {nextWaitingPatient.slot_time || nextWaitingPatient.time}</span>
                    {nextWaitingPatient.patient_phone && (
                      <>
                        <span>•</span>
                        <span>{nextWaitingPatient.patient_phone}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    <strong>Chief Complaint:</strong> {nextWaitingPatient.reason || 'Routine checkup'}
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCallNext}
                    disabled={isCalling}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold border border-slate-200/80 shadow-2xs cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Admit & Call into Chamber →</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#6B6E84] space-y-1">
                <p className="font-bold text-[#1F1F1F]">Queue is currently clear</p>
                <p>New patient bookings will appear here automatically.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* =========================================================================
          3. SINGLE UNIFIED PATIENT QUEUE (Combined Schedule & Roster)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Header with Segmented Status Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-[#1F1F1F] font-heading">
              Today's Patient Queue ({docAppointments.length})
            </h3>
            <p className="text-xs text-[#6B6E84]">
              Unified patient queue with clear statuses and instant actions
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#F8FAFE] rounded-xl border border-slate-200/80 self-start sm:self-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-[#4C5BBD] text-white shadow-2xs'
                  : 'text-[#6B6E84] hover:text-[#1F1F1F] bg-transparent'
              }`}
            >
              Active ({waitingAppointments.length + (currentServingAppointment ? 1 : 0)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('waiting')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                statusFilter === 'waiting'
                  ? 'bg-[#4C5BBD] text-white shadow-2xs'
                  : 'text-[#6B6E84] hover:text-[#1F1F1F] bg-transparent'
              }`}
            >
              Waiting ({waitingAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-[#4C5BBD] text-white shadow-2xs'
                  : 'text-[#6B6E84] hover:text-[#1F1F1F] bg-transparent'
              }`}
            >
              Completed ({completedAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#4C5BBD] text-white shadow-2xs'
                  : 'text-[#6B6E84] hover:text-[#1F1F1F] bg-transparent'
              }`}
            >
              All ({docAppointments.length})
            </button>
          </div>
        </div>

        {/* Patient Queue List */}
        {filteredRoster.length > 0 ? (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden">
            {filteredRoster.map((apt) => {
              const isServing = apt.id === currentServingAppointment?.id;
              const isCompleted = apt.status === 'Completed';

              return (
                <div
                  key={apt.id}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                    isServing
                      ? 'bg-emerald-50/50'
                      : isCompleted
                      ? 'bg-slate-50/60 opacity-60'
                      : 'bg-white hover:bg-[#F8FAFE]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black font-sans shrink-0 border ${
                        isServing
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-[#F2F5FF] text-[#4C5BBD] border-[#DCE5FA]'
                      }`}
                    >
                      {apt.token_number}
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-[#1F1F1F] truncate">
                          {apt.patient_name}
                        </h5>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isServing
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCompleted
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isServing ? 'In Consultation' : isCompleted ? 'Completed' : 'Waiting in Queue'}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B6E84] flex items-center gap-2 truncate">
                        <span>Slot: {apt.slot_time || apt.time}</span>
                        {apt.reason && (
                          <>
                            <span>•</span>
                            <span className="truncate">{apt.reason}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Contextual Action per Patient */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-500 bg-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : isServing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartConsultation(apt.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold border border-[#4C5BBD]/30 shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartCall(apt.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(apt.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartConsultation(apt.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold border border-slate-200/90 shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Admit Patient →</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#6B6E84] bg-[#F8FAFE] rounded-2xl border border-slate-200/70 p-4">
            No patients found matching the selected filter.
          </div>
        )}

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  PhoneCall,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Radio,
  Clock,
  Volume2,
  MessageSquare,
  Video,
  ArrowRight,
  User,
  Calendar,
  AlertCircle,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { callNextPatientInBackend } from '../../services/doctorBackendService';
import { supabase, isSupabaseConfigured } from '../../services/supabase/client';

export const QueueControlPanel = () => {
  const navigate = useNavigate();
  const { activeDoctor } = useAuth();
  const { queues, callNextPatient, appointments, updateAppointmentStatus } = useQueue();
  const { showToast } = useToast();
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const queue = queues[activeDoctor.id] || {
    current_token: 'None',
    serving_patient: 'Chamber Ready',
    total_in_queue: 0,
    status: 'ACTIVE',
  };

  // 1. Appointments specifically for this active doctor
  const docAppointments = appointments.filter(
    (a) =>
      a.doctor_id === activeDoctor.id ||
      (a.doctor_name && activeDoctor.name && a.doctor_name.toLowerCase().includes(activeDoctor.name.toLowerCase()))
  );

  // 2. Identify the active / currently serving patient
  const currentServingAppointment = docAppointments.find(
    (a) =>
      a.status === 'In Session' ||
      (queue.current_token && queue.current_token !== 'None' && a.token_number === queue.current_token)
  );

  // 3. Upcoming patients waiting in queue
  const waitingAppointments = docAppointments.filter(
    (a) => a.status === 'Scheduled' && a.id !== currentServingAppointment?.id
  );

  const nextWaitingAppointment = waitingAppointments[0] || null;

  const handleNext = async () => {
    setIsCalling(true);
    try {
      let res = null;
      if (activeDoctor?.id) {
        res = await callNextPatientInBackend(activeDoctor.id);
      }
      const calledToken = res?.current_token || (nextWaitingAppointment ? nextWaitingAppointment.token_number : null);
      callNextPatient(activeDoctor.id, calledToken);

      // Target appointment to enter room
      const targetApt = res?.appointment || nextWaitingAppointment || currentServingAppointment;
      if (targetApt && targetApt.id) {
        showToast(`Token ${calledToken} called! Opening consultation room...`, 'success');
        navigate(`/patients/consultation/${targetApt.id}`);
        return;
      }
      showToast(`Token Called! Patient notified for ${activeDoctor.room_number || 'Room 101'}.`, 'success');
    } catch (err) {
      callNextPatient(activeDoctor.id);
      if (nextWaitingAppointment?.id) {
        navigate(`/patients/consultation/${nextWaitingAppointment.id}`);
        return;
      }
      showToast(`Token Called! Room: ${activeDoctor.room_number || 'Room 101'}`, 'info');
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

        // Advance or reset queue
        if (waitingAppointments.length > 0) {
          await supabase
            .from('queues')
            .update({
              current_token: 'None',
              serving_patient: 'Chamber Ready',
              total_in_queue: waitingAppointments.length,
            })
            .eq('doctor_id', activeDoctor.id);
        } else {
          await supabase
            .from('queues')
            .update({
              current_token: 'None',
              serving_patient: 'Chamber Ready',
              total_in_queue: 0,
            })
            .eq('doctor_id', activeDoctor.id);
        }
      }

      if (updateAppointmentStatus) {
        updateAppointmentStatus(aptId, 'Completed');
      }
      showToast('Patient marked Completed and removed from chamber!', 'success');
    } catch (err) {
      console.error('Failed to complete consultation:', err);
      showToast('Completed consultation update', 'info');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAttendChat = (aptId) => {
    navigate(`/patients/consultation/${aptId}`);
  };

  const handleAttendVideo = (aptId) => {
    navigate(`/patients/consultation/${aptId}?action=video`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 font-sans">
      
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F1F1F] font-heading">
              Live OPD Patient Caller & Chamber Control
            </h3>
            <p className="text-xs text-[#6B6E84] font-medium">
              Manage patient consultation flow, attend live calls, and broadcast token announcements
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsQueuePaused(!isQueuePaused)}
          style={{ outline: 'none' }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border-0 shadow-xs cursor-pointer ${
            isQueuePaused
              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          {isQueuePaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
          <span>{isQueuePaused ? 'Resume Queue' : 'Pause Queue'}</span>
        </button>
      </div>

      {/* 2. Three Metric Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Token Currently Serving */}
        <div className="bg-[#F8FAFE] p-5 rounded-2xl border border-slate-200/70 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6E84]">Now Serving Token</span>
          <p className="text-4xl font-black font-sans text-[#4C5BBD] tracking-wider my-1">
            {queue.current_token || 'None'}
          </p>
          <p className="text-xs text-[#1F1F1F] font-bold">Chamber: {activeDoctor.room_number || 'Room 101'}</p>
        </div>

        {/* Patients Waiting */}
        <div className="bg-[#F8FAFE] p-5 rounded-2xl border border-slate-200/70 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6E84]">Patients Waiting</span>
          <p className="text-4xl font-black text-[#1F1F1F] font-sans my-1">
            {waitingAppointments.length > 0 ? waitingAppointments.length : queue.total_in_queue}
          </p>
          <p className="text-xs text-[#6B6E84] font-medium">Est. avg ~12 mins / visit</p>
        </div>

        {/* Next Expected Token */}
        <div className="bg-[#F8FAFE] p-5 rounded-2xl border border-slate-200/70 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6E84]">Next Up Token</span>
          <p className="text-2xl font-black font-sans text-[#161B33] tracking-wide my-2">
            {nextWaitingAppointment ? nextWaitingAppointment.token_number : 'No Queue'}
          </p>
          <span className={`text-xs font-bold ${nextWaitingAppointment ? 'text-[#4C5BBD]' : 'text-emerald-600'}`}>
            {nextWaitingAppointment ? `${nextWaitingAppointment.patient_name || 'Patient'} Waiting` : 'OPD Chamber Ready'}
          </span>
        </div>

      </div>

      {/* 3. ACTIVE PATIENT IN CHAMBER CARD (With Attend Chat & Attend Video Call) */}
      <div className="bg-[#F8FAFE] rounded-3xl p-6 border-2 border-[#4C5BBD]/20 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#4C5BBD] font-heading">
              Currently Serving in Chamber
            </span>
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#4C5BBD] text-white shadow-xs">
            Token: {currentServingAppointment?.token_number || queue.current_token || 'None'}
          </span>
        </div>

        {currentServingAppointment ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center text-xl font-black uppercase shadow-xs shrink-0">
                  {(currentServingAppointment.patient_name || 'P')[0]}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black text-[#1F1F1F] font-heading">
                      {currentServingAppointment.patient_name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      In Consultation
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6E84] font-medium flex items-center gap-3 flex-wrap">
                    <span>Email: <strong className="text-[#1F1F1F]">{currentServingAppointment.patient_email || 'Not provided'}</strong></span>
                    {currentServingAppointment.patient_phone && (
                      <span>• Phone: <strong className="text-[#1F1F1F]">{currentServingAppointment.patient_phone}</strong></span>
                    )}
                    <span>• Slot: <strong className="text-[#1F1F1F]">{currentServingAppointment.slot_time || currentServingAppointment.time}</strong></span>
                  </p>
                  <p className="text-xs text-[#4C5BBD] font-medium pt-0.5">
                    <strong>Reason / Chief Complaint:</strong> {currentServingAppointment.reason || 'Routine cardiology checkup & consultation'}
                  </p>
                </div>
              </div>

              {/* Direct Actions to Pick Chat / Attend Call */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAttendChat(currentServingAppointment.id)}
                  style={{ outline: 'none' }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] border border-[#4C5BBD]/30 text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#4C5BBD]" />
                  <span>Pick Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAttendVideo(currentServingAppointment.id)}
                  style={{ outline: 'none' }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Attend Call</span>
                </button>

                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => handleMarkComplete(currentServingAppointment.id)}
                  style={{ outline: 'none' }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Finish Visit"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-2">
            <p className="text-sm font-bold text-[#1F1F1F]">No patient currently in consultation chamber</p>
            <p className="text-xs text-[#6B6E84]">
              Click "Call Next Patient Token" below to notify the next waiting patient to enter {activeDoctor.room_number || 'Room 101'}.
            </p>
          </div>
        )}
      </div>

      {/* 4. Primary Call Action Control */}
      <div>
        <button
          type="button"
          disabled={isQueuePaused || isCalling || (!nextWaitingAppointment && queue.total_in_queue === 0)}
          onClick={handleNext}
          style={{ outline: 'none' }}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-sm font-black shadow-xs transition-all border-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <PhoneCall className="w-4.5 h-4.5" />
          <span>
            {isCalling
              ? 'Broadcasting Token...'
              : nextWaitingAppointment
              ? `Call Next Patient: ${nextWaitingAppointment.patient_name} (${nextWaitingAppointment.token_number})`
              : 'Call Next Patient Token'}
          </span>
        </button>
      </div>

      {/* 5. Doctor's OPD Patient Queue List */}
      {docAppointments.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4C5BBD]" />
              <span>Today's OPD Patient Roster ({docAppointments.length})</span>
            </h4>
            <span className="text-xs text-[#6B6E84] font-medium">Real-time synced</span>
          </div>

          <div className="divide-y divide-slate-100 rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
            {docAppointments.map((apt) => {
              const isServing = apt.id === currentServingAppointment?.id;
              const isCompleted = apt.status === 'Completed';

              return (
                <div
                  key={apt.id}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    isCompleted
                      ? 'bg-slate-100/90 opacity-40 filter grayscale contrast-75 select-none pointer-events-none'
                      : isServing
                      ? 'bg-[#F2F5FF]/70'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black font-sans border shadow-2xs ${
                        isCompleted
                          ? 'bg-slate-200/60 border-slate-300 text-slate-500'
                          : 'bg-white border-slate-200 text-[#4C5BBD]'
                      }`}
                    >
                      {apt.token_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-black ${
                            isCompleted ? 'text-slate-500 line-through' : 'text-[#1F1F1F]'
                          }`}
                        >
                          {apt.patient_name}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-slate-200 text-slate-500 font-extrabold line-through'
                              : apt.status === 'In Session'
                              ? 'bg-emerald-100 text-emerald-800 font-black'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompleted ? '✓ Completed & Discharged' : apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6E84]">
                        Slot: {apt.slot_time || apt.time} • Phone: {apt.patient_phone || 'N/A'} • Reason: {apt.reason || 'General Checkup'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200/80 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Finished</span>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAttendChat(apt.id)}
                          style={{ outline: 'none' }}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold border border-slate-200 shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAttendVideo(apt.id)}
                          style={{ outline: 'none' }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold border-0 shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

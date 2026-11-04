import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { PhoneCall, Video, MessageSquare, Check, X, Bell, User, Clock, ShieldCheck } from 'lucide-react';

/**
 * IncomingConsultationNotification:
 * Real-time floating / modal banner that alerts the EXACT doctor when a patient
 * books, checks in, or their turn arrives to attend consultation/call/chat!
 */
export const IncomingConsultationNotification = () => {
  const navigate = useNavigate();
  const { isDoctor, activeDoctor } = useAuth();
  const { appointments, queues } = useQueue();

  const [activeAlert, setActiveAlert] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  useEffect(() => {
    if (!isDoctor || !activeDoctor?.id) {
      setActiveAlert(null);
      return;
    }

    const docId = activeDoctor.id;
    const docQueue = queues[docId];
    const currentToken = docQueue?.current_token;

    // Find if there is an active appointment waiting or in session for this doctor
    const matchingApt = appointments.find((a) => {
      if (a.doctor_id !== docId) return false;
      if (dismissedIds.has(a.id)) return false;
      // Triggers if appointment is In Session OR it's the current called token OR Scheduled today
      if (a.status === 'In Session') return true;
      if (currentToken && a.token_number === currentToken && a.status !== 'Completed') return true;
      return false;
    });

    if (matchingApt) {
      setActiveAlert(matchingApt);
    } else {
      setActiveAlert(null);
    }
  }, [isDoctor, activeDoctor?.id, appointments, queues, dismissedIds]);

  if (!activeAlert) return null;

  const handlePickChat = () => {
    navigate(`/patients/consultation/${activeAlert.id}`);
    setActiveAlert(null);
  };

  const handleDismiss = () => {
    setDismissedIds((prev) => new Set([...prev, activeAlert.id]));
    setActiveAlert(null);
  };

  return createPortal(
    <div className="fixed top-5 right-5 z-[999999] animate-bounce-in max-w-sm w-full font-sans">
      <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-[#4C5BBD]/30 relative overflow-hidden backdrop-blur-md">
        {/* Top Glow Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#4C5BBD] to-blue-500"></div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs relative">
              <PhoneCall className="w-5 h-5 animate-pulse text-emerald-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                  Patient Ready • Token {activeAlert.token_number}
                </span>
              </div>
              <h4 className="text-sm font-black text-[#1F1F1F] font-heading mt-0.5">
                {activeAlert.patient_name || 'Patient'}
              </h4>
              <p className="text-[11px] text-[#6B6E84] font-medium">
                {activeAlert.reason || activeAlert.specialty || 'General Consultation'} • {activeAlert.room_number || activeDoctor.room_number || 'Room 101'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors border-0 cursor-pointer"
            title="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons: Pick Chat / Attend Call */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <button
            onClick={handlePickChat}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold shadow-xs transition-all border-0 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Pick Chat</span>
          </button>

          <button
            onClick={handlePickChat}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all border-0 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Attend Call</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


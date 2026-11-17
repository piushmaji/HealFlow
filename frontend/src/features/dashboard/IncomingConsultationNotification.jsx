import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { Bell, ArrowRight, X, Clock } from 'lucide-react';

/**
 * IncomingConsultationNotification:
 * Premium, minimal, clean white design matching HealFlow's theme.
 * Gives a 1-click shortcut to the Live Queue tracker or Chamber.
 */
export const IncomingConsultationNotification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDoctor, patientUser, currentUser } = useAuth();
  const { appointments, queues } = useQueue();

  const [patientTurnAlert, setPatientTurnAlert] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  // Do not show banner if user is ALREADY inside the chamber or live queue
  const isAlreadyInChamber = location.pathname.includes('/patients/consultation/');
  const isAlreadyInLiveQueue = location.pathname.includes('/live-queue');

  // PATIENT SIDE: Only when doctor calls the turn / admits patient to chamber
  useEffect(() => {
    if (isDoctor || isAlreadyInChamber || isAlreadyInLiveQueue) {
      setPatientTurnAlert(null);
      return;
    }

    const myId = patientUser?.id || currentUser?.id;
    const myEmail = patientUser?.email || currentUser?.email;

    const myAdmittedApt = appointments.find((a) => {
      if (dismissedIds.has(a.id)) return false;
      const isMine =
        (myId && a.patient_id === myId) ||
        (myEmail && a.patient_email && a.patient_email.toLowerCase() === myEmail.toLowerCase()) ||
        (!myId && !myEmail);

      if (!isMine) return false;

      if (a.status === 'In Session') return true;

      if (a.doctor_id && queues[a.doctor_id]) {
        const docQueue = queues[a.doctor_id];
        if (docQueue.current_token && docQueue.current_token === a.token_number && a.status !== 'Completed') {
          return true;
        }
      }

      return false;
    });

    if (myAdmittedApt) {
      setPatientTurnAlert(myAdmittedApt);
    } else {
      setPatientTurnAlert(null);
    }
  }, [isDoctor, appointments, queues, patientUser?.id, patientUser?.email, currentUser?.id, currentUser?.email, dismissedIds, isAlreadyInChamber, isAlreadyInLiveQueue]);

  if (isAlreadyInChamber || isAlreadyInLiveQueue || !patientTurnAlert) return null;

  const handleGoToLiveQueue = () => {
    navigate(`/patients/live-queue/${patientTurnAlert.id}`);
    setPatientTurnAlert(null);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, patientTurnAlert.id]));
    setPatientTurnAlert(null);
  };

  return createPortal(
    <div
      onClick={handleGoToLiveQueue}
      className="fixed top-4 inset-x-3 sm:top-5 sm:right-5 sm:left-auto sm:max-w-md w-auto z-[9999999] cursor-pointer font-sans animate-fade-in"
    >
      <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200/90 hover:border-[#4C5BBD]/40 transition-all group flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Bell className="w-5 h-5 text-emerald-600 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Doctor Admitted
              </span>
              <span className="text-xs font-black text-[#1F1F1F]">
                Token #{patientTurnAlert.token_number}
              </span>
            </div>
            <p className="text-xs text-[#6B6E84] mt-0.5 truncate font-medium">
              {patientTurnAlert.doctor_name || 'Doctor'} • {patientTurnAlert.room_number || 'Room 101'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-[#4C5BBD] hidden sm:inline group-hover:translate-x-0.5 transition-transform">
            View Live Queue
          </span>
          <div className="w-7 h-7 rounded-full bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1 border-0 cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


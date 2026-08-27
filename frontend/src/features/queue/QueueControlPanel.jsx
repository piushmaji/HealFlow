import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users, PhoneCall, CheckCircle2, PauseCircle, PlayCircle, Radio, Clock, Volume2 } from 'lucide-react';

export const QueueControlPanel = () => {
  const { activeDoctor } = useAuth();
  const { queues, callNextPatient } = useQueue();
  const { showToast } = useToast();
  const [isQueuePaused, setIsQueuePaused] = useState(false);

  const queue = queues[activeDoctor.id] || {
    current_token: `${(activeDoctor.specialty || 'CARD').substring(0, 4).toUpperCase()}-007`,
    serving_patient: 'Regular Patient',
    total_in_queue: 5,
    status: 'ACTIVE',
  };

  const handleNext = () => {
    callNextPatient(activeDoctor.id);
    showToast(`Token Called! Patient notified for ${activeDoctor.room_number || 'Room 302'}.`, 'success');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-0 shadow-xs space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F1F1F] font-heading">
              Live OPD Patient Caller System
            </h3>
            <p className="text-xs text-[#6B6E84] font-medium">
              Broadcast token announcements and manage patient queue sequence
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsQueuePaused(!isQueuePaused)}
          style={{ outline: 'none' }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border-0 shadow-xs ${
            isQueuePaused
              ? 'bg-amber-50 text-amber-800'
              : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          {isQueuePaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
          <span>{isQueuePaused ? 'Resume Queue' : 'Pause Queue'}</span>
        </button>
      </div>

      {/* 3 Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Token Currently Serving */}
        <div className="bg-[#F8FAFE] p-5 rounded-2xl border-0 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6E84]">Now Serving Token</span>
          <p className="text-4xl font-black font-sans text-[#4C5BBD] tracking-wider my-1">
            {queue.current_token}
          </p>
          <p className="text-xs text-[#1F1F1F] font-bold">Room: {activeDoctor.room_number || 'Room 302'}</p>
        </div>

        {/* Patients Waiting */}
        <div className="bg-[#F8FAFE] p-5 rounded-2xl border-0 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6E84]">Patients Waiting</span>
          <p className="text-4xl font-black text-[#1F1F1F] font-sans my-1">{queue.total_in_queue}</p>
          <p className="text-xs text-[#6B6E84] font-medium">Est. avg ~12 mins / visit</p>
        </div>

        {/* Next Expected Token */}
        <div className="bg-[#F8FAFE] p-5 rounded-2xl border-0 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6E84]">Next Up Token</span>
          <p className="text-2xl font-black font-sans text-[#161B33] tracking-wide my-2">
            {(() => {
              const parts = (queue.current_token || 'CARD-007').split('-');
              const nextNum = parseInt(parts[1] || '7', 10) + 1;
              return `${parts[0]}-${String(nextNum).padStart(3, '0')}`;
            })()}
          </p>
          <span className="text-xs text-emerald-600 font-bold">Ready outside Room</span>
        </div>

      </div>

      {/* Primary Call Action Control */}
      <div>
        <button
          type="button"
          disabled={isQueuePaused || queue.total_in_queue === 0}
          onClick={handleNext}
          style={{ outline: 'none' }}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-sm font-black shadow-xs transition-all border-0 disabled:opacity-50"
        >
          <PhoneCall className="w-4.5 h-4.5" />
          <span>Call Next Patient Token</span>
        </button>
      </div>

    </div>
  );
};

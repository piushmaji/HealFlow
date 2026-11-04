import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';

export const EmergencyAlert = ({ message, emergencyContact = '112' }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 text-rose-900 shadow-sm animate-bounce-short">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-rose-700">Critical Medical Alert</h4>
          <p className="text-xs font-bold text-rose-950">Immediate Emergency Care Required</p>
        </div>
      </div>

      <p className="text-[11px] text-rose-800 leading-relaxed font-medium whitespace-pre-line">
        {message || 'Your symptoms indicate a potentially severe condition. Please do not wait for a routine clinic appointment.'}
      </p>

      <div className="pt-1 flex items-center gap-2">
        <a
          href={`tel:${emergencyContact}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Emergency {emergencyContact}</span>
        </a>
      </div>
    </div>
  );
};


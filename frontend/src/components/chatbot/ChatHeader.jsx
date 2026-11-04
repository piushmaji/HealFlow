import React from 'react';
import { Bot, RefreshCw, X, Sparkles } from 'lucide-react';

export const ChatHeader = ({ onClose, onClear }) => {
  return (
    <div className="bg-[#4C5BBD] text-white p-3.5 px-4 rounded-t-3xl flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-black tracking-wide font-heading">
            Healflow AI Specialist Guide
          </h3>
          <p className="text-[10px] text-white/80 font-medium">
            Clinical Symptom & Doctor Triage
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onClear}
          title="Clear Conversation"
          className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors border-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Close Chat"
          className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors border-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


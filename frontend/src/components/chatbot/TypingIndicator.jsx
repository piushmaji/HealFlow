import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator = () => {
  return (
    <div className="flex gap-2.5 items-center">
      <div className="w-7 h-7 rounded-xl bg-[#F2F5FF] text-[#4C5BBD] border border-[#DCE5F7] flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4C5BBD] animate-bounce"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#4C5BBD] animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#4C5BBD] animate-bounce [animation-delay:0.4s]"></span>
        <span className="text-[11px] text-[#6B6E84] font-medium ml-1">Analyzing symptoms & doctors...</span>
      </div>
    </div>
  );
};


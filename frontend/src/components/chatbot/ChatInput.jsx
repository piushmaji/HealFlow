import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder="Describe symptoms in English, Hindi, or Hinglish..."
        className="flex-1 bg-[#F8FAFE] border border-slate-200/80 focus:border-[#4C5BBD] focus:bg-white rounded-full px-4 py-2.5 text-xs text-[#1F1F1F] font-medium outline-none transition-all placeholder-[#A8B1CE]"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="w-9 h-9 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs border-0 cursor-pointer shrink-0"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};


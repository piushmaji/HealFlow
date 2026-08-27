import React from 'react';
import { Ticket } from 'lucide-react';

export const TokenBadge = ({ tokenNumber, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-bold',
    lg: 'px-4 py-2 text-lg font-extrabold',
    xl: 'px-6 py-3 text-3xl font-black tracking-wider',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 bg-[#4C5BBD] text-white rounded-xl border-0 shadow-md font-sans ${sizes[size]} ${className}`}
    >
      <Ticket className="shrink-0" />
      <span>{tokenNumber}</span>
    </div>
  );
};

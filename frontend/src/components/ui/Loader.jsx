import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-slate-500 ${className}`}>
      <Loader2 className={`animate-spin text-brand-600 ${sizes[size]}`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
};

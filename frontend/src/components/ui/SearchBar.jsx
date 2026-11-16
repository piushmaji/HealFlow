import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by doctor name, specialty, or clinic...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-4 w-4 h-4 text-[#64748B] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ outline: 'none', boxShadow: 'none' }}
        className="w-full bg-white border-2 border-slate-200/90 focus:border-[#4C5BBD] rounded-full pl-11 pr-11 py-3 text-xs text-[#1F1F1F] placeholder-[#64748B] shadow-sm outline-none focus:outline-none focus:ring-0 transition-all font-semibold"
      />
      {value && (
        <button
          onClick={onClear}
          style={{ outline: 'none', boxShadow: 'none' }}
          className="absolute right-3.5 text-[#A8B1CE] hover:text-[#1F1F1F] p-1 rounded-full hover:bg-[#F2F5FF] outline-none focus:outline-none focus:ring-0"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

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
      <Search className="absolute left-4 w-4 h-4 text-[#A8B1CE] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ outline: 'none', boxShadow: 'none' }}
        className="w-full bg-white border-0 rounded-full pl-11 pr-11 py-3 text-xs text-[#1F1F1F] placeholder-[#A8B1CE] shadow-xs outline-none focus:outline-none focus:ring-0 focus:border-0 transition-all font-medium"
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

import React from 'react';

export const SegmentedControl = ({
  options = [
    { label: 'Chats', value: 'chats' },
    { label: 'Calls', value: 'calls' },
  ],
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center p-1 bg-[#F2F5FF] border border-[#CEDEFF] rounded-full shadow-inner font-poppins ${className}`}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange && onChange(option.value)}
            className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
              isSelected
                ? 'bg-[#5B81FA] text-white shadow-material-1 scale-100'
                : 'text-[#6B6E84] hover:text-[#1F1F1F] bg-transparent'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

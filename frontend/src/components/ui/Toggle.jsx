import React from 'react';

export const Toggle = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: { track: 'w-8 h-4.5 p-0.5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-3.5' },
    md: { track: 'w-11 h-6 p-1', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7.5 p-1', thumb: 'w-5.5 h-5.5', translate: 'translate-x-6.5' },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={`relative inline-flex shrink-0 ${currentSize.track} rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B81FA] focus:ring-offset-2 ${
          checked ? 'bg-[#5B81FA]' : 'bg-[#A8B1CE]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block ${currentSize.thumb} transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? currentSize.translate : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-xs font-semibold text-[#1F1F1F] font-poppins">{label}</span>}
    </label>
  );
};

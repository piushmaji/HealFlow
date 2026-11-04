import React from 'react';

export const Select = ({
  label,
  options = [],
  error,
  helperText,
  icon: Icon,
  pill = false,
  className = '',
  id,
  required = false,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const roundedClass = pill ? 'rounded-full' : 'rounded-2xl';

  return (
    <div className="w-full flex flex-col gap-1.5 font-poppins">
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold text-[#1F1F1F] tracking-wide uppercase">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-[#5B81FA] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          id={selectId}
          className={`w-full bg-[#F8FAFE] focus:bg-white border-0 ${roundedClass} ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3 text-xs sm:text-sm font-bold text-[#1F1F1F] shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#4C5BBD]/25 disabled:bg-[#F2F5FF] disabled:text-[#A8B1CE] appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value ?? opt.id ?? opt} value={opt.value ?? opt.id ?? opt}>
              {opt.label ?? opt.name ?? opt}
            </option>
          ))}
        </select>
        <div className="absolute right-4 pointer-events-none text-[#5B81FA]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-rose-500 font-medium mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#6B6E84] mt-0.5">{helperText}</p>}
    </div>
  );
};

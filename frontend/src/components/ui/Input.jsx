import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  actionIcon: ActionIcon,
  onActionClick,
  pill = false,
  type = 'text',
  className = '',
  id,
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const roundedClass = pill ? 'rounded-full' : 'rounded-2xl';

  return (
    <div className="w-full flex flex-col gap-1.5 font-poppins">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-[#1F1F1F] tracking-wide uppercase">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-[#5B81FA] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full bg-white border ${
            error
              ? 'border-rose-400 focus:ring-rose-400'
              : 'border-[#CEDEFF] focus:border-[#5B81FA] focus:ring-[#5B81FA]/20'
          } ${roundedClass} ${Icon ? 'pl-11' : 'pl-4'} ${
            ActionIcon ? 'pr-12' : 'pr-4'
          } py-3 text-sm text-[#1F1F1F] placeholder-[#A8B1CE] shadow-sm transition-all focus:outline-none focus:ring-4 disabled:bg-[#F2F5FF] disabled:text-[#A8B1CE] ${className}`}
          {...props}
        />
        {ActionIcon && (
          <button
            type="button"
            onClick={onActionClick}
            className="absolute right-2.5 p-1.5 rounded-full bg-[#5B81FA] text-white hover:bg-[#486de8] transition-colors focus:outline-none"
          >
            <ActionIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 font-medium mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#6B6E84] mt-0.5">{helperText}</p>}
    </div>
  );
};

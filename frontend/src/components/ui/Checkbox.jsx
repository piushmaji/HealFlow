import React from 'react';
import { Check } from 'lucide-react';

/**
 * HealFlow Themed Checkbox Component (Border-free, soft shadow depth)
 * Matches the design library screenshot: rounded square with blue fill and white checkmark
 */
export const Checkbox = ({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className = '',
  name,
  value,
}) => {
  const checkboxId = id || (name ? `${name}-${value}` : `checkbox-${Math.random().toString(36).substring(2, 9)}`);

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          if (!disabled && onChange) {
            onChange(e.target.checked);
          }
        }}
        className="sr-only"
      />

      <div
        onClick={handleToggle}
        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 border-0 ${
          checked
            ? 'bg-[#4C5BBD] text-white shadow-md shadow-[#4C5BBD]/25 scale-100'
            : 'bg-[#F2F5FF] text-transparent hover:bg-[#E5ECFF] shadow-xs'
        }`}
      >
        <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} />
      </div>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && (
            <span className={`text-xs font-bold font-sans transition-colors ${checked ? 'text-[#1F1F1F]' : 'text-[#4A4D65] group-hover:text-[#1F1F1F]'}`}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-[#6B6E84] font-medium leading-tight">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};


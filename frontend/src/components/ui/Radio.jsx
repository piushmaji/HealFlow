import React from 'react';

/**
 * HealFlow Themed Radio Button & RadioGroup Component (Border-free, soft shadow depth)
 * Matches the design library screenshot: circular indicator with blue filled center on white/tinted pill
 */
export const Radio = ({
  checked = false,
  onChange,
  label,
  description,
  name,
  value,
  disabled = false,
  id,
  className = '',
}) => {
  const radioId = id || (name ? `${name}-${value}` : `radio-${Math.random().toString(36).substring(2, 9)}`);

  return (
    <label
      htmlFor={radioId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        type="radio"
        id={radioId}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          if (!disabled && onChange) {
            onChange(value !== undefined ? value : e.target.checked);
          }
        }}
        className="sr-only"
      />

      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 border-0 ${
          checked
            ? 'bg-[#4C5BBD] shadow-md shadow-[#4C5BBD]/25'
            : 'bg-[#F2F5FF] hover:bg-[#E5ECFF] shadow-xs'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'scale-100' : 'scale-0'
          }`}
        />
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

export const RadioGroup = ({
  name,
  value,
  onChange,
  options = [],
  direction = 'horizontal', // 'horizontal' | 'vertical'
  className = '',
}) => {
  return (
    <div
      role="radiogroup"
      className={`flex ${direction === 'horizontal' ? 'flex-row flex-wrap gap-4 items-center' : 'flex-col gap-2.5'} ${className}`}
    >
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const optDesc = typeof opt === 'object' ? opt.description : null;
        const isSelected = value === optValue;

        return (
          <Radio
            key={String(optValue)}
            name={name}
            value={optValue}
            checked={isSelected}
            onChange={() => onChange && onChange(optValue)}
            label={optLabel}
            description={optDesc}
          />
        );
      })}
    </div>
  );
};


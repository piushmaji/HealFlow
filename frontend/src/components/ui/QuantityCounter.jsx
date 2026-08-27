import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const QuantityCounter = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  className = '',
}) => {
  const handleDecrement = () => {
    if (value > min && onChange) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && onChange) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 p-1 bg-[#F2F5FF] border border-[#CEDEFF] rounded-full font-poppins ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-6 h-6 rounded-full bg-white text-[#5B81FA] border border-[#CEDEFF] flex items-center justify-center hover:bg-[#CEDEFF] disabled:opacity-40 transition-colors shadow-sm"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3 stroke-[3]" />
      </button>
      <span className="text-xs font-extrabold text-[#1F1F1F] w-4 text-center select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-6 h-6 rounded-full bg-[#5B81FA] text-white flex items-center justify-center hover:bg-[#486de8] disabled:opacity-40 transition-colors shadow-sm"
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3 stroke-[3]" />
      </button>
    </div>
  );
};

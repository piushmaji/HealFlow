import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

/**
 * HealFlow Themed Single-Card Calendar DatePicker
 * Features:
 * - Direct Month & Year selection dropdowns (1920 to current year)
 * - Outside click listener to auto-close
 * - Elevation depth, zero border, active token highlight
 */
export const CalendarPickerCard = ({
  selectedDate = null,
  onDateSelect,
  className = '',
  maxDate = new Date().toISOString().split('T')[0], // For birth dates, max is today
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date(2000, 0, 1);
  });

  const [mode, setMode] = useState('days'); // 'days' | 'months' | 'years'
  const yearsListRef = useRef(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Scroll to active year when year selector opens
  useEffect(() => {
    if (mode === 'years' && yearsListRef.current) {
      const activeEl = yearsListRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [mode]);

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Convert Sunday (0) to Monday-based index (0: Mo, 6: Su)
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return false;
    const selYear = parseInt(parts[0], 10);
    const selMonth = parseInt(parts[1], 10) - 1;
    const selDay = parseInt(parts[2], 10);

    return selYear === year && selMonth === month && selDay === day;
  };

  const handleDayClick = (day) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const isoDate = `${year}-${formattedMonth}-${formattedDay}`;

    if (onDateSelect) {
      onDateSelect(isoDate);
    }
  };

  // Year range from 1920 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1920; y--) {
    years.push(y);
  }

  return (
    <div
      className={`bg-white rounded-3xl p-5 shadow-2xl border border-slate-200/80 w-[310px] select-none font-sans space-y-4 backdrop-blur-sm ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Header with Month & Year Interactive Selectors */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5">
          {/* Month Toggle Button */}
          <button
            type="button"
            onClick={() => setMode(mode === 'months' ? 'days' : 'months')}
            style={{ outline: 'none' }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
              mode === 'months'
                ? 'bg-[#4C5BBD] text-white border-[#4C5BBD] shadow-xs'
                : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] text-[#1F1F1F] border-slate-200/70 hover:border-[#4C5BBD]/40'
            }`}
          >
            <span>{monthNames[month]}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Year Toggle Button */}
          <button
            type="button"
            onClick={() => setMode(mode === 'years' ? 'days' : 'years')}
            style={{ outline: 'none' }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
              mode === 'years'
                ? 'bg-[#4C5BBD] text-white border-[#4C5BBD] shadow-xs'
                : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] text-[#1F1F1F] border-slate-200/70 hover:border-[#4C5BBD]/40'
            }`}
          >
            <span>{year}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
        </div>

        {/* Prev / Next Arrows */}
        {mode === 'days' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              style={{ outline: 'none' }}
              className="p-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F2F5FF] text-[#6B6E84] hover:text-[#4C5BBD] border border-slate-200/70 hover:border-[#4C5BBD]/40 transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              style={{ outline: 'none' }}
              className="p-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F2F5FF] text-[#6B6E84] hover:text-[#4C5BBD] border border-slate-200/70 hover:border-[#4C5BBD]/40 transition-all cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Mode Views */}
      {mode === 'months' && (
        <div className="grid grid-cols-3 gap-2 py-2">
          {monthNames.map((mName, idx) => {
            const isCurr = idx === month;
            return (
              <button
                key={mName}
                type="button"
                onClick={() => {
                  setCurrentDate(new Date(year, idx, 1));
                  setMode('days');
                }}
                style={{ outline: 'none' }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isCurr
                    ? 'bg-[#4C5BBD] text-white border-[#4C5BBD] shadow-xs'
                    : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] text-[#1F1F1F] border-slate-200/60 hover:border-[#4C5BBD]/30'
                }`}
              >
                {mName.slice(0, 3)}
              </button>
            );
          })}
        </div>
      )}

      {mode === 'years' && (
        <div
          ref={yearsListRef}
          className="grid grid-cols-3 gap-2 py-2 max-h-56 overflow-y-auto no-scrollbar pr-1"
        >
          {years.map((y) => {
            const isCurr = y === year;
            return (
              <button
                key={y}
                data-selected={isCurr ? 'true' : 'false'}
                type="button"
                onClick={() => {
                  setCurrentDate(new Date(y, month, 1));
                  setMode('days');
                }}
                style={{ outline: 'none' }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isCurr
                    ? 'bg-[#4C5BBD] text-white border-[#4C5BBD] shadow-xs'
                    : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] text-[#1F1F1F] border-slate-200/60 hover:border-[#4C5BBD]/30'
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {mode === 'days' && (
        <>
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[10px] font-black text-[#6B6E84] py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
            {/* Previous Month Padding */}
            {Array.from({ length: adjustedFirstDay }).map((_, index) => {
              const day = daysInPrevMonth - adjustedFirstDay + index + 1;
              return (
                <div key={`prev-${index}`} className="flex items-center justify-center py-1.5">
                  <span className="text-[#A8B1CE] text-xs font-medium opacity-40">{day}</span>
                </div>
              );
            })}

            {/* Current Month Active Days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, index) => {
              const day = index + 1;
              const active = isSelected(day);

              return (
                <div key={`curr-${day}`} className="flex items-center justify-center py-1">
                  <button
                    type="button"
                    onClick={() => handleDayClick(day)}
                    style={{ outline: 'none' }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all border-0 cursor-pointer ${
                      active
                        ? 'bg-[#4C5BBD] text-white shadow-md shadow-[#4C5BBD]/30 scale-105'
                        : 'text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#4C5BBD]'
                    }`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Fast Quick-Select Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            setCurrentDate(today);
            handleDayClick(today.getDate());
          }}
          style={{ outline: 'none' }}
          className="text-[#4C5BBD] hover:underline font-bold border-0 bg-transparent cursor-pointer"
        >
          Set Today
        </button>

        <button
          type="button"
          onClick={() => {
            const def = new Date(2000, 0, 1);
            setCurrentDate(def);
            handleDayClick(1);
          }}
          style={{ outline: 'none' }}
          className="text-[#6B6E84] hover:text-[#1F1F1F] font-bold border-0 bg-transparent cursor-pointer"
        >
          Default (2000)
        </button>
      </div>
    </div>
  );
};

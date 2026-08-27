import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

export const DatePicker = ({ selectedDate, onChange, label = 'Select Preferred Date' }) => {
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const initial = selectedDate ? new Date(selectedDate) : new Date();
    return isNaN(initial.getTime()) ? new Date() : initial;
  });

  // Generate next 5 fast-select consultation days starting today
  const generateUpcomingDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoString = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
      const formattedDisplay = `${d.getDate()} ${d.toLocaleDateString('en-IN', { month: 'short' })}`;
      days.push({
        iso: isoString,
        dayName,
        display: formattedDisplay,
      });
    }
    return days;
  };

  const upcomingDays = generateUpcomingDays();
  const isCustomSelected = !upcomingDays.some((d) => d.iso === selectedDate);

  // Month Calendar Navigation helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate days matrix for current month view
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const todayIso = new Date().toISOString().split('T')[0];

  const handleDaySelect = (dayNum) => {
    const selectedMonth = String(currentMonth + 1).padStart(2, '0');
    const selectedDayStr = String(dayNum).padStart(2, '0');
    const targetIso = `${currentYear}-${selectedMonth}-${selectedDayStr}`;
    onChange(targetIso);
    setShowCustomCalendar(false);
  };

  return (
    <div className="space-y-2.5 font-sans w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#4C5BBD]" />
            <span>{label}</span>
          </label>
          <span className="text-[10px] font-black text-[#4C5BBD] bg-[#F2F5FF] px-2.5 py-0.5 rounded-full">
            Selected: {selectedDate}
          </span>
        </div>
      )}

      {/* Non-Scrollable Single Line Grid (5 Fast Days + 1 Custom Date Button) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
        {upcomingDays.map((day) => {
          const isSelected = selectedDate === day.iso;
          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => onChange(day.iso)}
              style={{ outline: 'none', boxShadow: 'none' }}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl text-xs font-bold transition-all border-0 shadow-xs w-full ${
                isSelected
                  ? 'bg-[#4C5BBD] text-white font-black shadow-xs'
                  : 'bg-[#F8FAFE] text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#4C5BBD]'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider truncate ${isSelected ? 'text-white/80' : 'text-[#6B6E84]'}`}>
                {day.dayName}
              </span>
              <span className="text-xs font-black font-sans mt-0.5 truncate">
                {day.display}
              </span>
            </button>
          );
        })}

        {/* 6th Pill: Custom Calendar Trigger Button */}
        <button
          type="button"
          onClick={() => setShowCustomCalendar(true)}
          style={{ outline: 'none', boxShadow: 'none' }}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl text-xs font-bold transition-all border-0 shadow-xs w-full ${
            isCustomSelected
              ? 'bg-[#4C5BBD] text-white font-black shadow-xs'
              : 'bg-[#F8FAFE] text-[#4C5BBD] hover:bg-[#F2F5FF]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 truncate">
            Custom
          </span>
          <span className="text-xs font-black flex items-center gap-1 mt-0.5 truncate">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Date</span>
          </span>
        </button>
      </div>

      {/* Breathtaking Themed Custom Month Calendar Modal Overlay */}
      {showCustomCalendar && (
        <>
          <div
            onClick={() => setShowCustomCalendar(false)}
            className="fixed inset-0 z-50 bg-black/60"
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border-0 w-full max-w-sm space-y-5 animate-fade-in font-sans">
              
              {/* Header with Month Nav & Close */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#4C5BBD]" />
                  <h3 className="text-sm font-black text-[#1F1F1F] font-heading">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    style={{ outline: 'none' }}
                    className="p-1.5 rounded-full text-[#6B6E84] hover:bg-[#F2F5FF] hover:text-[#4C5BBD] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    style={{ outline: 'none' }}
                    className="p-1.5 rounded-full text-[#6B6E84] hover:bg-[#F2F5FF] hover:text-[#4C5BBD] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCustomCalendar(false)}
                    style={{ outline: 'none' }}
                    className="p-1.5 rounded-full text-[#6B6E84] hover:bg-slate-100 transition-colors ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase tracking-wider text-[#6B6E84]">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {/* Empty cells before month start day */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9"></div>
                ))}

                {/* Day numbers */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const monthStr = String(currentMonth + 1).padStart(2, '0');
                  const dayStr = String(dayNum).padStart(2, '0');
                  const targetIso = `${currentYear}-${monthStr}-${dayStr}`;
                  const isSelected = selectedDate === targetIso;
                  const isPast = targetIso < todayIso;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleDaySelect(dayNum)}
                      style={{ outline: 'none' }}
                      className={`h-9 w-9 mx-auto rounded-full font-bold flex items-center justify-center transition-all border-0 ${
                        isPast
                          ? 'text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#4C5BBD] text-white font-black shadow-xs scale-105'
                          : 'text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#4C5BBD]'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Footer Note */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#6B6E84]">
                <span>Selected: <strong className="text-[#4C5BBD] font-black">{selectedDate}</strong></span>
                <button
                  type="button"
                  onClick={() => handleDaySelect(new Date().getDate())}
                  className="text-[#4C5BBD] font-bold hover:underline"
                >
                  Select Today
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

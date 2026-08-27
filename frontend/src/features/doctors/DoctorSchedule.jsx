import React from 'react';
import { Clock, Check } from 'lucide-react';
import { TIME_SLOTS } from '../../utils/constants';

export const DoctorSchedule = ({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  availableSlots = TIME_SLOTS,
}) => {
  // Generate next 5 available calendar days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({ iso, dayName, dayNum, monthName, isToday: i === 0 });
    }
    return days;
  };

  const dates = getNextDays();

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Appointment Date
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {dates.map((d) => {
            const isSelected = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => onSelectDate(d.iso)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm scale-105 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-[10px] uppercase opacity-80">{d.dayName}</p>
                <p className="text-base font-extrabold my-0.5">{d.dayNum}</p>
                <p className="text-[10px] uppercase opacity-80">{d.monthName}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slot picker */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Select Available Slot</span>
          <span className="text-[11px] text-brand-600 font-normal">Live Slots Updated</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableSlots.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-50 text-brand-700 border-brand-400 ring-2 ring-brand-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{slot}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

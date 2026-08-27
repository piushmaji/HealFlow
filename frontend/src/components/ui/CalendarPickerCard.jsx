import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from './Card';

export const CalendarPickerCard = ({
  onDateSelect,
  className = '',
}) => {
  const [selectedDay, setSelectedDay] = useState(15);
  const [month, setMonth] = useState('July 2026');

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const calendarDays = [
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
  ];

  const handleSelect = (dayObj) => {
    if (dayObj.isCurrentMonth) {
      setSelectedDay(dayObj.day);
      if (onDateSelect) onDateSelect(dayObj.day);
    }
  };

  return (
    <Card className={`p-4 bg-white border-[#CEDEFF] shadow-card font-poppins max-w-sm ${className}`}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <button
          type="button"
          className="p-1 rounded-full text-[#6B6E84] hover:bg-[#F2F5FF] hover:text-[#5B81FA] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 font-bold text-xs text-[#1F1F1F]">
          <CalendarIcon className="w-3.5 h-3.5 text-[#5B81FA]" />
          <span>{month}</span>
        </div>

        <button
          type="button"
          className="p-1 rounded-full text-[#6B6E84] hover:bg-[#F2F5FF] hover:text-[#5B81FA] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((day) => (
          <span key={day} className="text-[10px] font-bold text-[#6B6E84] uppercase">
            {day}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, idx) => {
          const isSelected = item.isCurrentMonth && item.day === selectedDay;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-semibold transition-all ${
                !item.isCurrentMonth
                  ? 'text-slate-300 pointer-events-none'
                  : isSelected
                  ? 'bg-[#5B81FA] text-white font-extrabold shadow-material-1 scale-105'
                  : 'text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#5B81FA]'
              }`}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

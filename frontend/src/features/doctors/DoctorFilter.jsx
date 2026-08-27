import React from 'react';
import { SPECIALTIES } from '../../utils/constants';
import { Stethoscope, Heart, Sparkles, Baby, Brain, Bone, Activity, Smile, Ear } from 'lucide-react';

const ICON_MAP = {
  Stethoscope,
  Heart,
  Sparkles,
  Baby,
  Brain,
  Bone,
  Activity,
  Smile,
  Ear,
};

export const DoctorFilter = ({ selectedSpecialty, onSelectSpecialty }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-1.5 py-1.5 no-scrollbar">
      {SPECIALTIES.map((spec) => {
        const IconComponent = ICON_MAP[spec.icon] || Stethoscope;
        const isSelected = selectedSpecialty === spec.id;

        return (
          <button
            key={spec.id}
            onClick={() => onSelectSpecialty(spec.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border-0 shrink-0 shadow-xs outline-none focus:outline-none focus:ring-0 select-none ${
              isSelected
                ? 'bg-[#4C5BBD] text-white shadow-xs font-extrabold'
                : 'bg-white text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#4C5BBD]'
            }`}
            style={{ outline: 'none', boxShadow: 'none' }}
          >
            <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#4C5BBD]'}`} />
            <span>{spec.name}</span>
          </button>
        );
      })}
    </div>
  );
};

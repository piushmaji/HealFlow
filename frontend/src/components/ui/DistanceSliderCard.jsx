import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Card } from './Card';

export const DistanceSliderCard = ({
  initialDistance = 8,
  onDistanceChange,
  className = '',
}) => {
  const [distance, setDistance] = useState(initialDistance);

  const handleChange = (e) => {
    const val = Number(e.target.value);
    setDistance(val);
    if (onDistanceChange) onDistanceChange(val);
  };

  return (
    <Card className={`p-4 bg-white border-[#CEDEFF] shadow-card font-poppins ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#1F1F1F]">Distance from you</span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#F2F5FF] text-[#5B81FA] border border-[#CEDEFF] text-xs font-extrabold">
          {distance} km
        </span>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#F2F5FF] text-[#5B81FA] border border-[#CEDEFF] flex items-center justify-center shrink-0">
          <MapPin className="w-3.5 h-3.5" />
        </div>

        <div className="relative flex-grow flex items-center">
          <input
            type="range"
            min="1"
            max="30"
            value={distance}
            onChange={handleChange}
            className="w-full h-2 bg-[#F2F5FF] rounded-lg appearance-none cursor-pointer accent-[#5B81FA] border border-[#CEDEFF]"
          />
        </div>

        <div className="w-7 h-7 rounded-full bg-[#5B81FA] text-white flex items-center justify-center shrink-0 shadow-sm">
          <Navigation className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex justify-between items-center text-[10px] text-[#6B6E84] font-medium mt-2 px-10">
        <span>1 km</span>
        <span>15 km</span>
        <span>30 km</span>
      </div>
    </Card>
  );
};

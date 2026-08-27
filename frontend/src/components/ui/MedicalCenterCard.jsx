import React from 'react';
import { Star, MapPin, CheckCircle2, PhoneCall } from 'lucide-react';
import { Card } from './Card';

export const MedicalCenterCard = ({
  name = 'Smart Medical Center',
  rating = 5,
  distance = '2.5 km',
  location = '124 Healthcare Avenue',
  imageUrl = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&auto=format&fit=crop&q=80',
  isVerified = true,
  className = '',
}) => {
  return (
    <Card className={`p-4 bg-white border-[#CEDEFF] shadow-card font-poppins max-w-sm ${className}`}>
      <div className="relative mb-3 overflow-hidden rounded-2xl">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
        />
        {isVerified && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#5B81FA] text-[10px] font-bold flex items-center gap-1 shadow-sm border border-[#CEDEFF]">
            <CheckCircle2 className="w-3 h-3 text-[#5B81FA]" />
            Verified
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#1F1F1F] font-heading">{name}</h4>
          <div className="flex items-center gap-0.5 text-amber-400">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400" />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#6B6E84]">
          <MapPin className="w-3.5 h-3.5 text-[#5B81FA]" />
          <span>{distance} from your location</span>
        </div>
      </div>
    </Card>
  );
};

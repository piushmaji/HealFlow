import React from 'react';
import { Star, ShieldCheck, Heart } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export const DoctorCard = ({
  name = 'Dr. Sarah Jenkins',
  specialty = 'Heart Surgeon',
  rating = '4.8',
  reviewsCount = '120+',
  avatarUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  onPrescriptionClick,
  onBookClick,
  className = '',
}) => {
  return (
    <Card className={`p-5 bg-white border-[#CEDEFF] shadow-card font-poppins relative overflow-hidden group hover:border-[#5B81FA] transition-all ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#CEDEFF]"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F2F5FF] text-[#5B81FA] border border-[#CEDEFF]">
                {specialty}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B81FA]" />
            </div>
            <h4 className="text-sm font-bold text-[#1F1F1F] mt-1 group-hover:text-[#5B81FA] transition-colors font-heading">
              {name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-[#6B6E84]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#1F1F1F]">{rating}</span>
              <span>({reviewsCount})</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="p-2 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          aria-label="Add to favorites"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Button
          variant="primary"
          size="sm"
          pill
          fullWidth
          onClick={onPrescriptionClick}
          className="py-2 text-xs font-bold shadow-material-1"
        >
          Prescription
        </Button>
        <Button
          variant="outline"
          size="sm"
          pill
          fullWidth
          onClick={onBookClick}
          className="py-2 text-xs font-bold"
        >
          Book Slot
        </Button>
      </div>
    </Card>
  );
};

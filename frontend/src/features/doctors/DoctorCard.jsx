import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { formatCurrency } from '../../utils/formatters';

export const DoctorCard = ({ doctor, onBookClick, onViewDetails }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(doctor);
    } else {
      navigate(`/doctors/${doctor.id}`);
    }
  };

  const handleBookSlotClick = (e) => {
    e.stopPropagation();
    navigate(`/doctors/${doctor.id}/book`);
  };

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full group border-0 shadow-xs">
      <div>
        {/* Header with Avatar & Specialty */}
        <div
          onClick={handleCardClick}
          className="flex items-start gap-4 mb-4 cursor-pointer"
        >
          <Avatar
            src={doctor.avatar_url}
            name={doctor.name}
            size="xl"
            className="group-hover:scale-105 transition-transform duration-200 border-0 shadow-xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-[#4C5BBD] bg-[#F2F5FF] border-0 rounded-full mb-1">
              {doctor.specialty}
            </span>
            <h3 className="text-base font-black text-[#1F1F1F] font-heading group-hover:text-[#4C5BBD] transition-colors truncate">
              {doctor.name}
            </h3>
            <p className="text-xs text-[#6B6E84] font-medium truncate">{doctor.title}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-1 text-xs text-[#6B6E84]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#1F1F1F]">{doctor.rating}</span>
              <span className="text-[#6B6E84]/80">({doctor.review_count} reviews)</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p
          onClick={handleCardClick}
          className="text-xs text-[#6B6E84] line-clamp-2 mb-4 leading-relaxed font-medium cursor-pointer hover:text-[#1F1F1F] transition-colors"
        >
          {doctor.bio}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8FAFE] rounded-2xl border-0 text-xs mb-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-[#6B6E84]">
            <MapPin className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
            <span className="truncate font-medium">{doctor.hospital || 'Smart Clinic Central'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#6B6E84]">
            <Clock className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
            <span className="font-medium">{doctor.experience_years}+ Yrs Exp</span>
          </div>
        </div>
      </div>

      {/* Footer with Consultation Fee & Dedicated Booking Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#6B6E84] tracking-wider">Fee</span>
          <p className="text-base font-black text-[#1F1F1F] font-sans">{formatCurrency(doctor.consultation_fee)}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCardClick}
            style={{ outline: 'none' }}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-[#4C5BBD] hover:bg-[#F2F5FF] transition-all border-0 shadow-xs"
          >
            Profile
          </button>

          <button
            type="button"
            onClick={handleBookSlotClick}
            style={{ outline: 'none' }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4C5BBD] text-white text-xs font-black shadow-xs hover:bg-[#3B489E] transition-all border-0"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Slot</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

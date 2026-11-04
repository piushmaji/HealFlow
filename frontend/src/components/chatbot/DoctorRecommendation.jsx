import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, ArrowRight, Stethoscope } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const DoctorRecommendation = ({ doctors = [], specialty, specialtyReason }) => {
  const navigate = useNavigate();

  if (!specialty && (!doctors || doctors.length === 0)) return null;

  return (
    <div className="space-y-3 pt-2">
      {specialty && (
        <div className="bg-[#F2F5FF] border border-[#DCE5F7] rounded-2xl p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#4C5BBD]">
            <Stethoscope className="w-4 h-4" />
            <span>Recommended Specialty: {specialty}</span>
          </div>
          {specialtyReason && (
            <p className="text-[11px] text-[#6B6E84] leading-relaxed">
              {specialtyReason}
            </p>
          )}
        </div>
      )}

      {doctors && doctors.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6E84]">
            Available Verified Specialists on HealFlow:
          </p>

          <div className="space-y-2">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200/80 hover:border-[#4C5BBD] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                    alt={doc.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <h5 className="text-xs font-bold text-[#1F1F1F] truncate">{doc.name}</h5>
                    <p className="text-[10px] text-[#6B6E84] truncate">
                      {doc.hospital} • {doc.room_number || 'Room 101'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {doc.rating || 4.9}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-[#4C5BBD]">
                        {formatCurrency(doc.consultation_fee || 500)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(doc.booking_url || `/doctors/${doc.id}/book`)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-[11px] font-bold transition-all shadow-xs border-0 cursor-pointer"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Book</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


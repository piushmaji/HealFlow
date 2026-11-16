import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, ArrowRight, Stethoscope, User, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const DoctorRecommendation = ({ doctors = [], specialty, specialtyReason }) => {
  const navigate = useNavigate();
  const [expandedDocId, setExpandedDocId] = useState(null);

  if (!specialty && (!doctors || doctors.length === 0)) return null;

  const toggleBio = (docId, e) => {
    e.stopPropagation();
    setExpandedDocId((prev) => (prev === docId ? null : docId));
  };

  const handleCardClick = (doc) => {
    navigate(doc.profile_url || `/doctors/${doc.id}`);
  };

  const handleBookClick = (doc, e) => {
    e.stopPropagation();
    navigate(doc.booking_url || `/doctors/${doc.id}/book`);
  };

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
            {doctors.map((doc) => {
              const isExpanded = expandedDocId === doc.id;
              return (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200/90 hover:border-[#4C5BBD]/70 rounded-2xl p-3 shadow-xs transition-all space-y-2.5"
                >
                  {/* Top Doctor Row (Clicking card opens Doctor Profile) */}
                  <div
                    onClick={() => handleCardClick(doc)}
                    className="flex items-center justify-between gap-2.5 cursor-pointer group"
                    title="Click to view doctor full profile & bio"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                        alt={doc.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-[#1F1F1F] group-hover:text-[#4C5BBD] transition-colors truncate">
                            {doc.name}
                          </h5>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#4C5BBD] shrink-0 transition-colors" />
                        </div>
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleBookClick(doc, e)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-[11px] font-bold transition-all shadow-xs border-0 cursor-pointer"
                        title="Book Consultation"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Book</span>
                      </button>
                    </div>
                  </div>

                  {/* Doctor Bio Snippet & Profile Link Bar */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <button
                      type="button"
                      onClick={(e) => toggleBio(doc.id, e)}
                      className="text-[#6B6E84] hover:text-[#4C5BBD] font-medium flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Bio' : 'Quick Bio'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCardClick(doc)}
                      className="text-[#4C5BBD] hover:text-[#3B489E] font-bold flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer transition-colors"
                    >
                      <span>View Full Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Collapsible Inline Bio */}
                  {isExpanded && (
                    <div className="bg-[#F8FAFE] rounded-xl p-2.5 text-[11px] text-[#475569] leading-relaxed border border-slate-100 animate-fade-in">
                      <p className="font-medium">
                        {doc.bio || `${doc.title || 'Specialist doctor'} with ${doc.experience_years || 10}+ years of clinical experience at ${doc.hospital || 'HealFlow Center'}.`}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCardClick(doc)}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#4C5BBD] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <User className="w-3 h-3" />
                        <span>Open detailed doctor profile & qualifications →</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


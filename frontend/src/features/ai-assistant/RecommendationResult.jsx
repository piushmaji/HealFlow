import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, RotateCcw, Stethoscope } from 'lucide-react';

export const RecommendationResult = ({ result, onReset }) => {
  const navigate = useNavigate();

  if (!result) return null;

  const handleBrowseDoctors = () => {
    navigate(`/doctors?specialty=${encodeURIComponent(result.specialty)}`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-0 shadow-xs space-y-6 font-sans animate-fade-in">
      
      {/* Top Match Badges */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#F2F5FF] text-[#4C5BBD] shadow-xs">
          <Sparkles className="w-4 h-4 text-[#4C5BBD]" />
          <span>AI Match Score: {result.confidenceScore}</span>
        </span>

        {result.isEmergencyWarning && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Urgent Symptoms Flagged</span>
          </span>
        )}
      </div>

      {/* Suggested Specialist Banner (Deep Indigo Theme) */}
      <div className="bg-[#4C5BBD] text-white rounded-3xl p-6 sm:p-7 shadow-xs space-y-2">
        <span className="text-[10px] uppercase font-black tracking-widest text-[#CEDEFF] font-secondary">
          Recommended Medical Department
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
          {result.specialty}
        </h3>
        <p className="text-xs text-[#CEDEFF] font-semibold font-secondary">{result.title}</p>
      </div>

      {/* Clinical Context Breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-[#1F1F1F] uppercase tracking-wider font-heading">
          Clinical Reasoning
        </h4>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-xs text-[#1F1F1F] leading-relaxed font-secondary">
          {result.explanation}
        </div>
      </div>

      {/* Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-[#F2F5FF] border-0 shadow-xs text-xs text-[#4C5BBD] font-secondary leading-relaxed">
        <p className="font-extrabold text-[#161B33] mb-0.5 uppercase text-[10px]">Medical Note:</p>
        <p className="text-[#6B6E84]">"{result.disclaimer}"</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 font-secondary">
        <button
          type="button"
          onClick={onReset}
          style={{ outline: 'none' }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold hover:bg-slate-200 transition-colors border-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Analyze Another Symptom</span>
        </button>

        <button
          type="button"
          onClick={handleBrowseDoctors}
          style={{ outline: 'none' }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Find {result.specialty} Specialists →</span>
        </button>
      </div>

    </div>
  );
};

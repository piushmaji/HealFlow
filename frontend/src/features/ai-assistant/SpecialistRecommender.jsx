import React, { useState } from 'react';
import { Sparkles, Activity, ShieldCheck, HelpCircle, ArrowRight, Stethoscope } from 'lucide-react';
import { analyzeSymptoms } from '../../services/supabase/aiService';

export const SpecialistRecommender = ({ onRecommendation }) => {
  const [description, setDescription] = useState('');
  const [ageGroup, setAgeGroup] = useState('adult');
  const [duration, setDuration] = useState('few-days');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    const result = await analyzeSymptoms(description, ageGroup, duration);
    setIsLoading(false);
    onRecommendation(result);
  };

  const samplePrompts = [
    'Red itchy skin rash on arm with small bumps',
    'Severe throbbing headache with light sensitivity',
    'Chest pressure during physical exercise',
    'Swollen knee joint with stiffness after walking',
    'Persistent dry cough and fever for 3 days',
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-0 shadow-xs space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center shadow-xs shrink-0">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase text-[#4C5BBD] tracking-wider font-secondary">AI Medical Telemetry</span>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F1F1F] font-heading">
            AI Specialist Matcher
          </h2>
          <p className="text-xs text-[#6B6E84] font-medium font-secondary">
            Describe your health symptoms to identify the right medical department
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Symptom Input Textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider font-secondary">
            Describe Your Symptoms / Medical Concern
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. I have experienced a sharp pain in my lower back for 2 days when sitting down..."
            required
            style={{ outline: 'none', boxShadow: 'none' }}
            className="w-full bg-[#F8FAFE] border-0 rounded-2xl p-4 text-xs font-semibold text-[#1F1F1F] placeholder-[#A8B1CE] focus:bg-white transition-all shadow-xs resize-none font-secondary"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-[#6B6E84] uppercase tracking-wider flex items-center gap-1.5 font-secondary">
            <HelpCircle className="w-3.5 h-3.5 text-[#4C5BBD]" />
            <span>Click a sample symptom prompt:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setDescription(prompt)}
                style={{ outline: 'none' }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold font-secondary bg-[#F2F5FF] text-[#4C5BBD] hover:bg-[#4C5BBD] hover:text-white transition-all shadow-xs border-0 text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 font-secondary">
            <label className="text-xs font-bold text-[#1F1F1F]">Patient Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              style={{ outline: 'none' }}
              className="w-full bg-[#F8FAFE] border-0 rounded-2xl p-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
            >
              <option value="infant">Infant / Child (0 - 12 yrs)</option>
              <option value="adult">Adult (18 - 64 yrs)</option>
              <option value="senior">Senior (65+ yrs)</option>
            </select>
          </div>

          <div className="space-y-1.5 font-secondary">
            <label className="text-xs font-bold text-[#1F1F1F]">Symptom Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ outline: 'none' }}
              className="w-full bg-[#F8FAFE] border-0 rounded-2xl p-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
            >
              <option value="today">Started Today</option>
              <option value="few-days">2 - 7 Days</option>
              <option value="weeks">More than a Week</option>
            </select>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="p-4 bg-[#F2F5FF] rounded-2xl border-0 shadow-xs text-xs text-[#4C5BBD] flex items-start gap-3 font-secondary">
          <ShieldCheck className="w-5 h-5 text-[#4C5BBD] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold uppercase tracking-wider text-[10px] block text-[#161B33]">
              Guidance Only Disclaimer
            </span>
            <p className="text-[11px] leading-relaxed text-[#6B6E84]">
              This AI tool provides specialist category suggestions for guidance only. It does not provide medical diagnoses or replace emergency care.
            </p>
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          style={{ outline: 'none' }}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Analyzing Symptoms...' : 'Analyze Symptoms & Match Specialist'}</span>
        </button>

      </form>
    </div>
  );
};

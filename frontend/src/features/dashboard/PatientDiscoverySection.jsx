import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Stethoscope,
  HeartPulse,
  Bone,
  Brain,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Activity,
  Users,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { getDoctors } from '../../services/supabase/doctorService';

export const PatientDiscoverySection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyCounts, setSpecialtyCounts] = useState({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState('All');
  const searchContainerRef = useRef(null);

  // 1. Fetch real doctor counts per specialty from Supabase DB
  useEffect(() => {
    let isMounted = true;
    getDoctors()
      .then((docs) => {
        if (!isMounted || !Array.isArray(docs)) return;
        const counts = {};
        docs.forEach((doc) => {
          if (doc.specialty) {
            counts[doc.specialty] = (counts[doc.specialty] || 0) + 1;
            if (doc.specialty === 'General Medicine' || doc.specialty === 'General Physician') {
              counts['General Physician'] = (counts['General Physician'] || 0) + 1;
              counts['General Medicine'] = (counts['General Medicine'] || 0) + 1;
            }
          }
        });
        setSpecialtyCounts(counts);
        setIsLoadingCounts(false);
      })
      .catch((err) => {
        console.warn('[PatientDiscoverySection] Specialty count fetch notice:', err.message);
        if (isMounted) setIsLoadingCounts(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time doctor search lookup with rich debounced filtering
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(() => {
      getDoctors({ searchQuery: trimmed })
        .then((res) => {
          setSearchResults(Array.isArray(res) ? res.slice(0, 6) : []);
          setIsSearching(false);
        })
        .catch(() => {
          setSearchResults([]);
          setIsSearching(false);
        });
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleSpecialtyClick = (specialtyQuery) => {
    navigate(`/doctors?specialty=${encodeURIComponent(specialtyQuery)}`);
  };

  const SPECIALTY_CARDS = [
    {
      id: 'General Physician',
      name: 'General Physician',
      searchTarget: 'General Medicine',
      icon: Stethoscope,
      bgVar: 'bg-indigo-50/80',
      textColor: 'text-indigo-700',
      iconColor: 'text-[#4F5FC5]',
      borderHover: 'hover:border-[#4F5FC5]',
      countKey: 'General Physician',
      desc: 'Fever, cough, cold, primary triage',
    },
    {
      id: 'Cardiology',
      name: 'Cardiology',
      searchTarget: 'Cardiology',
      icon: HeartPulse,
      bgVar: 'bg-rose-50/80',
      textColor: 'text-rose-700',
      iconColor: 'text-rose-600',
      borderHover: 'hover:border-rose-400',
      countKey: 'Cardiology',
      desc: 'Chest pain, blood pressure, heart health',
    },
    {
      id: 'Dermatology',
      name: 'Dermatology',
      searchTarget: 'Dermatology',
      icon: Sparkles,
      bgVar: 'bg-amber-50/80',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-600',
      borderHover: 'hover:border-amber-400',
      countKey: 'Dermatology',
      desc: 'Skin rash, acne, eczema, allergies',
    },
    {
      id: 'Neurology',
      name: 'Neurology',
      searchTarget: 'Neurology',
      icon: Brain,
      bgVar: 'bg-purple-50/80',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600',
      borderHover: 'hover:border-purple-400',
      countKey: 'Neurology',
      desc: 'Headaches, migraines, nerve health',
    },
    {
      id: 'Orthopedics',
      name: 'Orthopedics',
      searchTarget: 'Orthopedics',
      icon: Bone,
      bgVar: 'bg-emerald-50/80',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-400',
      countKey: 'Orthopedics',
      desc: 'Joints, bone fractures, knee pain',
    },
    {
      id: 'Pediatrics',
      name: 'Pediatrics',
      searchTarget: 'Pediatrics',
      icon: Users,
      bgVar: 'bg-teal-50/80',
      textColor: 'text-teal-700',
      iconColor: 'text-teal-600',
      borderHover: 'hover:border-teal-400',
      countKey: 'Pediatrics',
      desc: 'Infants, child fever, pediatric care',
    },
  ];

  return (
    <section
      aria-label="Doctor Discovery & OPD Search"
      className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md space-y-6 transition-all duration-300 font-sans relative overflow-visible"
    >
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <h2 className="text-lg sm:text-xl font-black font-heading text-[#1F1F1F] tracking-tight">
              Find Doctors & Medical Specialists
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6E84] font-medium mt-0.5">
            Search top verified physicians across HealFlow clinic and OPD chambers
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/doctors')}
          className="text-xs font-bold text-[#4C5BBD] hover:text-[#3B489E] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer border-0 bg-transparent group"
        >
          <span>View All Doctors</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. PREMIUM HERO SEARCH BAR WITH LIVE SUGGESTIONS */}
      <div ref={searchContainerRef} className="relative w-full">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center bg-[#F8FAFE] rounded-2xl sm:rounded-full border border-slate-200 focus-within:border-[#4C5BBD] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#4C5BBD]/10 transition-all p-1.5 sm:p-2 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-white text-[#4C5BBD] flex items-center justify-center shrink-0 ml-1 shadow-xs border border-slate-100">
              <Search className="w-4 h-4 text-[#4C5BBD]" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by doctor name, specialty (e.g. Cardiology, Dermatology), hospital, or symptom..."
              className="w-full bg-transparent border-0 outline-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#1F1F1F] placeholder-slate-400"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors border-0 cursor-pointer mr-1"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] active:scale-95 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer shrink-0 hidden sm:flex items-center gap-1.5"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Live Search Suggestions Dropdown */}
        {showDropdown && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden animate-fade-in text-xs font-sans">
            {isSearching ? (
              <div className="p-4 text-center text-slate-400 font-medium flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#4C5BBD] border-t-transparent rounded-full animate-spin" />
                <span>Searching verified doctors...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="px-4 py-2 bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Verified Doctor Results
                </div>
                {searchResults.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      navigate(`/doctors/${doc.id}`);
                      setShowDropdown(false);
                    }}
                    className="p-3.5 hover:bg-[#F2F5FF] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          doc.avatar_url ||
                          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={doc.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#1F1F1F] text-xs truncate">{doc.name}</p>
                          <span className="text-[10px] font-black px-2 py-0.2 rounded-md bg-[#EEF2FF] text-[#4C5BBD]">
                            {doc.specialty}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B6E84] truncate mt-0.5 flex items-center gap-1.5">
                          <span>{doc.hospital || 'HealFlow Clinic'}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">₹{doc.consultation_fee || 500} OPD</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[#4C5BBD] font-bold text-xs shrink-0">
                      <span>Book</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}

                <div
                  onClick={handleSearchSubmit}
                  className="p-3 bg-[#F8FAFE] text-center font-bold text-xs text-[#4C5BBD] hover:bg-[#EEF2FF] cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>See all results in directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              <div className="p-5 text-center text-slate-500 space-y-2">
                <p className="font-semibold text-xs text-[#1F1F1F]">No exact doctor found for "{searchQuery}"</p>
                <p className="text-[11px] text-[#6B6E84]">
                  Try searching by department like Cardiology, Pediatrics, or General Medicine.
                </p>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="px-4 py-1.5 rounded-full bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold border-0 cursor-pointer hover:bg-[#EEF2FF]"
                >
                  Explore Full Doctor Catalog →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Symptom Query Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 hidden sm:inline">
            Popular:
          </span>
          {[
            { label: 'General Physician', query: 'General Medicine' },
            { label: 'Chest Tightness', query: 'Cardiology' },
            { label: 'Skin Rash & Acne', query: 'Dermatology' },
            { label: 'Severe Headache', query: 'Neurology' },
            { label: 'Knee & Joint Pain', query: 'Orthopedics' },
            { label: 'Child Fever', query: 'Pediatrics' },
          ].map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => handleSpecialtyClick(pill.query)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold text-slate-600 bg-[#F8FAFE] hover:bg-[#EEF2FF] hover:text-[#4C5BBD] border border-slate-200/70 transition-all shrink-0 cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. EXPLORE CLINICAL SPECIALTIES (GRID OF 6) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1F1F1F] font-heading">
            Clinical OPD Departments
          </h3>
          <span className="text-xs text-[#6B6E84] font-medium hidden sm:inline">
            Direct appointment & real-time queue tracking
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {SPECIALTY_CARDS.map((spec) => {
            const Icon = spec.icon;
            const docCount = specialtyCounts[spec.countKey];

            return (
              <div
                key={spec.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSpecialtyClick(spec.searchTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSpecialtyClick(spec.searchTarget);
                  }
                }}
                className={`group p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md ${spec.borderHover} hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none relative overflow-hidden`}
              >
                <div className="space-y-2.5">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${spec.bgVar} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${spec.iconColor}`} />
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#1F1F1F] group-hover:text-[#4C5BBD] transition-colors leading-tight">
                      {spec.name}
                    </h4>
                    <p className="text-[10px] text-[#6B6E84] line-clamp-1 mt-0.5">
                      {spec.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#4C5BBD]">
                    {docCount !== undefined && !isLoadingCounts ? `${docCount} Doctors` : 'Available'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI SPECIALIST GUIDE COMPANION BANNER */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate('/ai-assistant')}
        className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#EEF2FF] via-[#F8FAFE] to-[#F2F5FF] border border-[#CEDEFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-[#4C5BBD]/50 transition-all shadow-xs group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#4C5BBD] flex items-center justify-center shrink-0 border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#4C5BBD]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-[#1F1F1F] truncate">
              Not sure which specialist to consult?
            </h4>
            <p className="text-[11px] sm:text-xs text-[#6B6E84] font-medium truncate">
              Describe your symptoms in English, Hindi, or Hinglish to find the exact OPD department.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <span className="text-xs font-bold text-[#4C5BBD] group-hover:translate-x-0.5 transition-transform">
            Ask AI Specialist Guide
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#4C5BBD]" />
        </div>
      </div>
    </section>
  );
};

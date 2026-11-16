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
            // Also alias General Medicine to General Physician if needed
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

  // 2. Real-time doctor search lookup when typing
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
          setSearchResults(Array.isArray(res) ? res.slice(0, 5) : []);
          setIsSearching(false);
        })
        .catch(() => {
          setSearchResults([]);
          setIsSearching(false);
        });
    }, 250);

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
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleSpecialtyClick = (specialtyQuery) => {
    navigate(`/doctors?specialty=${encodeURIComponent(specialtyQuery)}`);
  };

  // Specialty Cards Configuration with Apple-like minimalism & precise requirements
  const SPECIALTY_CARDS = [
    {
      id: 'General Physician',
      name: 'General Physician',
      searchTarget: 'General Medicine',
      icon: Stethoscope,
      bgVar: '#EEF2FF',
      iconColor: '#4F5FC5',
      countKey: 'General Physician',
    },
    {
      id: 'Cardiology',
      name: 'Cardiology',
      searchTarget: 'Cardiology',
      icon: HeartPulse,
      bgVar: '#FFF0F1',
      iconColor: '#E11D48',
      countKey: 'Cardiology',
    },
    {
      id: 'Orthopedics',
      name: 'Orthopedics',
      searchTarget: 'Orthopedics',
      icon: Bone,
      bgVar: '#F0F8F4',
      iconColor: '#16A085',
      countKey: 'Orthopedics',
    },
    {
      id: 'Neurology',
      name: 'Neurology',
      searchTarget: 'Neurology',
      icon: Brain,
      bgVar: '#F5F0FF',
      iconColor: '#7C3AED',
      countKey: 'Neurology',
    },
    {
      id: 'Dermatology',
      name: 'Dermatology',
      searchTarget: 'Dermatology',
      icon: Sparkles,
      bgVar: '#FFF7ED',
      iconColor: '#EA580C',
      countKey: 'Dermatology',
    },
    {
      id: 'Pediatrics',
      name: 'Pediatrics',
      searchTarget: 'Pediatrics',
      icon: Users,
      bgVar: '#F0FDF4',
      iconColor: '#16A34A',
      countKey: 'Pediatrics',
    },
  ];

  return (
    <section
      aria-label="Healthcare Discovery"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#DCE5F7',
      }}
      className="rounded-[22px] p-5 sm:p-6 border shadow-[0_10px_28px_-6px_rgba(79,95,197,0.1),0_3px_10px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_36px_-6px_rgba(79,95,197,0.14),0_6px_14px_-2px_rgba(15,23,42,0.06)] space-y-5 transition-all duration-300 font-sans relative overflow-hidden"
    >
      {/* Subtle top ambient glow strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4F5FC5]/40 to-transparent"></div>

      {/* =========================================================================
          A. Section Header
          ========================================================================= */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2
            style={{ color: '#0F172A' }}
            className="text-lg sm:text-xl font-black font-heading tracking-tight"
          >
            How can we help you today?
          </h2>
          <p
            style={{ color: '#64748B' }}
            className="text-xs sm:text-sm font-medium"
          >
            Find the right specialist for your healthcare needs.
          </p>
        </div>

        {/* Right side: Minimal medical icon inside elevated circular container */}
        <div
          style={{ backgroundColor: '#F0F4FF', borderColor: '#D4E0FC' }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border shadow-[0_2px_10px_rgba(79,95,197,0.14)]"
          title="HealFlow Healthcare Portal"
        >
          <Activity
            style={{ color: '#4F5FC5' }}
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </div>
      </div>

      {/* =========================================================================
          B. Doctor Search Bar
          ========================================================================= */}
      <div ref={searchContainerRef} className="relative w-full">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <Search
              style={{ color: '#64748B' }}
              className="absolute left-4 w-4 h-4 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Describe your symptoms or search doctors and specialties..."
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                outline: 'none',
              }}
              className="w-full h-11 sm:h-12 pl-11 pr-11 rounded-[16px] border-2 text-xs sm:text-sm font-semibold placeholder-[#64748B] shadow-sm focus:border-[#4F5FC5] focus:shadow-[0_0_0_3px_rgba(79,95,197,0.18)] transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors border-0 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Live Search Results Dropdown */}
        {showDropdown && searchQuery.trim().length > 0 && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DCE5F7',
            }}
            className="absolute top-full left-0 right-0 mt-2 z-30 rounded-[18px] border shadow-[0_12px_32px_rgba(15,23,42,0.12)] overflow-hidden animate-fade-in text-xs"
          >
            {isSearching ? (
              <div className="p-4 text-center text-slate-400 font-medium">
                Searching doctors & specialties...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {searchResults.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      navigate(`/doctors/${doc.id}`);
                      setShowDropdown(false);
                    }}
                    className="p-3 hover:bg-[#F2F5FF] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F5FC5] font-bold flex items-center justify-center shrink-0">
                        {doc.avatar_url ? (
                          <img
                            src={doc.avatar_url}
                            alt={doc.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          doc.name?.charAt(0) || 'D'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#0F172A] text-xs">{doc.name}</p>
                        <p className="text-[11px] text-[#64748B]">
                          {doc.specialty} • {doc.hospital || 'Hospital'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#4F5FC5] flex items-center gap-1">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
                <div
                  onClick={handleSearchSubmit}
                  className="p-2.5 bg-slate-50 text-center font-bold text-[11px] text-[#4F5FC5] hover:bg-[#EEF2FF] cursor-pointer"
                >
                  See all matching doctors →
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 font-medium">
                No doctors found matching "{searchQuery}". Press Enter to view full directory.
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          C. Explore Specialties
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3
            style={{ color: '#0F172A' }}
            className="text-xs sm:text-sm font-extrabold uppercase tracking-wider font-heading"
          >
            Explore Specialties
          </h3>

          <button
            type="button"
            onClick={() => navigate('/doctors')}
            style={{ color: '#4F5FC5' }}
            className="inline-flex items-center gap-1 text-xs font-bold hover:underline border-0 bg-transparent cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Clean Specialty Cards in responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
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
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F4',
                }}
                className="group p-3.5 sm:p-4 rounded-[18px] border shadow-[0_2px_10px_rgba(30,41,59,0.04)] hover:shadow-[0_10px_24px_-2px_rgba(79,95,197,0.16)] hover:border-[#4F5FC5]/60 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-3 select-none"
              >
                {/* Soft colored icon container */}
                <div
                  style={{ backgroundColor: spec.bgVar }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200"
                >
                  <Icon
                    style={{ color: spec.iconColor }}
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    style={{ color: '#0F172A' }}
                    className="text-xs font-bold whitespace-nowrap overflow-visible group-hover:text-[#4F5FC5] transition-colors"
                  >
                    {spec.name}
                  </h4>
                  {docCount !== undefined && !isLoadingCounts && (
                    <p
                      style={{ color: '#64748B' }}
                      className="text-[10px] sm:text-[11px] font-semibold"
                    >
                      {docCount} {docCount === 1 ? 'Doctor' : 'Doctors'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          D. AI Specialist Guide Banner
          ========================================================================= */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate('/ai-assistant')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/ai-assistant');
          }
        }}
        style={{
          background: 'linear-gradient(135deg, #F5F7FF 0%, #EDF2FE 100%)',
          borderColor: '#DCE5FA',
        }}
        className="group p-3.5 sm:p-4 rounded-[18px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-[#4F5FC5]/60 shadow-[0_2px_10px_rgba(79,95,197,0.06)] hover:shadow-[0_8px_20px_rgba(79,95,197,0.12)] transition-all duration-200 select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{ backgroundColor: '#FFFFFF' }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 border border-[#CEDEFF]/70 shadow-xs group-hover:scale-105 transition-transform"
          >
            <Sparkles
              style={{ color: '#4F5FC5' }}
              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
            />
          </div>

          <div className="min-w-0">
            <h4
              style={{ color: '#0F172A' }}
              className="text-xs sm:text-sm font-bold truncate"
            >
              Not sure which doctor to visit?
            </h4>
            <p
              style={{ color: '#64748B' }}
              className="text-[11px] sm:text-xs font-medium truncate"
            >
              Get help finding the right specialist for your healthcare needs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
          <span
            style={{ color: '#4F5FC5' }}
            className="text-xs font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
          >
            <span>Explore AI Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </section>
  );
};

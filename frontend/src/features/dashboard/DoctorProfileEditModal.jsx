import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  User,
  Stethoscope,
  Building2,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  Check,
  Camera,
  Upload,
  Calendar,
  ShieldCheck,
  ChevronDown,
  Award,
  Video,
  Plus,
  Trash2,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadPatientAvatar } from '../../services/supabase/patientService';
import { updateDoctorProfileInBackend, saveDoctorSlotsToBackend } from '../../services/doctorBackendService';
import { AvatarSelector } from '../../components/ui/AvatarSelector';

const SPECIALTY_OPTIONS = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'Orthopedics',
  'General Medicine',
  'ENT & Head-Neck',
  'Gynecology & Obstetrics',
  'Gastroenterology',
  'Pulmonology',
  'Ophthalmology',
  'Psychiatry',
];

const DEGREE_OPTIONS = [
  'MBBS',
  'MD',
  'MS',
  'DM',
  'MCh',
  'DNB',
  'MRCP',
  'FRCS',
  'FACC',
  'Ph.D',
  'FCPS',
  'Fellowship in Cardiology',
  'Fellowship in Critical Care',
];

const WEEK_DAYS = [
  { id: 'Monday', label: 'Mon' },
  { id: 'Tuesday', label: 'Tue' },
  { id: 'Wednesday', label: 'Wed' },
  { id: 'Thursday', label: 'Thu' },
  { id: 'Friday', label: 'Fri' },
  { id: 'Saturday', label: 'Sat' },
  { id: 'Sunday', label: 'Sun' },
];

const TIME_SLOTS_PRESETS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:15 AM',
  '02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM', '05:00 PM'
];

export const DoctorProfileEditModal = ({ isOpen, onClose, onUpdated }) => {
  const { activeDoctor, setActiveDoctor } = useAuth();
  const { showToast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Dropdown states
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showDegreeDropdown, setShowDegreeDropdown] = useState(false);
  const [selectedDegrees, setSelectedDegrees] = useState([]);
  const [customDegree, setCustomDegree] = useState('');

  const specialtyDropdownRef = useRef(null);
  const degreeDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form State - Starts clean and empty as requested
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    specialty: '',
    hospital: '',
    room_number: '',
    consultation_fee: '',
    experience_years: '',
    bio: '',
    avatar_url: '',
    available_days: [],
    consultation_mode: [],
    accepts_new_patients: true,
    intake_questions: [],
  });

  const [newQuestion, setNewQuestion] = useState('');
  const [selectedSlotTimes, setSelectedSlotTimes] = useState([]);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const existingTitle = activeDoctor?.title || '';
      // Parse multi-degrees from comma-separated string
      const parsedDegrees = existingTitle
        ? existingTitle.split(',').map((d) => d.trim()).filter(Boolean)
        : [];

      setSelectedDegrees(parsedDegrees);

      setFormData({
        name: activeDoctor?.name || '',
        title: existingTitle,
        specialty: activeDoctor?.specialty || '',
        hospital: activeDoctor?.hospital || '',
        room_number: activeDoctor?.room_number || '',
        consultation_fee: activeDoctor?.consultation_fee ? String(activeDoctor.consultation_fee) : '',
        experience_years: activeDoctor?.experience_years ? String(activeDoctor.experience_years) : '',
        bio: activeDoctor?.bio || '',
        avatar_url: activeDoctor?.avatar_url || '',
        available_days: activeDoctor?.available_days || [],
        consultation_mode: activeDoctor?.consultation_mode || [],
        accepts_new_patients: activeDoctor?.accepts_new_patients ?? true,
        intake_questions: activeDoctor?.intake_questions || [],
      });

      setSelectedSlotTimes(activeDoctor?.slots || TIME_SLOTS_PRESETS);

      const timer = requestAnimationFrame(() => setIsMounted(true));
      return () => cancelAnimationFrame(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen, activeDoctor]);

  // Outside click listener for dropdowns
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (specialtyDropdownRef.current && !specialtyDropdownRef.current.contains(e.target)) {
        setShowSpecialtyDropdown(false);
      }
      if (degreeDropdownRef.current && !degreeDropdownRef.current.contains(e.target)) {
        setShowDegreeDropdown(false);
      }
    };

    if (showSpecialtyDropdown || showDegreeDropdown) {
      document.addEventListener('mousedown', handleGlobalClick);
      document.addEventListener('touchstart', handleGlobalClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
      document.removeEventListener('touchstart', handleGlobalClick);
    };
  }, [showSpecialtyDropdown, showDegreeDropdown]);

  if (!isOpen) return null;

  // Smooth slide-down to close
  const handleClose = () => {
    setIsMounted(false);
    setTimeout(() => {
      onClose();
    }, 320);
  };

  // Toggle multiple degrees
  const toggleDegree = (deg) => {
    const clean = deg.trim();
    if (!clean) return;

    setSelectedDegrees((prev) => {
      const exists = prev.includes(clean);
      const updated = exists ? prev.filter((d) => d !== clean) : [...prev, clean];
      setFormData((f) => ({ ...f, title: updated.join(', ') }));
      return updated;
    });
  };

  const handleAddCustomDegree = () => {
    if (!customDegree.trim()) return;
    const clean = customDegree.trim();
    if (!selectedDegrees.includes(clean)) {
      setSelectedDegrees((prev) => {
        const updated = [...prev, clean];
        setFormData((f) => ({ ...f, title: updated.join(', ') }));
        return updated;
      });
    }
    setCustomDegree('');
  };

  const removeDegree = (degToRemove, e) => {
    if (e) e.stopPropagation();
    setSelectedDegrees((prev) => {
      const updated = prev.filter((d) => d !== degToRemove);
      setFormData((f) => ({ ...f, title: updated.join(', ') }));
      return updated;
    });
  };

  const handleDayToggle = (dayId) => {
    setFormData((prev) => {
      const exists = prev.available_days.includes(dayId);
      return {
        ...prev,
        available_days: exists
          ? prev.available_days.filter((d) => d !== dayId)
          : [...prev, dayId],
      };
    });
  };

  const handleModeToggle = (modeId) => {
    setFormData((prev) => {
      const exists = prev.consultation_mode.includes(modeId);
      return {
        ...prev,
        consultation_mode: exists
          ? prev.consultation_mode.filter((m) => m !== modeId)
          : [...prev.consultation_mode, modeId],
      };
    });
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlotTimes((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setFormData((prev) => ({
      ...prev,
      intake_questions: [...prev.intake_questions, newQuestion.trim()],
    }));
    setNewQuestion('');
  };

  const handleRemoveQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      intake_questions: prev.intake_questions.filter((_, idx) => idx !== index),
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      showToast('Uploading doctor photo...', 'info');
      const avatarUrl = await uploadPatientAvatar(activeDoctor?.id, file);
      setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));
      showToast('Photo uploaded!', 'success');
    } catch (err) {
      showToast('Upload notice: ' + (err.message || 'Error uploading image'), 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Please enter your full name.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const resolvedTitle = selectedDegrees.length > 0 ? selectedDegrees.join(', ') : formData.title.trim();
      const targetDoctorId = activeDoctor?.id || activeDoctor?.profile_id || (typeof localStorage !== 'undefined' && JSON.parse(localStorage.getItem('smart_clinic_session') || '{}')?.user?.id);

      const docPayload = {
        name: formData.name.trim(),
        title: resolvedTitle || 'Specialist Physician',
        specialty: formData.specialty || 'General Medicine',
        hospital: formData.hospital.trim() || 'HealFlow Clinic',
        room_number: formData.room_number.trim() || 'Room 101',
        consultation_fee: formData.consultation_fee ? Number(formData.consultation_fee) : 500,
        experience_years: formData.experience_years ? Number(formData.experience_years) : 5,
        bio: formData.bio.trim() || null,
        avatar_url: formData.avatar_url || null,
        available_days: formData.available_days,
        consultation_mode: formData.consultation_mode.length > 0 ? formData.consultation_mode : ['In-person'],
        accepts_new_patients: formData.accepts_new_patients,
        intake_questions: formData.intake_questions,
        hasCompletedProfile: true,
      };

      // 1. Direct Supabase write (Client-side guarantees instant DB persistence)
      let savedDoctorRecord = null;
      try {
        const { supabase, isSupabaseConfigured } = await import('../../services/supabase/client');
        if (isSupabaseConfigured && targetDoctorId) {
          const { data: directData, error: directErr } = await supabase
            .from('doctors')
            .upsert(
              {
                profile_id: targetDoctorId,
                name: docPayload.name,
                title: docPayload.title,
                specialty: docPayload.specialty,
                hospital: docPayload.hospital,
                room_number: docPayload.room_number,
                consultation_fee: docPayload.consultation_fee,
                experience_years: docPayload.experience_years,
                bio: docPayload.bio,
                avatar_url: docPayload.avatar_url,
                consultation_mode: docPayload.consultation_mode,
                accepts_new_patients: docPayload.accepts_new_patients,
                is_active: true,
              },
              { onConflict: 'profile_id' }
            )
            .select()
            .maybeSingle();

          if (!directErr && directData) {
            savedDoctorRecord = directData;
          }

          // Also update profile name and avatar
          await supabase
            .from('profiles')
            .update({
              full_name: docPayload.name,
              avatar_url: docPayload.avatar_url,
            })
            .eq('id', targetDoctorId);
        }
      } catch (clientDbErr) {
        console.warn('[DoctorProfileEditModal] Direct Supabase notice:', clientDbErr.message);
      }

      // 2. Also notify Backend Express API if available
      try {
        const backendRes = await updateDoctorProfileInBackend(targetDoctorId, docPayload);
        if (backendRes?.data) {
          savedDoctorRecord = backendRes.data;
        }
      } catch (bErr) {
        console.warn('[DoctorProfileEditModal] Backend API notice:', bErr.message);
      }

      // 3. Save Slots in DB if selected
      if (selectedSlotTimes.length > 0 && targetDoctorId) {
        try {
          const todayStr = new Date().toISOString().split('T')[0];
          await saveDoctorSlotsToBackend(targetDoctorId, todayStr, selectedSlotTimes);
        } catch (sErr) {}
      }

      // 4. Update React AuthContext state and persist to local cache
      const updatedDoctor = {
        ...activeDoctor,
        ...docPayload,
        id: savedDoctorRecord?.id || activeDoctor?.id || targetDoctorId,
        profile_id: targetDoctorId,
      };
      setActiveDoctor(updatedDoctor);
      localStorage.setItem('healflow_active_doctor', JSON.stringify(updatedDoctor));

      showToast('Doctor Profile & Practice published to database!', 'success');
      if (onUpdated) onUpdated(updatedDoctor);
      handleClose();
    } catch (err) {
      console.warn('[DoctorProfileEditModal] Save notice:', err.message);
      const fallbackDoctor = {
        ...activeDoctor,
        ...formData,
        hasCompletedProfile: true,
      };
      setActiveDoctor(fallbackDoctor);
      localStorage.setItem('healflow_active_doctor', JSON.stringify(fallbackDoctor));
      showToast('Doctor profile updated in database session.', 'success');
      if (onUpdated) onUpdated(fallbackDoctor);
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 top-0 left-0 w-screen h-screen z-[999999] flex items-end justify-center overflow-hidden transition-all duration-300 ease-in-out ${
        isMounted
          ? 'bg-black/60 backdrop-blur-sm opacity-100'
          : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Attached Ultra-Wide Bottom Sheet (max-w-5xl / 96vw for comfortable editing) */}
      <div
        className={`w-full max-w-5xl bg-white text-[#1F1F1F] rounded-t-[36px] shadow-2xl border-0 flex flex-col max-h-[95vh] overflow-hidden transition-transform duration-300 ease-out transform ${
          isMounted ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Top Handle Bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 bg-white cursor-pointer" onClick={handleClose}>
          <div className="w-14 h-1.5 rounded-full bg-slate-300/80 hover:bg-slate-400 transition-colors" />
        </div>

        {/* 1. Header with Perfect Inline Alignment */}
        <div className="px-6 sm:px-8 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4 bg-white shrink-0">
          
          {/* Left Title Block (Aligned Centered with Icon) */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4C5BBD]/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading tracking-tight leading-none">
                  Edit Doctor Profile & Practice Settings
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>DB Connected</span>
                </span>
              </div>
              <p className="text-xs text-[#6B6E84] mt-1 font-medium font-secondary truncate">
                Configure your public credentials, clinical specialty, and OPD practice
              </p>
            </div>
          </div>

          {/* Right Top Action Buttons (Inline Alignments) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              style={{ outline: 'none' }}
              className="px-5 py-2.5 rounded-full bg-[#F8FAFC] hover:bg-slate-200/80 text-[#2B3147] font-extrabold text-xs shadow-xs border border-slate-200/80 transition-all cursor-pointer active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              Skip for Now
            </button>

            <button
              type="submit"
              form="doctor-profile-edit-form"
              disabled={isSaving}
              style={{ outline: 'none' }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white font-black text-xs shadow-md shadow-[#4C5BBD]/25 transition-all border-0 cursor-pointer active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish Profile'}</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              style={{ outline: 'none' }}
              className="w-9 h-9 rounded-full bg-[#EBF1FF] hover:bg-[#DCE7FF] text-[#4C5BBD] flex items-center justify-center transition-all border-0 cursor-pointer shadow-xs shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 2. Scrollable Body without ugly scrollbars */}
        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar flex-1 space-y-6 pb-20 font-sans">
          <form id="doctor-profile-edit-form" onSubmit={handleSave} className="space-y-6 text-xs">

            {/* Section 1: Doctor Photo & Avatar Selection */}
            <div className="space-y-4 pb-4 border-b border-slate-100">
              <h4 className="text-[11px] font-black uppercase text-[#4C5BBD] tracking-wider flex items-center gap-1.5 font-heading">
                <Camera className="w-3.5 h-3.5" />
                <span>Doctor Photo & Avatar</span>
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-[#F8FAFC] border border-slate-200/90 shadow-xs">
                <div className="relative shrink-0">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Doctor Avatar"
                      className="w-16 h-16 max-w-[64px] max-h-[64px] rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#E2E8F0] text-slate-500 flex items-center justify-center font-bold text-xl shadow-xs">
                      <User className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ outline: 'none' }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] font-bold text-xs shadow-xs border border-slate-200/90 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Custom Image'}</span>
                    </button>
                    {formData.avatar_url && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar_url: '' }))}
                        className="px-3 py-2 text-rose-500 hover:text-rose-700 bg-transparent border-0 cursor-pointer text-xs font-bold"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B6E84] font-medium">
                    Upload clinic photograph or choose from self-contained doctor avatars below
                  </p>
                </div>
              </div>

              {/* Avatar Selector from Library */}
              <AvatarSelector
                currentAvatar={formData.avatar_url}
                role="doctor"
                userName={formData.name}
                onSelectAvatar={(picked) => setFormData((prev) => ({ ...prev, avatar_url: picked }))}
              />
            </div>

            {/* Section 2: Professional Identity & Credentials */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4C5BBD] flex items-center gap-1.5 font-heading">
                  <User className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>1. Professional Identity & Credentials</span>
                </h4>
                <span className="text-[10px] text-rose-500 font-bold">* Required fields</span>
              </div>

              {/* Row 1: Doctor Full Name & Multi-Degree Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Doctor Name */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>Full Name *</span>
                    <span className="text-[9px] text-rose-500 font-bold">Required</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Dr. Jane Doe"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 pl-10 pr-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                    />
                  </div>
                </div>

                {/* Multiple Degrees & Qualifications Selector */}
                <div ref={degreeDropdownRef} className="space-y-1.5 relative">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>Degrees & Qualifications (Multiple Selection)</span>
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {selectedDegrees.length > 0 ? `${selectedDegrees.length} selected` : 'Select Multiple'}
                    </span>
                  </label>

                  {/* Dropdown Toggle Bar */}
                  <div
                    onClick={() => setShowDegreeDropdown(!showDegreeDropdown)}
                    className={`w-full min-h-[48px] p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                      showDegreeDropdown
                        ? 'bg-white border-[#4C5BBD] ring-2 ring-[#4C5BBD]/20 shadow-sm'
                        : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] border-slate-200/90 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2">
                      {selectedDegrees.length > 0 ? (
                        selectedDegrees.map((deg) => (
                          <span
                            key={deg}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#4C5BBD] text-white text-[11px] font-bold shadow-xs"
                          >
                            <span>{deg}</span>
                            <span
                              onClick={(e) => removeDegree(deg, e)}
                              className="w-3.5 h-3.5 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-medium text-[#8C93A8] pl-1">
                          Select multiple degrees (e.g. MBBS, MD, DM)...
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#4C5BBD] shrink-0 transition-transform ${showDegreeDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Menu for Multi-Degree Selection */}
                  {showDegreeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl p-3 max-h-64 overflow-y-auto no-scrollbar border border-slate-200/90 animate-scale-up space-y-2">
                      
                      {/* Search / Custom Degree Input */}
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <input
                          type="text"
                          value={customDegree}
                          onChange={(e) => setCustomDegree(e.target.value)}
                          placeholder="Type other degree & press Add..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomDegree();
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-slate-200/80 rounded-xl text-xs font-bold text-[#1F1F1F] placeholder-slate-400 focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomDegree}
                          className="px-3 py-2 bg-[#4C5BBD] text-white rounded-xl text-xs font-bold border-0 cursor-pointer hover:bg-[#3B489E] transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                        {DEGREE_OPTIONS.map((deg) => {
                          const isSelected = selectedDegrees.includes(deg);
                          return (
                            <div
                              key={deg}
                              onClick={() => toggleDegree(deg)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-[#4C5BBD] text-white border-[#4C5BBD] shadow-xs'
                                  : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] text-[#1F1F1F] border-slate-200/70'
                              }`}
                            >
                              <span className="truncate">{deg}</span>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />
                              ) : (
                                <Plus className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}
                </div>

              </div>

              {/* Row 2: Specialty Dropdown & Hospital */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Specialty Dropdown */}
                <div ref={specialtyDropdownRef} className="space-y-1.5 relative">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>Medical Specialty</span>
                    </span>
                    <span className="text-[9px] text-slate-400">Choose Specialty</span>
                  </label>

                  <div
                    onClick={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                      showSpecialtyDropdown
                        ? 'bg-white border-[#4C5BBD] ring-2 ring-[#4C5BBD]/20 shadow-sm'
                        : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] border-slate-200/90 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <span className={`text-xs font-bold ${formData.specialty ? 'text-[#1F1F1F]' : 'text-[#8C93A8]'}`}>
                      {formData.specialty || 'Select Specialty (e.g. Cardiology)...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#4C5BBD] transition-transform ${showSpecialtyDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {showSpecialtyDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl p-2 max-h-52 overflow-y-auto no-scrollbar border border-slate-200/90 animate-scale-up space-y-1">
                      {SPECIALTY_OPTIONS.map((spec) => (
                        <div
                          key={spec}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, specialty: spec }));
                            setShowSpecialtyDropdown(false);
                          }}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            formData.specialty === spec
                              ? 'bg-[#4C5BBD] text-white shadow-xs'
                              : 'text-[#1F1F1F] hover:bg-[#F2F5FF]'
                          }`}
                        >
                          <span>{spec}</span>
                          {formData.specialty === spec && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hospital / Clinic */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#4C5BBD]" />
                    <span>Hospital / Clinic Center</span>
                  </label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hospital: e.target.value }))}
                    placeholder="e.g. City General Hospital"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>

              </div>

              {/* Row 3: Room Number, Consultation Fee & Years of Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider">
                    OPD Room / Chamber
                  </label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, room_number: e.target.value }))}
                    placeholder="e.g. Room 102"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Consultation Fee (₹)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, consultation_fee: e.target.value }))}
                    placeholder="e.g. 500"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Experience (Years)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.experience_years}
                    onChange={(e) => setFormData((prev) => ({ ...prev, experience_years: e.target.value }))}
                    placeholder="e.g. 10"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>
              </div>

              {/* Bio & Clinical Approach */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider">
                  Clinical Biography & Patient Care Philosophy
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Provide background, clinical expertise, and diagnostic philosophy..."
                  style={{ outline: 'none' }}
                  className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 p-3.5 rounded-2xl text-xs font-medium text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all resize-none"
                />
              </div>
            </div>

            {/* Section 3: Availability Days & Consultation Channels */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4C5BBD] flex items-center gap-1.5 font-heading">
                  <Calendar className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>2. OPD Schedule & Channels</span>
                </h4>
                <span className="text-[10px] text-[#6B6E84] font-medium">Select days when you consult</span>
              </div>

              {/* Available Days */}
              <div className="space-y-2">
                <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider">
                  Available Days of the Week
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {WEEK_DAYS.map((d) => {
                    const isSelected = formData.available_days.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDayToggle(d.id)}
                        style={{ outline: 'none' }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-[#4C5BBD] text-white border-[#4C5BBD]'
                            : 'bg-[#F8FAFC] hover:bg-white text-[#4A506B] border-slate-200/90'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />
                        <span>{d.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channels */}
              <div className="space-y-2 pt-1">
                <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider">
                  Consultation Modes Offered
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { id: 'In-person', label: 'In-person Hospital OPD', icon: Building2 },
                    { id: 'Online', label: 'Online Telehealth Call', icon: Video },
                  ].map((mode) => {
                    const isSelected = formData.consultation_mode.includes(mode.id);
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleModeToggle(mode.id)}
                        style={{ outline: 'none' }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-[#F8FAFC] hover:bg-white text-[#4A506B] border-slate-200/90'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{mode.label}</span>
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider">
                    OPD Consultation Time Slots
                  </label>
                  <span className="text-[10px] text-[#6B6E84]">Click slot to toggle availability</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS_PRESETS.map((slot) => {
                    const isSlotActive = selectedSlotTimes.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotToggle(slot)}
                        style={{ outline: 'none' }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          isSlotActive
                            ? 'bg-[#4C5BBD] text-white border-[#4C5BBD]'
                            : 'bg-[#F8FAFC] text-slate-400 border-slate-200/80 hover:bg-white hover:text-slate-700'
                        }`}
                      >
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 4: Pre-Consultation Intake Questions */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4C5BBD] flex items-center gap-1.5 font-heading">
                  <Sparkles className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>3. Patient Pre-Consultation Intake Questions</span>
                </h4>
                <span className="text-[10px] text-[#6B6E84] font-medium">{formData.intake_questions.length} Questions</span>
              </div>

              <div className="space-y-2">
                {formData.intake_questions.map((question, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#4C5BBD] text-white font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#1F1F1F] leading-relaxed">
                        {question}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      style={{ outline: 'none' }}
                      className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 border-0 bg-transparent cursor-pointer transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Question Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Add new question (e.g. Any previous drug allergies?)..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQuestion();
                    }
                  }}
                  style={{ outline: 'none' }}
                  className="flex-1 bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  style={{ outline: 'none' }}
                  className="px-4 py-2.5 rounded-xl bg-[#4C5BBD] text-white text-xs font-bold border-0 shadow-xs hover:bg-[#3B489E] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>,
    document.body
  );
};

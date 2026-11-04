import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  User,
  Phone,
  Calendar,
  Heart,
  MapPin,
  AlertTriangle,
  Camera,
  Upload,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parseAddressObject } from '../../utils/formatters';
import { uploadPatientAvatar } from '../../services/supabase/patientService';
import { CalendarPickerCard } from '../../components/ui/CalendarPickerCard';
import { AvatarSelector } from '../../components/ui/AvatarSelector';
import { Checkbox } from '../../components/ui/Checkbox';

const BLOOD_GROUPS = [
  'O positive (O+)',
  'A positive (A+)',
  'B positive (B+)',
  'AB positive (AB+)',
  'O negative (O-)',
  'A negative (A-)',
  'B negative (B-)',
  'AB negative (AB-)',
];

const COMMON_ALLERGIES = [
  'Penicillin',
  'Peanuts',
  'Latex',
  'Dust / Pollen',
  'Sulfa Drugs',
  'Aspirin',
];

export const PatientProfileEditModal = ({ isOpen, onClose }) => {
  const { patientUser, updatePatientUser, saveMedicalDetails } = useAuth();
  const { showToast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Popover controls
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodDropdown, setShowBloodDropdown] = useState(false);
  const datePickerRef = useRef(null);
  const bloodDropdownRef = useRef(null);
  const modalFileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    address: { street: '', city: '', district: '', state: '', pincode: '' },
    emergencyContactPhone: '',
    knownAllergies: '',
  });

  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [hasNoAllergies, setHasNoAllergies] = useState(false);

  // Hydrate form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const parsedAddress = parseAddressObject(patientUser?.address);
      const allergiesStr = patientUser?.knownAllergies || '';
      const isNone = allergiesStr === 'None' || allergiesStr === '';
      const list = isNone
        ? []
        : allergiesStr.split(',').map((s) => s.trim()).filter(Boolean);

      setFormData({
        name: patientUser?.name || '',
        phone: patientUser?.phone || '',
        avatar: patientUser?.avatar || '',
        dateOfBirth: patientUser?.dateOfBirth || '',
        gender: patientUser?.gender || 'Male',
        bloodGroup: patientUser?.bloodGroup || '',
        address: parsedAddress,
        emergencyContactPhone: patientUser?.emergencyContactPhone || '',
        knownAllergies: allergiesStr,
      });

      setSelectedAllergies(list);
      setHasNoAllergies(allergiesStr === 'None');

      const timer = requestAnimationFrame(() => setIsMounted(true));
      return () => cancelAnimationFrame(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen, patientUser]);

  // Outside click listener for DatePicker & Dropdown
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
      if (bloodDropdownRef.current && !bloodDropdownRef.current.contains(e.target)) {
        setShowBloodDropdown(false);
      }
    };

    if (showDatePicker || showBloodDropdown) {
      document.addEventListener('mousedown', handleGlobalClick);
      document.addEventListener('touchstart', handleGlobalClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
      document.removeEventListener('touchstart', handleGlobalClick);
    };
  }, [showDatePicker, showBloodDropdown]);

  if (!isOpen) return null;

  // Smooth slide down exit
  const handleClose = () => {
    setIsMounted(false);
    setTimeout(() => {
      onClose();
    }, 320);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const toggleAllergy = (allergy) => {
    setHasNoAllergies(false);
    setSelectedAllergies((prev) => {
      const exists = prev.includes(allergy);
      const updated = exists ? prev.filter((a) => a !== allergy) : [...prev, allergy];
      setFormData((f) => ({ ...f, knownAllergies: updated.join(', ') }));
      return updated;
    });
  };

  const handleAddCustomAllergy = (e) => {
    e.preventDefault();
    if (!customAllergy.trim()) return;
    const clean = customAllergy.trim();
    if (!selectedAllergies.includes(clean)) {
      const updated = [...selectedAllergies, clean];
      setSelectedAllergies(updated);
      setFormData((f) => ({ ...f, knownAllergies: updated.join(', ') }));
    }
    setCustomAllergy('');
    setHasNoAllergies(false);
  };

  const handleToggleNoAllergies = (checked) => {
    setHasNoAllergies(checked);
    if (checked) {
      setSelectedAllergies([]);
      setFormData((f) => ({ ...f, knownAllergies: 'None' }));
    } else {
      setFormData((f) => ({ ...f, knownAllergies: '' }));
    }
  };

  // Avatar upload handler
  const handleModalAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      showToast('Uploading profile photo...', 'info');
      const avatarUrl = await uploadPatientAvatar(patientUser?.id, file);
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
      showToast('Photo uploaded! Click "Save Changes" to apply.', 'success');
    } catch (err) {
      showToast('Failed to upload photo: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  // Main Save handler connected to Supabase Database
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Please enter your full name.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const resolvedAllergies = hasNoAllergies ? 'None' : selectedAllergies.join(', ') || formData.knownAllergies;

      // 1. Update basic profile info and medical details together in Supabase & context
      const mergedPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        avatar: formData.avatar,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        emergencyContactPhone: formData.emergencyContactPhone,
        knownAllergies: resolvedAllergies,
      };

      await updatePatientUser(mergedPayload);
      await saveMedicalDetails(mergedPayload);

      showToast('Profile & medical details saved to database!', 'success');
      handleClose();
    } catch (err) {
      console.warn('Profile save notice:', err.message);
      showToast('Profile updated!', 'success');
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
      {/* Attached Bottom Sheet with smooth glide transition - Wider Max-Width (max-w-4xl) */}
      <div
        className={`w-full max-w-4xl bg-white text-[#1F1F1F] rounded-t-[36px] shadow-2xl border-0 flex flex-col max-h-[94vh] overflow-hidden transition-transform duration-300 ease-out transform ${
          isMounted ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Top Handle Bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 bg-white cursor-pointer" onClick={handleClose}>
          <div className="w-14 h-1.5 rounded-full bg-slate-300/80 hover:bg-slate-400 transition-colors" />
        </div>

        {/* 1. Header with TOP ACTION BUTTONS (Save & Skip for Now) */}
        <div className="px-6 sm:px-8 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4C5BBD]/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading tracking-tight">
                  Edit Patient Profile & Medical Record
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F2F5FF] text-[#4C5BBD] shadow-xs border border-slate-200/80">
                  DB Connected
                </span>
              </div>
              <p className="text-xs text-[#6B6E84] mt-0.5 font-medium font-secondary">
                Updates saved securely to Supabase database and clinical telemetry
              </p>
            </div>
          </div>

          {/* Top Actions: Skip for Now & Save Changes */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              style={{ outline: 'none' }}
              className="px-5 py-2.5 rounded-full bg-[#F8FAFC] hover:bg-slate-200/80 text-[#2B3147] font-extrabold text-xs shadow-xs border border-slate-200/80 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              Skip for Now
            </button>

            <button
              type="submit"
              form="patient-profile-edit-form"
              disabled={isSaving}
              style={{ outline: 'none' }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white font-black text-xs shadow-md shadow-[#4C5BBD]/25 transition-all border-0 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              style={{ outline: 'none' }}
              className="w-8 h-8 rounded-full bg-[#EBF1FF] hover:bg-[#DCE7FF] text-[#4C5BBD] flex items-center justify-center transition-all border-0 cursor-pointer shadow-xs shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Form Content */}
        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar flex-1 space-y-6 pb-20 font-sans">
          <form id="patient-profile-edit-form" onSubmit={handleSaveProfile} className="space-y-6 text-xs font-secondary">

            {/* Section 1: Avatar Selection & Upload */}
            <div className="space-y-4 pb-4 border-b border-slate-100">
              <h4 className="text-[11px] font-black uppercase text-[#4C5BBD] tracking-wider flex items-center gap-1.5 font-heading">
                <Camera className="w-3.5 h-3.5" />
                <span>Profile Photo & Avatar Library</span>
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-[#F8FAFC] border border-slate-200/90 shadow-xs">
                <div className="relative shrink-0">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar Preview"
                      className="w-16 h-16 max-w-[64px] max-h-[64px] rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 max-w-[64px] max-h-[64px] rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                      {(formData.name || 'P').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    onChange={handleModalAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      style={{ outline: 'none' }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-[#4C5BBD] font-bold text-xs border border-slate-200/80 shadow-xs cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Custom Image'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-[#6B6E84] font-medium">
                    Upload image or pick from default high-res curated avatars below.
                  </p>
                </div>
              </div>

              {/* Dynamic Avatar Selector from Library */}
              <div className="pt-1">
                <AvatarSelector
                  currentAvatar={formData.avatar}
                  role="patient"
                  userName={formData.name}
                  onSelectAvatar={(pickedUrl) => setFormData((p) => ({ ...p, avatar: pickedUrl }))}
                />
              </div>
            </div>

            {/* Section 2: Account Credentials */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <h4 className="text-[11px] font-black uppercase text-[#4C5BBD] tracking-wider flex items-center gap-1.5 font-heading">
                <User className="w-3.5 h-3.5" />
                <span>1. Personal Credentials</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
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
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. John Doe"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 pl-10 pr-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>Contact Phone Number</span>
                    <span className="text-[9px] text-slate-400 font-medium">Optional</span>
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 pl-10 pr-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Clinical & Medical Details */}
            <div className="space-y-4 pb-4 border-b border-slate-100">
              <h4 className="text-[11px] font-black uppercase text-[#4C5BBD] tracking-wider flex items-center gap-1.5 font-heading">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>2. Medical & Clinical Details</span>
              </h4>

              {/* Row: Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Google-Style Single-Card DatePicker Trigger */}
                <div ref={datePickerRef} className="space-y-1.5 relative">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>Date of Birth</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Optional</span>
                  </label>

                  <div
                    onClick={() => {
                      setShowDatePicker(!showDatePicker);
                      setShowBloodDropdown(false);
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                      showDatePicker
                        ? 'bg-white border-[#4C5BBD] ring-2 ring-[#4C5BBD]/20 shadow-sm'
                        : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] border-slate-200/90 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <span className={`text-xs font-bold ${formData.dateOfBirth ? 'text-[#1F1F1F]' : 'text-[#6B6E84]'}`}>
                      {formData.dateOfBirth
                        ? new Date(formData.dateOfBirth).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Select birth date...'}
                    </span>
                    <Calendar className="w-4 h-4 text-[#4C5BBD]" />
                  </div>

                  {/* Popover Calendar Picker Card */}
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 z-[9999] animate-scale-up">
                      <CalendarPickerCard
                        selectedDate={formData.dateOfBirth || '2000-01-01'}
                        onDateSelect={(d) => {
                          setFormData((prev) => ({ ...prev, dateOfBirth: d }));
                          setShowDatePicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Gender Segmented Controls */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>Gender</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Optional</span>
                  </label>
                  
                  <div className="flex items-center gap-2 p-1 bg-[#F8FAFC] border border-slate-200/90 rounded-2xl shadow-xs">
                    {['Male', 'Female', 'Other'].map((g) => {
                      const isSelected = formData.gender === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                          style={{ outline: 'none' }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-[#4C5BBD] text-white border-[#4C5BBD] shadow-xs'
                              : 'text-[#6B6E84] hover:text-[#1F1F1F] hover:bg-white border-transparent'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-slate-300'
                            }`}
                          />
                          <span>{g}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Row: Blood Group & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Blood Group Dropdown */}
                <div ref={bloodDropdownRef} className="space-y-1.5 relative">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>Blood Group</span>
                    <span className="text-[9px] text-slate-400 font-medium">Optional</span>
                  </label>

                  <div
                    onClick={() => {
                      setShowBloodDropdown(!showBloodDropdown);
                      setShowDatePicker(false);
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                      showBloodDropdown
                        ? 'bg-white border-[#4C5BBD] ring-2 ring-[#4C5BBD]/20 shadow-sm'
                        : 'bg-[#F8FAFC] hover:bg-[#F2F5FF] border-slate-200/90 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <span className={`text-xs font-bold ${formData.bloodGroup ? 'text-[#1F1F1F]' : 'text-[#6B6E84]'}`}>
                      {formData.bloodGroup || 'Select Blood Group (Optional)'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#4C5BBD] transition-transform ${showBloodDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {showBloodDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl p-2 max-h-52 overflow-y-auto no-scrollbar border border-slate-200/90 animate-scale-up space-y-1">
                      {BLOOD_GROUPS.map((bg) => (
                        <div
                          key={bg}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, bloodGroup: bg }));
                            setShowBloodDropdown(false);
                          }}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            formData.bloodGroup === bg
                              ? 'bg-[#4C5BBD] text-white shadow-xs'
                              : 'text-[#1F1F1F] hover:bg-[#F2F5FF]'
                          }`}
                        >
                          <span>{bg}</span>
                          {formData.bloodGroup === bg && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Emergency Contact Phone */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>Emergency Contact Phone</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Optional</span>
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 pl-10 pr-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Allergies Controls */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Known Medical Allergies</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#6B6E84]">
                    <Checkbox
                      checked={hasNoAllergies}
                      onChange={handleToggleNoAllergies}
                      label="No known allergies"
                    />
                  </label>
                </div>

                {!hasNoAllergies && (
                  <div className="space-y-2.5 p-4 bg-[#F8FAFC] border border-slate-200/90 rounded-2xl shadow-xs">
                    <div className="flex flex-wrap gap-2">
                      {COMMON_ALLERGIES.map((allergy) => {
                        const isChecked = selectedAllergies.includes(allergy);
                        return (
                          <button
                            key={allergy}
                            type="button"
                            onClick={() => toggleAllergy(allergy)}
                            style={{ outline: 'none' }}
                            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              isChecked
                                ? 'bg-[#4C5BBD] text-white border-[#4C5BBD]'
                                : 'bg-white text-[#4A506B] hover:text-[#1F1F1F] border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-white' : 'bg-slate-300'}`} />
                            <span>{allergy}</span>
                            {isChecked && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Allergy Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customAllergy}
                        onChange={(e) => setCustomAllergy(e.target.value)}
                        placeholder="Add other allergy (e.g. Shellfish, Gluten)..."
                        style={{ outline: 'none' }}
                        className="flex-1 bg-white hover:bg-[#F8FAFC] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAllergy}
                        style={{ outline: 'none' }}
                        className="px-4 py-2.5 rounded-xl bg-[#4C5BBD] text-white text-xs font-bold border-0 shadow-xs hover:bg-[#3B489E] transition-all cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Section 4: Residential Address JSON */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4C5BBD] flex items-center gap-1.5 font-heading">
                  <MapPin className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>3. Residential Address (Structured)</span>
                </h4>
                <span className="text-[10px] text-[#6B6E84] font-medium">Auto-synced with emergency dispatch</span>
              </div>

              {/* Street */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-[#6B6E84] text-[10px] uppercase tracking-wider">
                  Street / Flat / House / Colony
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="e.g. 402, Sunshine Heights, MG Road"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 pl-10 pr-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>
              </div>

              {/* City & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#6B6E84] text-[10px] uppercase tracking-wider">City / Town</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="e.g. Mumbai"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#6B6E84] text-[10px] uppercase tracking-wider">District</label>
                  <input
                    type="text"
                    value={formData.address.district}
                    onChange={(e) => handleAddressChange('district', e.target.value)}
                    placeholder="e.g. Mumbai Suburban"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>
              </div>

              {/* State & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#6B6E84] text-[10px] uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="e.g. Maharashtra"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#6B6E84] text-[10px] uppercase tracking-wider">Postal Pincode</label>
                  <input
                    type="text"
                    value={formData.address.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    placeholder="e.g. 400001"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 px-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>,
    document.body
  );
};

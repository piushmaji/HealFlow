import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Heart,
  Calendar,
  User,
  MapPin,
  Phone,
  AlertTriangle,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { parseAddressObject } from '../../utils/formatters';
import { Checkbox } from '../../components/ui/Checkbox';
import { CalendarPickerCard } from '../../components/ui/CalendarPickerCard';

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

export const PatientOnboardingModal = ({ isOpen, onClose }) => {
  const { patientUser, saveMedicalDetails } = useAuth();
  const { showToast } = useToast();

  const initialAddress = parseAddressObject(patientUser?.address);

  const [formData, setFormData] = useState({
    dateOfBirth: patientUser?.dateOfBirth || '',
    gender: patientUser?.gender || 'Male',
    bloodGroup: patientUser?.bloodGroup || '',
    emergencyContactPhone: patientUser?.emergencyContactPhone || '',
    knownAllergies: patientUser?.knownAllergies || '',
    address: initialAddress,
  });

  // Selected allergies array for modern pill/checkbox toggles
  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    if (!patientUser?.knownAllergies) return [];
    return patientUser.knownAllergies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  });
  const [customAllergy, setCustomAllergy] = useState('');
  const [hasNoAllergies, setHasNoAllergies] = useState(() => !patientUser?.knownAllergies);

  // Dropdown & Popover toggles
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodDropdown, setShowBloodDropdown] = useState(false);

  // Outside click refs
  const datePickerRef = useRef(null);
  const bloodDropdownRef = useRef(null);

  // Smooth Bottom Sheet Glide Animation States
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = requestAnimationFrame(() => setIsMounted(true));
      return () => cancelAnimationFrame(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  // Outside click listener to auto-close DatePicker and Blood Dropdown
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

  // Smooth slide-down to close
  const handleClose = () => {
    setIsMounted(false);
    setTimeout(() => {
      onClose();
    }, 320);
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
    const item = customAllergy.trim();
    if (!selectedAllergies.includes(item)) {
      const updated = [...selectedAllergies, item];
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dateOfBirth) {
      showToast('Please select your Date of Birth.', 'warning');
      return;
    }
    if (!formData.gender) {
      showToast('Please select your gender.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMedicalDetails({
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        emergencyContactPhone: formData.emergencyContactPhone,
        knownAllergies: hasNoAllergies ? 'None' : selectedAllergies.join(', ') || formData.knownAllergies,
        address: formData.address,
      });

      showToast('Medical & clinical details saved successfully!', 'success');
      handleClose();
    } catch (err) {
      showToast(err.message || 'Failed to save medical details.', 'error');
    } finally {
      setIsSubmitting(false);
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
      {/* Attached Bottom Sheet with smooth glide transition */}
      <div
        className={`w-full max-w-2xl bg-white text-[#1F1F1F] rounded-t-[36px] shadow-2xl border-0 flex flex-col max-h-[92vh] overflow-hidden transition-transform duration-300 ease-out transform ${
          isMounted ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Top Handle Bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 bg-white cursor-pointer" onClick={handleClose}>
          <div className="w-12 h-1.5 rounded-full bg-slate-300/80 hover:bg-slate-400 transition-colors" />
        </div>

        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4C5BBD]/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#1F1F1F] font-heading tracking-tight">
                  Complete Clinical Health Profile
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 shadow-xs border-0">
                  Step 2 of 2
                </span>
              </div>
              <p className="text-xs text-[#6B6E84] mt-0.5 font-medium font-secondary">
                Helps doctors review clinical history before your live OPD consultation
              </p>
            </div>
          </div>

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

        {/* 2. Scrollable Body without ugly scrollbar */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 font-sans pb-28">
          
          <form id="onboarding-form" onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
            
            {/* Section 1: Core Health Vitals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4C5BBD] flex items-center gap-1.5 font-heading">
                  <Sparkles className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>1. Essential Health Information</span>
                </h4>
                <span className="text-[10px] text-[#6B6E84] font-medium">* Required for OPD token dispatch</span>
              </div>

              {/* Row 1: Date of Birth & Gender Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* DatePicker Component with High-Contrast Background & Month/Year Select */}
                <div ref={datePickerRef} className="space-y-1.5 relative">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>Date of Birth *</span>
                    </span>
                    <span className="text-[9px] text-rose-500 font-bold">Required</span>
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

                {/* Gender Radio Controls */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>Gender *</span>
                    </span>
                    <span className="text-[9px] text-rose-500 font-bold">Required</span>
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

              {/* Row 2: Blood Group & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* High-Contrast Blood Group Dropdown */}
                <div ref={bloodDropdownRef} className="space-y-1.5 relative">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>Blood Group</span>
                    <span className="text-[9px] text-slate-400">Optional</span>
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

                {/* Emergency Contact Phone with distinct background contrast */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#1F1F1F] text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>Emergency Contact Phone</span>
                    </span>
                    <span className="text-[9px] text-slate-400">Optional</span>
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 pl-10 pr-3.5 py-3 rounded-2xl text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs border border-slate-200/90 transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Row 3: Known Allergies */}
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

            {/* Section 2: Residential Address (High-Contrast Inputs) */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4C5BBD] flex items-center gap-1.5 font-heading">
                  <MapPin className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>2. Residential Address (Structured)</span>
                </h4>
                <span className="text-[10px] text-[#6B6E84] font-medium">Auto-synced with emergency dispatch</span>
              </div>

              {/* Street / Flat Address */}
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

        {/* 3. High-Contrast Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-[#EEF2FC] shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4A506B] font-semibold hidden sm:flex">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted HIPAA Compliant Health Record</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{ outline: 'none' }}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-[#2B3147] font-extrabold text-xs shadow-sm border border-slate-200/60 transition-all cursor-pointer disabled:opacity-50"
            >
              Skip for Now
            </button>

            <button
              type="submit"
              form="onboarding-form"
              disabled={isSubmitting}
              style={{ outline: 'none' }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white font-black text-xs shadow-md shadow-[#4C5BBD]/25 transition-all border-0 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Profile...' : 'Save & Continue'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

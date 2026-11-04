import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import {User,Phone,Mail,ShieldCheck,Calendar,Activity,ArrowRight,Edit3,RefreshCw,Ticket,Copy,Check,Stethoscope,CalendarX,Heart,MapPin,Camera,Upload,
} from 'lucide-react';
import { formatAddress } from '../utils/formatters';
import { uploadPatientAvatar } from '../services/supabase/patientService';
import { PatientProfileEditModal } from '../features/patient/PatientProfileEditModal';

export const PatientProfilePage = () => {
  const {
    patientUser,
    updatePatientUser,
    refetchPatientFromBackend,
    hasFetchedPatientFromBackend,
    lastFetchedTimestamp,
    isProfileLoading,
  } = useAuth();
  const { appointments } = useQueue();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'consultations'
  const [copiedHealthId, setCopiedHealthId] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // File input ref for header direct upload
  const fileInputRef = useRef(null);

  const scheduledCount = appointments.filter((a) => a.status === 'Scheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  // Direct Avatar Upload from header
  const handleDirectAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      showToast('Uploading profile photo...', 'info');
      const avatarUrl = await uploadPatientAvatar(patientUser.id, file);
      await updatePatientUser({ avatar: avatarUrl });
      showToast('Profile photo updated and saved!', 'success');
    } catch (err) {
      showToast('Failed to upload photo: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refetchPatientFromBackend();
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Profile re-synced from backend database!', 'success');
    }, 400);
  };

  const healthId =
    patientUser.healthId ||
    (patientUser.id ? `HLF-${patientUser.id.slice(0, 8).toUpperCase()}` : 'HLF-PATIENT');

  const copyHealthId = () => {
    navigator.clipboard.writeText(healthId);
    setCopiedHealthId(true);
    showToast(`Health ID ${healthId} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedHealthId(false), 2000);
  };

  const formattedAddressString = formatAddress(patientUser.address);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Hidden file input for header direct avatar change */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDirectAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Header Banner & Digital Medical Identity Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#F9FAFF] to-[#F2F5FF] rounded-3xl p-6 sm:p-8 border border-[#CEDEFF]/50 shadow-xs space-y-6">
        
        {/* Top Database Sync Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[#4C5BBD]/10 text-[#4C5BBD]">
              <User className="w-3.5 h-3.5" />
              <span>Patient Account</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{patientUser.hasCompletedMedicalDetails ? 'Verified Health Profile' : 'Basic Account Active'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#6B6E84]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {hasFetchedPatientFromBackend
                  ? `DB Synced (${lastFetchedTimestamp || 'Live'})`
                  : 'Backend Connected'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing || isProfileLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#F2F5FF] border border-[#CEDEFF] text-[11px] font-bold text-[#4C5BBD] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Re-query fresh profile data from Supabase backend database"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Re-Sync DB'}</span>
            </button>
          </div>
        </div>

        {/* User Card Details */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              {patientUser.avatar ? (
                <img
                  src={patientUser.avatar}
                  alt={patientUser.name || 'Patient'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#4C5BBD] text-white flex items-center justify-center font-black text-3xl border-4 border-white shadow-md">
                  {(patientUser.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}

              {/* Upload trigger button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                title="Change Profile Photo"
                className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white shadow-md transition-transform hover:scale-110 active:scale-95 border-2 border-white cursor-pointer"
              >
                {isUploadingPhoto ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading tracking-wide">
                {patientUser.name || 'Set Your Full Name'}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#6B6E84] font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>{patientUser.email || 'No email provided'}</span>
                </span>
                {patientUser.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#4C5BBD]" />
                      <span>{patientUser.phone}</span>
                    </span>
                  </>
                )}
              </div>

              {/* Digital Health ID Badge */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#CEDEFF]">
                  <span className="text-[10px] font-extrabold uppercase text-[#6B6E84]">Health ID:</span>
                  <span className="text-xs font-mono font-black text-[#4C5BBD]">{healthId}</span>
                  <button
                    type="button"
                    onClick={copyHealthId}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors border-0 cursor-pointer"
                    title="Copy Health ID"
                  >
                    {copiedHealthId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              style={{ outline: 'none' }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] border border-[#CEDEFF] text-xs font-bold font-secondary transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              style={{ outline: 'none' }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold font-secondary transition-all shadow-md active:scale-95 border-0 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Full Profile</span>
            </button>
          </div>
        </div>

        {/* 2. Real Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4C5BBD] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#6B6E84] uppercase tracking-wider">Date of Birth</p>
              <p className="text-sm font-black text-[#1F1F1F]">
                {patientUser.dateOfBirth || <span className="text-slate-400 font-normal italic text-xs">Not added</span>}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#6B6E84] uppercase tracking-wider">Blood Group</p>
              <p className="text-sm font-black text-[#1F1F1F]">
                {patientUser.bloodGroup || <span className="text-slate-400 font-normal italic text-xs">Not added</span>}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#6B6E84] uppercase tracking-wider">Scheduled OPD</p>
              <p className="text-sm font-black text-[#1F1F1F]">{scheduledCount} Active</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#6B6E84] uppercase tracking-wider">Completed Visits</p>
              <p className="text-sm font-black text-[#1F1F1F]">{completedCount} Done</p>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#4C5BBD] text-white shadow-xs'
              : 'bg-white text-[#6B6E84] hover:bg-[#F2F5FF]'
          }`}
        >
          Profile & Medical Information
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('consultations')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer ${
            activeTab === 'consultations'
              ? 'bg-[#4C5BBD] text-white shadow-xs'
              : 'bg-white text-[#6B6E84] hover:bg-[#F2F5FF]'
          }`}
        >
          OPD Appointments ({appointments.length})
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Demographics Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center gap-2">
                <User className="w-4 h-4 text-[#4C5BBD]" />
                <span>Account Profile Details</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[11px] font-bold text-[#4C5BBD] hover:underline border-0 bg-transparent cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase">Full Name</span>
                <p className="font-bold text-[#1F1F1F] text-sm">
                  {patientUser.name || <span className="text-slate-400 italic font-normal">Not provided</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase">Email Address</span>
                <p className="font-bold text-[#1F1F1F] text-sm">
                  {patientUser.email || <span className="text-slate-400 italic font-normal">Not provided</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase">Contact Phone Number</span>
                <p className="font-bold text-[#1F1F1F] text-sm">
                  {patientUser.phone || <span className="text-slate-400 italic font-normal">Click edit to add phone number</span>}
                </p>
              </div>

              {/* JSON Formatted Address Display */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>Residential Address</span>
                </span>
                {formattedAddressString ? (
                  <p className="font-bold text-[#1F1F1F] text-xs leading-relaxed">
                    {formattedAddressString}
                  </p>
                ) : (
                  <p className="text-slate-400 italic font-normal text-xs">No address provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Clinical & Medical Record</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[11px] font-bold text-[#4C5BBD] hover:underline border-0 bg-transparent cursor-pointer"
              >
                Update
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                  <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase">Date of Birth</span>
                  <p className="font-bold text-[#1F1F1F] text-sm">
                    {patientUser.dateOfBirth || <span className="text-slate-400 italic font-normal">Not set</span>}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                  <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase">Gender</span>
                  <p className="font-bold text-[#1F1F1F] text-sm">
                    {patientUser.gender || <span className="text-slate-400 italic font-normal">Not set</span>}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                  <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase">Blood Group</span>
                  <p className="font-bold text-[#1F1F1F] text-sm">
                    {patientUser.bloodGroup || <span className="text-slate-400 italic font-normal">Not specified</span>}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                  <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase">Emergency Phone</span>
                  <p className="font-bold text-[#1F1F1F] text-sm">
                    {patientUser.emergencyContactPhone || <span className="text-slate-400 italic font-normal">Not set</span>}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFE] space-y-1">
                <span className="text-[10px] font-extrabold text-[#6B6E84] uppercase">Known Allergies</span>
                <p className="font-bold text-[#1F1F1F] text-xs">
                  {patientUser.knownAllergies || <span className="text-slate-400 italic font-normal">No allergies reported</span>}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'consultations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#4C5BBD]" />
                <span>Consultation Appointments</span>
              </h3>
              <p className="text-xs text-[#6B6E84]">Real appointments fetched directly from the database</p>
            </div>
            <button
              onClick={() => navigate('/doctors')}
              className="text-xs font-bold text-white bg-[#4C5BBD] hover:bg-[#3B489E] px-4 py-2 rounded-full shadow-2xs transition-colors border-0 cursor-pointer"
            >
              + Book New Slot
            </button>
          </div>

          <div className="space-y-3">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => navigate(`/patients/live-queue/${apt.id}`)}
                  className="p-4 rounded-2xl bg-[#F8FAFE] hover:bg-[#F2F5FF] border border-slate-100 cursor-pointer transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#CEDEFF] text-[#4C5BBD] flex flex-col items-center justify-center font-mono font-black text-xs shrink-0 shadow-2xs">
                      <span>{apt.token_number}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#1F1F1F] text-sm">
                          {apt.doctor_name || 'Assigned Specialist'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700">
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6E84] mt-0.5">
                        {apt.department || 'General Medicine'} • {apt.appointment_date} ({apt.appointment_time || 'OPD Slot'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-full bg-[#4C5BBD] text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
                      <span>View OPD Queue</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-3">
                <CalendarX className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No appointment bookings found in database.</p>
                <button
                  onClick={() => navigate('/doctors')}
                  className="px-4 py-2 rounded-full bg-[#4C5BBD] text-white text-xs font-bold border-0 cursor-pointer"
                >
                  Find Doctors & Book
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Connected Bottom-Sheet Edit Profile Modal */}
      <PatientProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

    </div>
  );
};

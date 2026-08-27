import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, ShieldCheck, Heart, FileText, Calendar, Activity, ArrowRight, Edit3, X, Save } from 'lucide-react';

export const PatientProfilePage = () => {
  const { patientUser, updatePatientUser } = useAuth();
  const { appointments } = useQueue();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: patientUser.name || '',
    email: patientUser.email || '',
    phone: patientUser.phone || '',
    bloodGroup: patientUser.bloodGroup || 'O positive (O+)',
    address: patientUser.address || '',
    emergencyContact: patientUser.emergencyContact || '',
  });

  const scheduledCount = appointments.filter((a) => a.status === 'Scheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updatePatientUser(formData);
    showToast('Patient profile updated successfully!', 'success');
    setIsEditModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-0 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={patientUser.avatar}
              alt={patientUser.name}
              className="w-28 h-28 rounded-3xl object-cover border-0 shadow-xs shrink-0"
            />

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] shadow-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>Patient Account</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Medical Record</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] font-heading tracking-wide">
                {patientUser.name}
              </h1>
              <p className="text-xs text-[#6B6E84] font-medium font-secondary">{patientUser.email}</p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#6B6E84]">
                <div className="flex items-center gap-1.5 font-bold font-secondary text-[#1F1F1F]">
                  <Phone className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>{patientUser.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: patientUser.name || '',
                email: patientUser.email || '',
                phone: patientUser.phone || '',
                bloodGroup: patientUser.bloodGroup || 'O positive (O+)',
                address: patientUser.address || '',
                emergencyContact: patientUser.emergencyContact || '',
              });
              setIsEditModalOpen(true);
            }}
            style={{ outline: 'none' }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white text-[#4C5BBD] text-xs font-bold font-secondary transition-all shadow-xs border-0 shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Patient Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-center">
            <p className="text-[10px] font-bold text-[#6B6E84] uppercase font-secondary">Scheduled OPD</p>
            <p className="text-base font-black text-[#4C5BBD] font-sans mt-0.5">{scheduledCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-center">
            <p className="text-[10px] font-bold text-[#6B6E84] uppercase font-secondary">Visits Completed</p>
            <p className="text-base font-black text-emerald-600 font-sans mt-0.5">{completedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-center">
            <p className="text-[10px] font-bold text-[#6B6E84] uppercase font-secondary">Blood Group</p>
            <p className="text-base font-black text-[#1F1F1F] font-sans mt-0.5">{patientUser.bloodGroup || 'O+'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs text-center">
            <p className="text-[10px] font-bold text-[#6B6E84] uppercase font-secondary">Primary Hospital</p>
            <p className="text-base font-black text-[#1F1F1F] font-sans mt-0.5">Apollo OPD</p>
          </div>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal & Emergency Details */}
        <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4 font-sans">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#4C5BBD]" />
              <span>Personal & Emergency Details</span>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] font-bold text-[#4C5BBD] hover:underline font-secondary"
            >
              Update
            </button>
          </h3>

          <div className="space-y-3 text-xs font-secondary">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Primary Address</span>
              <p className="font-bold text-[#1F1F1F]">{patientUser.address}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Emergency Contact</span>
              <p className="font-bold text-[#1F1F1F]">{patientUser.emergencyContact}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Medical Insurance</span>
              <p className="font-bold text-[#1F1F1F]">Star Health Comprehensive Care Policy (#ST-88902)</p>
            </div>
          </div>
        </div>

        {/* Recent Medical Records & Consultations */}
        <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4 font-sans">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4C5BBD]" />
              <span>Active Consultations</span>
            </div>
            <button
              onClick={() => navigate('/doctors')}
              className="text-[11px] font-bold text-[#4C5BBD] hover:underline font-secondary"
            >
              Book New
            </button>
          </h3>

          <div className="space-y-2.5">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => navigate(`/patients/live-queue/${apt.id}`)}
                className="p-3 rounded-2xl bg-[#F8FAFE] border-0 hover:bg-[#F2F5FF] cursor-pointer transition-all shadow-xs flex items-center justify-between gap-3 font-secondary"
              >
                <div>
                  <span className="text-[10px] font-sans font-black text-[#4C5BBD] bg-white px-2 py-0.5 rounded-md shadow-xs">
                    {apt.token_number}
                  </span>
                  <h4 className="text-xs font-bold text-[#1F1F1F] mt-1">{apt.doctor_name}</h4>
                  <p className="text-[10px] text-[#6B6E84]">{apt.specialty} • {apt.time}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#4C5BBD] shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Profile Modal Overlay (Rendered via React Portal onto document.body) */}
      {isEditModalOpen && createPortal(
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[999999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-[#1F1F1F] rounded-3xl p-6 sm:p-8 shadow-2xl border-0 w-full max-w-lg space-y-5 font-sans animate-fade-in relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#F2F5FF] text-[#4C5BBD]">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-[#1F1F1F] font-heading">
                  Edit Patient Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ outline: 'none' }}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-secondary">
              <div className="space-y-1">
                <label className="font-bold text-[#6B6E84] uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ outline: 'none' }}
                  className="w-full p-3 rounded-2xl bg-[#F8FAFE] border-0 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#6B6E84] uppercase text-[10px]">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{ outline: 'none' }}
                    className="w-full p-3 rounded-2xl bg-[#F8FAFE] border-0 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#6B6E84] uppercase text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    style={{ outline: 'none' }}
                    className="w-full p-3 rounded-2xl bg-[#F8FAFE] border-0 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#6B6E84] uppercase text-[10px]">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  style={{ outline: 'none' }}
                  className="w-full p-3 rounded-2xl bg-[#F8FAFE] border-0 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                >
                  <option value="O positive (O+)">O positive (O+)</option>
                  <option value="A positive (A+)">A positive (A+)</option>
                  <option value="B positive (B+)">B positive (B+)</option>
                  <option value="AB positive (AB+)">AB positive (AB+)</option>
                  <option value="O negative (O-)">O negative (O-)</option>
                  <option value="A negative (A-)">A negative (A-)</option>
                  <option value="B negative (B-)">B negative (B-)</option>
                  <option value="AB negative (AB-)">AB negative (AB-)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#6B6E84] uppercase text-[10px]">Primary Address</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{ outline: 'none' }}
                  className="w-full p-3 rounded-2xl bg-[#F8FAFE] border-0 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#6B6E84] uppercase text-[10px]">Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  style={{ outline: 'none' }}
                  className="w-full p-3 rounded-2xl bg-[#F8FAFE] border-0 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                />
              </div>

              {/* Form Controls */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ outline: 'none' }}
                  className="px-5 py-2.5 rounded-full bg-[#F2F5FF] text-[#4C5BBD] font-bold text-xs hover:bg-slate-200 transition-colors border-0"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{ outline: 'none' }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white font-black text-xs shadow-xs transition-all border-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Updates</span>
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

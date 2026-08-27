import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Mail,
  Lock,
  User,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Phone,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { HealFlowLogo } from '../components/common/HealFlowLogo';
import { HealFlowIcon } from '../components/common/HealFlowIcon';
import { MOCK_DOCTORS } from '../utils/mockData';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState(() => (location.pathname === '/register' ? 'register' : 'login'));
  
  // Portal: 'patient' or 'doctor'
  const [portalType, setPortalType] = useState('patient');
  
  // Form fields
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [selectedDoctorId, setSelectedDoctorId] = useState(MOCK_DOCTORS[0].id);
  const [email, setEmail] = useState('rahul.sharma@healflow.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('••••••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••••••');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (portalType === 'doctor') {
        login('doctor', selectedDoctorId);
        navigate('/doctor-dashboard');
      } else {
        login('patient');
        navigate('/patient-dashboard');
      }
      setLoading(false);
    }, 500);
  };

  const handleDemoPatient = () => {
    login('patient');
    navigate('/patients/dashboard');
  };

  const handleDemoDoctor = () => {
    login('doctor', MOCK_DOCTORS[0].id);
    navigate('/doctor-dashboard');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#EBF1FF] font-sans flex flex-col justify-between p-4 sm:p-6 text-[#1F1F1F]">
      
      {/* 1. Header (Borderless & Shadowless) */}
      <header className="shrink-0 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group outline-none" style={{ outline: 'none' }}>
          <HealFlowLogo height={32} />
        </Link>

        <Link
          to="/"
          style={{ outline: 'none' }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#6B6E84] hover:text-[#4C5BBD] border-0 text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* 2. Main Authentication Card (Borderless) */}
      <main className="flex-1 flex items-center justify-center min-h-0 py-2">
        <div className="w-full max-w-lg max-h-full bg-white border-0 shadow-xs rounded-3xl p-6 sm:p-8 flex flex-col overflow-hidden">
          
          {/* Card Top: Auth Mode & Role Switcher */}
          <div className="shrink-0 space-y-4 pb-4 border-0">
            
            {/* Mode Switcher Pills (Sign In vs Register) */}
            <div className="p-1 bg-[#F8FAFE] border-0 rounded-full flex items-center gap-1 max-w-xs mx-auto shadow-xs">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                style={{ outline: 'none' }}
                className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all border-0 ${
                  authMode === 'login'
                    ? 'bg-[#4C5BBD] text-white shadow-xs'
                    : 'text-[#6B6E84] hover:text-[#1F1F1F]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                style={{ outline: 'none' }}
                className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all border-0 ${
                  authMode === 'register'
                    ? 'bg-[#4C5BBD] text-white shadow-xs'
                    : 'text-[#6B6E84] hover:text-[#1F1F1F]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Header Titles */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#1F1F1F] font-heading tracking-wide">
                {authMode === 'login' ? 'Welcome Back to HealFlow' : 'Create Your Health Account'}
              </h2>
              <p className="text-xs text-[#6B6E84] font-medium">
                {authMode === 'login'
                  ? 'Access live OPD queue tokens, consultations, and medical records.'
                  : 'Join thousands saving hours on hospital OPD visits every week.'}
              </p>
            </div>

            {/* Role Switcher Pills (Patient vs Doctor) */}
            <div className="p-1 bg-[#F8FAFE] border-0 rounded-full flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setPortalType('patient')}
                style={{ outline: 'none' }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-bold transition-all border-0 ${
                  portalType === 'patient'
                    ? 'bg-white text-[#4C5BBD] shadow-xs'
                    : 'text-[#6B6E84] hover:text-[#1F1F1F]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#4C5BBD]" />
                <span>Patient Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalType('doctor')}
                style={{ outline: 'none' }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-bold transition-all border-0 ${
                  portalType === 'doctor'
                    ? 'bg-[#161B33] text-white shadow-xs'
                    : 'text-[#6B6E84] hover:text-[#1F1F1F]'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal</span>
              </button>
            </div>
          </div>

          {/* Form Content Area (Borderless Inputs) */}
          <div className="flex-1 overflow-y-auto py-3 px-1 space-y-3.5 text-left no-scrollbar">
            <form id="auth-form" onSubmit={handleSubmit} className="space-y-3.5">
              
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#4C5BBD] absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Rahul Sharma"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFE] border-0 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                    />
                  </div>
                </div>
              )}

              {portalType === 'doctor' && authMode === 'login' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider">Select Doctor Profile</label>
                  <div className="relative flex items-center">
                    <Stethoscope className="w-4 h-4 text-[#4C5BBD] absolute left-4 pointer-events-none" />
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFE] border-0 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                    >
                      {MOCK_DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {portalType === 'doctor' && authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider">Medical Specialty</label>
                  <div className="relative flex items-center">
                    <Stethoscope className="w-4 h-4 text-[#4C5BBD] absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Cardiology / Pediatrics"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFE] border-0 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#4C5BBD] absolute left-4 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul.sharma@healflow.in"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFE] border-0 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-[#4C5BBD] absolute left-4 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFE] border-0 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#4C5BBD] absolute left-4 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFE] border-0 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#6B6E84] tracking-wider">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#4C5BBD] absolute left-4 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      style={{ outline: 'none' }}
                      className="w-full bg-[#F8FAFE] border-0 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[#1F1F1F] focus:bg-white shadow-xs transition-all"
                    />
                  </div>
                </div>
              )}

              {authMode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <label className="inline-flex items-center gap-2 text-[#6B6E84] cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-3.5 h-3.5 rounded text-[#4C5BBD] accent-[#4C5BBD] border-0"
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="text-[#4C5BBD] font-bold hover:underline">
                    Forgot Password?
                  </a>
                </div>
              )}
            </form>
          </div>

          {/* Card Bottom: Submit & Fast Demo Access Buttons */}
          <div className="shrink-0 pt-3 border-0 space-y-3">
            <button
              form="auth-form"
              type="submit"
              disabled={loading}
              style={{ outline: 'none' }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs font-black shadow-xs transition-all border-0 disabled:opacity-50 ${
                portalType === 'doctor'
                  ? 'bg-[#161B33] text-white hover:bg-slate-800'
                  : 'bg-[#4C5BBD] text-white hover:bg-[#3B489E]'
              }`}
            >
              <span>
                {authMode === 'login'
                  ? `Sign In to ${portalType === 'doctor' ? 'Doctor Portal' : 'Patient Account'}`
                  : `Create ${portalType === 'doctor' ? 'Doctor' : 'Patient'} Account`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Access Pills */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDemoPatient}
                style={{ outline: 'none' }}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-[#F2F5FF] text-[#4C5BBD] text-xs font-bold hover:bg-[#4C5BBD] hover:text-white transition-all border-0 shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient Demo</span>
              </button>

              <button
                type="button"
                onClick={handleDemoDoctor}
                style={{ outline: 'none' }}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-[#161B33] text-white text-xs font-bold hover:bg-slate-800 transition-all border-0 shadow-xs"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Demo</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* 3. Security Footer */}
      <footer className="shrink-0 text-center text-xs text-[#6B6E84] py-1 flex items-center justify-center gap-1.5 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-[#4C5BBD]" />
        <span>256-Bit SSL Encrypted & HIPAA Compliant Data Protection</span>
      </footer>

    </div>
  );
};

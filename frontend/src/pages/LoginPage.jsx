import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
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
} from 'lucide-react';
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
  const [fullName, setFullName] = useState('Alex Morgan');
  const [selectedDoctorId, setSelectedDoctorId] = useState(MOCK_DOCTORS[0].id);
  const [email, setEmail] = useState('alex.morgan@healflow.health');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
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
    navigate('/patient-dashboard');
  };

  const handleDemoDoctor = () => {
    login('doctor', MOCK_DOCTORS[0].id);
    navigate('/doctor-dashboard');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-[#F2F5FF] via-white to-[#F8FAFE] font-sans flex flex-col justify-between p-4 sm:p-6 text-[#1F1F1F]">
      
      {/* 1. Fixed Header (No outer scroll) */}
      <header className="shrink-0 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-[#5B81FA] flex items-center justify-center text-white shadow-material-1 group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg tracking-tight text-[#1F1F1F] font-heading">Heal</span>
              <span className="font-extrabold text-lg text-[#5B81FA] font-heading">Flow</span>
            </div>
          </div>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#6B6E84] hover:text-[#5B81FA] border border-[#CEDEFF] text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* 2. Middle Container - Fits inside height */}
      <main className="flex-1 flex items-center justify-center min-h-0 py-2">
        <div className="w-full max-w-lg max-h-full bg-white border border-[#CEDEFF] shadow-card-hover rounded-3xl p-6 sm:p-8 flex flex-col overflow-hidden">
          
          {/* Fixed Card Top: Mode Switcher & Title */}
          <div className="shrink-0 space-y-4 pb-4 border-b border-slate-100">
            {/* Mode Switcher */}
            <div className="p-1 bg-[#F2F5FF] border border-[#CEDEFF] rounded-full flex items-center gap-1 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                  authMode === 'login'
                    ? 'bg-[#5B81FA] text-white shadow-material-1'
                    : 'text-[#6B6E84] hover:text-[#1F1F1F]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                  authMode === 'register'
                    ? 'bg-[#5B81FA] text-white shadow-material-1'
                    : 'text-[#6B6E84] hover:text-[#1F1F1F]'
                }`}
              >
                Register
              </button>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#1F1F1F] font-heading tracking-tight">
                {authMode === 'login' ? 'Welcome Back to HealFlow' : 'Create Your Account'}
              </h2>
              <p className="text-[11px] text-[#6B6E84]">
                {authMode === 'login'
                  ? 'Access your appointment tokens and live queue history.'
                  : 'Join thousands saving hours on hospital OPD visits every week.'}
              </p>
            </div>

            {/* Patient vs Doctor Sub-Toggle */}
            <div className="p-1 bg-[#F2F5FF] border border-[#CEDEFF] rounded-full flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPortalType('patient')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                  portalType === 'patient'
                    ? 'bg-white text-[#5B81FA] border border-[#CEDEFF] shadow-sm'
                    : 'text-[#6B6E84] hover:text-[#1F1F1F]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#5B81FA]" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalType('doctor')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                  portalType === 'doctor'
                    ? 'bg-[#29318A] text-white shadow-sm'
                    : 'text-[#6B6E84] hover:text-[#1F1F1F]'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal</span>
              </button>
            </div>
          </div>

          {/* Hidden Scrollbar Form Container */}
          <div className="flex-1 overflow-y-auto py-4 px-1 space-y-3.5 text-left no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <form id="auth-form" onSubmit={handleSubmit} className="space-y-3.5">
              
              {authMode === 'register' && (
                <Input
                  label="Full Name"
                  type="text"
                  icon={User}
                  pill
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                />
              )}

              {portalType === 'doctor' && authMode === 'login' && (
                <Select
                  label="Select Doctor Profile"
                  icon={Stethoscope}
                  pill
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  options={MOCK_DOCTORS.map((d) => ({
                    value: d.id,
                    label: `${d.name} (${d.specialty})`,
                  }))}
                />
              )}

              {portalType === 'doctor' && authMode === 'register' && (
                <Input
                  label="Medical Specialty"
                  type="text"
                  icon={Stethoscope}
                  pill
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Cardiology / Pediatrics"
                  required
                />
              )}

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                pill
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@healflow.health"
                required
              />

              {authMode === 'register' && (
                <Input
                  label="Phone Number"
                  type="tel"
                  icon={Phone}
                  pill
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  required
                />
              )}

              <Input
                label="Password"
                type="password"
                icon={Lock}
                pill
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />

              {authMode === 'register' && (
                <Input
                  label="Confirm Password"
                  type="password"
                  icon={Lock}
                  pill
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              )}

              {authMode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <label className="inline-flex items-center gap-2 text-[#6B6E84] cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-3.5 h-3.5 rounded text-[#5B81FA] accent-[#5B81FA] border-[#CEDEFF]"
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="text-[#5B81FA] font-bold hover:underline">
                    Forgot Password?
                  </a>
                </div>
              )}
            </form>
          </div>

          {/* Fixed Card Bottom: Submit & Quick Demo Buttons */}
          <div className="shrink-0 pt-3 border-t border-slate-100 space-y-3">
            <Button
              form="auth-form"
              type="submit"
              variant={portalType === 'doctor' ? 'secondary' : 'primary'}
              size="lg"
              pill
              fullWidth
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="py-3 text-xs font-bold shadow-material-2"
            >
              {authMode === 'login'
                ? `Sign In to ${portalType === 'doctor' ? 'Doctor Portal' : 'Patient Account'}`
                : `Create ${portalType === 'doctor' ? 'Doctor Portal' : 'Patient'} Account`}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="soft"
                size="sm"
                pill
                icon={User}
                onClick={handleDemoPatient}
                className="py-1.5 text-[11px] font-bold"
              >
                Patient Demo
              </Button>

              <Button
                variant="outline"
                size="sm"
                pill
                icon={Stethoscope}
                onClick={handleDemoDoctor}
                className="py-1.5 text-[11px] font-bold border-[#CEDEFF] text-[#29318A]"
              >
                Doctor Demo
              </Button>
            </div>
          </div>

        </div>
      </main>

      {/* 3. Fixed Security Footer */}
      <footer className="shrink-0 text-center text-xs text-[#6B6E84] py-1 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#5B81FA]" />
        <span>256-Bit SSL Encrypted & HIPAA Compliant Data Protection</span>
      </footer>

    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Phone,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { HealFlowLogo } from '../components/common/HealFlowLogo';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState(() => (location.pathname === '/register' ? 'register' : 'login'));

  // Active Portal: defaults to clean Patient login
  // Doctor portal is cleanly toggled via bottom link
  const [portalType, setPortalType] = useState('patient');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Switch portals cleanly
  const switchToDoctorPortal = () => {
    setPortalType('doctor');
    setErrorMessage('');
  };

  const switchToPatientPortal = () => {
    setPortalType('patient');
    setErrorMessage('');
  };

  // Form submit for Register & Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (!fullName.trim() || !email.trim() || !password || !phone.trim()) {
          setErrorMessage('Please fill in all registration fields.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          role: portalType,
        });

        localStorage.setItem('healflow_onboarding_completed', 'true');
        if (portalType === 'doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/patients/dashboard');
        }
      } else {
        await login(portalType, email.trim(), password);
        localStorage.setItem('healflow_onboarding_completed', 'true');

        if (portalType === 'doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/patients/dashboard');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = portalType === 'doctor';

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] font-sans flex flex-col justify-between p-4 sm:p-6 text-[#1F1F1F]">
      
      {/* 1. Top Navbar Header */}
      <header className="shrink-0 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 outline-none" style={{ outline: 'none' }}>
          <HealFlowLogo height={32} />
        </Link>

        <Link
          to="/"
          style={{ outline: 'none' }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F2F5FF] text-[#6B6E84] hover:text-[#4C5BBD] text-xs font-bold transition-all shadow-xs border border-slate-200/80"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* 2. Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center py-6 px-2">
        <div className="w-full max-w-md bg-white border border-slate-200/90 shadow-xl rounded-3xl p-6 sm:p-8 flex flex-col transition-all">
          
          {/* Header Title & Portal Indicator */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F2F5FF] text-[#4C5BBD] border border-slate-200/70">
              {isDoctor ? (
                <>
                  <Stethoscope className="w-3 h-3 text-[#4C5BBD]" />
                  <span>Doctor Specialist Console</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-[#4C5BBD]" />
                  <span>Patient Health Portal</span>
                </>
              )}
            </div>

            <h1 className="text-2xl font-black text-[#1F1F1F] font-heading tracking-tight">
              {authMode === 'login'
                ? isDoctor ? 'Doctor Sign In' : 'Patient Sign In'
                : isDoctor ? 'Doctor Registration' : 'Create Patient Account'}
            </h1>
            <p className="text-xs text-[#6B6E84]">
              {authMode === 'login'
                ? isDoctor
                  ? 'Access OPD sequence, consultation charts & patient calls'
                  : 'Track live OPD tokens, view appointments & clinical records'
                : 'Join HealFlow to experience seamless queue care'}
            </p>
          </div>

          {/* Clean Segmented Toggle between Sign In and Create Account */}
          <div className="p-1 bg-[#F8FAFC] border border-slate-200/90 rounded-2xl flex items-center gap-1 mt-5 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              style={{ outline: 'none' }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#4C5BBD] text-white border-[#4C5BBD] shadow-xs'
                  : 'text-[#6B6E84] hover:text-[#1F1F1F] border-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
              }}
              style={{ outline: 'none' }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#4C5BBD] text-white border-[#4C5BBD] shadow-xs'
                  : 'text-[#6B6E84] hover:text-[#1F1F1F] border-transparent'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/70 text-rose-900 text-xs font-medium text-left animate-fade-in space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-950">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Authentication Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-900">{errorMessage}</p>
            </div>
          )}

          {/* Form Area with High-Contrast Bordered Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-5 text-left">
            
            {/* FULL NAME (Registration Only) */}
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-[#1F1F1F] tracking-wider flex items-center justify-between">
                  <span>Full Name</span>
                  <span className="text-rose-500 text-[9px] font-bold">Required</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isDoctor ? 'e.g. Dr. Rajesh Sharma' : 'e.g. Rahul Verma'}
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 border border-slate-200/90 rounded-2xl pl-10 pr-3.5 py-3 text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs transition-all"
                  />
                </div>
              </div>
            )}

            {/* EMAIL ADDRESS */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-[#1F1F1F] tracking-wider flex items-center justify-between">
                <span>{isDoctor ? 'Doctor Email Address' : 'Email Address'}</span>
                <span className="text-rose-500 text-[9px] font-bold">Required</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isDoctor ? 'doctor@hospital.in' : 'patient@example.com'}
                  style={{ outline: 'none' }}
                  className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 border border-slate-200/90 rounded-2xl pl-10 pr-3.5 py-3 text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs transition-all"
                />
              </div>
            </div>

            {/* PHONE NUMBER (Registration Only) */}
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-[#1F1F1F] tracking-wider flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-rose-500 text-[9px] font-bold">Required</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ outline: 'none' }}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 border border-slate-200/90 rounded-2xl pl-10 pr-3.5 py-3 text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs transition-all"
                  />
                </div>
              </div>
            )}

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-[#1F1F1F] tracking-wider flex items-center justify-between">
                <span>Password</span>
                <span className="text-rose-500 text-[9px] font-bold">Required</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#4C5BBD] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'register' ? 'Choose a secure password (min 6 chars)' : 'Enter your account password'}
                  style={{ outline: 'none' }}
                  className="w-full bg-[#F8FAFC] hover:bg-[#F2F5FF] focus:bg-white focus:border-[#4C5BBD] focus:ring-2 focus:ring-[#4C5BBD]/20 border border-slate-200/90 rounded-2xl pl-10 pr-10 py-3 text-xs font-bold text-[#1F1F1F] placeholder-[#8C93A8] shadow-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ outline: 'none' }}
                  className="absolute right-3.5 text-[#6B6E84] hover:text-[#4C5BBD] border-0 bg-transparent p-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{ outline: 'none' }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs font-black bg-[#4C5BBD] hover:bg-[#3B489E] text-white shadow-md transition-all border-0 disabled:opacity-50 mt-2 cursor-pointer active:scale-98"
            >
              <span>
                {loading
                  ? 'Verifying with database...'
                  : authMode === 'login'
                  ? `Sign In as ${isDoctor ? 'Doctor' : 'Patient'}`
                  : `Create ${isDoctor ? 'Doctor' : 'Patient'} Account`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Clean Portal Switcher in Bottom Corner */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#6B6E84] font-medium text-[11px]">
              {isDoctor ? 'Looking for patient appointments?' : 'Are you a licensed doctor or clinic staff?'}
            </span>

            {isDoctor ? (
              <button
                type="button"
                onClick={switchToPatientPortal}
                style={{ outline: 'none' }}
                className="font-bold text-[#4C5BBD] hover:underline border-0 bg-transparent cursor-pointer flex items-center gap-1 text-xs shrink-0"
              >
                <span>Patient Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={switchToDoctorPortal}
                style={{ outline: 'none' }}
                className="font-bold text-[#4C5BBD] hover:underline border-0 bg-transparent cursor-pointer flex items-center gap-1 text-xs shrink-0"
              >
                <span>Doctor Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </main>

      {/* 3. Security Footer */}
      <footer className="shrink-0 text-center text-xs text-[#6B6E84] py-1 flex items-center justify-center gap-1.5 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-[#4C5BBD]" />
        <span>256-Bit SSL Encrypted & HIPAA Compliant Healthcare System</span>
      </footer>

    </div>
  );
};

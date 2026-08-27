import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer } from '../common/Toast';
import { FloatingAICopilot } from '../common/FloatingAICopilot';
import { HealFlowLogo } from '../common/HealFlowLogo';
import { HealFlowIcon } from '../common/HealFlowIcon';
import {
  Activity,
  LayoutDashboard,
  Clock,
  Stethoscope,
  Sparkles,
  Palette,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  User,
} from 'lucide-react';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { isDoctor, activeDoctor, patientUser, logout } = useAuth();

  // Track visited routes in session to enable first-time smooth transition & zero animation afterwards
  const visitedRoutesRef = useRef(new Set());
  const isFirstTimeRouteVisit = !visitedRoutesRef.current.has(location.pathname);

  useEffect(() => {
    if (!visitedRoutesRef.current.has(location.pathname)) {
      visitedRoutesRef.current.add(location.pathname);
    }
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userDisplayName = isDoctor ? activeDoctor?.name : patientUser?.name;
  const userSubTitle = isDoctor ? activeDoctor?.specialty : 'Patient Account';
  const userAvatar = isDoctor ? activeDoctor?.avatar_url : patientUser?.avatar;

  const navLinks = isDoctor
    ? [
        { name: 'Doctor Control Room', path: '/doctor-dashboard', icon: LayoutDashboard },
        { name: 'Patient Queue Telemetry', path: '/live-queue', icon: Clock, badge: 'Live' },
        { name: 'Doctor Directory', path: '/doctors', icon: Stethoscope },
        { name: 'AI Medical Guide', path: '/ai-assistant', icon: Sparkles, badge: 'AI' },
        { name: 'Style Guide', path: '/style-guide', icon: Palette },
      ]
    : [
        { name: 'Patient Dashboard', path: '/patients/dashboard', icon: LayoutDashboard },
        { name: 'Live Queue Status', path: '/patients/live-queue', icon: Clock, badge: 'Live' },
        { name: 'Find & Book Doctors', path: '/doctors', icon: Stethoscope },
        { name: 'AI Specialist Guide', path: '/patients/ai-assistant', icon: Sparkles, badge: 'AI' },
        { name: 'My Profile', path: '/patients/profile', icon: User },
      ];

  // Smart Active Nav Matcher for sub-routes and aliases
  const isLinkActive = (linkPath) => {
    const currentPath = location.pathname;

    if (linkPath === '/patients/dashboard') {
      return currentPath === '/patients/dashboard' || currentPath === '/patient-dashboard';
    }
    if (linkPath === '/patients/live-queue' || linkPath === '/live-queue') {
      return currentPath.startsWith('/patients/live-queue') || currentPath.startsWith('/live-queue');
    }
    if (linkPath === '/doctors') {
      return (
        currentPath.startsWith('/doctors') ||
        currentPath.startsWith('/book-slot') ||
        currentPath.includes('/book')
      );
    }
    if (linkPath === '/patients/ai-assistant' || linkPath === '/ai-assistant') {
      return currentPath.startsWith('/patients/ai-assistant') || currentPath.startsWith('/ai-assistant');
    }
    if (linkPath === '/patients/profile') {
      return currentPath === '/patients/profile';
    }
    if (linkPath === '/doctor-dashboard') {
      return currentPath === '/doctor-dashboard';
    }

    return currentPath === linkPath;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#EBF1FF] font-sans text-[#1F1F1F]">
      
      {/* 1. Borderless & Shadowless Indigo Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#4C5BBD] text-white border-0 border-none shadow-none flex flex-col justify-between p-4 transition-transform duration-300 md:static md:translate-x-0 shrink-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link
              to={isDoctor ? "/doctor-dashboard" : "/patients/dashboard"}
              className="flex items-center gap-3 group outline-none focus:outline-none"
              style={{ outline: 'none' }}
            >
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center p-2 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <HealFlowIcon variant="dark" className="w-full h-full" />
              </div>

              <div>
                <div className="flex items-center gap-1 font-heading font-black text-lg text-white tracking-wide">
                  <span>HEAL</span>
                  <span className="text-[#CEDEFF]">FLOW</span>
                </div>
                <p className="text-[9px] text-[#CEDEFF]/80 font-bold uppercase tracking-wider">
                  {isDoctor ? 'Doctor Workspace' : 'Patient Portal'}
                </p>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-full text-[#CEDEFF] hover:bg-white/10 outline-none focus:outline-none"
              style={{ outline: 'none' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Block inside Sidebar */}
          <Link
            to={isDoctor ? '/doctor-dashboard' : '/patients/profile'}
            className="p-3.5 bg-white/10 border-0 rounded-2xl flex items-center gap-3 hover:bg-white/20 transition-colors block"
            style={{ outline: 'none' }}
          >
            <img
              src={userAvatar}
              alt={userDisplayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shrink-0"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-black text-white font-heading truncate">
                {userDisplayName}
              </h4>
              <p className="text-[10px] text-[#CEDEFF] font-semibold truncate">
                {userSubTitle}
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#CEDEFF]/70 px-3 mb-2">
              Workspace Menu
            </p>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{ outline: 'none' }}
                  className={`flex items-center justify-between text-xs font-bold transition-all duration-200 outline-none focus:outline-none ${
                    active
                      ? 'bg-[#EBF1FF] text-[#4C5BBD] font-black rounded-l-full shadow-none ml-3 -mr-4 pl-4 pr-5 py-3 font-heading'
                      : 'text-[#CEDEFF] hover:text-white hover:bg-white/10 rounded-2xl px-3.5 py-3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#4C5BBD]' : 'text-[#CEDEFF]'}`} />
                    <span>{link.name}</span>
                  </div>

                  {link.badge && (
                    <span
                      className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full ${
                        active ? 'bg-[#4C5BBD] text-white' : 'bg-white/20 text-white'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/15 space-y-2 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            style={{ outline: 'none' }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-xs font-bold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border-0 transition-colors outline-none focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#CEDEFF]/80 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        ></div>
      )}

      {/* 2. Main Workspace Canvas (#EBF1FF) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#EBF1FF]">
        
        {/* Main Scrollable Canvas (Uniform X-Axis Padding Across All Pages) */}
        <main className="flex-1 overflow-y-auto pt-0 px-4 sm:px-6 pb-8 no-scrollbar">
          
          {/* Topbar Header (Uniform Max-Width & Padding Alignment) */}
          <div className="max-w-6xl mx-auto">
            <header className="bg-white text-[#161B33] rounded-b-3xl rounded-t-none px-4 sm:px-6 py-3.5 mb-6 border-0 border-none shadow-xs flex items-center justify-between gap-2.5 mt-0">
              
              {/* Left: Mobile Toggle & Page Greeting */}
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  style={{ outline: 'none' }}
                  className="md:hidden p-2 rounded-full text-[#161B33] bg-[#F2F5FF] border-0 hover:bg-slate-200 shadow-xs outline-none focus:outline-none shrink-0"
                >
                  <Menu className="w-4.5 h-4.5" />
                </button>

                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="text-sm sm:text-lg font-black text-[#161B33] font-heading tracking-wide truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                    {isDoctor ? `Dr. ${activeDoctor.name.split(' ').slice(-1)[0]}` : `Welcome, ${patientUser.name}`}
                  </h3>
                  <p className="text-[11px] text-[#4C5BBD] font-semibold hidden md:block leading-tight">
                    {isDoctor ? 'Live OPD Queue & Patient Telemetry' : 'Manage appointments & real-time OPD queue tokens'}
                  </p>
                </div>
              </div>

              {/* Center & Right: Search Bar, Live Token, Bell, Profile */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <form
                  onSubmit={handleSearchSubmit}
                  className="hidden lg:flex items-center relative w-56"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    style={{ outline: 'none', boxShadow: 'none' }}
                    className="w-full bg-[#F2F5FF] border-0 focus:bg-white text-xs text-[#161B33] placeholder-[#A8B1CE] rounded-full pl-4 pr-10 py-2 outline-none focus:outline-none focus:ring-0 focus:border-0 font-medium transition-all shadow-xs"
                  />
                  <button
                    type="submit"
                    style={{ outline: 'none' }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#4C5BBD] text-white flex items-center justify-center shadow-xs outline-none focus:outline-none"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Live Queue Token Badge */}
                <Link
                  to="/patients/live-queue"
                  style={{ outline: 'none' }}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#F2F5FF] border-0 hover:bg-white text-xs font-bold transition-all shadow-xs outline-none focus:outline-none"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="text-[10px] text-[#6B6E84] hidden md:inline">Token:</span>
                  <span className="font-sans text-[#4C5BBD] font-black text-xs tracking-wide">CARD-007</span>
                </Link>

                {/* Notification Bell */}
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    style={{ outline: 'none' }}
                    className="p-2 sm:p-2.5 rounded-full bg-[#F2F5FF] text-[#6B6E84] hover:text-[#4C5BBD] transition-colors relative border-0 shadow-xs outline-none focus:outline-none"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4C5BBD]"></span>
                  </button>

                  {showNotifications && (
                    <>
                      <div
                        onClick={() => setShowNotifications(false)}
                        className="fixed inset-0 z-40 bg-black/60"
                      ></div>
                      <div className="absolute right-0 mt-2 w-72 bg-white text-[#161B33] rounded-2xl border-0 shadow-xl p-4 z-50 text-xs space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-bold text-[#161B33]">Queue Alerts</span>
                          <span className="text-[10px] font-bold text-[#4C5BBD] uppercase">1 New</span>
                        </div>
                        <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#F8FAFE] border-0 shadow-xs">
                          <Clock className="w-4 h-4 text-[#4C5BBD] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-[#161B33]">Your Turn Approaching</p>
                            <p className="text-[11px] text-[#6B6E84]">3 patients ahead for Dr. Rajesh Sharma (Room 302).</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* User Profile Avatar */}
                <Link
                  to={isDoctor ? '/doctor-dashboard' : '/patients/profile'}
                  className="flex items-center pl-1 sm:pl-2 shrink-0"
                >
                  <img
                    src={userAvatar}
                    alt={userDisplayName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-0 shadow-xs hover:scale-105 transition-transform"
                  />
                </Link>
              </div>

            </header>
          </div>

          {/* Route Page Content */}
          <div
            key={location.pathname}
            className={isFirstTimeRouteVisit ? 'animate-fade-in transition-opacity duration-300' : 'transition-none'}
          >
            <Outlet />
          </div>
        </main>
        
        <FloatingAICopilot />
        <ToastContainer />
      </div>

    </div>
  );
};

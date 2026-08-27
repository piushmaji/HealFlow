import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcher } from '../common/RoleSwitcher';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, patientUser, activeDoctor, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  // Clean 4 standard Nav Links as requested by user
  const publicNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/doctors' },
    { name: 'Services', path: '/live-queue' },
    { name: 'Contact Us', path: '/ai-assistant' },
    { name: 'Style Guide', path: '/style-guide' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userDisplayName = role === 'doctor' ? activeDoctor?.name : patientUser?.name;
  const userAvatar = role === 'doctor' ? activeDoctor?.avatar_url : patientUser?.avatar;
  const dashboardPath = role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#CEDEFF] text-[#1F1F1F] shadow-sm font-sans transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#5B81FA] flex items-center justify-center text-white shadow-material-1 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black text-xl tracking-tight text-[#1F1F1F] font-heading">Heal</span>
                <span className="font-extrabold text-xl text-[#5B81FA] font-heading">Flow</span>
                <span className="flex h-2 w-2 relative ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B81FA] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5B81FA]"></span>
                </span>
              </div>
              <p className="text-[9px] text-[#6B6E84] font-bold tracking-wider uppercase hidden sm:block">
                Care That Flows
              </p>
            </div>
          </Link>

          {/* Clean 4 Standard Nav Links (No Clutter, No Badges) */}
          <nav className="hidden md:flex items-center gap-2">
            {publicNavLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#5B81FA] text-white shadow-sm'
                      : 'text-[#6B6E84] hover:text-[#1F1F1F] hover:bg-[#F2F5FF]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons: Log In & Get Started */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1F1F1F] border border-[#CEDEFF] hover:border-[#5B81FA] text-xs font-bold transition-all hover:bg-[#F2F5FF]"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#5B81FA]" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#5B81FA] hover:bg-[#486de8] text-white text-xs font-bold transition-all shadow-material-2 hover:shadow-card-hover"
                >
                  <span>Get Started</span>
                </Link>
              </>
            ) : (
              <>
                <RoleSwitcher />

                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F2F5FF] border border-[#CEDEFF] hover:border-[#5B81FA] transition-all"
                >
                  <img
                    src={userAvatar}
                    alt={userDisplayName}
                    className="w-7 h-7 rounded-full object-cover border border-[#5B81FA]"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1F1F1F] leading-tight font-heading">
                      {userDisplayName}
                    </p>
                    <p className="text-[9px] text-[#5B81FA] font-extrabold uppercase">
                      {role === 'doctor' ? 'Doctor Portal' : 'Patient Dashboard'}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[#6B6E84] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Drawer Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full bg-[#5B81FA] text-white text-xs font-bold"
              >
                Log In
              </Link>
            ) : (
              <RoleSwitcher />
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#6B6E84] hover:bg-[#F2F5FF] border border-[#CEDEFF]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#CEDEFF] px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F2F5FF] border border-[#CEDEFF]">
              <img src={userAvatar} alt={userDisplayName} className="w-10 h-10 rounded-full object-cover border border-[#5B81FA]" />
              <div className="flex-grow">
                <p className="text-xs font-bold text-[#1F1F1F]">{userDisplayName}</p>
                <p className="text-[10px] text-[#5B81FA] font-extrabold uppercase">{role === 'doctor' ? 'Doctor' : 'Patient'}</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-full text-rose-500 hover:bg-rose-100">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {publicNavLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold ${
                    active ? 'bg-[#5B81FA] text-white' : 'text-[#6B6E84] hover:bg-[#F2F5FF]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1F1F1F] border border-[#CEDEFF] text-xs font-bold"
                >
                  <LogIn className="w-4 h-4 text-[#5B81FA]" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#5B81FA] text-white text-xs font-bold shadow-material-2"
                >
                  <span>Get Started</span>
                </Link>
              </div>
            ) : (
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 mt-2 px-5 py-3 rounded-full bg-[#5B81FA] text-white text-xs font-bold shadow-material-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to {role === 'doctor' ? 'Doctor Portal' : 'Patient Dashboard'}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

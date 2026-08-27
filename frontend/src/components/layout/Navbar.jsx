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
import { HealFlowLogo } from '../common/HealFlowLogo';
import { HealFlowIcon } from '../common/HealFlowIcon';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, patientUser, activeDoctor, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  // Clean 4 standard Nav Links
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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-0 text-[#1F1F1F] shadow-xs font-sans transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0 outline-none" style={{ outline: 'none' }}>
            <HealFlowIcon variant="dark" size={30} className="shrink-0 group-hover:scale-105 transition-transform" />

            <div>
              <div className="flex items-center gap-1 font-heading font-black text-xl text-[#1F1F1F] tracking-wide">
                <span>HEAL</span>
                <span className="text-[#5B81FA]">FLOW</span>
              </div>
              <p className="text-[9px] text-[#6B6E84] font-bold tracking-wider uppercase hidden sm:block">
                Care That Flows
              </p>
            </div>
          </Link>

          {/* Clean Standard Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            {publicNavLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-0 ${
                    active
                      ? 'bg-[#5B81FA] text-white shadow-xs'
                      : 'text-[#6B6E84] hover:text-[#1F1F1F] hover:bg-[#F2F5FF]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  style={{ outline: 'none' }}
                  className="flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#F8FAFE] text-[#1F1F1F] hover:bg-[#F2F5FF] text-xs font-bold transition-all border-0 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#5B81FA]" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/login"
                  style={{ outline: 'none' }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#5B81FA] hover:bg-[#486de8] text-white text-xs font-bold transition-all border-0 shadow-xs"
                >
                  <span>Get Started</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={dashboardPath}
                  style={{ outline: 'none' }}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F8FAFE] border-0 hover:bg-[#F2F5FF] transition-all shadow-xs"
                >
                  <img
                    src={userAvatar}
                    alt={userDisplayName}
                    className="w-7 h-7 rounded-full object-cover border-0"
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
                  style={{ outline: 'none' }}
                  className="p-2 rounded-full text-[#6B6E84] hover:text-rose-600 hover:bg-rose-50 transition-colors border-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full bg-[#5B81FA] text-white text-xs font-bold border-0 shadow-xs"
              >
                Log In
              </Link>
            ) : null}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ outline: 'none' }}
              className="p-2 rounded-full text-[#6B6E84] hover:bg-[#F2F5FF] border-0 shadow-xs"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-0 px-4 pt-3 pb-6 space-y-3 shadow-xs">
          <div className="flex flex-col gap-1.5">
            {publicNavLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold border-0 ${
                    active ? 'bg-[#5B81FA] text-white' : 'text-[#6B6E84] hover:bg-[#F2F5FF]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

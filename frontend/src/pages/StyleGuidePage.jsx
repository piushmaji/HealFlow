import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { DoctorCard } from '../components/ui/DoctorCard';
import { MedicineCard } from '../components/ui/MedicineCard';
import { CalendarPickerCard } from '../components/ui/CalendarPickerCard';
import { DistanceSliderCard } from '../components/ui/DistanceSliderCard';
import { ChatCard } from '../components/ui/ChatCard';
import { MedicalCenterCard } from '../components/ui/MedicalCenterCard';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  Calendar,
  MessageSquare,
  Sliders,
  Bell,
  User,
} from 'lucide-react';

export const StyleGuidePage = () => {
  const [copiedColor, setCopiedColor] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [toggleState1, setToggleState1] = useState(true);
  const [radioValue, setRadioValue] = useState('option1');
  const [checkboxValue, setCheckboxValue] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Specialties');

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colors = [
    { name: 'Primary Blue', hex: '#5B81FA', role: 'Main CTAs, Active States, Highlights', class: 'bg-[#5B81FA] text-white' },
    { name: 'Secondary Navy', hex: '#29318A', role: 'Dark Buttons, Headers, Footers', class: 'bg-[#29318A] text-white' },
    { name: 'Border & Divider', hex: '#CEDEFF', role: 'Soft Borders, Card Dividers', class: 'bg-[#CEDEFF] text-[#1F1F1F]' },
    { name: 'Surface Tint', hex: '#F2F5FF', role: 'Card Backgrounds, Light Chips', class: 'bg-[#F2F5FF] text-[#1F1F1F]' },
    { name: 'Charcoal Text', hex: '#1F1F1F', role: 'Primary Typography, Headings', class: 'bg-[#1F1F1F] text-white' },
    { name: 'Muted Slate', hex: '#6B6E84', role: 'Subtitles, Helper Text, Icons', class: 'bg-[#6B6E84] text-white' },
    { name: 'Clean Surface', hex: '#FFFFFF', role: 'Base Backgrounds, Inputs', class: 'bg-white text-[#1F1F1F] border border-[#CEDEFF]' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFE] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Main Style Guide Specimen Banner Header */}
        <header className="text-center space-y-3 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Visual Solution</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#1F1F1F] font-heading tracking-tight">
            Style Guide
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6E84] leading-relaxed max-w-2xl mx-auto">
            Visual style is an essential part of a project as it helps create a standardized system of colors, text, layout, buttons, text input, and many other components that will be combined and displayed on user screens.
          </p>
        </header>

        {/* 1. Typography Section - Updated to Kind Sans */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#CEDEFF] shadow-card space-y-8">
          <div>
            <span className="text-xs font-extrabold text-[#5B81FA] uppercase tracking-wider">01 / Font System</span>
            <h2 className="text-2xl font-bold text-[#1F1F1F] font-heading mt-1">Typography (Kind Sans)</h2>
            <p className="text-xs text-[#6B6E84] mt-1 max-w-2xl">
              Kind Sans is our primary geometric sans-serif typeface used across HealFlow. The friendly, precise design of the characters ensures legibility across mobile screens, dashboard cards, and body text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#F2F5FF] p-6 sm:p-8 rounded-2xl border border-[#CEDEFF]">
            {/* Big Specimen Symbol */}
            <div className="md:col-span-4 flex items-center justify-center gap-4 border-b md:border-b-0 md:border-r border-[#CEDEFF] pb-6 md:pb-0 md:pr-6">
              <div className="relative">
                <span className="text-7xl font-black text-[#1F1F1F] tracking-tighter">Aa</span>
                <span className="absolute -bottom-1 -left-2 w-6 h-6 rounded-full bg-[#5B81FA] flex items-center justify-center text-white text-[10px] font-bold">
                  ✓
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1F1F1F] font-heading">Kind Sans</h3>
                <p className="text-xs text-[#6B6E84]">Primary Font Family</p>
              </div>
            </div>

            {/* Weights & Specimens */}
            <div className="md:col-span-8 space-y-4 text-xs font-sans">
              <div className="flex items-center gap-4">
                <span className="w-24 font-normal text-[#6B6E84]">Regular (400)</span>
                <span className="font-normal text-[#1F1F1F] text-sm tracking-wide">
                  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                </span>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-200 pt-3">
                <span className="w-24 font-medium text-[#6B6E84]">Medium (500)</span>
                <span className="font-medium text-[#1F1F1F] text-sm tracking-wide">
                  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                </span>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-200 pt-3">
                <span className="w-24 font-bold text-[#6B6E84]">Bold (700)</span>
                <span className="font-bold text-[#1F1F1F] text-sm tracking-wide font-heading">
                  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Color Palette Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#CEDEFF] shadow-card space-y-8">
          <div>
            <span className="text-xs font-extrabold text-[#5B81FA] uppercase tracking-wider">02 / Theme Palette</span>
            <h2 className="text-2xl font-bold text-[#1F1F1F] font-heading mt-1">Color Palette</h2>
            <p className="text-xs text-[#6B6E84] mt-1 max-w-2xl">
              Blue is trending, comfortable, gives a sense of security, and builds trust in the product. Primary blue color is associated with depth and stability, so for the app we choose blue as primary color, vibrant dark blue as secondary, pale for creating some accents, and soft black and gray for text.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {colors.map((c) => (
              <div
                key={c.hex}
                onClick={() => copyToClipboard(c.hex)}
                className="group p-4 rounded-2xl border border-[#CEDEFF] bg-white hover:border-[#5B81FA] hover:shadow-card-hover transition-all cursor-pointer space-y-3"
              >
                <div className={`h-24 rounded-xl ${c.class} p-3 flex flex-col justify-between shadow-inner`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{c.name}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold font-mono">{c.hex}</span>
                    <button className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
                      {copiedColor === c.hex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1F1F1F]">{c.name}</p>
                  <p className="text-[10px] text-[#6B6E84] mt-0.5">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Components Library Showcase Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#CEDEFF] shadow-card space-y-12">
          <div>
            <span className="text-xs font-extrabold text-[#5B81FA] uppercase tracking-wider">03 / Component System</span>
            <h2 className="text-2xl font-bold text-[#1F1F1F] font-heading mt-1">Components Library</h2>
            <p className="text-xs text-[#6B6E84] mt-1 max-w-2xl">
              This component library was created to facilitate communication between designers and developers and preserve the visual identity of the HealFlow application.
            </p>
          </div>

          {/* Buttons Showcase Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#1F1F1F] uppercase tracking-wider font-heading border-b border-slate-100 pb-2">
              Buttons & Action Controls
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div className="space-y-2 text-center p-3 bg-[#F2F5FF] rounded-2xl border border-[#CEDEFF]">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Primary Blue Pill</p>
                <Button variant="primary" pill fullWidth>Create account</Button>
              </div>

              <div className="space-y-2 text-center p-3 bg-[#F2F5FF] rounded-2xl border border-[#CEDEFF]">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Secondary Navy Pill</p>
                <Button variant="secondary" pill fullWidth>Create account</Button>
              </div>

              <div className="space-y-2 text-center p-3 bg-[#F2F5FF] rounded-2xl border border-[#CEDEFF]">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Outline Pill</p>
                <Button variant="outline" pill fullWidth>Create account</Button>
              </div>

              <div className="space-y-2 text-center p-3 bg-[#F2F5FF] rounded-2xl border border-[#CEDEFF]">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Google Auth Pill</p>
                <Button variant="google" pill fullWidth>Sign up with Google</Button>
              </div>
            </div>
          </div>

          {/* Form Controls: Inputs, Selects & Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#1F1F1F] uppercase tracking-wider font-heading border-b border-slate-100 pb-2">
              Inputs, Selects & Switches
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search Bar Input */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Pill Search Bar</p>
                <Input
                  pill
                  icon={Search}
                  actionIcon={Sliders}
                  placeholder="Search drugs, category..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>

              {/* Pill Select Dropdown */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Pill Category Select</p>
                <Select
                  pill
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { label: 'All Specialties', value: 'All Specialties' },
                    { label: 'Heart Surgeon', value: 'Heart Surgeon' },
                    { label: 'Neurology', value: 'Neurology' },
                    { label: 'Pediatrics', value: 'Pediatrics' },
                  ]}
                />
              </div>

              {/* Segmented Pill Control */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase">Segmented Tab Pill</p>
                <div className="pt-1">
                  <SegmentedControl
                    options={[
                      { label: 'Chats', value: 'chats' },
                      { label: 'Calls', value: 'calls' },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes, Radios, Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 items-center">
              <div className="flex items-center gap-3">
                <Toggle
                  checked={toggleState1}
                  onChange={setToggleState1}
                  label="Active Notification Switch"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F1F1F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkboxValue}
                    onChange={(e) => setCheckboxValue(e.target.checked)}
                    className="w-4 h-4 text-[#5B81FA] rounded accent-[#5B81FA] border-[#CEDEFF]"
                  />
                  <span>Save credentials</span>
                </label>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-[#1F1F1F]">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="style-radio"
                    value="option1"
                    checked={radioValue === 'option1'}
                    onChange={() => setRadioValue('option1')}
                    className="accent-[#5B81FA]"
                  />
                  <span>Option A</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="style-radio"
                    value="option2"
                    checked={radioValue === 'option2'}
                    onChange={() => setRadioValue('option2')}
                    className="accent-[#5B81FA]"
                  />
                  <span>Option B</span>
                </label>
              </div>
            </div>
          </div>

          {/* Interactive Component Cards Showcase */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#1F1F1F] uppercase tracking-wider font-heading border-b border-slate-100 pb-2">
              Interactive Component Cards
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Doctor Specialty Card</span>
                <DoctorCard />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Pharmacy Medicine Card</span>
                <MedicineCard />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Calendar Date Picker Card</span>
                <CalendarPickerCard />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Distance Slider Control</span>
                <DistanceSliderCard />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Doctor Chat Preview Card</span>
                <ChatCard />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Medical Center Card</span>
                <MedicalCenterCard />
              </div>
            </div>
          </div>

          {/* Bottom Bar Pill Navigation Showcase */}
          <div className="space-y-2 pt-6 border-t border-slate-100">
            <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Mobile Floating Bottom Navigation Bar</span>
            <div className="max-w-md mx-auto bg-white border border-[#CEDEFF] rounded-full p-2 shadow-card-hover flex items-center justify-around text-[#6B6E84]">
              <button className="p-2.5 rounded-full bg-[#5B81FA] text-white shadow-material-1">
                <User className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full hover:bg-[#F2F5FF] hover:text-[#5B81FA] transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full hover:bg-[#F2F5FF] hover:text-[#5B81FA] transition-colors">
                <Calendar className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full hover:bg-[#F2F5FF] hover:text-[#5B81FA] transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full hover:bg-[#F2F5FF] hover:text-[#5B81FA] transition-colors">
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};

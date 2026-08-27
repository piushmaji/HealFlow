import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Stethoscope } from 'lucide-react';
import { MOCK_DOCTORS } from '../../utils/mockData';

export const RoleSwitcher = () => {
  const { role, switchRole, activeDoctor, switchDoctor } = useAuth();
  const navigate = useNavigate();

  const handlePatientSwitch = () => {
    switchRole('patient');
    navigate('/patient-dashboard');
  };

  const handleDoctorSwitch = () => {
    switchRole('doctor');
    navigate('/doctor-dashboard');
  };

  return (
    <div className="relative inline-flex items-center bg-[#F2F5FF] p-1 rounded-full border border-[#CEDEFF] text-xs font-sans">
      <button
        onClick={handlePatientSwitch}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all duration-200 ${
          role === 'patient'
            ? 'bg-[#5B81FA] text-white shadow-material-1'
            : 'text-[#6B6E84] hover:text-[#1F1F1F] hover:bg-white/60'
        }`}
      >
        <User className="w-3.5 h-3.5" />
        <span>Patient</span>
      </button>

      <div className="flex items-center">
        <button
          onClick={handleDoctorSwitch}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all duration-200 ${
            role === 'doctor'
              ? 'bg-[#29318A] text-white shadow-material-1'
              : 'text-[#6B6E84] hover:text-[#1F1F1F] hover:bg-white/60'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor</span>
        </button>

        {role === 'doctor' && (
          <select
            value={activeDoctor.id}
            onChange={(e) => switchDoctor(e.target.value)}
            className="ml-1.5 bg-white text-[#29318A] border border-[#CEDEFF] rounded-full text-[11px] font-extrabold py-1 px-2 focus:outline-none focus:border-[#5B81FA] cursor-pointer"
          >
            {MOCK_DOCTORS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialty})
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

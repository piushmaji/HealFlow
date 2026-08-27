import React, { createContext, useContext, useState } from 'react';
import { MOCK_DOCTORS } from '../utils/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smart_clinic_auth') === 'true';
  });

  // Current user role: 'patient' or 'doctor'
  const [role, setRole] = useState(() => localStorage.getItem('smart_clinic_role') || 'patient');

  // Current doctor profile if in Doctor mode
  const [activeDoctor, setActiveDoctor] = useState(MOCK_DOCTORS[0]);

  // Current patient profile
  const [patientUser, setPatientUser] = useState({
    id: 'pat-101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@healflow.in',
    phone: '+91 98765 43210',
    bloodGroup: 'O positive (O+)',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
    emergencyContact: 'Sunita Sharma (Spouse) • +91 98450 11223',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  });

  const login = (selectedRole = 'patient', doctorId = null) => {
    setRole(selectedRole);
    localStorage.setItem('smart_clinic_role', selectedRole);
    localStorage.setItem('smart_clinic_auth', 'true');
    setIsAuthenticated(true);
    if (selectedRole === 'doctor') {
      const doc = MOCK_DOCTORS.find((d) => d.id === doctorId) || MOCK_DOCTORS[0];
      setActiveDoctor(doc);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('smart_clinic_auth', 'false');
  };

  const switchRole = (newRole, doctorId = null) => {
    setRole(newRole);
    localStorage.setItem('smart_clinic_role', newRole);
    if (newRole === 'doctor') {
      const doc = MOCK_DOCTORS.find((d) => d.id === doctorId) || MOCK_DOCTORS[0];
      setActiveDoctor(doc);
    }
  };

  const switchDoctor = (doctorId) => {
    const doc = MOCK_DOCTORS.find((d) => d.id === doctorId);
    if (doc) setActiveDoctor(doc);
  };

  const updatePatientUser = (updatedData) => {
    setPatientUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        patientUser,
        activeDoctor,
        login,
        logout,
        switchRole,
        switchDoctor,
        updatePatientUser,
        isDoctor: role === 'doctor',
        isPatient: role === 'patient',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
import { signUpUser, signInWithEmail, signOut, getUserProfile } from '../services/supabase/authService';
import {
  fetchPatientProfileFromDb,
  updatePatientProfileInBackendDb,
  savePatientMedicalDetails,
} from '../services/supabase/patientService';
import { getDoctors } from '../services/supabase/doctorService';
import { getDefaultAvatar } from '../utils/avatarLibrary';

const AuthContext = createContext();

const initialPatientState = {
  id: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  role: 'patient',
  createdAt: null,
  healthId: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  address: '',
  emergencyContactPhone: '',
  knownAllergies: '',
  hasCompletedMedicalDetails: false,
};

const initialDoctorState = {
  id: '',
  name: '',
  title: '',
  specialty: '',
  hospital: '',
  room_number: '',
  consultation_fee: 0,
  avatar_url: '',
  experience_years: 0,
  rating: 5.0,
  bio: '',
  available_days: [],
  consultation_mode: [],
  accepts_new_patients: true,
  intake_questions: [],
  hasCompletedProfile: false,
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(() => localStorage.getItem('smart_clinic_role') || 'patient');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('smart_clinic_auth') === 'true');

  const [activeDoctor, setActiveDoctor] = useState(() => {
    const saved = localStorage.getItem('healflow_active_doctor');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialDoctorState;
  });

  // Hydrate real doctor from database on start
  useEffect(() => {
    getDoctors().then((docs) => {
      if (Array.isArray(docs) && docs.length > 0) {
        setActiveDoctor((prev) => {
          const match = docs.find((d) => (prev.id && d.id === prev.id) || (prev.profile_id && (d.profile_id === prev.profile_id || d.id === prev.profile_id)));
          const target = match || docs[0];
          const merged = {
            ...target,
            ...prev,
            id: target.id || prev.id,
            profile_id: target.profile_id || prev.profile_id,
            name: target.name || prev.name,
            title: target.title || prev.title,
            specialty: target.specialty || prev.specialty,
            hospital: target.hospital || prev.hospital,
            room_number: target.room_number || prev.room_number,
            consultation_fee: target.consultation_fee ?? prev.consultation_fee,
            experience_years: target.experience_years ?? prev.experience_years,
            rating: target.rating ?? prev.rating,
            bio: target.bio || prev.bio,
            avatar_url: target.avatar_url || prev.avatar_url,
            available_days: target.available_days || prev.available_days,
            consultation_mode: target.consultation_mode || prev.consultation_mode,
            intake_questions: target.intake_questions || prev.intake_questions,
          };
          localStorage.setItem('healflow_active_doctor', JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(() => {});
  }, []);

  // Patient user state - dynamic from public.profiles and public.patients
  const [patientUser, setPatientUser] = useState(() => {
    const saved = localStorage.getItem('healflow_patient_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialPatientState;
  });

  const [hasFetchedPatientFromBackend, setHasFetchedPatientFromBackend] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState(null);

  // Save patientUser to localStorage when it changes
  useEffect(() => {
    if (patientUser?.name || patientUser?.email || patientUser?.id || patientUser?.avatar) {
      localStorage.setItem('healflow_patient_user', JSON.stringify(patientUser));
      if (patientUser?.id && patientUser?.avatar) {
        localStorage.setItem(`healflow_avatar_${patientUser.id}`, patientUser.avatar);
      }
    }
  }, [patientUser]);

  /**
   * Fetch patient profile from public.profiles + public.patients
   */
  const fetchPatientFromBackend = async (userId, force = false) => {
    if (hasFetchedPatientFromBackend && !force) {
      return patientUser;
    }

    setIsProfileLoading(true);
    try {
      const uId = userId || session?.user?.id || currentUser?.id || patientUser?.id;
      if (uId && isSupabaseConfigured) {
        const fetchedData = await fetchPatientProfileFromDb(uId);
        if (fetchedData) {
          // Check cached avatar backup so an empty DB avatar_url never clears user's avatar
          const backupAvatar = localStorage.getItem(`healflow_avatar_${uId}`) || patientUser?.avatar || '';
          const finalAvatar = fetchedData.avatar || backupAvatar;

          setPatientUser((prev) => ({
            ...prev,
            ...fetchedData,
            avatar: finalAvatar,
          }));
          setHasFetchedPatientFromBackend(true);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastFetchedTimestamp(timeStr);
          setIsProfileLoading(false);
          return { ...fetchedData, avatar: finalAvatar };
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Error fetching patient from DB:', err.message);
    } finally {
      setIsProfileLoading(false);
      setHasFetchedPatientFromBackend(true);
    }
    return patientUser;
  };

  // Hydrate user profile from Supabase DB when session changes
  const loadProfile = async (userId) => {
    if (!userId) return;
    const profile = await getUserProfile(userId);
    if (profile) {
      setCurrentUser(profile);
      if (profile.role) {
        setRole(profile.role);
        localStorage.setItem('smart_clinic_role', profile.role);
      }
      if (profile.role === 'patient') {
        const fullPatient = await fetchPatientFromBackend(userId, true);
        const backupAvatar = localStorage.getItem(`healflow_avatar_${userId}`) || patientUser?.avatar || '';
        const resolvedAvatar = fullPatient?.avatar || profile.avatar_url || backupAvatar;

        if (resolvedAvatar) {
          setPatientUser((prev) => ({
            ...prev,
            avatar: resolvedAvatar,
          }));
        }
      } else if (profile.role === 'doctor') {
        const docRecord = profile.doctorData || {};
        setActiveDoctor((prev) => {
          const updated = {
            ...prev,
            ...docRecord,
            id: docRecord.id || prev.id,
            profile_id: userId,
            name: docRecord.name || profile.full_name || prev.name,
            title: docRecord.title || prev.title,
            avatar_url: docRecord.avatar_url || profile.avatar_url || prev.avatar_url,
            specialty: docRecord.specialty || prev.specialty,
            hospital: docRecord.hospital || prev.hospital,
            room_number: docRecord.room_number || prev.room_number,
            consultation_fee: docRecord.consultation_fee ?? prev.consultation_fee,
            experience_years: docRecord.experience_years ?? prev.experience_years,
            rating: docRecord.rating ?? prev.rating,
            bio: docRecord.bio || prev.bio,
            available_days: docRecord.available_days || prev.available_days,
            consultation_mode: docRecord.consultation_mode || prev.consultation_mode,
            intake_questions: docRecord.intake_questions || prev.intake_questions,
          };
          localStorage.setItem('healflow_active_doctor', JSON.stringify(updated));
          return updated;
        });
      }
    }
  };

  // On App Mount / Page Refresh
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session: initSession } }) => {
        setSession(initSession);
        if (initSession?.user) {
          setIsAuthenticated(true);
          localStorage.setItem('smart_clinic_auth', 'true');
          loadProfile(initSession.user.id);
        } else {
          if (role === 'patient' && patientUser?.id && !hasFetchedPatientFromBackend) {
            fetchPatientFromBackend(patientUser.id, false);
          }
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          setIsAuthenticated(true);
          localStorage.setItem('smart_clinic_auth', 'true');
          loadProfile(currentSession.user.id);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (selectedRole = 'patient', email = '', password = '', doctorId = null) => {
    if (selectedRole === 'doctor' && doctorId && !email) {
      setRole('doctor');
      localStorage.setItem('smart_clinic_role', 'doctor');
      localStorage.setItem('smart_clinic_auth', 'true');
      setIsAuthenticated(true);
      const docs = await getDoctors();
      const doc = Array.isArray(docs) ? docs.find((d) => d.id === doctorId) || docs[0] : null;
      if (doc) setActiveDoctor(doc);
      return;
    }

    if (isSupabaseConfigured && email && password) {
      const data = await signInWithEmail(email, password);
      if (data?.user) {
        // Strict Role Verification: Ensure account role matches the selected portal!
        const profile = await getUserProfile(data.user.id);
        const actualRole = profile?.role || data.user.user_metadata?.role;

        if (actualRole && actualRole !== selectedRole) {
          if (actualRole === 'doctor') {
            throw new Error('Access Denied: This email belongs to a Doctor account. Please select "Doctor Portal" to log in.');
          } else {
            throw new Error('Access Denied: This email belongs to a Patient account. Please select "Patient Portal" to log in.');
          }
        }

        const resolvedRole = actualRole || selectedRole;
        setRole(resolvedRole);
        localStorage.setItem('smart_clinic_role', resolvedRole);
        localStorage.setItem('smart_clinic_auth', 'true');
        setIsAuthenticated(true);
        await loadProfile(data.user.id);
        return data;
      }
    }

    throw new Error('Invalid email or password. Please check your credentials or register a new account.');
  };

  const register = async (userData) => {
    if (isSupabaseConfigured) {
      const data = await signUpUser(userData);
      const registeredUser = data?.user;
      const uId = registeredUser?.id || `user-${Date.now()}`;

      const defaultAvatar = registeredUser?.user_metadata?.avatar_url || getDefaultAvatar(userData.fullName, userData.role);

      if (userData.role === 'patient') {
        const newPatient = {
          id: uId,
          name: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: defaultAvatar,
          role: 'patient',
          createdAt: new Date().toISOString(),
          healthId: `HLF-${uId.slice(0, 8).toUpperCase()}`,
          dateOfBirth: '',
          gender: '',
          bloodGroup: '',
          address: '',
          emergencyContactPhone: '',
          knownAllergies: '',
          hasCompletedMedicalDetails: false,
        };
        setPatientUser(newPatient);
        localStorage.setItem('healflow_patient_user', JSON.stringify(newPatient));
      } else if (userData.role === 'doctor') {
        const newDoctor = {
          ...initialDoctorState,
          id: uId,
          name: userData.fullName || '',
          avatar_url: defaultAvatar,
          hasCompletedProfile: false,
        };
        setActiveDoctor(newDoctor);
        localStorage.setItem('healflow_active_doctor', JSON.stringify(newDoctor));
      }

      setRole(userData.role);
      localStorage.setItem('smart_clinic_role', userData.role);
      localStorage.setItem('smart_clinic_auth', 'true');
      setIsAuthenticated(true);

      return data;
    }

    const uId = `demo-${Date.now()}`;
    const newPatient = {
      id: uId,
      name: userData.fullName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      avatar: '',
      role: 'patient',
      createdAt: new Date().toISOString(),
      healthId: `HLF-${uId.slice(0, 8).toUpperCase()}`,
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      address: '',
      emergencyContactPhone: '',
      knownAllergies: '',
      hasCompletedMedicalDetails: false,
    };
    setPatientUser(newPatient);
    localStorage.setItem('healflow_patient_user', JSON.stringify(newPatient));
    setRole(userData.role);
    localStorage.setItem('smart_clinic_role', userData.role);
    localStorage.setItem('smart_clinic_auth', 'true');
    setIsAuthenticated(true);
    return { user: { id: uId } };
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
    setHasFetchedPatientFromBackend(false);
    localStorage.setItem('smart_clinic_auth', 'false');
    localStorage.removeItem('healflow_patient_user');
    setPatientUser(initialPatientState);
    setCurrentUser(null);
  };

  const switchRole = async (newRole, doctorId = null) => {
    setRole(newRole);
    localStorage.setItem('smart_clinic_role', newRole);
    if (newRole === 'doctor') {
      const docs = await getDoctors();
      const doc = Array.isArray(docs) ? docs.find((d) => d.id === doctorId) || docs[0] : null;
      if (doc) setActiveDoctor(doc);
    } else if (newRole === 'patient') {
      if (patientUser?.id && !hasFetchedPatientFromBackend) {
        fetchPatientFromBackend(patientUser.id, false);
      }
    }
  };

  const switchDoctor = async (doctorId) => {
    const docs = await getDoctors();
    const doc = Array.isArray(docs) ? docs.find((d) => d.id === doctorId) : null;
    if (doc) setActiveDoctor(doc);
  };

  /**
   * Save patient medical details (popup on dashboard or profile page)
   */
  const saveMedicalDetails = async (details) => {
    const targetUserId = session?.user?.id || currentUser?.id || patientUser?.id;
    let savedFromDb = null;
    if (targetUserId && isSupabaseConfigured) {
      try {
        savedFromDb = await savePatientMedicalDetails(targetUserId, details);
      } catch (e) {
        console.warn('[AuthContext] savePatientMedicalDetails warning:', e.message);
      }
    }

    const updated = {
      ...patientUser,
      dateOfBirth: details.dateOfBirth ?? patientUser.dateOfBirth,
      gender: details.gender ?? patientUser.gender,
      bloodGroup: details.bloodGroup ?? patientUser.bloodGroup,
      address: details.address ?? patientUser.address,
      emergencyContactPhone: details.emergencyContactPhone ?? patientUser.emergencyContactPhone,
      knownAllergies: details.knownAllergies ?? patientUser.knownAllergies,
      hasCompletedMedicalDetails: true,
    };

    setPatientUser(updated);
    localStorage.setItem('healflow_patient_user', JSON.stringify(updated));
    if (targetUserId) {
      localStorage.setItem(`healflow_medical_${targetUserId}`, JSON.stringify(details));
    }
    return updated;
  };

  /**
   * Update patient profile in public.profiles table
   */
  const updatePatientUser = async (updatedData) => {
    const nextPatient = {
      ...patientUser,
      ...updatedData,
    };

    setPatientUser(nextPatient);
    localStorage.setItem('healflow_patient_user', JSON.stringify(nextPatient));
    if (updatedData.avatar) {
      if (nextPatient.id) localStorage.setItem(`healflow_avatar_${nextPatient.id}`, updatedData.avatar);
      localStorage.setItem('healflow_last_avatar', updatedData.avatar);
    }

    const targetUserId = session?.user?.id || currentUser?.id || patientUser?.id;

    if (targetUserId && isSupabaseConfigured) {
      try {
        const saved = await updatePatientProfileInBackendDb(targetUserId, updatedData);
        if (saved) {
          const merged = {
            ...nextPatient,
            ...saved,
            name: updatedData.name || saved.name || nextPatient.name,
            phone: updatedData.phone || saved.phone || nextPatient.phone,
            avatar: updatedData.avatar || saved.avatar || nextPatient.avatar,
            dateOfBirth: updatedData.dateOfBirth || saved.dateOfBirth || nextPatient.dateOfBirth,
            gender: updatedData.gender || saved.gender || nextPatient.gender,
            bloodGroup: updatedData.bloodGroup || saved.bloodGroup || nextPatient.bloodGroup,
            address: updatedData.address || saved.address || nextPatient.address,
            emergencyContactPhone: updatedData.emergencyContactPhone || saved.emergencyContactPhone || nextPatient.emergencyContactPhone,
            knownAllergies: updatedData.knownAllergies || saved.knownAllergies || nextPatient.knownAllergies,
          };
          setPatientUser(merged);
          localStorage.setItem('healflow_patient_user', JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        console.warn('[AuthContext] Failed to update patient in Supabase DB:', err.message);
      }
    }
    return nextPatient;
  };

  const refetchPatientFromBackend = async () => {
    const uId = session?.user?.id || currentUser?.id || patientUser?.id;
    return await fetchPatientFromBackend(uId, true);
  };

  const updateActiveDoctor = (newDocData) => {
    setActiveDoctor((prev) => {
      const updated = typeof newDocData === 'function' ? newDocData(prev) : { ...prev, ...newDocData };
      localStorage.setItem('healflow_active_doctor', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        currentUser,
        isAuthenticated,
        role,
        patientUser,
        activeDoctor,
        setActiveDoctor: updateActiveDoctor,
        updateActiveDoctor,
        hasFetchedPatientFromBackend,
        isProfileLoading,
        lastFetchedTimestamp,
        login,
        register,
        logout: handleLogout,
        switchRole,
        switchDoctor,
        updatePatientUser,
        saveMedicalDetails,
        refetchPatientFromBackend,
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

import { supabase, isSupabaseConfigured } from './client';
import { INITIAL_PATIENT_APPOINTMENTS } from '../../utils/mockData';
import { formatTokenNumber } from '../../utils/formatters';

export const createAppointment = async (appointmentData) => {
  const tokenIndex = Math.floor(Math.random() * 15) + 5;
  const tokenNumber = formatTokenNumber(appointmentData.specialty || 'CLN', tokenIndex);

  const newAppointment = {
    id: `apt-${Date.now()}`,
    ...appointmentData,
    token_number: tokenNumber,
    token_index: tokenIndex,
    status: 'Scheduled',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('appointments').insert([newAppointment]).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase createAppointment error, returning local object:', err.message);
    }
  }

  return newAppointment;
};

export const getPatientAppointments = async (patientEmail = 'patient@smartclinic.health') => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_email', patientEmail)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase getPatientAppointments fallback:', err.message);
    }
  }

  return INITIAL_PATIENT_APPOINTMENTS;
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select();

      if (!error && data) return data[0];
    } catch (err) {
      console.warn('Supabase updateAppointmentStatus fallback:', err.message);
    }
  }

  return { id: appointmentId, status };
};

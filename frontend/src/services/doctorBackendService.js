/**
 * Doctor Backend Service for Frontend
 * Connects Frontend directly to Node.js / Express Backend (/api/doctors) & Supabase
 * Dynamically resolves backend host for cross-device mobile/laptop testing
 */
const getBackendBase = () => {
  // If explicitly provided via Vite environment variable (e.g. on Render/Vercel)
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    // If running in HTTPS, ensure backend URL also uses HTTPS to prevent Mixed Content
    if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && envUrl.startsWith('http://')) {
      return envUrl.replace('http://', 'https://').replace('/api/chat', '/api/doctors');
    }
    return envUrl.replace('/api/chat', '/api/doctors');
  }

  // If running in browser on local network (e.g. mobile accessing laptop IP over HTTP)
  if (typeof window !== 'undefined' && window.location) {
    const isHttps = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // If on HTTPS (e.g. *.vercel.app)
    if (isHttps) {
      if (envUrl && envUrl.startsWith('https://')) {
        return envUrl.replace('/api/chat', '/api/doctors');
      }
      // Return Render backend URL default if on HTTPS Vercel
      return 'https://healflow.onrender.com/api/doctors';
    }

    if (!isLocalhost && !isHttps) {
      return `http://${window.location.hostname}:5001/api/doctors`;
    }
  }

  return envUrl
    ? envUrl.replace('/api/chat', '/api/doctors')
    : 'http://localhost:5001/api/doctors';
};

const BACKEND_URL = getBackendBase();

export const fetchDoctorProfileFromBackend = async (doctorId) => {
  try {
    const res = await fetch(`${BACKEND_URL}/${doctorId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[doctorBackendService] fetchDoctorProfileFromBackend error:', err.message);
    return null;
  }
};

export const updateDoctorProfileInBackend = async (doctorId, updateData) => {
  try {
    const res = await fetch(`${BACKEND_URL}/${doctorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[doctorBackendService] updateDoctorProfileInBackend error:', err.message);
    throw err;
  }
};

export const fetchDoctorAppointmentsFromBackend = async (doctorId, date = '') => {
  try {
    const url = date ? `${BACKEND_URL}/${doctorId}/appointments?date=${date}` : `${BACKEND_URL}/${doctorId}/appointments`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[doctorBackendService] fetchDoctorAppointmentsFromBackend error:', err.message);
    return [];
  }
};

export const callNextPatientInBackend = async (doctorId) => {
  try {
    const res = await fetch(`${BACKEND_URL}/${doctorId}/call-next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[doctorBackendService] callNextPatientInBackend error:', err.message);
    throw err;
  }
};

export const updateAppointmentStatusInBackend = async (appointmentId, status) => {
  try {
    const res = await fetch(`${BACKEND_URL}/appointments/${appointmentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[doctorBackendService] updateAppointmentStatusInBackend error:', err.message);
    throw err;
  }
};

export const fetchDoctorSlotsFromBackend = async (doctorId, date = '') => {
  try {
    const url = date ? `${BACKEND_URL}/${doctorId}/slots?date=${date}` : `${BACKEND_URL}/${doctorId}/slots`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[doctorBackendService] fetchDoctorSlotsFromBackend error:', err.message);
    return [];
  }
};

export const saveDoctorSlotsToBackend = async (doctorId, date, slots) => {
  try {
    const res = await fetch(`${BACKEND_URL}/${doctorId}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, slots }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[doctorBackendService] saveDoctorSlotsToBackend error:', err.message);
    throw err;
  }
};

export const fetchConsultationMessagesFromBackend = async (appointmentId) => {
  try {
    const res = await fetch(`${BACKEND_URL}/consultations/${appointmentId}/messages`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[doctorBackendService] fetchConsultationMessagesFromBackend error:', err.message);
    return [];
  }
};

export const getCallSignalFromBackend = async (appointmentId) => {
  try {
    const res = await fetch(`${BACKEND_URL}/consultations/${appointmentId}/signal`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};

export const updateCallSignalInBackend = async (appointmentId, payload) => {
  try {
    const res = await fetch(`${BACKEND_URL}/consultations/${appointmentId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};

export const sendConsultationMessageToBackend = async (appointmentId, messagePayload) => {
  try {
    const res = await fetch(`${BACKEND_URL}/consultations/${appointmentId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[doctorBackendService] sendConsultationMessageToBackend error:', err.message);
    throw err;
  }
};

export const fetchAllDoctorsFromBackend = async (queryParams = {}) => {
  try {
    const params = new URLSearchParams();
    if (queryParams.specialty && queryParams.specialty !== 'all') {
      params.append('specialty', queryParams.specialty);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BACKEND_URL}${queryString}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[doctorBackendService] fetchAllDoctorsFromBackend error:', err.message);
    return null;
  }
};

export const fetchDoctorWorkloadFromBackend = async (doctorId, date = '') => {
  try {
    const url = date ? `${BACKEND_URL}/${doctorId}/workload?date=${date}` : `${BACKEND_URL}/${doctorId}/workload`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[doctorBackendService] fetchDoctorWorkloadFromBackend error:', err.message);
    return null;
  }
};

export const bookDoctorAppointmentInBackend = async (appointmentPayload) => {
  try {
    const res = await fetch(`${BACKEND_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentPayload),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[doctorBackendService] bookDoctorAppointmentInBackend error:', err.message);
    throw err;
  }
};




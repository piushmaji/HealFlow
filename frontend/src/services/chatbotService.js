/**
 * Frontend Chatbot API Service
 * Connects frontend to the Node.js Express Backend (/api/chat/message)
 * with graceful fallback to browser-side triage if backend is offline.
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api/chat';

export const sendChatbotMessage = async (message, sessionId = null) => {
  try {
    const res = await fetch(`${API_BASE_URL}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[chatbotService] Backend unreachable, using graceful client triage fallback:', err.message);
  }

  // Graceful client fallback triage
  const lower = (message || '').toLowerCase();
  let specialty = 'General Medicine';
  let reason = 'A General Physician will evaluate your symptoms and guide appropriate tests or referrals.';

  if (lower.includes('chest') || lower.includes('heart') || lower.includes('bp') || lower.includes('palpitation')) {
    specialty = 'Cardiology';
    reason = 'Cardiologists specialize in evaluating cardiac rhythms, chest pressure, and blood pressure control.';
  } else if (lower.includes('rash') || lower.includes('skin') || lower.includes('acne') || lower.includes('itch')) {
    specialty = 'Dermatology';
    reason = 'Dermatologists diagnose cutaneous conditions, rashes, and allergic dermatological symptoms.';
  } else if (lower.includes('bone') || lower.includes('joint') || lower.includes('knee') || lower.includes('fracture') || lower.includes('back pain')) {
    specialty = 'Orthopedics';
    reason = 'Orthopedic specialists treat bone fractures, joint stiffness, and musculoskeletal conditions.';
  } else if (lower.includes('headache') || lower.includes('migraine') || lower.includes('nerve') || lower.includes('dizziness')) {
    specialty = 'Neurology';
    reason = 'Neurologists evaluate brain and neurological symptoms like chronic headaches and neuropathies.';
  } else if (lower.includes('child') || lower.includes('baby') || lower.includes('kid') || lower.includes('infant')) {
    specialty = 'Pediatrics';
    reason = 'Pediatricians specialize in early childhood developmental milestones and pediatric healthcare.';
  }

  return {
    message: `Based on your query, a consultation with a specialist in ${specialty} is suggested.`,
    language: 'en',
    suggested_specialty: specialty,
    specialty_reason: reason,
    emergency: false,
    emergency_message: null,
    show_doctors: true,
    doctors: [],
  };
};


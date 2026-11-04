/**
 * Real Doctor Matching Service
 * Matches verified doctors from Supabase public.doctors table
 * Strictly uses real doctors, ratings, fees, and rooms. NEVER generates fake doctors.
 */
import { supabase } from '../config/supabase.js';

// Supported HealFlow Specialties
export const SUPPORTED_SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'Orthopedics',
  'General Medicine',
];

/**
 * Fetch verified real doctors from Supabase by specialty
 * @param {string} specialty - Specialty name
 * @param {number} limit - Maximum doctors to return
 * @returns {Promise<Array>} List of real active doctor objects
 */
export const getMatchingDoctors = async (specialty, limit = 3) => {
  if (!specialty) return [];

  // Normalize specialty name (e.g. General Physician -> General Medicine)
  let cleanSpecialty = specialty.trim();
  if (cleanSpecialty.toLowerCase().includes('physician') || cleanSpecialty.toLowerCase().includes('general')) {
    cleanSpecialty = 'General Medicine';
  } else if (cleanSpecialty.toLowerCase().includes('cardio')) {
    cleanSpecialty = 'Cardiology';
  } else if (cleanSpecialty.toLowerCase().includes('derma')) {
    cleanSpecialty = 'Dermatology';
  } else if (cleanSpecialty.toLowerCase().includes('pediatric')) {
    cleanSpecialty = 'Pediatrics';
  } else if (cleanSpecialty.toLowerCase().includes('neuro')) {
    cleanSpecialty = 'Neurology';
  } else if (cleanSpecialty.toLowerCase().includes('ortho')) {
    cleanSpecialty = 'Orthopedics';
  }

  // Ensure specialty is supported
  const isSupported = SUPPORTED_SPECIALTIES.some(
    (s) => s.toLowerCase() === cleanSpecialty.toLowerCase()
  );

  if (!isSupported) {
    return {
      isSupported: false,
      doctors: [],
      message: `Healflow currently does not list specialists for ${specialty}. Please consult a nearby hospital or clinic.`,
    };
  }

  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, name, title, specialty, experience_years, hospital, rating, review_count, consultation_fee, room_number, avatar_url, is_active')
      .ilike('specialty', `%${cleanSpecialty}%`)
      .eq('is_active', true)
      .limit(limit);

    if (error) {
      console.warn('[Doctor Matching] Supabase query error:', error.message);
      return { isSupported: true, doctors: [] };
    }

    const doctors = (data || []).map((doc) => ({
      id: doc.id,
      name: doc.name,
      title: doc.title,
      specialty: doc.specialty,
      experience_years: doc.experience_years,
      hospital: doc.hospital,
      rating: doc.rating,
      review_count: doc.review_count,
      consultation_fee: doc.consultation_fee,
      room_number: doc.room_number,
      avatar_url: doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      booking_url: `/doctors/${doc.id}/book`,
    }));

    return {
      isSupported: true,
      doctors,
    };
  } catch (err) {
    console.error('[Doctor Matching] Exception:', err.message);
    return { isSupported: true, doctors: [] };
  }
};


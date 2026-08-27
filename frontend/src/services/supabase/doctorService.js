import { supabase, isSupabaseConfigured } from './client';
import { MOCK_DOCTORS } from '../../utils/mockData';

export const getDoctors = async ({ specialty = 'all', searchQuery = '' } = {}) => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('doctors').select('*').eq('is_active', true);

      if (specialty && specialty !== 'all') {
        query = query.eq('specialty', specialty);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,specialty.ilike.%${searchQuery}%,hospital.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase query failed, falling back to local dataset:', err.message);
    }
  }

  // Fallback to local high-quality dataset
  return MOCK_DOCTORS.filter((doc) => {
    const matchesSpecialty = specialty === 'all' || doc.specialty.toLowerCase() === specialty.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(queryLower) ||
      doc.specialty.toLowerCase().includes(queryLower) ||
      doc.hospital.toLowerCase().includes(queryLower);

    return matchesSpecialty && matchesSearch;
  });
};

export const getDoctorById = async (id) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getDoctorById failed:', err.message);
    }
  }

  return MOCK_DOCTORS.find((doc) => doc.id === id) || MOCK_DOCTORS[0];
};

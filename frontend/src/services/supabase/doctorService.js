import { supabase, isSupabaseConfigured } from './client';
import { fetchAllDoctorsFromBackend, fetchDoctorProfileFromBackend } from '../doctorBackendService';

/**
 * Fetch active doctors dynamically from Supabase database or backend API
 * Eliminates static mock data and supports searching, filtering by specialty, maxFee, rating, and sorting.
 */
export const getDoctors = async ({
  specialty = 'all',
  gender = 'all',
  maxFee = null,
  minRating = null,
  searchQuery = '',
  sortBy = 'rating_desc',
} = {}) => {
  // 1. Try Supabase Client direct query
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('doctors')
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('is_active', true);

      if (specialty && specialty !== 'all') {
        query = query.eq('specialty', specialty);
      }
      if (maxFee) {
        query = query.lte('consultation_fee', Number(maxFee));
      }
      if (minRating) {
        query = query.gte('rating', Number(minRating));
      }
      if (searchQuery) {
        query = query.or(`specialty.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,hospital.ilike.%${searchQuery}%`);
      }

      if (sortBy === 'rating_desc') {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === 'fee_asc') {
        query = query.order('consultation_fee', { ascending: true });
      } else if (sortBy === 'fee_desc') {
        query = query.order('consultation_fee', { ascending: false });
      } else if (sortBy === 'experience_desc') {
        query = query.order('experience_years', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((doc) => ({
          ...doc,
          name: doc.name || doc.profiles?.full_name || 'Dr. Specialist',
          hospital: doc.hospital || doc.hospital_name || 'HealFlow Medical Center',
          avatar_url: doc.avatar_url || doc.profiles?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        }));
      }
    } catch (err) {
      console.warn('Supabase doctor direct query notice:', err.message);
    }
  }

  // 2. Fallback to Backend Node API (/api/doctors) which queries Supabase with service role
  try {
    const backendDocs = await fetchAllDoctorsFromBackend({ specialty });
    if (Array.isArray(backendDocs) && backendDocs.length > 0) {
      let filtered = backendDocs;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.name?.toLowerCase().includes(q) ||
            d.specialty?.toLowerCase().includes(q) ||
            d.hospital?.toLowerCase().includes(q)
        );
      }
      if (maxFee) {
        filtered = filtered.filter((d) => (d.consultation_fee || 0) <= Number(maxFee));
      }
      if (minRating) {
        filtered = filtered.filter((d) => (d.rating || 0) >= Number(minRating));
      }
      return filtered;
    }
  } catch (backendErr) {
    console.warn('Backend doctors fetch notice:', backendErr.message);
  }

  return [];
};

/**
 * Fetch doctor by ID from Supabase or Backend API
 */
export const getDoctorById = async (id) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          name: data.name || data.profiles?.full_name || 'Dr. Specialist',
          hospital: data.hospital || data.hospital_name || 'HealFlow Medical Center',
          avatar_url: data.avatar_url || data.profiles?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        };
      }
    } catch (err) {
      console.warn('Supabase getDoctorById notice:', err.message);
    }
  }

  try {
    const backendDoc = await fetchDoctorProfileFromBackend(id);
    if (backendDoc) return backendDoc;
  } catch (err) {}

  return null;
};

/**
 * Fetch dynamic doctor schedule & queue telemetry for a specific date from Supabase
 * Calculates real-time queue length, bookings, and busy/free status.
 * @param {string} doctorId - Doctor UUID
 * @param {string} dateString - Format YYYY-MM-DD
 * @returns {Promise<Object>} Dynamic queue telemetry & slot availability
 */
export const getDoctorDaySchedule = async (doctorId, dateString) => {
  const targetDate = dateString || new Date().toISOString().split('T')[0];

  const defaultSchedule = {
    date: targetDate,
    totalBookings: 0,
    waitingInQueue: 0,
    servingToken: null,
    isDoctorBusy: false,
    busyLevel: 'Available', // 'Available' | 'Moderate' | 'High Demand' | 'Fully Booked'
    estimatedWaitMins: 0,
    bookedSlots: [],
    slotQueues: {}, // maps slot_time -> count of patients in queue
  };

  if (!isDoctorIdValidUUID(doctorId) || !isSupabaseConfigured) {
    return defaultSchedule;
  }

  try {
    // 1. Query appointments for this doctor on the selected date
    const { data: appointments, error: aptErr } = await supabase
      .from('appointments')
      .select('id, slot_time, status, token_number, token_index')
      .eq('doctor_id', doctorId)
      .eq('slot_date', targetDate);

    // 2. Query live queue status from public.queues table
    const { data: queueRow, error: qErr } = await supabase
      .from('queues')
      .select('*')
      .eq('doctor_id', doctorId)
      .maybeSingle();

    const activeApts = Array.isArray(appointments)
      ? appointments.filter((a) => a.status === 'Scheduled' || a.status === 'In Session' || a.status === 'Checked In')
      : [];

    const totalBookings = activeApts.length;
    const bookedSlotTimes = activeApts.map((a) => a.slot_time);

    // Calculate queue depth per slot
    const slotQueues = {};
    activeApts.forEach((a) => {
      if (a.slot_time) {
        slotQueues[a.slot_time] = (slotQueues[a.slot_time] || 0) + 1;
      }
    });

    // Busy level threshold
    let busyLevel = 'Available';
    let isDoctorBusy = false;
    if (totalBookings >= 10) {
      busyLevel = 'Fully Booked';
      isDoctorBusy = true;
    } else if (totalBookings >= 5) {
      busyLevel = 'High Demand';
      isDoctorBusy = true;
    } else if (totalBookings >= 2) {
      busyLevel = 'Moderate';
    }

    const servingToken = queueRow?.current_token || (totalBookings > 0 ? activeApts[0]?.token_number : null);
    const waitingInQueue = queueRow?.total_in_queue || totalBookings;
    const estimatedWaitMins = waitingInQueue * 10; // ~10 mins avg per patient

    return {
      date: targetDate,
      totalBookings,
      waitingInQueue,
      servingToken,
      isDoctorBusy,
      busyLevel,
      estimatedWaitMins,
      bookedSlots: bookedSlotTimes,
      slotQueues,
      queueStatus: queueRow?.status || 'ACTIVE',
    };
  } catch (err) {
    console.warn('[doctorService] getDoctorDaySchedule error:', err.message);
    return defaultSchedule;
  }
};

const isDoctorIdValidUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);



import { supabase, isSupabaseConfigured } from './client';
import { INITIAL_QUEUES } from '../../utils/mockData';

export const getDoctorQueue = async (doctorId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('queues').select('*').eq('doctor_id', doctorId).single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getDoctorQueue error:', err.message);
    }
  }

  return INITIAL_QUEUES[doctorId] || {
    doctor_id: doctorId,
    current_token: 'CLN-001',
    serving_patient: 'Regular Walk-in',
    total_in_queue: 5,
    status: 'ACTIVE',
    last_updated: new Date().toISOString(),
  };
};

export const advanceDoctorQueue = async (doctorId, currentQueueState) => {
  const parts = (currentQueueState.current_token || 'CLN-001').split('-');
  const prefix = parts[0] || 'CLN';
  const currentNum = parseInt(parts[1] || '1', 10);
  const nextNum = currentNum + 1;
  const nextToken = `${prefix}-${String(nextNum).padStart(3, '0')}`;

  const updatedQueue = {
    ...currentQueueState,
    current_token: nextToken,
    total_in_queue: Math.max(0, (currentQueueState.total_in_queue || 5) - 1),
    last_updated: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('queues')
        .upsert([{ doctor_id: doctorId, current_token: nextToken, last_updated: updatedQueue.last_updated }])
        .select()
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase advanceDoctorQueue fallback:', err.message);
    }
  }

  return updatedQueue;
};

export const subscribeToQueueUpdates = (doctorId, callback) => {
  if (isSupabaseConfigured) {
    const channel = supabase
      .channel(`public:queues:doctor_id=eq.${doctorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues', filter: `doctor_id=eq.${doctorId}` },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Fallback cleanup function for local mode
  return () => {};
};

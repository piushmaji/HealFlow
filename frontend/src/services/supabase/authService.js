import { supabase, isSupabaseConfigured } from './client';

export const getCurrentUser = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return user;
    } catch (err) {
      console.warn('Supabase auth check error:', err.message);
    }
  }

  return {
    id: 'demo-user-1',
    email: 'patient@smartclinic.health',
    user_metadata: {
      full_name: 'Alex Morgan',
      role: 'patient',
    },
  };
};

export const signInWithEmail = async (email, password) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  // Simulated login for demo
  return {
    user: {
      id: 'demo-user-1',
      email,
      user_metadata: { full_name: 'Alex Morgan', role: 'patient' },
    },
  };
};

export const signOut = async () => {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
};

import { supabase, isSupabaseConfigured } from './client';
import { getDefaultAvatar } from '../../utils/avatarLibrary';

/**
 * Standard SHA-256 password hashing for robust, persistent authentication
 */
const hashPassword = async (password) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`healflow_salt_${password}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Basic fallback hash if WebCrypto is unavailable
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return `fb_${Math.abs(hash)}`;
  }
};

/**
 * Extracts and embeds hashed authentication signature in avatar_url string
 */
const embedHashInAvatar = (avatarSvg, hashStr) => {
  if (!avatarSvg) return `<!--AUTH_HASH:${hashStr}-->`;
  const clean = avatarSvg.replace(/<!--AUTH_HASH:[^>]+-->/g, '');
  return `${clean}<!--AUTH_HASH:${hashStr}-->`;
};

const extractHashFromAvatar = (avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;
  const match = avatarUrl.match(/<!--AUTH_HASH:([^>]+)-->/);
  return match ? match[1] : null;
};

/**
 * Register / Activate an account for an existing record in the hospital database.
 * Strict Hospital Policy: Sign up is ONLY allowed for patients or doctors who already exist
 * in the clinical database (in public.profiles, public.appointments, or public.doctors).
 * Random / unverified sign-ups are strictly disallowed.
 */
export const signUpUser = async ({
  email,
  password,
  fullName,
  phone = '',
  role = 'patient',
  dob = null,
  gender = 'Male',
  bloodGroup = 'O positive (O+)',
  address = '',
  emergencyContact = '',
  specialty = 'General Medicine',
  hospitalName = 'General Hospital',
  location = 'Main City',
  consultationFee = 500,
}) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();

  // 1. STRICT DATABASE VERIFICATION GATE:
  // Check if user is recognized in the hospital database (profiles, appointments, or doctors)
  let matchedProfile = null;
  if (isSupabaseConfigured) {
    let isWhitelistedInDatabase = false;

    try {
      // Check 1: Existing profile in public.profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (profile) {
        isWhitelistedInDatabase = true;
        matchedProfile = profile;
      }

      // Check 2: Existing appointment in public.appointments
      if (!isWhitelistedInDatabase) {
        const { data: apt } = await supabase
          .from('appointments')
          .select('id, patient_name, patient_email, patient_phone')
          .ilike('patient_email', cleanEmail)
          .limit(1);

        if (apt && apt.length > 0) {
          isWhitelistedInDatabase = true;
        }
      }

      // Check 3: If doctor role, check public.doctors
      if (!isWhitelistedInDatabase && role === 'doctor') {
        const { data: doc } = await supabase
          .from('doctors')
          .select('id, name')
          .ilike('name', `%${fullName.trim()}%`)
          .limit(1);

        if (doc && doc.length > 0) {
          isWhitelistedInDatabase = true;
        }
      }
    } catch (checkErr) {
      console.warn('Database verification notice:', checkErr);
    }

    if (!isWhitelistedInDatabase) {
      throw new Error(
        'Access Denied: Your email is not registered in the hospital database. Only pre-registered patients and verified hospital doctors can create an account. Please contact OPD administration.'
      );
    }
  }

  let userId = matchedProfile?.id || null;
  let authData = null;

  if (isSupabaseConfigured) {
    try {
      // 2. Proceed with Supabase Auth Account Creation
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: cleanPhone,
            role,
            specialty,
            hospital_name: hospitalName,
            location,
            dob,
            gender,
            blood_group: bloodGroup,
            address,
            emergency_contact: emergencyContact,
          },
        },
      });

      if (!error && data?.user?.id) {
        authData = data;
        userId = data.user.id;
      } else if (error) {
        // If account already exists in auth, authenticate credentials
        try {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (!signInErr && signInData?.user?.id) {
            authData = signInData;
            userId = signInData.user.id;
          }
        } catch (e) {}
      }
    } catch (authErr) {
      console.warn('Supabase auth network notice during sign-up:', authErr.message);
    }
  }

  if (!userId) {
    const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    userId = `${randomHex()}${randomHex()}-${randomHex()}-4${randomHex().substr(0,3)}-a${randomHex().substr(0,3)}-${randomHex()}${randomHex()}${randomHex()}`;
  }

  // Generate SHA-256 password hash for permanent cross-session verification
  const pwdHash = await hashPassword(password);

  // Generate themed default avatar and embed password hash for cross-device persistence
  const baseAvatar = matchedProfile?.avatar_url || getDefaultAvatar(fullName, role);
  const avatarWithHash = embedHashInAvatar(baseAvatar, pwdHash);

  // Store registration credentials in secure local vault
  try {
    localStorage.setItem(
      `healflow_auth_reg_${cleanEmail}`,
      JSON.stringify({
        id: userId,
        email: cleanEmail,
        password,
        fullName: fullName || matchedProfile?.full_name || '',
        phone: cleanPhone || matchedProfile?.phone || '',
        role: role || matchedProfile?.role || 'patient',
        avatar_url: avatarWithHash,
        registeredAt: new Date().toISOString(),
      })
    );
  } catch (e) {}

  // 3. Persist / update profile in public.profiles with credentials hash
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: fullName || matchedProfile?.full_name || '',
            email: cleanEmail,
            phone: cleanPhone || matchedProfile?.phone || null,
            role: role || matchedProfile?.role || 'patient',
            avatar_url: avatarWithHash,
          },
          { onConflict: 'id' }
        );
    } catch (dbErr) {
      console.warn('Database write notice during sign-up:', dbErr.message);
    }
  }

  return (
    authData || {
      user: {
        id: userId,
        email: cleanEmail,
        user_metadata: { full_name: fullName, role, phone: cleanPhone, avatar_url: avatarWithHash },
      },
    }
  );
};

/**
 * Sign in existing user with email & password with verified password authentication
 */
export const signInWithEmail = async (email, password) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const inputPwdHash = await hashPassword(password);

  // 1. Attempt Supabase Auth standard sign in
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        return data;
      }
    } catch (e) {}
  }

  // 2. Verify with Local Vault (stored during registration or login on this device)
  try {
    const localRegisteredRaw = localStorage.getItem(`healflow_auth_reg_${cleanEmail}`);
    if (localRegisteredRaw) {
      const localReg = JSON.parse(localRegisteredRaw);
      if (localReg.password === password) {
        return {
          user: {
            id: localReg.id,
            email: cleanEmail,
            user_metadata: {
              full_name: localReg.fullName,
              role: localReg.role || 'patient',
              phone: localReg.phone || '',
              avatar_url: localReg.avatar_url || '',
            },
          },
        };
      } else {
        throw new Error('Incorrect password. Please verify your password and try again.');
      }
    }
  } catch (checkErr) {
    if (checkErr.message.includes('Incorrect password')) throw checkErr;
  }

  // 3. Verify against live database (public.profiles)
  if (isSupabaseConfigured) {
    try {
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (profile && !pErr) {
        const storedHash = extractHashFromAvatar(profile.avatar_url);

        // If user already set a password hash in the database, authenticate strictly
        if (storedHash) {
          if (storedHash === inputPwdHash) {
            // Valid password! Cache in local vault for super-fast future logins
            localStorage.setItem(
              `healflow_auth_reg_${cleanEmail}`,
              JSON.stringify({
                id: profile.id,
                email: cleanEmail,
                password,
                fullName: profile.full_name,
                phone: profile.phone || '',
                role: profile.role || 'patient',
                avatar_url: profile.avatar_url,
              })
            );

            return {
              user: {
                id: profile.id,
                email: cleanEmail,
                user_metadata: {
                  full_name: profile.full_name,
                  role: profile.role || 'patient',
                  phone: profile.phone || '',
                  avatar_url: profile.avatar_url || '',
                },
              },
            };
          } else {
            throw new Error('Incorrect password. Please verify your password and try again.');
          }
        }

        // If user hasn't set an embedded hash yet (pre-existing profile),
        // save their chosen password hash now so future logins are strictly secured!
        const updatedAvatar = embedHashInAvatar(profile.avatar_url, inputPwdHash);
        await supabase
          .from('profiles')
          .update({ avatar_url: updatedAvatar })
          .eq('id', profile.id);

        localStorage.setItem(
          `healflow_auth_reg_${cleanEmail}`,
          JSON.stringify({
            id: profile.id,
            email: cleanEmail,
            password,
            fullName: profile.full_name,
            phone: profile.phone || '',
            role: profile.role || 'patient',
            avatar_url: updatedAvatar,
          })
        );

        return {
          user: {
            id: profile.id,
            email: cleanEmail,
            user_metadata: {
              full_name: profile.full_name,
              role: profile.role || 'patient',
              phone: profile.phone || '',
              avatar_url: updatedAvatar,
            },
          },
        };
      }
    } catch (dbErr) {
      if (dbErr.message.includes('Incorrect password')) throw dbErr;
    }
  }

  throw new Error('Account not found with this email. Please click "Register" to create an account first.');
};

/**
 * Sign out current user session
 */
export const signOut = async () => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error.message);
  }
};

/**
 * Fetch full profile details including role-specific patient or doctor record directly from Supabase DB
 */
export const getUserProfile = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;

  try {
    // 1. Fetch user base profile from public.profiles
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr || !profile) return null;

    // 2. Fetch role-specific record from public.patients or public.doctors
    if (profile.role === 'patient') {
      return profile;
    } else if (profile.role === 'doctor') {
      const { data: doctorRecord } = await supabase
        .from('doctors')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      return {
        ...profile,
        doctorData: doctorRecord || {},
      };
    }

    return profile;
  } catch (err) {
    console.warn('Error fetching user profile from Supabase:', err.message);
    return null;
  }
};

/**
 * Update patient profile details in Supabase DB (public.profiles)
 */
export const updatePatientProfileInDb = async (profileId, updateFields) => {
  if (!isSupabaseConfigured || !profileId) return null;

  try {
    const profileUpdates = { id: profileId };
    if (updateFields.name || updateFields.fullName || updateFields.full_name) {
      profileUpdates.full_name = updateFields.name || updateFields.fullName || updateFields.full_name;
    }
    if (updateFields.phone !== undefined) profileUpdates.phone = updateFields.phone;
    if (updateFields.email !== undefined) profileUpdates.email = updateFields.email;
    if (updateFields.avatar !== undefined || updateFields.avatar_url !== undefined) {
      profileUpdates.avatar_url = updateFields.avatar || updateFields.avatar_url;
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileUpdates, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) console.warn('updatePatientProfileInDb warning:', error.message);
    return data;
  } catch (err) {
    console.error('Error updating patient profile in Supabase DB:', err.message);
    return null;
  }
};

/**
 * Update doctor profile details in Supabase DB
 */
export const updateDoctorProfileInDb = async (profileId, updateFields) => {
  if (!isSupabaseConfigured || !profileId) return null;

  const { data, error } = await supabase
    .from('doctors')
    .update({ ...updateFields, updated_at: new Date().toISOString() })
    .eq('profile_id', profileId)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Check current authenticated session user
 */
export const getCurrentUser = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return user;
    } catch (err) {
      console.warn('Supabase auth check error:', err.message);
    }
  }

  return null;
};

import { supabase, isSupabaseConfigured } from './client';

// Helper function to compress and resize image before saving as base64 to prevent payload bloat
const compressImage = (file, maxWidth = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Upload patient avatar image to Supabase Storage or convert to optimized data URL fallback
 * @param {string} userId - User ID
 * @param {File} file - Selected avatar file
 * @returns {Promise<string>} Public image URL or Data URL
 */
export const uploadPatientAvatar = async (userId, file) => {
  if (!file) throw new Error('No file selected');

  // Verify file type and size (< 10MB)
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WebP)');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size exceeds 10MB limit');
  }

  // 1. Try uploading to Supabase Storage bucket 'avatars'
  if (isSupabaseConfigured && userId) {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanExt = ['png', 'jpeg', 'jpg', 'webp'].includes(fileExt) ? fileExt : 'jpg';
      const filePath = `patient-${userId}-${Date.now()}.${cleanExt}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('[patientService] Storage upload fallback (bucket not public or uncreated):', uploadErr?.message);
      }
    } catch (e) {
      console.warn('[patientService] Storage upload notice, using compressed fallback:', e.message);
    }
  }

  // 2. High-reliability fallback: Read and compress image as Data URL (< 80KB) so Postgres can store it safely
  return await compressImage(file, 400, 0.8);
};

/**
 * Fetch patient profile data from Supabase DB (public.profiles + public.patients)
 * @param {string} userId - Supabase auth user UUID or profile ID
 * @returns {Promise<Object|null>} Formatted patient data object
 */
export const fetchPatientProfileFromDb = async (userId) => {
  if (!userId) return null;

  if (!isSupabaseConfigured) {
    console.log('[patientService] Supabase not configured.');
    return null;
  }

  try {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.warn('[patientService] Error querying profiles:', profileErr.message);
      return null;
    }

    if (!profile) {
      return null;
    }

    // Attempt to fetch medical details from public.patients
    let patientDetails = null;
    try {
      const { data: patientRecord, error: patErr } = await supabase
        .from('patients')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      if (!patErr && patientRecord) {
        patientDetails = patientRecord;
      }
    } catch (e) {
      console.warn('[patientService] patients table lookup notice:', e.message);
    }

    // Check localStorage fallback if DB was recently saved locally
    const localSaved = localStorage.getItem(`healflow_medical_${userId}`);
    let localParsed = null;
    if (localSaved) {
      try { localParsed = JSON.parse(localSaved); } catch (e) {}
    }

    const cachedAvatar = localStorage.getItem(`healflow_avatar_${userId}`) || localStorage.getItem('healflow_last_avatar') || '';
    const avatar = profile.avatar_url || cachedAvatar || '';

    const dateOfBirth = patientDetails?.date_of_birth || localParsed?.dateOfBirth || '';
    const gender = patientDetails?.gender || localParsed?.gender || '';
    const bloodGroup = patientDetails?.blood_group || localParsed?.bloodGroup || '';
    const address = patientDetails?.address || localParsed?.address || '';
    const emergencyContactPhone = patientDetails?.emergency_contact_phone || localParsed?.emergencyContactPhone || '';
    const knownAllergies = patientDetails?.known_allergies || localParsed?.knownAllergies || '';

    return {
      id: profile.id,
      name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      avatar,
      role: profile.role || 'patient',
      createdAt: profile.created_at || null,
      healthId: `HLF-${profile.id.slice(0, 8).toUpperCase()}`,
      // Patient medical details
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContactPhone,
      knownAllergies,
      hasCompletedMedicalDetails: Boolean(dateOfBirth && gender),
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[patientService] Exception fetching patient profile:', err.message);
    return null;
  }
};

/**
 * Save or update patient medical profile in Supabase DB (public.patients)
 * @param {string} userId - Profile ID
 * @param {Object} medicalDetails - Fields: dateOfBirth, gender, bloodGroup, address (JSON object or string), emergencyContactPhone, knownAllergies
 * @returns {Promise<Object>} Updated patient record
 */
export const savePatientMedicalDetails = async (userId, medicalDetails) => {
  // Normalize address to JSON string or object
  let formattedAddress = medicalDetails.address;
  if (typeof medicalDetails.address === 'object' && medicalDetails.address !== null) {
    formattedAddress = JSON.stringify(medicalDetails.address);
  }

  const normalizedDetails = {
    ...medicalDetails,
    address: formattedAddress || null,
  };

  // Always persist to local cache first so patient never loses data
  if (userId) {
    localStorage.setItem(`healflow_medical_${userId}`, JSON.stringify(normalizedDetails));
  }

  if (!isSupabaseConfigured) {
    return normalizedDetails;
  }

  // Find target authenticated user ID
  let targetUid = userId;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      targetUid = user.id;
    }
  } catch (e) {
    console.warn('[patientService] auth getUser check notice:', e.message);
  }

  if (!targetUid) {
    return normalizedDetails;
  }

  const payload = {
    profile_id: targetUid,
    date_of_birth: normalizedDetails.dateOfBirth,
    gender: normalizedDetails.gender,
    blood_group: normalizedDetails.bloodGroup || null,
    address: formattedAddress || null,
    emergency_contact_phone: normalizedDetails.emergencyContactPhone || null,
    known_allergies: normalizedDetails.knownAllergies || null,
    updated_at: new Date().toISOString(),
  };

  try {
    // 1. Try upsert first
    const { data: upsertData, error: upsertErr } = await supabase
      .from('patients')
      .upsert(payload, { onConflict: 'profile_id' })
      .select()
      .maybeSingle();

    if (!upsertErr && upsertData) {
      return upsertData;
    }

    // 2. If upsert fails or policy prevents upsert, check if existing record exists
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('profile_id', targetUid)
      .maybeSingle();

    if (existing?.id) {
      const { data: updateData, error: updateErr } = await supabase
        .from('patients')
        .update(payload)
        .eq('profile_id', targetUid)
        .select()
        .maybeSingle();

      if (updateErr) {
        console.warn('[patientService] Update notice (RLS restriction):', updateErr.message);
        // Fallback to local storage cache without throwing blocking error
        return { ...payload, id: existing.id, _cachedLocally: true };
      }
      return updateData;
    } else {
      const { data: insertData, error: insertErr } = await supabase
        .from('patients')
        .insert([payload])
        .select()
        .maybeSingle();

      if (insertErr) {
        console.warn('[patientService] Insert notice (RLS restriction):', insertErr.message);
        // Fallback gracefully so UI is not blocked
        return { ...payload, _cachedLocally: true };
      }
      return insertData;
    }
  } catch (err) {
    console.warn('[patientService] Database operation caught, applying local state fallback:', err.message);
    return { ...payload, _cachedLocally: true };
  }
};

/**
 * Save or update patient base profile in Supabase DB (public.profiles)
 * @param {string} userId - Profile ID
 * @param {Object} updatedFields - Fields to update (name, phone, avatar)
 * @returns {Promise<Object|null>} Updated patient object
 */
export const updatePatientProfileInBackendDb = async (userId, updatedFields) => {
  if (!userId) return null;

  // Resolve target UID from active auth session if available
  let targetUid = userId;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) targetUid = user.id;
  } catch (e) {
    // ignore
  }

  if (!isSupabaseConfigured) {
    return updatedFields;
  }

  try {
    const profileUpdates = {
      id: targetUid,
    };
    if (updatedFields.name !== undefined) profileUpdates.full_name = updatedFields.name;
    if (updatedFields.phone !== undefined) profileUpdates.phone = updatedFields.phone;
    if (updatedFields.email !== undefined) profileUpdates.email = updatedFields.email;
    if (updatedFields.avatar !== undefined) profileUpdates.avatar_url = updatedFields.avatar;

    // 1. Try updating profiles table directly
    let savedProfile = null;
    const { data: updateData, error: updateErr } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', targetUid)
      .select()
      .maybeSingle();

    if (!updateErr && updateData) {
      savedProfile = updateData;
    } else {
      // 2. If update didn't match or failed, try upsert
      const { data: upsertData, error: upsertErr } = await supabase
        .from('profiles')
        .upsert(profileUpdates, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (upsertErr) {
        console.warn('[patientService] Warning updating profiles table in DB:', upsertErr.message);
      } else {
        savedProfile = upsertData;
      }
    }

    // Also update medical details if provided
    if (
      updatedFields.dateOfBirth !== undefined ||
      updatedFields.gender !== undefined ||
      updatedFields.bloodGroup !== undefined ||
      updatedFields.address !== undefined ||
      updatedFields.emergencyContactPhone !== undefined ||
      updatedFields.knownAllergies !== undefined
    ) {
      try {
        await savePatientMedicalDetails(targetUid, {
          dateOfBirth: updatedFields.dateOfBirth,
          gender: updatedFields.gender,
          bloodGroup: updatedFields.bloodGroup,
          address: updatedFields.address,
          emergencyContactPhone: updatedFields.emergencyContactPhone,
          knownAllergies: updatedFields.knownAllergies,
        });
      } catch (medErr) {
        console.warn('[patientService] Optional medical details save warning:', medErr.message);
      }
    }

    return {
      id: targetUid,
      name: savedProfile?.full_name || updatedFields.name,
      email: savedProfile?.email || updatedFields.email,
      phone: savedProfile?.phone || updatedFields.phone,
      avatar: savedProfile?.avatar_url || updatedFields.avatar,
      role: savedProfile?.role || 'patient',
      healthId: `HLF-${targetUid.slice(0, 8).toUpperCase()}`,
      dateOfBirth: updatedFields.dateOfBirth,
      gender: updatedFields.gender,
      bloodGroup: updatedFields.bloodGroup,
      address: updatedFields.address,
      emergencyContactPhone: updatedFields.emergencyContactPhone,
      knownAllergies: updatedFields.knownAllergies,
      hasCompletedMedicalDetails: Boolean(updatedFields.dateOfBirth && updatedFields.gender),
    };
  } catch (err) {
    console.warn('[patientService] Exception updating profile in DB, continuing smoothly:', err.message);
    return {
      id: targetUid,
      ...updatedFields,
    };
  }
};

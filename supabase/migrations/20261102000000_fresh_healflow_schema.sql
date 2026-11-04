-- ====================================================================
-- HEALFLOW – FRESH COMPLETE DATABASE SCHEMA & RLS POLICIES
-- File: supabase/migrations/20261102000000_fresh_healflow_schema.sql
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. CREATE TABLE: PROFILES (Accounts for Patients, Doctors, Admins)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. CREATE TABLE: PATIENTS (Medical Profile for Onboarding & OPD)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    blood_group TEXT,
    address TEXT,
    emergency_contact_phone TEXT,
    known_allergies TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. CREATE TABLE: DOCTORS (Doctor Profiles & Consultation Details)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience_years INT NOT NULL DEFAULT 5,
    hospital TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.9,
    review_count INT DEFAULT 50,
    consultation_fee INT NOT NULL DEFAULT 100,
    room_number TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. CREATE TABLE: DOCTOR_SLOTS (Booking Slots per Doctor)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.doctor_slots (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TEXT NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. CREATE TABLE: APPOINTMENTS (OPD Bookings & Tokens)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    specialty TEXT NOT NULL,
    slot_date DATE NOT NULL,
    slot_time TEXT NOT NULL,
    reason TEXT,
    token_number TEXT NOT NULL,
    token_index INT NOT NULL,
    status TEXT CHECK (status IN ('Scheduled', 'Checked In', 'In Session', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. CREATE TABLE: QUEUES (Live Doctor OPD Telemetry)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.queues (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    doctor_id UUID UNIQUE REFERENCES public.doctors(id) ON DELETE CASCADE,
    current_token TEXT NOT NULL,
    serving_patient TEXT,
    total_in_queue INT DEFAULT 0,
    status TEXT CHECK (status IN ('ACTIVE', 'PAUSED')) DEFAULT 'ACTIVE',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_patients_profile_id ON public.patients(profile_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON public.doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_doctor_id ON public.doctor_slots(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_queues_doctor_id ON public.queues(doctor_id);

-- ====================================================================
-- 9. AUTOMATIC USER PROFILE TRIGGER (Fires on Supabase auth.users INSERT)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_full_name TEXT;
    user_phone TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
    IF user_role NOT IN ('patient', 'doctor', 'admin') THEN
        user_role := 'patient';
    END IF;

    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
    user_phone := NEW.raw_user_meta_data->>'phone';

    INSERT INTO public.profiles (id, full_name, email, phone, role, avatar_url)
    VALUES (
        NEW.id,
        user_full_name,
        NEW.email,
        user_phone,
        user_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;

-- 10.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 10.2 PATIENTS POLICIES
DROP POLICY IF EXISTS "Patients read own record" ON public.patients;
CREATE POLICY "Patients read own record"
    ON public.patients FOR SELECT
    USING (
        auth.uid() = profile_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'doctor'
        )
    );

DROP POLICY IF EXISTS "Patients insert own record" ON public.patients;
CREATE POLICY "Patients insert own record"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Patients update own record" ON public.patients;
CREATE POLICY "Patients update own record"
    ON public.patients FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- 10.3 DOCTORS POLICIES
DROP POLICY IF EXISTS "Public read active doctors" ON public.doctors;
CREATE POLICY "Public read active doctors"
    ON public.doctors FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Doctors update own profile" ON public.doctors;
CREATE POLICY "Doctors update own profile"
    ON public.doctors FOR ALL
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- 10.4 DOCTOR SLOTS POLICIES
DROP POLICY IF EXISTS "Public read doctor slots" ON public.doctor_slots;
CREATE POLICY "Public read doctor slots"
    ON public.doctor_slots FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Manage doctor slots" ON public.doctor_slots;
CREATE POLICY "Manage doctor slots"
    ON public.doctor_slots FOR ALL
    USING (true)
    WITH CHECK (true);

-- 10.5 APPOINTMENTS POLICIES
DROP POLICY IF EXISTS "Users read appointments" ON public.appointments;
CREATE POLICY "Users read appointments"
    ON public.appointments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users insert appointments" ON public.appointments;
CREATE POLICY "Users insert appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users update appointments" ON public.appointments;
CREATE POLICY "Users update appointments"
    ON public.appointments FOR UPDATE
    USING (true);

-- 10.6 QUEUES POLICIES
DROP POLICY IF EXISTS "Public read queues" ON public.queues;
CREATE POLICY "Public read queues"
    ON public.queues FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Manage queues" ON public.queues;
CREATE POLICY "Manage queues"
    ON public.queues FOR ALL
    USING (true)
    WITH CHECK (true);

-- ====================================================================
-- 11. SUPABASE REALTIME ENABLEMENT
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.queues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_slots;

-- ====================================================================
-- 12. SEED INITIAL VERIFIED SPECIALIST DOCTORS & LIVE OPD QUEUES
-- ====================================================================
INSERT INTO public.doctors (id, name, title, specialty, experience_years, hospital, rating, review_count, consultation_fee, room_number, avatar_url, bio, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Dr. Rajesh Sharma', 'MD, FACC - Senior Consultant Cardiologist', 'Cardiology', 14, 'Apollo Super Speciality Hospital', 4.9, 128, 1200, 'Room 302', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400', 'Senior Cardiologist specializing in preventative cardiology, hypertension, and clinical ECG telemetry.', true),
    ('c2222222-2222-2222-2222-222222222222', 'Dr. Ananya Roy', 'MD, FAAD - Consultant Dermatologist', 'Dermatology', 11, 'Max Super Speciality Skin Center', 4.85, 94, 800, 'Room 105', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400', 'Expert in clinical dermatology, pediatric skin care, eczema treatment, and allergy therapeutics.', true),
    ('c3333333-3333-3333-3333-333333333333', 'Dr. Vikram Malhotra', 'MD, DCH - Chief Pediatrician', 'Pediatrics', 16, 'Fortis Children Health Pavilion', 4.95, 210, 700, 'Room 201', 'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=400', 'Compassionate pediatric care focusing on newborn developmental milestones, immunization, and child wellness.', true),
    ('c4444444-4444-4444-4444-444444444444', 'Dr. Priya Patel', 'DM, M.Ch - Consultant Neurologist', 'Neurology', 18, 'Manipal Institute of Neurological Sciences', 4.92, 165, 1500, 'Room 408', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400', 'Specialist in migraine diagnostics, peripheral neuropathies, stroke rehabilitation, and spine neurology.', true),
    ('c5555555-5555-5555-5555-555555555555', 'Dr. Suresh Iyer', 'MS, FRCS - Senior Orthopedic Surgeon', 'Orthopedics', 12, 'Medanta Bone & Joint Institute', 4.88, 112, 1100, 'Room 112', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 'Expert in joint rehabilitation, sports injuries, fracture management, and arthroscopic procedures.', true),
    ('c6666666-6666-6666-6666-666666666666', 'Dr. Kavita Verma', 'MD - Internal Medicine Consultant', 'General Medicine', 9, 'Smart Clinic Primary Care Center', 4.79, 87, 500, 'Room 101', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400', 'Dedicated physician providing comprehensive primary care checkups, diabetes and blood pressure management.', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Corresponding Active OPD Queues
INSERT INTO public.queues (doctor_id, current_token, serving_patient, total_in_queue, status, last_updated)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'CARD-001', 'Regular Walk-in', 4, 'ACTIVE', NOW()),
    ('c2222222-2222-2222-2222-222222222222', 'DERM-001', 'Regular Walk-in', 3, 'ACTIVE', NOW()),
    ('c3333333-3333-3333-3333-333333333333', 'PED-001', 'Regular Walk-in', 5, 'ACTIVE', NOW()),
    ('c4444444-4444-4444-4444-444444444444', 'NEUR-001', 'Regular Walk-in', 2, 'ACTIVE', NOW()),
    ('c5555555-5555-5555-5555-555555555555', 'ORTH-001', 'Regular Walk-in', 3, 'ACTIVE', NOW()),
    ('c6666666-6666-6666-6666-666666666666', 'GEN-001', 'Regular Walk-in', 6, 'ACTIVE', NOW())
ON CONFLICT (doctor_id) DO UPDATE SET
    current_token = EXCLUDED.current_token,
    status = EXCLUDED.status,
    last_updated = NOW();


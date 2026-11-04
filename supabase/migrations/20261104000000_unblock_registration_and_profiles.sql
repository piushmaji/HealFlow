-- ====================================================================
-- HEALFLOW: FIX AUTHENTICATION, DISABLE EMAIL CONFIRMATION ROADBLOCKS
-- AND ALLOW ANONYMOUS / DIRECT REGISTRATION IN SUPABASE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zhrdwcapfqwoyrdcrwzb/sql
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Modify public.profiles to allow standalone IDs (not strictly tied to auth.users if email auth is disabled)
DO $$
BEGIN
    -- Drop the foreign key constraint on profiles.id if it exists so direct registration works flawlessly
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

-- 3. PERMISSIVE RLS FOR public.profiles
-- This allows newly registered users to write and read their profile directly
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles management" ON public.profiles;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Allow all profiles management"
    ON public.profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. PERMISSIVE RLS FOR public.patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all patients management" ON public.patients;
DROP POLICY IF EXISTS "Patients manage own record" ON public.patients;
DROP POLICY IF EXISTS "Public patients access" ON public.patients;

CREATE POLICY "Allow all patients management"
    ON public.patients
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. PERMISSIVE RLS FOR public.doctors, public.doctor_slots, public.appointments, public.queues
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all doctors management" ON public.doctors;
CREATE POLICY "Allow all doctors management" ON public.doctors FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all slots management" ON public.doctor_slots;
CREATE POLICY "Allow all slots management" ON public.doctor_slots FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all appointments management" ON public.appointments;
CREATE POLICY "Allow all appointments management" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all queues management" ON public.queues;
CREATE POLICY "Allow all queues management" ON public.queues FOR ALL USING (true) WITH CHECK (true);

-- 6. Insert Default Seed Doctors (if table is empty)
INSERT INTO public.doctors (id, name, title, specialty, experience_years, hospital, rating, review_count, consultation_fee, room_number, avatar_url, bio, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Dr. Rajesh Sharma', 'MD, FACC - Senior Consultant Cardiologist', 'Cardiology', 14, 'Apollo Super Speciality Hospital', 4.9, 128, 1200, 'Room 302', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400', 'Senior Cardiologist specializing in preventative cardiology, hypertension, and clinical ECG telemetry.', true),
    ('c2222222-2222-2222-2222-222222222222', 'Dr. Ananya Roy', 'MD, FAAD - Consultant Dermatologist', 'Dermatology', 11, 'Max Super Speciality Skin Center', 4.85, 94, 800, 'Room 105', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400', 'Expert in clinical dermatology, pediatric skin care, eczema treatment, and allergy therapeutics.', true),
    ('c3333333-3333-3333-3333-333333333333', 'Dr. Vikram Malhotra', 'MD, DCH - Chief Pediatrician', 'Pediatrics', 16, 'Fortis Children Health Pavilion', 4.95, 210, 700, 'Room 201', 'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=400', 'Compassionate pediatric care focusing on newborn developmental milestones, immunization, and child wellness.', true),
    ('c4444444-4444-4444-4444-444444444444', 'Dr. Priya Patel', 'DM, M.Ch - Consultant Neurologist', 'Neurology', 18, 'Manipal Institute of Neurological Sciences', 4.92, 165, 1500, 'Room 408', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400', 'Specialist in migraine diagnostics, peripheral neuropathies, stroke rehabilitation, and spine neurology.', true),
    ('c5555555-5555-5555-5555-555555555555', 'Dr. Suresh Iyer', 'MS, FRCS - Senior Orthopedic Surgeon', 'Orthopedics', 12, 'Medanta Bone & Joint Institute', 4.88, 112, 1100, 'Room 112', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 'Expert in joint rehabilitation, sports injuries, fracture management, and arthroscopic procedures.', true),
    ('c6666666-6666-6666-6666-666666666666', 'Dr. Kavita Verma', 'MD - Internal Medicine Consultant', 'General Medicine', 9, 'Smart Clinic Primary Care Center', 4.79, 87, 500, 'Room 101', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400', 'Dedicated physician providing comprehensive primary care checkups, diabetes and blood pressure management.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.queues (doctor_id, current_token, serving_patient, total_in_queue, status, last_updated)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'CARD-001', 'Regular Walk-in', 4, 'ACTIVE', NOW()),
    ('c2222222-2222-2222-2222-222222222222', 'DERM-001', 'Regular Walk-in', 3, 'ACTIVE', NOW()),
    ('c3333333-3333-3333-3333-333333333333', 'PED-001', 'Regular Walk-in', 5, 'ACTIVE', NOW()),
    ('c4444444-4444-4444-4444-444444444444', 'NEUR-001', 'Regular Walk-in', 2, 'ACTIVE', NOW()),
    ('c5555555-5555-5555-5555-555555555555', 'ORTH-001', 'Regular Walk-in', 3, 'ACTIVE', NOW()),
    ('c6666666-6666-6666-6666-666666666666', 'GEN-001', 'Regular Walk-in', 6, 'ACTIVE', NOW())
ON CONFLICT (doctor_id) DO NOTHING;


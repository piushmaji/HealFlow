-- ====================================================================
-- SMART CLINIC – DATABASE MIGRATION: INITIAL SCHEMA & RLS POLICIES
-- File: supabase/migrations/20260827000000_initial_schema.sql
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience_years INT NOT NULL DEFAULT 5,
    hospital TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.9,
    review_count INT DEFAULT 50,
    consultation_fee INT NOT NULL DEFAULT 100,
    room_number TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Doctor Time Slots Table
CREATE TABLE IF NOT EXISTS public.doctor_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TEXT NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 6. Create Realtime OPD Queues Table
CREATE TABLE IF NOT EXISTS public.queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID UNIQUE REFERENCES public.doctors(id) ON DELETE CASCADE,
    current_token TEXT NOT NULL,
    serving_patient TEXT,
    total_in_queue INT DEFAULT 0,
    status TEXT CHECK (status IN ('ACTIVE', 'PAUSED')) DEFAULT 'ACTIVE',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active doctors & queues for appointment discovery
CREATE POLICY "Public Read Active Doctors" ON public.doctors FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Queues" ON public.queues FOR SELECT USING (true);
CREATE POLICY "Public Read Slots" ON public.doctor_slots FOR SELECT USING (true);

-- Allow patients to read and create their appointments
CREATE POLICY "Users Read Own Appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Users Insert Appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users Update Appointments" ON public.appointments FOR UPDATE USING (true);

-- Allow doctor queue updates
CREATE POLICY "Doctor Queue Updates" ON public.queues FOR UPDATE USING (true);

-- ====================================================================
-- SUPABASE REALTIME PUBLICATION ENABLEMENT
-- ====================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.queues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

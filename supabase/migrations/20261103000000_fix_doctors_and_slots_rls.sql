-- ====================================================================
-- HEALFLOW: COMPLETE RLS FIX FOR DOCTORS, DOCTOR_SLOTS, QUEUES & APPOINTMENTS
-- File: supabase/migrations/20261103000000_fix_doctors_and_slots_rls.sql
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/zhrdwcapfqwoyrdcrwzb/sql)
-- ====================================================================

-- 1. Ensure RLS is enabled
ALTER TABLE IF EXISTS public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.doctor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Drop restrictive/stale policies
DROP POLICY IF EXISTS "Public read active doctors" ON public.doctors;
DROP POLICY IF EXISTS "Doctors update own profile" ON public.doctors;
DROP POLICY IF EXISTS "Allow authenticated users to manage doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow all for doctors" ON public.doctors;

DROP POLICY IF EXISTS "Public read doctor slots" ON public.doctor_slots;
DROP POLICY IF EXISTS "Manage doctor slots" ON public.doctor_slots;
DROP POLICY IF EXISTS "Allow all for doctor_slots" ON public.doctor_slots;

DROP POLICY IF EXISTS "Public read queues" ON public.queues;
DROP POLICY IF EXISTS "Doctors manage queues" ON public.queues;
DROP POLICY IF EXISTS "Allow all for queues" ON public.queues;

DROP POLICY IF EXISTS "Users read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all for appointments" ON public.appointments;

-- 3. PERMISSIVE POLICIES FOR DOCTORS TABLE
CREATE POLICY "Allow read doctors"
    ON public.doctors FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated to insert/update doctors"
    ON public.doctors FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon to update doctors"
    ON public.doctors FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- 4. PERMISSIVE POLICIES FOR DOCTOR_SLOTS TABLE
CREATE POLICY "Allow read doctor_slots"
    ON public.doctor_slots FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated to manage doctor_slots"
    ON public.doctor_slots FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon to manage doctor_slots"
    ON public.doctor_slots FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- 5. PERMISSIVE POLICIES FOR QUEUES TABLE
CREATE POLICY "Allow read queues"
    ON public.queues FOR SELECT
    USING (true);

CREATE POLICY "Allow manage queues"
    ON public.queues FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon to manage queues"
    ON public.queues FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- 6. PERMISSIVE POLICIES FOR APPOINTMENTS TABLE
CREATE POLICY "Allow read appointments"
    ON public.appointments FOR SELECT
    USING (true);

CREATE POLICY "Allow manage appointments"
    ON public.appointments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon to manage appointments"
    ON public.appointments FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);


-- ====================================================================
-- QUICK FIX: FIX PATIENTS TABLE ROW-LEVEL SECURITY (RLS) POLICIES
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Ensure RLS is active on patients table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting restrictive policies on patients
DROP POLICY IF EXISTS "Patients read own record" ON public.patients;
DROP POLICY IF EXISTS "Patients insert own record" ON public.patients;
DROP POLICY IF EXISTS "Patients update own record" ON public.patients;
DROP POLICY IF EXISTS "Doctors read patient records" ON public.patients;
DROP POLICY IF EXISTS "Enable all access for patients" ON public.patients;
DROP POLICY IF EXISTS "Allow authenticated to manage patients" ON public.patients;

-- 3. Policy: Allow authenticated users to SELECT their own record (or doctors to read)
CREATE POLICY "Patients select own record"
    ON public.patients
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = profile_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'doctor'
        )
    );

-- 4. Policy: Allow authenticated users to INSERT with auth.uid() = profile_id
CREATE POLICY "Patients insert own record"
    ON public.patients
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = profile_id);

-- 5. Policy: Allow authenticated users to UPDATE their own record
CREATE POLICY "Patients update own record"
    ON public.patients
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- Optional Fallback: If you prefer completely permissive access during testing/development:
-- CREATE POLICY "Enable all access for patients" ON public.patients FOR ALL TO public USING (true) WITH CHECK (true);


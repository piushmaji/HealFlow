-- ====================================================================
-- SUPABASE STORAGE BUCKET & RLS POLICIES FOR AVATARS & PROFILES
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Create 'avatars' Storage Bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

-- 2. Storage Objects RLS Policies for 'avatars' bucket
-- Drop old policies to prevent collision
DROP POLICY IF EXISTS "Public can view avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow any upload to avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from avatars" ON storage.objects;

-- Allow anyone to view avatars (public read)
CREATE POLICY "Allow public read from avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Allow authenticated and anon users to upload to avatars bucket
CREATE POLICY "Allow any upload to avatars bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow any update to avatars bucket"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars')
    WITH CHECK (bucket_id = 'avatars');

-- 3. PERMISSIVE RLS FOR public.profiles (Avoid update rejection)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated to manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles management" ON public.profiles;

CREATE POLICY "Allow all profiles management"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon read profiles"
    ON public.profiles
    FOR SELECT
    TO anon
    USING (true);

-- 4. PERMISSIVE RLS FOR public.patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients manage own record" ON public.patients;
DROP POLICY IF EXISTS "Public patients access" ON public.patients;
DROP POLICY IF EXISTS "Allow all patients management" ON public.patients;

CREATE POLICY "Allow all patients management"
    ON public.patients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon patients management"
    ON public.patients
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);


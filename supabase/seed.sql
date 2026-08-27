-- ====================================================================
-- SMART CLINIC – DATABASE SEED DATA
-- File: supabase/seed.sql
-- ====================================================================

INSERT INTO public.doctors (id, name, title, specialty, experience_years, hospital, rating, review_count, consultation_fee, room_number, avatar_url, bio)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Sarah Jenkins', 'MD, FACC - Lead Cardiologist', 'Cardiology', 14, 'Apex Heart Institute', 4.90, 128, 150, 'Room 302 (Cardio Block)', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400', 'Specialist in preventative cardiology, hypertension, and non-invasive imaging.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Dr. Marcus Vance', 'MD, FAAD - Clinical Dermatologist', 'Dermatology', 11, 'St. Jude Skin Center', 4.85, 94, 120, 'Room 105 (Derm Clinic)', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400', 'Expert in pediatric & adult dermatology, acne management, and eczema therapeutics.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Dr. Elena Rostova', 'MD, DCH - Senior Pediatrician', 'Pediatrics', 16, 'Metro Children Hospital', 4.95, 210, 100, 'Room 201 (Child Care)', 'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=400', 'Compassionate pediatric care focusing on newborn developmental milestones and immunology.');

INSERT INTO public.queues (doctor_id, current_token, serving_patient, total_in_queue, status)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CARD-004', 'Michael Scott', 8, 'ACTIVE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'DERM-002', 'Jessica Taylor', 5, 'ACTIVE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'PED-006', 'Ethan Brown', 10, 'ACTIVE');

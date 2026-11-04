# 🏥 HealFlow – Comprehensive Project Analysis & Production Database Blueprint

> **Document Version:** 1.0.0  
> **Last Updated:** September 12, 2026  
> **Target Purpose:** Complete system audit, role mapping, page catalog, feature matrix, and authoritative backend database schema blueprint for building production database tables & backend services.

---

## 📑 Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [User Roles & Access Control Matrix](#2-user-roles--access-control-matrix)
3. [Page Catalog & Frontend Routes (13 Pages)](#3-page-catalog--frontend-routes-13-pages)
4. [Introduced Features & System Capabilities](#4-introduced-features--system-capabilities)
5. [Database Schema Blueprint (Deep Technical Focus)](#5-database-schema-blueprint-deep-technical-focus)
   - [5.1 Entity Relationship Diagram (ERD) Conceptual Model](#51-entity-relationship-diagram-erd-conceptual-model)
   - [5.2 Existing Initial Schema Audit](#52-existing-initial-schema-audit)
   - [5.3 Production Database Table Specifications (15 Tables)](#53-production-database-table-specifications-15-tables)
   - [5.4 Row Level Security (RLS) & Security Policies](#54-row-level-security-rls--security-policies)
6. [Backend API Services & Endpoints Specification](#6-backend-api-services--endpoints-specification)
7. [Comprehensive Project Metrics & Database Roadmap](#7-comprehensive-project-metrics--database-roadmap)

---

## 1. 📌 Executive Summary & Vision

**HealFlow** is a next-generation, AI-empowered Healthcare & OPD Queue Management Ecosystem designed to transform the patient consultation experience, streamline clinic workflows, eliminate physical waiting lines, and connect patients with healthcare providers through intelligent AI triage.

### Core Value Proposition:
1. **Live OPD Queue Tracking:** Real-time token tracking with live sound alerts, estimated wait times, and active token updates powered by Supabase Realtime / WebSockets.
2. **AI Clinical Assistant & Triage:** Intelligent natural language symptom analyzer recommending appropriate medical specialties with emergency detection.
3. **Seamless Multi-Role Experience:** Dedicated interfaces tailored for Patients, Doctors, Clinic Administrators, Pharmacists, and Diagnostic Labs.
4. **End-to-End Digital Healthcare:** Instant slot booking, electronic medical records (EHR), digital prescriptions, live doctor-patient chat, and queue control panels.

---

## 2. 👥 User Roles & Access Control Matrix

HealFlow defines **6 distinct operational roles**, with 2 primary active frontend roles currently implemented and 4 extended ecosystem roles designed for complete backend database coverage.

| Role ID | Role Name | System Access Level | Key Capabilities & Responsibilities |
| :--- | :--- | :--- | :--- |
| `patient` | **Patient** | Authenticated User | Browse doctors, AI symptom checker, book appointments, track live OPD token queue, store health profile & medical records, chat with doctor. |
| `doctor` | **Doctor / Practitioner** | Authenticated Provider | Manage daily OPD queue (Call Next, Pause, Finish), view patient history, write digital prescriptions, conduct chat consultations, manage availability slots. |
| `admin` | **Clinic Administrator** | Super Admin | Manage hospital/clinic staff, onboard doctors, view global OPD analytics, override queue statuses, manage billing & system audit logs. |
| `pharmacist` | **Pharmacist / Pharmacy Staff** | Staff User | Receive verified digital prescriptions, fulfill medicine orders, manage drug inventory & stock levels. |
| `lab_tech` | **Lab Technician / Pathologist** | Staff User | Manage diagnostic test requests, upload test reports & blood work PDFs, link reports directly to patient medical records. |
| `receptionist` | **Front Desk / Receptionist** | Staff User | Manual walk-in patient registration, physical token distribution, cash collection, and manual queue updates. |

### Role Access Guard Architecture (Frontend Enforcement):
- `UnauthenticatedOnlyRoute`: Restricts logged-in users from seeing landing/login pages, auto-redirecting to their role-specific dashboard (`/patients/dashboard` vs `/doctor-dashboard`).
- `PatientOnlyRoute`: Guarantees only `role === 'patient'` can view patient profile, booking, and patient chat.
- `DoctorOnlyRoute`: Guarantees only `role === 'doctor'` can view OPD control panel and physician analytics.

---

## 3. 📄 Page Catalog & Frontend Routes (13 Pages)

HealFlow currently features **13 distinct frontend pages** structured under clean layouts (`AppLayout` for public landing, `DashboardLayout` for authenticated workspace).

| # | Page Component | Route Path | Access Level | Description & Core UI Modules |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `HomePage.jsx` | `/` | Public (Logged-Out) | Landing page featuring Hero section, Live OPD Queue stats ticker, Top Doctors showcase, AI Copilot highlight, Specialty browser, & FAQ. |
| **2** | `LoginPage.jsx` | `/login`, `/register` | Public (Logged-Out) | Dual-tab login & registration interface with instant role switcher toggle (Patient vs Doctor mode) and 1-click Demo credentials. |
| **3** | `DoctorsDirectoryPage.jsx` | `/doctors` | Authenticated Shared | Comprehensive doctor listing with multi-parameter filtering (Specialty, Search Query, Availability, Hospital location, Fee range). |
| **4** | `DoctorDetailsPage.jsx` | `/doctors/:doctorId` | Authenticated Shared | Detailed doctor profile page showing qualifications, hospital affiliation, room number, consultation fee, patient reviews, and live slot grid. |
| **5** | `BookAppointmentPage.jsx` | `/doctors/:doctorId/book`, `/book-slot` | Authenticated Patient | Interactive appointment booking interface with calendar slot selection, reason for visit input, and instant token generation (e.g. `CARD-007`). |
| **6** | `LiveQueuePage.jsx` | `/patients/live-queue`, `/live-queue/:id` | Authenticated Patient / Shared | Real-time live OPD queue tracker card displaying token sequence, current serving patient, estimated wait time, audio toggle alert, & queue progress bar. |
| **7** | `PatientDashboardPage.jsx` | `/patients/dashboard`, `/patient-dashboard` | Authenticated Patient | Patient command center displaying active live queue cards, upcoming appointments grid, past consultation history, medical records quick link, & AI assist CTA. |
| **8** | `PatientProfilePage.jsx` | `/patients/profile` | Authenticated Patient | Comprehensive Patient Health Profile containing blood group, emergency contact details, chronic conditions, allergies list, past prescriptions, and document upload UI. |
| **9** | `DoctorConsultationChatPage.jsx` | `/patients/consultation/:id`, `/patients/chat/:id` | Authenticated Patient / Doctor | Teleconsultation workspace with live messaging, attachment upload, active vitals bar, digital prescription viewer, and meeting controls. |
| **10** | `DoctorDashboardPage.jsx` | `/doctor-dashboard` | Authenticated Doctor | Physician OPD Management panel featuring live token call buttons (*Call Next*, *Pause Queue*, *Mark Completed*, *Recall*), today's appointment list, and queue metrics. |
| **11** | `AIAssistantPage.jsx` | `/patients/ai-assistant`, `/ai-assistant` | Authenticated Patient / Shared | Standalone AI Health Assistant featuring interactive symptom chat, medical specialty triage recommendation, severity flags, and direct doctor booking integration. |
| **12** | `StyleGuidePage.jsx` | `/style-guide` | Public / Developer | Living Design System documentation showing typography hierarchy, color palette tokens, button variants, card components, badge states, and toast triggers. |
| **13** | `NotFoundPage.jsx` | `*` | Public Fallback | Elegant 404 error screen guiding users back to their workspace or home landing page. |

---

## 4. 🚀 Introduced Features & System Capabilities

HealFlow has introduced **9 core feature modules** in the frontend, requiring robust backend data support:

1. **Real-time OPD Live Queue Engine (`QueueContext` + Supabase Realtime):**
   - Live token broadcasting (`current_token`, `serving_patient`, `total_in_queue`, `status`).
   - Dynamic estimated delay calculation (Avg ~10-15 mins per patient).
   - Audio notification cues when a patient's token is called.
2. **AI Symptom Checker & Clinical Triage (`aiService.js`):**
   - Natural language keyword matching against medical rules database.
   - Urgency & emergency warning detection (e.g. chest pain -> emergency flag).
   - Direct specialty recommendation & instant doctor match routing.
3. **Interactive Time-Slot Booking Engine (`DoctorSchedule` + `BookingModal`):**
   - Doctor schedule slot generator with `is_booked` state handling.
   - Sequential token generation (e.g., `CARD-001`, `DERM-005`, `PED-012`).
4. **Doctor OPD Control Center (`QueueControlPanel`):**
   - Real-time Queue control actions: `Call Next Patient`, `Hold Queue`, `Pause OPD`, `Mark Completed`.
   - Real-time sync with patient dashboard live trackers.
5. **Electronic Health Records (EHR) & Profile Management:**
   - Patient health parameters (Blood Group, Height/Weight, Allergies, Chronic Conditions).
   - Medical document attachment store.
6. **Live Teleconsultation & Chat Workspace:**
   - Chat thread between patient and doctor per appointment ID.
   - Digital prescription attachment & patient vital statistics banner.
7. **Multi-Role Context Switching (`AuthContext` + `RoleSwitcher`):**
   - Seamless demo switching between Patient mode (Rahul Sharma) and Doctor mode (Dr. Rajesh Sharma).
   - Persisted role state in `localStorage` + state context.
8. **Doctor Directory & Multi-Facet Filtering:**
   - Real-time search across doctor names, medical specialties, hospital names, and room locations.
9. **Global Notification & Toast System (`ToastContext`):**
   - Feedback alerts for successful bookings, queue position updates, and error handles.

---

## 5. 🗄️ Database Schema Blueprint (Deep Technical Focus)

> **Goal:** This section defines the complete, production-ready relational database schema required for HealFlow. It builds upon the initial Supabase schema (`20260827000000_initial_schema.sql`) and expands it into **15 robust database tables** covering all current and planned system requirements.

### 5.1 Entity Relationship Diagram (ERD) Conceptual Model

```
                    ┌─────────────────────────┐
                    │       auth.users        │
                    └────────────┬────────────┘
                                 │ (1:1)
                    ┌────────────┴────────────┐
                    │    public.profiles      │
                    └──────┬────────────┬─────┘
                     (1:1) │            │ (1:1)
         ┌─────────────────┴─┐        ┌─┴─────────────────┐
         │  public.patients  │        │  public.doctors   │
         └────────┬──────────┘        └─┬────────────┬────┘
                  │                     │            │
            (1:N) │                (1:N)│       (1:1)│
         ┌────────┴──────────┐          │     ┌──────┴────────────┐
         │public.appointments├──────────┘     │   public.queues   │
         └────────┬──────────┘                └───────────────────┘
                  │
  ┌───────────────┼───────────────┬──────────────────┬─────────────────┐
  │ (1:1)         │ (1:N)         │ (1:1)            │ (1:N)           │ (1:N)
┌─┴─────────────┐ │             ┌─┴──────────────┐ ┌─┴───────────────┐ │
│public.payments│ │             │ prescriptions  │ │ chat_messages   │ │
└───────────────┘ │             └───────┬────────┘ └─────────────────┘ │
                  │                     │ (1:N)                        │
        ┌─────────┴──────────┐   ┌──────┴─────────────┐      ┌─────────┴──────────┐
        │   medical_records  │   │ prescription_items │      │reviews_and_ratings │
        └────────────────────┘   └────────────────────┘      └────────────────────┘
```

---

### 5.2 Existing Initial Schema Audit

The existing migration file `supabase/migrations/20260827000000_initial_schema.sql` creates **5 basic tables**:
1. `profiles` (Auth profiles link)
2. `doctors` (Doctor directory metadata)
3. `doctor_slots` (Doctor time slot availability)
4. `appointments` (Patient appointment bookings & tokens)
5. `queues` (Live OPD queue real-time state)

---

### 5.3 Production Database Table Specifications (15 Tables)

Here is the exact data dictionary, data types, constraints, foreign keys, and indexes for all **15 Database Tables**.

---

#### Table 1: `public.profiles` (User Base Identities & Roles)
Stores essential user account info linked directly to Supabase `auth.users`.

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'pharmacist', 'lab_tech', 'receptionist')) DEFAULT 'patient',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
```

---

#### Table 2: `public.patients` (Detailed Patient Clinical Profiles)
Stores extended clinical & personal health details for patient users.

```sql
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer Not to Say')),
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    chronic_conditions TEXT[], -- e.g. ARRAY['Hypertension', 'Type 2 Diabetes']
    allergies TEXT[],          -- e.g. ARRAY['Penicillin', 'Peanuts']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_profile_id ON public.patients(profile_id);
```

---

#### Table 3: `public.doctors` (Physician Credentials & Metadata)
Stores medical qualifications, hospital affiliations, fees, ratings, and room assignments.

```sql
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,         -- e.g. 'MD, FACC - Senior Consultant'
    specialty TEXT NOT NULL,     -- e.g. 'Cardiology'
    experience_years INT NOT NULL DEFAULT 0,
    hospital TEXT NOT NULL,      -- e.g. 'Apollo Super Speciality Hospital'
    location TEXT NOT NULL,      -- e.g. 'Ameerpet, Hyderabad'
    consultation_fee INT NOT NULL DEFAULT 500,
    room_number TEXT NOT NULL,   -- e.g. 'Room 302 (Cardio Block)'
    rating NUMERIC(3,2) DEFAULT 4.90,
    review_count INT DEFAULT 0,
    avatar_url TEXT,
    bio TEXT,
    degrees TEXT[],              -- e.g. ARRAY['MBBS', 'MD', 'DM']
    specializations TEXT[],      -- e.g. ARRAY['Hypertension', 'Interventional Cardiology']
    available_days TEXT[],       -- e.g. ARRAY['Monday', 'Wednesday', 'Friday']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX idx_doctors_profile_id ON public.doctors(profile_id);
```

---

#### Table 4: `public.doctor_slots` (Appointment Time Slot Availability)
Defines dynamic date and time slot availability per doctor.

```sql
CREATE TABLE IF NOT EXISTS public.doctor_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TEXT NOT NULL,     -- e.g. '10:30 AM'
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doctor_id, slot_date, slot_time)
);

CREATE INDEX idx_doctor_slots_lookup ON public.doctor_slots(doctor_id, slot_date, is_booked);
```

---

#### Table 5: `public.appointments` (Patient Bookings & Queue Tokens)
Central entity managing patient consultation bookings, token indexes, and status tracking.

```sql
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    specialty TEXT NOT NULL,
    slot_date DATE NOT NULL,
    slot_time TEXT NOT NULL,
    reason TEXT,
    token_number TEXT NOT NULL, -- e.g. 'CARD-007'
    token_index INT NOT NULL,   -- e.g. 7
    status TEXT CHECK (status IN ('Scheduled', 'Checked In', 'In Session', 'Completed', 'Cancelled', 'No Show')) DEFAULT 'Scheduled',
    consultation_fee INT NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('Pending', 'Paid', 'Refunded')) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_date ON public.appointments(doctor_id, slot_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
```

---

#### Table 6: `public.queues` (Real-Time OPD Live Token Queue)
Manages the real-time active token counter and serving patient for each doctor's OPD room.

```sql
CREATE TABLE IF NOT EXISTS public.queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID UNIQUE NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    current_token TEXT NOT NULL DEFAULT 'NONE-000',
    serving_patient TEXT DEFAULT 'No Patient',
    total_in_queue INT DEFAULT 0,
    status TEXT CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED')) DEFAULT 'ACTIVE',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queues_doctor ON public.queues(doctor_id);
```

---

#### Table 7: `public.prescriptions` (Digital Prescription Header)
Header record for prescriptions issued by doctors during or after a consultation session.

```sql
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    general_advice TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_appointment ON public.prescriptions(appointment_id);
```

---

#### Table 8: `public.prescription_items` (Prescribed Medicines & Dosage)
Line items for prescribed medications within a prescription.

```sql
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,         -- e.g. '500 mg'
    frequency TEXT NOT NULL,      -- e.g. '1-0-1 (After meals)'
    duration_days INT NOT NULL,   -- e.g. 5
    instructions TEXT             -- e.g. 'Take with warm water'
);

CREATE INDEX idx_prescription_items_rx ON public.prescription_items(prescription_id);
```

---

#### Table 9: `public.medical_records` (Health Documents & Diagnostic Reports)
Stores uploaded medical documents, lab test PDFs, and diagnostic scans.

```sql
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,           -- e.g. 'Annual ECG Test Report'
    category TEXT CHECK (category IN ('Lab Report', 'Prescription', 'Scan/X-Ray', 'Discharge Summary', 'Other')) DEFAULT 'Lab Report',
    file_url TEXT NOT NULL,
    file_size_bytes INT,
    issued_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medical_records_patient ON public.medical_records(patient_id);
```

---

#### Table 10: `public.chat_messages` (Teleconsultation Messages)
Stores real-time chat messages between doctor and patient during remote consultations.

```sql
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('patient', 'doctor')),
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_appointment ON public.chat_messages(appointment_id, created_at);
```

---

#### Table 11: `public.ai_consultation_logs` (AI Symptom Triage Records)
Audit and history table for AI symptom checking sessions and specialty triage recommendations.

```sql
CREATE TABLE IF NOT EXISTS public.ai_consultation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_symptom_description TEXT NOT NULL,
    suggested_specialty TEXT NOT NULL,
    confidence_score TEXT NOT NULL,
    is_emergency_flag BOOLEAN DEFAULT FALSE,
    recommended_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_patient ON public.ai_consultation_logs(patient_id);
```

---

#### Table 12: `public.payments` (Transactions & Payment Gateway Records)
Stores billing and payment transaction records for appointments and pharmacy orders.

```sql
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT CHECK (payment_method IN ('UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash')) DEFAULT 'UPI',
    transaction_id TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')) DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_patient ON public.payments(patient_id);
```

---

#### Table 13: `public.reviews_and_ratings` (Patient Feedback & Doctor Ratings)
Patient ratings and reviews for doctors post-consultation.

```sql
CREATE TABLE IF NOT EXISTS public.reviews_and_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_doctor ON public.reviews_and_ratings(doctor_id);
```

---

#### Table 14: `public.notifications` (In-App System Alerts & Reminders)
System notifications for queue updates, appointment confirmations, and prescription alerts.

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('QUEUE_ALERT', 'APPOINTMENT_UPDATE', 'PRESCRIPTION_READY', 'SYSTEM')) DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
```

---

#### Table 15: `public.pharmacy_inventory` (Medicine Stock & Pharmacy Module)
Medication stock catalog for pharmacy ordering & digital prescription fulfillment.

```sql
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    category TEXT NOT NULL,         -- e.g. 'Antibiotic', 'Analgesic', 'Cardiovascular'
    unit_price NUMERIC(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    manufacturer TEXT,
    requires_prescription BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pharmacy_name ON public.pharmacy_inventory(medicine_name);
```

---

### 5.4 Row Level Security (RLS) & Security Policies

To guarantee medical data privacy and compliance:

```sql
-- Enable RLS across all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Sample Key RLS Policies
-- 1. Profiles Policy: Users can view & edit their own profile
CREATE POLICY "Users access own profile" ON public.profiles 
    FOR ALL USING (auth.uid() = id);

-- 2. Appointments Policy: Patients view their own; Doctors view appointments assigned to them
CREATE POLICY "Patient reads own appointments" ON public.appointments 
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctor reads assigned appointments" ON public.appointments 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctors 
            WHERE doctors.id = appointments.doctor_id 
            AND doctors.profile_id = auth.uid()
        )
    );

-- 3. Live Queues Policy: Public read for real-time OPD tracking screens
CREATE POLICY "Public Read Queues" ON public.queues 
    FOR SELECT USING (true);
```

---

## 6. ⚡ Backend API Services & Endpoints Specification

Below is the complete catalog of **24 RESTful / Supabase Edge Service Endpoints** required to power all backend operations:

### A. Authentication & User Management Service (`/api/v1/auth`)
1. `POST /api/v1/auth/register`: Create user account & auto-initialize `profiles` + `patients` / `doctors` row.
2. `POST /api/v1/auth/login`: Authenticate credentials & return JWT with custom role claim (`role`).
3. `GET /api/v1/auth/me`: Fetch authenticated user profile & active role metadata.
4. `PUT /api/v1/patients/profile`: Update patient personal health profile parameters.

### B. Doctor & Schedule Management Service (`/api/v1/doctors`)
5. `GET /api/v1/doctors`: Search & filter active doctors by specialty, hospital, fee range, and keyword query.
6. `GET /api/v1/doctors/:id`: Fetch complete doctor details, reviews, and available slots.
7. `GET /api/v1/doctors/:id/slots`: Query available time slots for a specific doctor & date.
8. `POST /api/v1/doctors/slots`: Doctor adds or updates available consultation time slots.

### C. Appointment & Booking Service (`/api/v1/appointments`)
9. `POST /api/v1/appointments`: Book appointment, lock time slot, calculate token index & generate token number (e.g. `CARD-007`).
10. `GET /api/v1/appointments/patient`: List logged-in patient's scheduled and past appointments.
11. `GET /api/v1/appointments/doctor`: List logged-in doctor's today & upcoming appointment schedule.
12. `PATCH /api/v1/appointments/:id/status`: Update appointment status (`Scheduled` -> `Checked In` -> `In Session` -> `Completed`).

### D. Real-time OPD Live Queue Service (`/api/v1/queues`)
13. `GET /api/v1/queues/:doctorId`: Fetch current OPD queue state for a doctor's room.
14. `POST /api/v1/queues/:doctorId/call-next`: Advance queue token to next waiting patient & trigger Supabase Realtime broadcast.
15. `POST /api/v1/queues/:doctorId/pause`: Pause OPD queue (e.g., emergency case or doctor break).
16. `POST /api/v1/queues/:doctorId/recall`: Re-announce current patient token with audio cue alert.

### E. AI Triage & Teleconsultation Chat Service (`/api/v1/ai` & `/api/v1/chat`)
17. `POST /api/v1/ai/analyze-symptoms`: Execute symptom keyword matching engine & return triage recommendation + warning flag.
18. `GET /api/v1/chat/:appointmentId/messages`: Fetch chat message history for consultation room.
19. `POST /api/v1/chat/:appointmentId/messages`: Post message or attachment to live consultation thread.

### F. EHR, Prescriptions & Diagnostics Service (`/api/v1/records` & `/api/v1/prescriptions`)
20. `POST /api/v1/prescriptions`: Doctor posts digital prescription with header advice & medication line items.
21. `GET /api/v1/prescriptions/patient`: Patient views their issued digital prescriptions.
22. `GET /api/v1/records`: Fetch patient uploaded medical records & diagnostic reports.
23. `POST /api/v1/records/upload`: Store medical document file metadata & Supabase Storage file URL.
24. `POST /api/v1/payments/checkout`: Initialize payment gateway transaction for consultation fees.

---

## 7. 📊 Comprehensive Project Metrics & Database Roadmap

### System Summary Metrics Dashboard

| Metric Category | Count / Status | Notes & Coverage |
| :--- | :-: | :--- |
| **Total User Roles** | **6 Roles** | 2 active frontend (`patient`, `doctor`), 4 extended (`admin`, `pharmacist`, `lab_tech`, `receptionist`). |
| **Total Frontend Pages** | **13 Pages** | Fully routed with access control guards (`HomePage`, `LoginPage`, `DoctorDashboard`, `PatientProfile`, etc.). |
| **Introduced Features** | **9 Features** | Live OPD Queue, AI Symptom Triage, Interactive Slot Booking, OPD Control Center, Patient Profile/EHR, Teleconsultation Chat, Doctor Directory, Role Switcher, Toast Alert System. |
| **Database Tables Required** | **15 Tables** | 5 existing in baseline schema (`profiles`, `doctors`, `doctor_slots`, `appointments`, `queues`), 10 added for full production. |
| **Backend API Endpoints** | **24 Endpoints** | Distributed across Auth, Doctors, Appointments, Live OPD Queue, AI Engine, Teleconsultation, EHR, & Billing. |

---

### Database Implementation Action Plan:
- [x] **Phase 1: Baseline Core Schema** (`profiles`, `doctors`, `doctor_slots`, `appointments`, `queues`) – *Completed in Supabase migrations*.
- [ ] **Phase 2: Patient Health & EHR Extension** (`patients`, `medical_records`, `prescriptions`, `prescription_items`).
- [ ] **Phase 3: Teleconsultation & Intelligence** (`chat_messages`, `ai_consultation_logs`, `notifications`).
- [ ] **Phase 4: Ecosystem & Commerce** (`payments`, `reviews_and_ratings`, `pharmacy_inventory`).
- [ ] **Phase 5: RLS Policies & Realtime Setup** (Enable Realtime on `queues`, `appointments`, `chat_messages` and enforce user-level RLS policies).

---
*Document produced for the HealFlow Engineering Team.*

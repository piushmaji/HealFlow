# 👨‍⚕️ HealFlow — Presentation Doctor Credentials & Profiles Directory

This directory contains the 10 presentation doctor accounts generated and stored directly into your live Supabase database (`public.doctors`, `public.profiles`, and `public.queues`).

All doctors have active OPD queues and can be logged into via the **Doctor Portal** (`/login`) with the uniform presentation password below.

---

## 🔑 Common Presentation Login Password
> **Password for all doctors:** `Doctor@123`

---

## 📋 Complete Doctor Profiles & Login Credentials

| # | Doctor Name | Email (Login ID) | Password | Specialty | Experience | Hospital / Room | Consultation Fee | Rating |
|:-:|:---|:---|:---|:---|:-:|:---|:-:|:-:|
| 1 | **Dr. Ananya Roy** | `ananya.roy@healflow.in` | `Doctor@123` | **Cardiology** | 12 Yrs | HealFlow Heart Institute (Room 102) | ₹600 | 4.95 ⭐ |
| 2 | **Dr. Rajesh K. Varma** | `rajesh.varma@healflow.in` | `Doctor@123` | **General Medicine** | 15 Yrs | HealFlow Central Clinic (Room 103) | ₹400 | 4.88 ⭐ |
| 3 | **Dr. Sneha Patel** | `sneha.patel@healflow.in` | `Doctor@123` | **Dermatology** | 8 Yrs | HealFlow Aesthetics & Skin (Room 201) | ₹550 | 4.92 ⭐ |
| 4 | **Dr. Vikram Malhotra** | `vikram.malhotra@healflow.in` | `Doctor@123` | **Orthopedics** | 14 Yrs | HealFlow Bone & Joint Center (Room 202) | ₹650 | 4.89 ⭐ |
| 5 | **Dr. Meera Nambiar** | `meera.nambiar@healflow.in` | `Doctor@123` | **Pediatrics** | 10 Yrs | HealFlow Child Health & OPD (Room 104) | ₹450 | 4.96 ⭐ |
| 6 | **Dr. Rohan Sengupta** | `rohan.sengupta@healflow.in` | `Doctor@123` | **Neurology** | 11 Yrs | HealFlow Neuro Sciences Clinic (Room 205) | ₹700 | 4.94 ⭐ |
| 7 | **Dr. Kavita Deshmukh** | `kavita.deshmukh@healflow.in` | `Doctor@123` | **General Medicine** | 9 Yrs | HealFlow Family Care OPD (Room 105) | ₹400 | 4.87 ⭐ |
| 8 | **Dr. Aditya Joshi** | `aditya.joshi@healflow.in` | `Doctor@123` | **Dermatology** | 7 Yrs | HealFlow Skin Care Center (Room 203) | ₹500 | 4.91 ⭐ |
| 9 | **Dr. Sanjay Nair** | `sanjay.nair@healflow.in` | `Doctor@123` | **Orthopedics** | 13 Yrs | HealFlow Joint Health (Room 204) | ₹600 | 4.90 ⭐ |
| 10 | **Dr. Sunita Bansal** | `sunita.bansal@healflow.in` | `Doctor@123` | **Pediatrics** | 16 Yrs | HealFlow Childrens Wellness (Room 106) | ₹500 | 4.97 ⭐ |

*(Note: The original developer profile **Dr. Piush Maji** `piushmaji@gmail.com` remains intact in the database as Doctor #11).*

---

## 🛠️ Database Schema Adherence
Every record contains strictly typed fields according to your Supabase schema:
- `id` (UUID Primary Key)
- `profile_id` (Foreign Key linked to `public.profiles.id`)
- `name` & `title` (Full medical credentials, e.g., MBBS, MD, MS)
- `specialty` (Mapped to one of the 6 core HealFlow disciplines)
- `experience_years`, `hospital`, `room_number`, `consultation_fee`
- `rating` (4.85 - 4.97) & `review_count`
- `languages` (Array: e.g. `['English', 'Hindi', ...]`)
- `consultation_mode` (Array: `['In-person', 'Video']`)
- `is_active: true` & `accepts_new_patients: true`
- `avatar_url` (Custom SVG vector medical avatars)
- SHA-256 embedded signature ensuring instant verification on login
- Initialized entry in `public.queues` so the Doctor OPD Console renders live queue numbers immediately upon sign-in.

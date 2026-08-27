# Supabase Database Migrations & Backend Setup

This folder contains all Supabase database migrations, seed data, and configuration for the **Smart Clinic – Appointment & Live Queue System**.

---

## 📁 Directory Overview

- `migrations/20260827000000_initial_schema.sql`: Initial database migration establishing table definitions (`profiles`, `doctors`, `doctor_slots`, `appointments`, `queues`), RLS security policies, and Supabase Realtime publication setup.
- `seed.sql`: Initial doctor profiles, room numbers, and OPD live queue starting state.
- `config.toml`: Configuration for Supabase CLI local development.

---

## 🚀 How to Apply Migrations

### Method 1: Using Supabase Dashboard SQL Editor (Quickest)
1. Go to your Supabase Project Dashboard (`https://app.supabase.com`).
2. Open the **SQL Editor** tab from the left sidebar.
3. Paste the contents of `migrations/20260827000000_initial_schema.sql` and click **Run**.
4. Paste the contents of `seed.sql` and click **Run**.

### Method 2: Using Supabase CLI
```bash
# Link to your remote Supabase project
npx supabase link --project-ref your-project-ref

# Apply pending database migrations
npx supabase db push

# Seed initial data
npx supabase db reset
```

---

## 🔑 Environment Variables Setup (`frontend/.env`)

Add your Supabase API keys into `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

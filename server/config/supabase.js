/**
 * Centralized Supabase client for Backend & RAG tasks
 */
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://zhrdwcapfqwoyrdcrwzb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocmR3Y2FwZnF3b3lyZGNyd3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MjEzNTMsImV4cCI6MjEwOTE5NzM1M30.Ob7ZgaBgJiWSRwdOfBjXqDRAnRFPRpa7FMawu3FbJbY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: WebSocket,
  },
});

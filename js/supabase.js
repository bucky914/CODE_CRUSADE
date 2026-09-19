/* Paste your project's public URL and anon/publishable key below. Never use a service-role key here. */
const SUPABASE_URL = "https://vbzgvrzxdcsbpvlkubbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiemd2cnp4ZGNzYnB2bGt1YmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzM1MTgsImV4cCI6MjEwNTIwOTUxOH0.iNxksnHHAcMJ0vteXgpY4eGPsqiJl2d3k2O9dRpz8rU";

const supabaseConfigured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
const supabaseClient = supabaseConfigured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/**
 * ELKHALIL HOTEL — Supabase Client
 * Uses Supabase CDN (loaded in index.html)
 */

const SUPABASE_URL = 'https://rnbxqluepeakokvcywry.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuYnhxbHVlcGVha29rdmN5d3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMTUzNzMsImV4cCI6MjA5ODY5MTM3M30.oA-0CpaQ7-eugpBnDcizgf1q7ICNQtDk9m531TixuGI';

// Initialize Supabase client using the CDN global
const { createClient } = supabase;
window.db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Export not needed for standard script tag


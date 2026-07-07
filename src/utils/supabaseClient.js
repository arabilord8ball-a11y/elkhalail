import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnbxqluepeakokvcywry.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuYnhxbHVlcGVha29rdmN5d3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMTUzNzMsImV4cCI6MjA5ODY5MTM3M30.oA-0CpaQ7-eugpBnDcizgf1q7ICNQtDk9m531TixuGI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

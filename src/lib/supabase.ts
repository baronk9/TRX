import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jfkhbafjaiixahpdpxqq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma2hiYWZqYWlpeGFocGRweHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDQ0MTQsImV4cCI6MjA4NzY4MDQxNH0.VuLT-0MO9O9Dq2W12ggCZddryRRO241-e0FXF-3Ty5o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

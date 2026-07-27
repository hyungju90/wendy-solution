import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaW56anRmZmtuZ3hta2RveWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDA5OTgsImV4cCI6MjA5OTExNjk5OH0.dkgztr_ZbKyP83JcJy7ieZ3MH4pnhDkVBeB_B6AqeT0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
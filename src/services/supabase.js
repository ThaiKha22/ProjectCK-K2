import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://vvxwihggqvczkelivobi.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eHdpaGdncXZjemtlbGl2b2JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc4MDU3MCwiZXhwIjoyMDk3MzU2NTcwfQ.HEj4OTZNDmUAdBOKVffsiAqbN9BLdLTp73Fey_cKvwc';

export const supabase = createClient(supabaseUrl, supabaseKey);
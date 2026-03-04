const { createClient } = require('@supabase/supabase-js');

// mock client to test postgrest syntax
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.error('No url');
  process.exit(1);
}

// this doesn't work if envs aren't accessible here, but let's check.

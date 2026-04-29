import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * 
 * In Vite, environment variables must be prefixed with VITE_ to be exposed to the client.
 * Access via import.meta.env.VITE_SUPABASE_URL and import.meta.env.VITE_SUPABASE_ANON_KEY
 * 
 * Create a .env file in the project root with:
 * VITE_SUPABASE_URL=your-project-url
 * VITE_SUPABASE_ANON_KEY=your-anon-key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Initialize Supabase client with secure defaults
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export { supabase };
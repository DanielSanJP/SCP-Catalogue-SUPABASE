import { createClient } from "@supabase/supabase-js";

// Use environment variables from your .env file with Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase URL and Anon Key must be provided in .env file with VITE_ prefix."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

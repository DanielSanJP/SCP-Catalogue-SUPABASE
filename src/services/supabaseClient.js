import { createClient } from "@supabase/supabase-js";
import process from 'process';

// Use environment variables from your .env file
// For Create React App, prefix them with REACT_APP_
// For Vite, prefix them with VITE_
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env?.VITE_SUPABASE_KEY || process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL and Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
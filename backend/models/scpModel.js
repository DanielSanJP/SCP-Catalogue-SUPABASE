import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import process from "process";

// Load environment variables from .env file (if it exists)
// This won't override existing environment variables (like those set in Railway)
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Warning: Supabase URL and Key not found in environment variables."
  );
  console.error(
    "Make sure they are set in Railway's environment variables as SUPABASE_URL and SUPABASE_KEY."
  );
  throw new Error(
    "Supabase credentials missing. Check environment variables configuration."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

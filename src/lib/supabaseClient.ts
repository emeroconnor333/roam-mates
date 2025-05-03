// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// --- Read Environment Variables ---
// Vite exposes environment variables prefixed with VITE_ on the `import.meta.env` object.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
// --- End Read Environment Variables ---

// --- Error Handling ---
// Check if the variables were loaded correctly from the .env file
if (!supabaseUrl) {
  console.error("Error: Supabase URL is missing. Make sure VITE_SUPABASE_URL is set in your .env file.");
  // You might throw an error or handle this differently depending on your app's needs
  // throw new Error("Supabase URL is missing."); 
}

if (!supabaseAnonKey) {
  console.error("Error: Supabase Anon Key is missing. Make sure VITE_SUPABASE_ANON_KEY is set in your .env file.");
  // throw new Error("Supabase Anon Key is missing.");
}
// --- End Error Handling ---

// --- Create and Export Client ---
// Create the Supabase client instance.
// It's safe to use nullish coalescing (??) or check the variables first, 
// but the error handling above should catch missing values.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

// Optional: Log a success message in development
if (import.meta.env.DEV) {
  if (supabaseUrl && supabaseAnonKey) {
    console.log("Supabase client initialized successfully.");
  } else {
    console.warn("Supabase client initialized BUT URL or Key might be missing.");
  }
}
// --- End Create and Export Client ---


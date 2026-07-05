import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diatur. " +
      "Cek file .env (lokal) atau Environment Variables di Vercel."
  );
}

export const supabase = createClient(url, anonKey);

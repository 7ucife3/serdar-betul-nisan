import { createClient, SupabaseClient } from "@supabase/supabase-js";

function initSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "undefined" ||
    !supabaseUrl.startsWith("http")
  ) {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.error("Supabase client init error:", err);
    return null;
  }
}

export const supabase = initSupabase();

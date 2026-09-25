import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

let supabase: SupabaseClient;

export const initSupabase = () => {
  if (!supabase) {
    supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
  }
  return supabase;
};

export const getSupabase = () => supabase || initSupabase();

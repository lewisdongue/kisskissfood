// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const getSupabase = () => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false } });
};

const requireAuth = async (req: Request) => {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Missing auth");
  const token = auth.slice("Bearer ".length);
  const sb = getSupabase();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) throw new Error("Invalid token");
  return user;
};

const getBalance = async (userId: string) => {
  const sb = getSupabase();
  const { data, error } = await sb.from("users").select("balance").eq("id", userId).single();
  if (error) throw error;
  return data?.balance ?? 0;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const user = await requireAuth(req);
    const balance = await getBalance(user.id);
    return new Response(JSON.stringify({ balance }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

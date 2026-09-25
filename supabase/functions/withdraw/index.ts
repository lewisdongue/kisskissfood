import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const subtractBalance = async (userId: string, amount: number) => {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("decrement_balance", { user_id: userId, amount });
  if (error) throw error;
  return data;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*", // or "http://localhost:5173"
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const user = await requireAuth(req);
    const { amount, destination } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0)
      return new Response(JSON.stringify({ error: "invalid_amount" }), { status: 400 });

    if (!destination)
      return new Response(JSON.stringify({ error: "missing_destination" }), { status: 400 });

    await subtractBalance(user.id, amount);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
});

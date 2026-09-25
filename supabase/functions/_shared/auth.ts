import { getSupabase } from "./supabaseService.ts";

export const requireAuth = async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*", // or "http://localhost:5173"
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Missing auth");
  const token = auth.slice("Bearer ".length);

  const sb = getSupabase();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) throw new Error("Invalid token");
  return user;
};

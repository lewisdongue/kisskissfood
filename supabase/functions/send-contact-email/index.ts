// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

/**
 * send-contact-email
 *
 * Receives a contact form submission and forwards it via Web3Forms only.
 * Set in Supabase Edge Function secrets: WEB3FORMS_ACCESS_KEY
 *
 * Web3Forms requires a valid UUID. Old keys (e.g. last segment 10 chars) are
 * normalized to UUID format (pad last segment to 12 hex chars) before sending.
 *
 * Body: { name, email, subject, message }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Normalize Web3Forms access key to valid UUID (8-4-4-4-12 hex). Old keys often have 10-char last segment. */
function toValidUuid(key: string): string {
  const k = key.trim();
  const match = k.match(/^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]+)$/i);
  if (!match) return k;
  const last = match[5];
  if (last.length === 12) return k;
  if (last.length === 10) return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${last}00`;
  if (last.length < 12) return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${last.padEnd(12, "0")}`;
  return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${last.slice(0, 12)}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const { name, email, subject, message } = body ?? {};

    if (!name || !email || !subject || !message) {
      return json({ error: "Missing required fields: name, email, subject, message" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: "Invalid email address" }, 400);
    }

    if (message.trim().length < 10) {
      return json({ error: "Message is too short" }, 400);
    }

    const rawKey = Deno.env.get("WEB3FORMS_ACCESS_KEY");
    if (!rawKey) {
      console.error("[send-contact-email] WEB3FORMS_ACCESS_KEY not set");
      return json({ error: "Email service not configured" }, 500);
    }

    const access_key = toValidUuid(rawKey);

    const w3Res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key,
        from_name: name.trim(),
        email: email.trim(),
        subject: `[Caakus Contact] ${subject.trim()}`,
        message: message.trim(),
        botcheck: "",
      }),
    });

    const w3Data = await w3Res.json().catch(() => ({}));

    if (w3Res.ok && w3Data?.success) {
      console.log("[send-contact-email] Web3Forms OK", { from: email, subject });
      return json({ success: true });
    }

    const msg = w3Data?.message || "Failed to send email";
    console.error("[send-contact-email] Web3Forms failed:", w3Data);

    if (msg.toLowerCase().includes("uuid") || msg.toLowerCase().includes("access_key") || msg.toLowerCase().includes("form_id")) {
      return json({
        error: "Invalid Web3Forms access key. Get a new key at https://web3forms.com (must be a valid UUID).",
      }, 500);
    }

    return json({ error: msg }, 500);
  } catch (err: any) {
    console.error("[send-contact-email] Exception:", err?.message);
    return json({ error: err?.message || "Internal server error" }, 500);
  }
});

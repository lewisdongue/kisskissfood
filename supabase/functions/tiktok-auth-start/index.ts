// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const encoder = new TextEncoder();

const toBase64Url = (input: Uint8Array) =>
  btoa(String.fromCharCode(...input))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const importSigningKey = async (secret: string) =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

const signValue = async (value: string, secret: string) => {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
};

const encodeState = async (payload: Record<string, unknown>, secret: string) => {
  const serialized = JSON.stringify(payload);
  const encodedPayload = toBase64Url(encoder.encode(serialized));
  const signature = await signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
};

const sanitizeAppUrl = (candidate?: string | null, fallback?: string | null) => {
  const finalCandidate = candidate || fallback;
  if (!finalCandidate) throw new Error("missing_app_url");

  const url = new URL(finalCandidate);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("invalid_app_url_protocol");
  }

  url.hash = "";
  return url.toString().replace(/\/$/, "");
};

const redirect = (location: string, status = 302) =>
  new Response(null, {
    status,
    headers: {
      Location: location,
    },
  });

serve(async (req: Request) => {
  try {
    if (req.method !== "GET") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
    const redirectUri = Deno.env.get("TIKTOK_REDIRECT_URI");
    const stateSecret = Deno.env.get("TIKTOK_STATE_SECRET");

    if (!clientKey || !redirectUri || !stateSecret) {
      return json(
        {
          error: "missing_env",
          missing: [
            !clientKey ? "TIKTOK_CLIENT_KEY" : null,
            !redirectUri ? "TIKTOK_REDIRECT_URI" : null,
            !stateSecret ? "TIKTOK_STATE_SECRET" : null,
          ].filter(Boolean),
        },
        500,
      );
    }

    const url = new URL(req.url);
    const appUrl = sanitizeAppUrl(url.searchParams.get("app_url"), Deno.env.get("APP_URL"));
    const ref = url.searchParams.get("ref") || undefined;

    const state = await encodeState(
      {
        appUrl,
        issuedAt: Date.now(),
        nonce: crypto.randomUUID(),
        ref,
      },
      stateSecret,
    );

    const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
    authUrl.searchParams.set("client_key", clientKey);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "user.info.basic");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);

    return redirect(authUrl.toString());
  } catch (error) {
    console.error("[tiktok-auth-start] error", error);
    return json({ error: "unable_to_start_tiktok_auth" }, 500);
  }
});

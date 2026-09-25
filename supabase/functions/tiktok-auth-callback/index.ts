// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type TikTokTokenResponse = {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_token?: string;
};

type TikTokUserInfo = {
  avatar_url?: string;
  display_name?: string;
  open_id?: string;
};

type TikTokStatePayload = {
  appUrl?: string;
  issuedAt: number;
  nonce: string;
  ref?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

let supabase: SupabaseClient;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getSupabase = () => {
  if (!supabase) {
    supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
  }

  return supabase;
};

const toBase64Url = (input: Uint8Array) =>
  btoa(String.fromCharCode(...input))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

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

const decodeState = async (
  rawState: string,
  secret: string,
  maxAgeMs = 10 * 60 * 1000,
) => {
  const [encodedPayload, signature] = rawState.split(".");
  if (!encodedPayload || !signature) throw new Error("invalid_state");

  const expectedSignature = await signValue(encodedPayload, secret);
  if (signature !== expectedSignature) throw new Error("invalid_state_signature");

  const payload = JSON.parse(decoder.decode(fromBase64Url(encodedPayload))) as TikTokStatePayload;
  if (!payload.issuedAt || Date.now() - payload.issuedAt > maxAgeMs) {
    throw new Error("expired_state");
  }

  return payload;
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

const buildRedirectUrl = (
  baseUrl: string,
  params: Record<string, string | undefined>,
) => {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
};

const redirect = (location: string, status = 302) =>
  new Response(null, {
    status,
    headers: {
      Location: location,
    },
  });

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const getFallbackAppUrl = () => {
  try {
    return sanitizeAppUrl(Deno.env.get("APP_URL"), "http://localhost:5173");
  } catch {
    return "http://localhost:5173";
  }
};

const exchangeCodeForToken = async (code: string) => {
  const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
  const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");
  const redirectUri = Deno.env.get("TIKTOK_REDIRECT_URI");

  if (!clientKey || !clientSecret || !redirectUri) {
    throw new Error("missing_tiktok_env");
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = (await res.json().catch(() => ({}))) as TikTokTokenResponse & { error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "tiktok_token_exchange_failed");
  }

  return data;
};

const fetchTikTokUserInfo = async (accessToken: string) => {
  const userInfoUrl = new URL("https://open.tiktokapis.com/v2/user/info/");
  userInfoUrl.searchParams.set("fields", "open_id,display_name,avatar_url");

  const res = await fetch(userInfoUrl.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  const user = (data?.data?.user || data?.data) as TikTokUserInfo | undefined;

  if (!res.ok || !user?.open_id) {
    throw new Error(data?.error?.message || data?.message || "tiktok_user_info_failed");
  }

  return user;
};

const resolveAuthUserIdByEmail = async (email: string) => {
  const supabase = getSupabase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;

    const user = data.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());
    if (user) return user.id;

    if (data.users.length < 1000) break;
    page += 1;
  }

  return null;
};

const getOrCreateSupabaseUser = async (profile: TikTokUserInfo) => {
  const supabase = getSupabase();
  const emailHash = await sha256Hex(profile.open_id!);
  const syntheticEmail = `tiktok_${emailHash}@users.caakus.local`;

  const { data: existingIdentity, error: identityError } = await supabase
    .from("tiktok_auth_identities")
    .select("user_id")
    .eq("tiktok_open_id", profile.open_id!)
    .maybeSingle();

  if (identityError) throw identityError;

  let userId = existingIdentity?.user_id ?? null;

  if (!userId) {
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email: syntheticEmail,
      password: `${crypto.randomUUID()}${crypto.randomUUID()}`,
      email_confirm: true,
      user_metadata: {
        avatar_url: profile.avatar_url || null,
        full_name: profile.display_name || "TikTok User",
        locale: "en",
        provider: "tiktok",
        tiktok_open_id: profile.open_id,
      },
    });

    if (createError) {
      userId = await resolveAuthUserIdByEmail(syntheticEmail);
      if (!userId) throw createError;
    } else {
      userId = createdUser.user.id;
    }
  }

  const updateResult = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      avatar_url: profile.avatar_url || null,
      full_name: profile.display_name || "TikTok User",
      locale: "en",
      provider: "tiktok",
      tiktok_open_id: profile.open_id,
    },
  });

  if (updateResult.error) {
    console.warn("[tiktok-auth-callback] failed to refresh auth metadata", updateResult.error);
  }

  return { syntheticEmail, userId };
};

const persistIdentity = async (userId: string, profile: TikTokUserInfo, token: TikTokTokenResponse) => {
  const supabase = getSupabase();
  const tokenExpiresAt = token.expires_in
    ? new Date(Date.now() + token.expires_in * 1000).toISOString()
    : null;

  const { error } = await supabase.from("tiktok_auth_identities").upsert(
    {
      access_token: token.access_token || null,
      avatar_url: profile.avatar_url || null,
      display_name: profile.display_name || "TikTok User",
      refresh_token: token.refresh_token || null,
      tiktok_open_id: profile.open_id!,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
      user_id: userId,
    },
    {
      onConflict: "tiktok_open_id",
    },
  );

  if (error) throw error;
};

const buildErrorRedirect = (appUrl: string, error: string) =>
  buildRedirectUrl(appUrl, { auth_error: error });

serve(async (req: Request) => {
  try {
    if (req.method !== "GET") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const url = new URL(req.url);
    const rawError = url.searchParams.get("error");
    const rawErrorDescription = url.searchParams.get("error_description");
    const rawState = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    const fallbackAppUrl = getFallbackAppUrl();

    if (rawError) {
      return redirect(buildErrorRedirect(fallbackAppUrl, rawErrorDescription || rawError));
    }

    if (!rawState || !code) {
      return redirect(buildErrorRedirect(fallbackAppUrl, "missing_tiktok_callback_params"));
    }

    const stateSecret = Deno.env.get("TIKTOK_STATE_SECRET");
    if (!stateSecret) {
      return redirect(buildErrorRedirect(fallbackAppUrl, "missing_tiktok_state_secret"));
    }

    const state = await decodeState(rawState, stateSecret);
    const appUrl = sanitizeAppUrl(state.appUrl, fallbackAppUrl);

    const token = await exchangeCodeForToken(code);
    const profile = await fetchTikTokUserInfo(token.access_token!);
    const { syntheticEmail, userId } = await getOrCreateSupabaseUser(profile);

    await persistIdentity(userId, profile, token);

    const redirectTo = buildRedirectUrl(appUrl, {
      ref: state.ref,
    });

    const supabase = getSupabase();
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: syntheticEmail,
      options: {
        redirectTo,
      },
    });

    if (linkError) throw linkError;

    const actionLink = linkData.properties?.action_link;
    if (!actionLink) {
      throw new Error("missing_magic_link");
    }

    return redirect(actionLink);
  } catch (error) {
    console.error("[tiktok-auth-callback] error", error);
    return redirect(buildErrorRedirect(getFallbackAppUrl(), "tiktok_auth_failed"));
  }
});

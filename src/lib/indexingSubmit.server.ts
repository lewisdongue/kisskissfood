// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE INDEXING API — shared server-only submission core.
// Used by the public /api/public/indexing route and by the admin server fns.
// Signing uses Web Crypto RS256 (the googleapis SDK is Node-only).
// ═══════════════════════════════════════════════════════════════════════════

import { iteratePermutations, pseoUrl, PERMUTATIONS_PER_LANG } from "@/lib/pseo";
import { LANGUAGE_BY_CODE } from "@/data/pseoData";

export const MAX_URLS = 200;
const BATCH_SIZE = 5;
const BATCH_PAUSE_MS = 220;
const SCOPE = "https://www.googleapis.com/auth/indexing";

type ServiceAccount = { client_email: string; private_key: string };

export type SubmitResult = {
  submitted: number;
  succeeded: number;
  failed: number;
  type: string;
  results: { url: string; status: number; error?: string }[];
};

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claim = b64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: sa.client_email,
        scope: SCOPE,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    ),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(sa.private_key.replace(/\\n/g, "\n")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claim}`),
  );
  const assertion = `${header}.${claim}.${b64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Token request failed [${res.status}]: ${body}`);
  return (JSON.parse(body) as { access_token: string }).access_token;
}

/** Deterministic URL slice for a language, used by cron + manual runs. */
export function buildAutoUrls(langCode: string, offset: number, count: number): string[] {
  const lang = LANGUAGE_BY_CODE.get(langCode);
  if (!lang) throw new Error("Unknown language");
  const start = Math.max(0, offset);
  if (start >= PERMUTATIONS_PER_LANG) throw new Error("Offset out of range");
  const size = Math.min(MAX_URLS, Math.max(1, count));
  void size; void iteratePermutations; void pseoUrl;
  // Programmatic pages were removed (410 Gone) — nothing to auto-submit.
  return [];
}

export async function submitUrlsToGoogle(
  urls: string[],
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED",
): Promise<SubmitResult> {
  const saRaw = process.env["GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON"];
  if (!saRaw) throw new Error("Indexing API is not configured on this environment.");

  const accessToken = await getAccessToken(JSON.parse(saRaw) as ServiceAccount);
  const results: { url: string; status: number; error?: string }[] = [];

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const settled = await Promise.all(
      batch.map(async (url) => {
        try {
          const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url, type }),
          });
          if (!res.ok) {
            const text = await res.text();
            return { url, status: res.status, error: text.slice(0, 300) };
          }
          return { url, status: res.status };
        } catch (err) {
          return { url, status: 0, error: (err as Error).message };
        }
      }),
    );
    results.push(...settled);
    if (i + BATCH_SIZE < urls.length) {
      await new Promise((r) => setTimeout(r, BATCH_PAUSE_MS));
    }
  }

  const ok = results.filter((r) => r.status === 200).length;
  return { submitted: urls.length, succeeded: ok, failed: urls.length - ok, type, results };
}

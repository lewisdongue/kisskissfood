// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE INDEXING API — secure batch submission endpoint
//
// POST /api/public/indexing
//   headers: x-indexing-token: <INDEXING_API_TOKEN>
//   body:    { "urls": ["https://www.caakus.com/en/discover/gamers/tokyo"] }
//        or: { "mode": "auto", "lang": "en", "offset": 0, "count": 180 }
//
// Auth: shared bearer token (INDEXING_API_TOKEN). Service account credentials
// come from GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON (the full JSON key).
// Signing uses Web Crypto RS256 directly — the googleapis SDK is a Node-only
// bundle and cannot run in this edge runtime.
// Rate limiting: max 200 URLs per request (Google's daily quota), sequential
// batches of 5 with a pause between batches.
// ═══════════════════════════════════════════════════════════════════════════

import { createFileRoute } from "@tanstack/react-router";
import { iteratePermutations, pseoUrl, PERMUTATIONS_PER_LANG } from "@/lib/pseo";
import { LANGUAGE_BY_CODE } from "@/data/pseoData";

const MAX_URLS = 200;
const BATCH_SIZE = 5;
const BATCH_PAUSE_MS = 220;
const SCOPE = "https://www.googleapis.com/auth/indexing";

type ServiceAccount = { client_email: string; private_key: string };

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

/** Mint a Google OAuth2 access token from the service account (RS256 JWT). */
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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/indexing")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["INDEXING_API_TOKEN"];
        const saRaw = process.env["GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON"];
        if (!token || !saRaw) {
          return json({ error: "Indexing API is not configured on this environment." }, 503);
        }
        const provided =
          request.headers.get("x-indexing-token") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (provided !== token) return json({ error: "Unauthorized" }, 401);

        let payload: Record<string, unknown>;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        // ── Resolve the URL list ──────────────────────────────────────────
        let urls: string[] = [];
        if (payload["mode"] === "auto") {
          const lang = LANGUAGE_BY_CODE.get(String(payload["lang"] ?? "en"));
          if (!lang) return json({ error: "Unknown language" }, 400);
          const offset = Math.max(0, Number(payload["offset"] ?? 0));
          const count = Math.min(MAX_URLS, Math.max(1, Number(payload["count"] ?? MAX_URLS)));
          if (offset >= PERMUTATIONS_PER_LANG) return json({ error: "Offset out of range" }, 400);
          void count; void iteratePermutations; void pseoUrl;
          // Programmatic pages were removed (410). Auto mode no longer submits them.
          return json({ error: "Auto mode disabled: programmatic pages were removed." }, 410);
        } else {
          const raw = payload["urls"];
          if (!Array.isArray(raw) || raw.length === 0) {
            return json({ error: "Provide a non-empty `urls` array or mode:'auto'." }, 400);
          }
          urls = raw
            .filter((u): u is string => typeof u === "string")
            .map((u) => u.trim())
            .filter((u) => u.startsWith("https://www.caakus.com/"));
        }

        if (urls.length === 0) return json({ error: "No valid caakus.com URLs supplied." }, 400);
        if (urls.length > MAX_URLS) {
          return json({ error: `Maximum ${MAX_URLS} URLs per request (Google daily quota).` }, 400);
        }

        const type = payload["type"] === "URL_DELETED" ? "URL_DELETED" : "URL_UPDATED";

        let accessToken: string;
        try {
          accessToken = await getAccessToken(JSON.parse(saRaw) as ServiceAccount);
        } catch (err) {
          console.error("Indexing auth failed:", err);
          return json({ error: `Google auth failed: ${(err as Error).message}` }, 502);
        }

        // ── Rate-limited batch submission ─────────────────────────────────
        const results: { url: string; status: number; error?: string }[] = [];
        for (let i = 0; i < urls.length; i += BATCH_SIZE) {
          const batch = urls.slice(i, i + BATCH_SIZE);
          const settled = await Promise.all(
            batch.map(async (url) => {
              try {
                const res = await fetch(
                  "https://indexing.googleapis.com/v3/urlNotifications:publish",
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ url, type }),
                  },
                );
                if (!res.ok) {
                  const text = await res.text();
                  console.error(`Indexing failed [${res.status}] ${url}: ${text}`);
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
        return json({
          submitted: urls.length,
          succeeded: ok,
          failed: urls.length - ok,
          type,
          results,
        });
      },
    },
  },
});

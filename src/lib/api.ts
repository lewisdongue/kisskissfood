import { SUPABASE_FUNCTIONS_URL, supabase } from '../config/supabase';


// ── Session cache ──────────────────────────────────────────────────────────────
// getSession() can take 100-300 ms on each call because it validates the JWT
// against the Supabase server. We keep a short-lived cache (45 s) so repeated
// API calls within a matching / join sequence don't each pay that round-trip.
//
// IMPORTANT: we only cache a non-null session. A null result is never cached
// because it can legitimately occur during the brief window where Supabase is
// still rehydrating its auth state from localStorage after page load.
let _sessionCache: { session: any; expiresAt: number } | null = null;

// Keep the cache warm whenever the auth state changes so we always have the
// latest token without an extra round-trip.
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    _sessionCache = { session, expiresAt: Date.now() + 45_000 };
  } else {
    // Sign-out: wipe the cache so we don't reuse a stale token.
    _sessionCache = null;
  }
});

const getActiveSession = async () => {
  const now = Date.now();
  if (_sessionCache && now < _sessionCache.expiresAt) {
    return _sessionCache.session;
  }

  // Supabase reads the session from localStorage asynchronously on first load.
  // Retry up to ~2 seconds before deciding the user is genuinely unauthenticated.
  const delays = [0, 150, 350, 600, 1000]; // ms between attempts
  let session: any = null;

  for (const delay of delays) {
    if (delay > 0) await new Promise(r => setTimeout(r, delay));

    ({ data: { session } } = await supabase.auth.getSession());
    if (session) break;
  }

  // Last resort: force a token refresh (handles expired access tokens)
  if (!session) {
    try { await supabase.auth.refreshSession(); } catch {}
    ({ data: { session } } = await supabase.auth.getSession());
  }

  if (session) {
    _sessionCache = { session, expiresAt: Date.now() + 45_000 };
  }
  return session; // null only for genuinely unauthenticated users
};
// ─────────────────────────────────────────────────────────────────────────────

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs?: number) => {
  if (!timeoutMs) return fetch(url, options);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const api = {
  /**
   * POST request to Supabase Edge Function
   * Supports both authenticated and guest users
   */
  post: async (
    functionName: string,
    payload?: any,
    options?: { isGuest?: boolean; timeoutMs?: number }
  ) => {
    const isGuestRequest = options?.isGuest || false;
    const timeoutMs = options?.timeoutMs;

    // For guest users, skip auth and add isGuest flag to payload
    if (isGuestRequest) {
      const url = `${SUPABASE_FUNCTIONS_URL}/${functionName}`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, isGuest: true }),
      }, timeoutMs);

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Function error');
      return data;
    }

    // Authenticated user flow — one cached session lookup
    const activeSession = await getActiveSession();
    if (!activeSession) {
      throw new Error('User not authenticated');
    }

    const url = `${SUPABASE_FUNCTIONS_URL}/${functionName}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeSession.access_token}`,
      },
      body: JSON.stringify(payload || {}),
    }, timeoutMs);

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Invalid response format: ${responseText}`);
    }

    if (!res.ok) throw new Error(data?.error || data?.message || 'Function error');
    return data;
  },

  /**
   * GET request to Supabase Edge Function
   * Supports both authenticated and guest users
   */
  get: async (
    functionName: string,
    queryParams?: Record<string, any>,
    options?: { isGuest?: boolean; timeoutMs?: number }
  ) => {
    const isGuestRequest = options?.isGuest || false;
    const timeoutMs = options?.timeoutMs;

    const url = new URL(`${SUPABASE_FUNCTIONS_URL}/${functionName}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    if (isGuestRequest) {
      const res = await fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }, timeoutMs);

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Function error');
      return data;
    }

    const activeSession = await getActiveSession();
    if (!activeSession) throw new Error('User not authenticated');

    const res = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${activeSession.access_token}` },
    }, timeoutMs);

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Function error');
    return data;
  },
};

export default api;

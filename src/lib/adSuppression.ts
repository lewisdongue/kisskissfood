// Tiny global switch used to purge partner scripts while an authentication
// surface (sign-up / login) is on screen. No ads on auth, ever.

let authOverlayCount = 0;
const listeners = new Set<(open: boolean) => void>();

function emit() {
  const open = authOverlayCount > 0;
  listeners.forEach((fn) => fn(open));
}

export function isAuthOverlayOpen(): boolean {
  return authOverlayCount > 0;
}

export function pushAuthOverlay(): () => void {
  authOverlayCount += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    authOverlayCount = Math.max(0, authOverlayCount - 1);
    emit();
  };
}

export function subscribeAuthOverlay(fn: (open: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

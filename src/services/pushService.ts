import type { Messaging } from 'firebase/messaging';
import { getToken } from 'firebase/messaging';

/**
 * Try to get an FCM token with retries and exponential backoff.
 * Returns the token string or null on failure.
 */
export async function getFCMTokenWithRetry(
    messaging: Messaging | null,
    vapidKey?: string,
    retries = 3,
    initialDelayMs = 500,
    serviceWorkerRegistration: ServiceWorkerRegistration | null = null
): Promise<string | null> {
    if (!messaging) {
        console.log('Messaging not available; cannot get FCM token');
        return null;
    }

    // Diagnostic checks
    try {
        console.info('getFCMTokenWithRetry: vapidKey length=', vapidKey ? vapidKey.length : 0);
        if (serviceWorkerRegistration) {
            console.info('getFCMTokenWithRetry: serviceWorkerRegistration.scope=', serviceWorkerRegistration.scope);
            try {
                const pm = (serviceWorkerRegistration as unknown as { pushManager?: PushManager }).pushManager;
                if (!pm) {
                    console.warn('getFCMTokenWithRetry: serviceWorkerRegistration has no pushManager');
                } else {
                    try {
                        const existing = await pm.getSubscription();
                        if (existing) {
                            console.info('getFCMTokenWithRetry: existing PushSubscription endpoint=', existing.endpoint);
                            // keys may be ArrayBuffer; print lengths for diagnostics
                            try {
                                const p256 = existing.getKey && existing.getKey('p256dh');
                                const auth = existing.getKey && existing.getKey('auth');
                                console.info('getFCMTokenWithRetry: existing subscription keys lengths p256dh=', p256 ? p256.byteLength : 0, 'auth=', auth ? auth.byteLength : 0);
                            } catch {
                                // ignore
                            }
                        } else {
                            console.info('getFCMTokenWithRetry: no existing PushSubscription');
                        }
                    } catch (e) {
                        console.warn('getFCMTokenWithRetry: pushManager.getSubscription failed', e);
                    }
                }
            } catch (e) {
                console.warn('getFCMTokenWithRetry: could not access pushManager on registration', e);
            }
        } else {
            console.info('getFCMTokenWithRetry: no serviceWorkerRegistration provided');
        }
    } catch (e) {
        console.warn('getFCMTokenWithRetry diagnostics failed', e);
    }

    // Basic vapidKey validation
    if (!vapidKey || typeof vapidKey !== 'string' || vapidKey.length < 20) {
        console.error('FCM VAPID key missing or looks invalid. Set VITE_FIREBASE_VAPID_KEY in .env to the public VAPID key from Firebase Console.');
        return null;
    }

    // Try with serviceWorkerRegistration first, then without if it fails
    const strategies = [
        { useSwReg: true, label: 'with ServiceWorkerRegistration' },
        { useSwReg: false, label: 'without ServiceWorkerRegistration (fallback)' }
    ];

    for (const strategy of strategies) {
        console.info(`Attempting getToken ${strategy.label}...`);
        const swReg = strategy.useSwReg ? (serviceWorkerRegistration || undefined) : undefined;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Pass the service worker registration when available to ensure
                // the token is linked to the correct service worker for background
                // messages. This improves reliability in some browsers.
                const token = await getToken(messaging, {
                    vapidKey,
                    serviceWorkerRegistration: swReg
                });
                if (token) {
                    console.info('✅ FCM token obtained successfully');
                    return token;
                }
                // If no token returned, throw to go to retry/backoff
                throw new Error('Empty token returned from getToken');
            } catch (err) {
                const wait = initialDelayMs * Math.pow(2, attempt);
                // Log detailed error info
                if (err instanceof Error) {
                    const errWithCode = err as Error & { code?: string };
                    console.error(`getFCMTokenWithRetry attempt ${attempt + 1} failed:`, {
                        name: err.name,
                        message: err.message,
                        code: errWithCode.code,
                        stack: err.stack?.split('\n').slice(0, 3).join('\n')
                    });
                } else {
                    console.error(`getFCMTokenWithRetry attempt ${attempt + 1} failed:`, err);
                }

                // Last attempt for this strategy -> break inner loop
                if (attempt === retries - 1) break;
                console.warn(`Retrying in ${wait}ms...`);
                await new Promise((res) => setTimeout(res, wait));
            }
        }
        // If we got here, this strategy failed - try next strategy
        console.warn(`Strategy "${strategy.label}" failed after ${retries} attempts, trying next strategy...`);
    }

    console.error('Failed to obtain FCM token after all strategies and retries');
    return null;
}

export default getFCMTokenWithRetry;

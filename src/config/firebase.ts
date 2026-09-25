import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

// Build firebase config from env — keep measurementId optional
const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

const app = initializeApp(firebaseConfig);

// Initialize analytics only in the browser and only if measurementId is present
let analytics: unknown = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    // dynamic import returns a promise; do not block module initialization
    import('firebase/analytics')
        .then((mod) => {
            try {
                analytics = mod.getAnalytics(app);
            } catch (e) {
                // ignore analytics init errors
                console.warn('Failed to init Firebase analytics', e);
            }
        })
        .catch((err) => {
            // ignore import failures in constrained environments
            console.warn('Firebase analytics not available:', err);
        });
}

let messaging: Messaging | null = null;
// Messaging is browser-only and needs a complete config; skip it during SSR
// or when the Firebase env variables are not set.
if (typeof window !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
    try {
        messaging = getMessaging(app);
    } catch (error) {
        console.log('Firebase messaging not supported:', error);
    }
}
export { app, analytics, messaging, getToken, onMessage };
export default app;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { YuyuBalanceProvider } from "@/context/YuyuBalanceContext";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import React, { useEffect, useState, Suspense, lazy, type ReactNode, Component, type ErrorInfo } from "react";
import { HelmetProvider } from "@/lib/helmet";
import { Toaster } from "react-hot-toast";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useServiceWorker } from "../hooks/useServiceWorker";

import ScrollToTop from "../components/ScrollToTop";
import Footer from "../components/Footer";
import { VoiceGreeting } from "../components/VoiceGreeting";
import { useBrowserPreferences } from "../hooks/useBrowserPreferences";

const BrowserNotificationOptIn = lazy(() =>
  import("../components/BrowserNotificationOptIn").then((m) => ({ default: m.BrowserNotificationOptIn })),
);
const GlobalLevelProgress = lazy(() =>
  import("../components/GlobalLevelProgress").then((m) => ({ default: m.GlobalLevelProgress })),
);
const GiftReceiveOverlay = lazy(() =>
  import("../components/GiftReceiveOverlay").then((m) => ({ default: m.GiftReceiveOverlay })),
);
const CaakusChatWidget = lazy(() => import("../components/CaakusChatWidget"));

// No branded loading screen: any intermediate splash adds perceived latency
// and blocks the first real paint. Routes mount straight onto the app
// background instead.
const PageLoader = () => (
  <div style={{ flex: 1, minHeight: "100vh" }} className="bg-background" aria-hidden />
);

const isChunkLoadError = (error: Error | null) => {
  const msg = `${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return (
    msg.includes("dynamically imported module") ||
    msg.includes("failed to fetch") ||
    msg.includes("chunkloaderror") ||
    msg.includes("importing a module script failed") ||
    msg.includes("loading css chunk")
  );
};

class RootErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; retryKey: number; attempts: number }
> {
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, retryKey: 0, attempts: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RootErrorBoundary]", error, info.componentStack);

    // A stale deployment chunk is the #1 cause of the crash screen:
    // silently reload once with a fresh cache instead of showing an error.
    if (typeof window !== "undefined" && isChunkLoadError(error) && !sessionStorage.getItem("caakus_chunk_reload")) {
      sessionStorage.setItem("caakus_chunk_reload", "1");
      void this.handleReload();
      return;
    }

    // Otherwise, self-heal: remount the tree twice before giving up.
    if (this.state.attempts < 2) {
      this.retryTimer = setTimeout(() => {
        this.setState((s) => ({
          hasError: false,
          error: null,
          retryKey: s.retryKey + 1,
          attempts: s.attempts + 1,
        }));
      }, 400);
    }
  }

  override componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }


  handleReload = async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      const regs = await navigator.serviceWorker?.getRegistrations();
      if (regs) await Promise.all(regs.map((r) => r.unregister()));
    } catch {
      // best-effort
    }
    window.location.reload();
  };

  override render() {
    if (this.state.hasError && this.state.attempts < 2) {
      // Silent self-heal in progress — never show a crash screen for a
      // transient render error.
      return <PageLoader />;
    }
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)",
            fontFamily: "system-ui,-apple-system,sans-serif",
            color: "#fff",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <img
            src="/logo_128.png"
            alt="Caakus"
            width={64}
            height={64}
            style={{ borderRadius: 16, marginBottom: 24 }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.6)",
              maxWidth: 400,
              marginBottom: 24,
            }}
          >
            An unexpected error occurred. Tap the button below to reload with a fresh cache.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "14px 32px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 4px 24px rgba(124,58,237,.4)",
            }}
          >
            Reload App
          </button>
          {this.state.error && (
            <pre
              style={{
                marginTop: 24,
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                maxWidth: "90vw",
                overflow: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return (
      <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>
    );
  }
}

function BrowserPreferencesInitializer() {
  useBrowserPreferences();
  return null;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover",
      },
      { name: "theme-color", content: "#dc2626" },
      { name: "author", content: "Bryan Lewis Dongue Ndiffo" },
      { property: "og:site_name", content: "Caakus" },
      { name: "twitter:site", content: "@caakus_official" },
      { name: "twitter:creator", content: "@lewis_ndiffo" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Caakus" },
      { httpEquiv: "Content-Security-Policy", content: "upgrade-insecure-requests" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/logo.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preload", as: "image", href: "/logo.webp", type: "image/webp", fetchPriority: "high" },
      // Greeting audio is not part of the first paint: prefetched at low
      // priority instead of preloaded, so it never competes with the LCP.
      { rel: "prefetch", href: "/audio/greetings/en.mp3", as: "audio", type: "audio/mpeg" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/logo.png" },
      { rel: "apple-touch-icon", sizes: "192x192", href: "/logo.png" },
      { rel: "apple-touch-icon", sizes: "512x512", href: "/logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
      { rel: "preconnect", href: "https://www.googletagmanager.com" },
      { rel: "preconnect", href: "https://turn.caakus.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://turn.caakus.com" },
    ],
    scripts: [
      {
        children:
          'window.global = window.globalThis = window; window.process = window.process || { env: {}, browser: true }; window.Buffer = window.Buffer || { isBuffer: () => false };',
      },
      {
        // Analytics is loaded only after the first user interaction (or when
        // the browser goes idle). It can no longer block touch input or the
        // first paint on mobile — the INP/LCP budget stays with the UI.
        children:
          "(function(){window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};var loaded=false;function load(){if(loaded)return;loaded=true;var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=G-6DM5WBSG4S';s.async=true;document.head.appendChild(s);gtag('js',new Date());gtag('config','G-6DM5WBSG4S');}['pointerdown','keydown','touchstart','scroll'].forEach(function(e){window.addEventListener(e,load,{once:true,passive:true});});if('requestIdleCallback' in window){requestIdleCallback(load,{timeout:6000});}else{setTimeout(load,5000);}})();",
      },
      {
        // Runs before first paint. Detect either the cached Caakus profile or
        // the persisted auth session, so returning users never paint the
        // signed-out CTA while their profile is being refreshed.
        children:
          "(function(){try{var ok=false,r=localStorage.getItem('audioChat_user');if(r){var u=JSON.parse(r);ok=!!(u&&u.id&&!u.isGuest);}if(!ok){for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(!k||!/^sb-.*-auth-token$/.test(k))continue;var s=JSON.parse(localStorage.getItem(k)||'null');if(s&&(s.access_token||s.currentSession&&s.currentSession.access_token)){ok=true;break;}}}if(ok)document.documentElement.setAttribute('data-auth-pending','1');}catch(e){}})();",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" prefix="og: https://ogp.me/ns#" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Content/SEO routes must be fully server-rendered: no loading gate, no
// app shell, no WebRTC prefetch. This is what keeps LCP and INP low on the
// programmatic directory, which is the bulk of organic entry traffic.
const CONTENT_EXACT = new Set([
  "/omegle-alternative",
  "/chatroulette-alternative",
  "/azar-alternative",
  "/monkey-app-alternative",
  "/random-video-chat",
  "/talk-to-strangers",
  "/meet-new-people",
  "/video-chat-dating",
  "/make-money-online",
  "/about",
  "/about-founder",
  "/privacy",
  "/terms-of-service",
  "/refund-policy",
]);

// Routes that keep the full app shell (providers, navbar, toasts) but must
// still be server-rendered immediately: no PageLoader gate. Home is the main
// ranking + crawl entry point, Contact/Support are static text pages.
const SSR_SHELL_EXACT = new Set(["/", "/contact", "/support"]);

/** Bare routes: no shell, no footer, no providers (third-party iframes). */
function isBarePath(pathname: string): boolean {
  return pathname.startsWith("/embed/");
}

function isContentPath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  return (
    CONTENT_EXACT.has(p) ||
    p === "/tools" ||
    p.startsWith("/tools/") ||
    p === "/embed-video-call" ||
    p === "/rankings" ||
    p.startsWith("/rankings/") ||
    p.includes("/discover/") ||
    p.startsWith("/directory/") ||
    p.startsWith("/guides/") ||
    p.startsWith("/sitemap") ||
    p.endsWith("/omegle-alternative")
  );
}

function isSsrShellPath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  return SSR_SHELL_EXACT.has(p);
}


/**
 * Canonical safety net: every route declares its own canonical, but if one is
 * ever missing we inject a clean self-referencing URL (no query string, no
 * trailing slash) so Google never reports "duplicate without user-selected
 * canonical".
 */
function useSelfCanonical() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const clean = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const href = `https://www.caakus.com${clean}`;
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));
    let link = links[0];
    // Canonical is singular by definition. Remove stale duplicates injected by
    // legacy page components before setting the clean route URL.
    links.slice(1).forEach((duplicate) => duplicate.remove());
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [pathname]);
}

function RootComponent() {
  useSelfCanonical();
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bareRoute = isBarePath(pathname);
  const adminRoute = pathname === "/nathan";
  const contentRoute = isContentPath(pathname) || bareRoute;
  const ssrShellRoute = isSsrShellPath(pathname);

  const [clientReady, setClientReady] = useState(false);
  const contentLoaded = true;

  useServiceWorker();

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (contentRoute || adminRoute) return;
    const timer = window.setTimeout(() => {
      void import("../pages/CallPage");
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [contentRoute, adminRoute]);

  useEffect(() => {
    if (contentRoute || adminRoute) return;
    let stop: (() => void) | undefined;
    void import("../services/dailyNotificationScheduler").then((m) => {
      stop = m.startDailyNotificationScheduler();
    });
    return () => stop?.();
  }, [contentRoute, adminRoute]);

  if (bareRoute) {
    return (
      <RootErrorBoundary>
        <Outlet />
      </RootErrorBoundary>
    );
  }

  if (adminRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <RootErrorBoundary>
          <Toaster position="top-right" />
          <Outlet />
        </RootErrorBoundary>
      </QueryClientProvider>
    );
  }

  if (contentRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <RootErrorBoundary>
          <div className="flex min-h-screen flex-col bg-background">
            <Outlet />
            {contentLoaded ? (
              <HelmetProvider>
                <Footer />
              </HelmetProvider>
            ) : null}
          </div>
        </RootErrorBoundary>
      </QueryClientProvider>
    );
  }

  // Browser-only application routes keep a stable blank surface for the brief
  // hydration boundary; the former branded/animated loading screen is gone.
  if (!clientReady && !ssrShellRoute) return <PageLoader />;

  return (
    <>
      <VoiceGreeting />
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <YuyuBalanceProvider>
          <RootErrorBoundary>
          <div
            className="flex min-h-screen flex-col bg-background relative safe-area-top safe-area-bottom"
          >
            <ScrollToTop />
            <Suspense fallback={null}>
              <BrowserNotificationOptIn />
              <GlobalLevelProgress />
              <GiftReceiveOverlay />
            </Suspense>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#fff",
                  color: "#222",
                  borderRadius: "0.5rem",
                  padding: "16px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e5e7eb",
                },
              }}
            />
            <BrowserPreferencesInitializer />
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
            {contentLoaded && (
              <>
                <Footer />
                <Suspense fallback={null}>
                  <CaakusChatWidget />
                </Suspense>
              </>
            )}
          </div>
          </RootErrorBoundary>
          </YuyuBalanceProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </>
  );
}

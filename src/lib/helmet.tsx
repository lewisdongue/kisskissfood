import type { ReactNode } from "react";

/**
 * React 19 hoists <title>, <meta> and <link> to <head> natively, and renders
 * inline <script type="application/ld+json"> where it stands. react-helmet-async
 * required a provider context that was missing during server rendering and
 * crashed the whole page (blank SSR HTML → very slow first paint on mobile).
 *
 * These pass-through components keep every existing call site working while
 * letting React own metadata. Do not reintroduce react-helmet-async here.
 */
export function Helmet({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function HelmetProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

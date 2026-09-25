import type { Transition, Variants } from 'framer-motion';

/**
 * Hardware-accelerated modal motion (transform + opacity only — never height/width).
 * Shared by every floating surface so transitions feel identical app-wide.
 */
export const modalSpring: Transition = { type: 'spring', stiffness: 300, damping: 30 };

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: modalSpring },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Minimum iOS-compliant touch target + safe-area aware placement for close buttons. */
export const closeButtonClasses =
  'fixed sm:absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] sm:top-3 z-[9999] ' +
  'inline-flex h-12 w-12 items-center justify-center rounded-full ' +
  'transition-transform duration-200 active:scale-95 touch-manipulation ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

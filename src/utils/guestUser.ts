/**
 * GUEST USER UTILITY
 * 
 * Handles guest user UUID generation and management.
 * Guest users get a client-generated UUID stored in localStorage.
 * This allows them to use the call system without authentication.
 */

const GUEST_USER_KEY = 'caakus_guest_user_id';
const GUEST_USER_PREFIX = 'guest_';

export interface GuestUser {
  id: string;
  isGuest: true;
  createdAt: string;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  // Modern browsers support crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create a guest user ID
 * Returns a stable UUID that persists across sessions
 */
export function getOrCreateGuestUserId(): string {
  try {
    // Check if guest user ID already exists
    const existingId = localStorage.getItem(GUEST_USER_KEY);
    
    if (existingId) {
      return existingId;
    }
    
    // Generate new guest user ID
    const newId = generateUUID();
    localStorage.setItem(GUEST_USER_KEY, newId);
    
    return newId;
    
  } catch (error) {
    console.error('Error accessing localStorage for guest user:', error);
    // Fallback to session-only UUID if localStorage fails
    return generateUUID();
  }
}

/**
 * Get guest user object with metadata
 */
export function getOrCreateGuestUser(): GuestUser {
  const id = getOrCreateGuestUserId();
  
  return {
    id,
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Check if a user ID belongs to a guest user
 */
export function isGuestUserId(userId: string): boolean {
  // Guest IDs are UUIDs stored in localStorage
  // We can identify them by checking if they're NOT in the auth system
  // or by checking if they exist in localStorage
  const guestId = localStorage.getItem(GUEST_USER_KEY);
  return userId === guestId;
}

/**
 * Clear guest user data (for debugging or logout)
 */
export function clearGuestUser(): void {
  try {
    localStorage.removeItem(GUEST_USER_KEY);
  } catch (error) {
    console.error('Error clearing guest user:', error);
  }
}

/**
 * Get current user ID (guest or authenticated)
 * This is the unified entry point for getting user ID
 */
export function getCurrentUserId(authenticatedUser: any | null): string {
  if (authenticatedUser?.id) {
    // Authenticated user - use their UUID from auth
    return authenticatedUser.id;
  }
  
  // No authenticated user - use guest ID
  return getOrCreateGuestUserId();
}

/**
 * Check if current session is guest mode
 */
export function isGuestMode(authenticatedUser: any | null): boolean {
  return !authenticatedUser || !authenticatedUser.id;
}


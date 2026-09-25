import toast from 'react-hot-toast';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export class NetworkError extends Error {
  statusCode?: number;
  originalError?: any;

  constructor(message: string, statusCode?: number, originalError?: any) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export class InsufficientFundsError extends Error {
  required: number;
  available: number;

  constructor(message: string, required: number, available: number) {
    super(message);
    this.name = 'InsufficientFundsError';
    this.required = required;
    this.available = available;
  }
}

export class ChallengeNotFoundError extends Error {
  constructor(message: string = 'Challenge not found') {
    super(message);
    this.name = 'ChallengeNotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized action') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Retry a promise-based function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    exponentialBackoff = true,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (
        error instanceof InsufficientFundsError ||
        error instanceof UnauthorizedError ||
        error?.message?.includes('insufficient') ||
        error?.message?.includes('not_authorized')
      ) {
        throw error;
      }

      if (attempt < maxAttempts) {
        const delay = exponentialBackoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
        
        console.warn(`⚠️ [Retry] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`, error);
        
        onRetry?.(attempt, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Parse Supabase/PostgreSQL errors into friendly messages
 */
export function parseSupabaseError(error: any): {
  message: string;
  type: 'insufficient_funds' | 'not_found' | 'unauthorized' | 'network' | 'unknown';
  originalError: any;
} {
  const errorMsg = error?.message || error?.toString() || 'Unknown error';
  
  // Insufficient funds
  if (errorMsg.includes('insufficient_funds') || errorMsg.includes('not enough')) {
    const match = errorMsg.match(/Need (\d+) coins but only have (\d+)/);
    if (match) {
      return {
        message: `Insufficient coins! You need ${parseInt(match[1]).toLocaleString()} but only have ${parseInt(match[2]).toLocaleString()}.`,
        type: 'insufficient_funds',
        originalError: error,
      };
    }
    return {
      message: 'Insufficient coins to perform this action.',
      type: 'insufficient_funds',
      originalError: error,
    };
  }
  
  // Not found
  if (errorMsg.includes('not_found') || errorMsg.includes('does not exist')) {
    return {
      message: 'Challenge not found or has been removed.',
      type: 'not_found',
      originalError: error,
    };
  }
  
  // Unauthorized
  if (errorMsg.includes('not_authorized') || errorMsg.includes('not_opponent') || errorMsg.includes('not_proposer')) {
    return {
      message: 'You are not authorized to perform this action.',
      type: 'unauthorized',
      originalError: error,
    };
  }
  
  // Network errors
  if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('timeout')) {
    return {
      message: 'Network error. Please check your connection and try again.',
      type: 'network',
      originalError: error,
    };
  }
  
  // Unknown
  return {
    message: errorMsg,
    type: 'unknown',
    originalError: error,
  };
}

/**
 * Handle challenge-related errors with appropriate user feedback
 */
export function handleChallengeError(error: any, context?: string): void {
  const parsed = parseSupabaseError(error);
  
  console.error(`❌ [Challenge Error] ${context || 'Error'}:`, parsed);
  
  switch (parsed.type) {
    case 'insufficient_funds':
      toast.error(parsed.message + ' Open coin purchase to add more.', { duration: 6000 });
      break;
    
    case 'not_found':
      toast.error(parsed.message, { duration: 4000 });
      break;
    
    case 'unauthorized':
      toast.error(parsed.message, { duration: 4000 });
      break;
    
    case 'network':
      toast.error(parsed.message, { duration: 5000, icon: '🔌' });
      break;
    
    default:
      toast.error('Something went wrong: ' + parsed.message, { duration: 5000 });
      break;
  }
}

/**
 * Check if user has network connectivity
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Wait for network to be online
 */
export async function waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
  if (isOnline()) return true;
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeoutMs);
    
    const onlineHandler = () => {
      clearTimeout(timeout);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };
    
    window.addEventListener('online', onlineHandler);
  });
}

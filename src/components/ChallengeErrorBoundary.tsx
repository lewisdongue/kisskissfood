import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ChallengeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [ChallengeErrorBoundary] Error caught:', error, errorInfo);
    
    // Log to monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
    
    this.props.onError?.(error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-red-400">Challenge System Error</div>
              <div className="text-sm text-white/70 mt-1">
                Something went wrong with the challenge feature. Please refresh and try again.
              </div>
              {this.state.error && (
                <div className="mt-2 text-xs text-white/50 font-mono">
                  {this.state.error.message}
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

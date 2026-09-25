/**
 * ENHANCED ERROR RECOVERY SYSTEM
 * Automatic error detection and recovery for mobile PWA
 */

import toast from "react-hot-toast";

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: number;
  userAgent: string;
  online: boolean;
}

export interface ErrorLog {
  error: Error;
  context: ErrorContext;
  recoveryAttempted: boolean;
  recoverySuccessful: boolean;
}

class ErrorRecoverySystem {
  private static instance: ErrorRecoverySystem;
  private errorLog: ErrorLog[] = [];
  private maxLogSize = 50;
  private recoveryStrategies: Map<string, () => Promise<boolean>> = new Map();
  
  private constructor() {
    this.setupGlobalErrorHandlers();
    this.registerRecoveryStrategies();
  }
  
  static getInstance(): ErrorRecoverySystem {
    if (!this.instance) {
      this.instance = new ErrorRecoverySystem();
    }
    return this.instance;
  }
  
  private setupGlobalErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        component: 'window',
        action: 'uncaught_error',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        online: navigator.onLine,
      });
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(event.reason || 'Unhandled promise rejection'),
        {
          component: 'window',
          action: 'unhandled_rejection',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          online: navigator.onLine,
        }
      );
    });
  }
  
  private registerRecoveryStrategies() {
    // Strategy 1: Connection lost - retry with exponential backoff
    this.recoveryStrategies.set('CONNECTION_LOST', async () => {
      console.log('🔄 Attempting connection recovery...');
      
      for (let i = 0; i < 3; i++) {
        await this.wait(Math.pow(2, i) * 1000); // 1s, 2s, 4s
        
        if (navigator.onLine) {
          console.log('✅ Connection restored');
          toast.success('Connection restored');
          return true;
        }
      }
      
      console.log('❌ Connection recovery failed');
      toast.error('Unable to restore connection. Please check your internet.');
      return false;
    });
    
    // Strategy 2: Media device error - request permissions again
    this.recoveryStrategies.set('MEDIA_DEVICE_ERROR', async () => {
      console.log('🔄 Attempting media device recovery...');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        
        // Stop tracks immediately
        stream.getTracks().forEach(track => track.stop());
        
        console.log('✅ Media device recovered');
        return true;
      } catch (err) {
        console.log('❌ Media device recovery failed:', err);
        toast.error('Please grant microphone permissions to continue');
        return false;
      }
    });
    
    // Strategy 3: WebRTC unsupported / peer connection failure
    this.recoveryStrategies.set('WEBRTC_ERROR', async () => {
      console.log('🔄 Attempting WebRTC recovery...');

      if (typeof RTCPeerConnection === 'undefined') {
        toast.error('Your browser does not support live video calls. Please update it.');
        return false;
      }

      // The peer connection is rebuilt on the next join; nothing to reload.
      return true;
    });

    
    // Strategy 4: Database error - retry query
    this.recoveryStrategies.set('DATABASE_ERROR', async () => {
      console.log('🔄 Attempting database recovery...');
      
      // Wait a bit and let Supabase auto-reconnect
      await this.wait(2000);
      
      console.log('✅ Database connection should be restored');
      return true;
    });
    
    // Strategy 5: Memory pressure - clear caches
    this.recoveryStrategies.set('MEMORY_PRESSURE', async () => {
      console.log('🔄 Attempting memory recovery...');
      
      try {
        // Clear non-critical caches
        const cacheNames = await caches.keys();
        const nonCritical = cacheNames.filter(name => 
          !name.includes('critical') && !name.includes('core')
        );
        
        await Promise.all(nonCritical.map(name => caches.delete(name)));
        
        // Force garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
        
        console.log('✅ Memory recovered');
        toast('Memory optimized', { icon: '🧹' });
        return true;
      } catch (err) {
        console.log('❌ Memory recovery failed:', err);
        return false;
      }
    });
  }
  
  async handleError(error: Error, context: ErrorContext): Promise<boolean> {
    console.error('❌ Error detected:', error, context);
    
    // Log error
    const errorLog: ErrorLog = {
      error,
      context,
      recoveryAttempted: false,
      recoverySuccessful: false,
    };
    
    this.errorLog.push(errorLog);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    
    // Determine error type and attempt recovery
    const errorType = this.classifyError(error);
    const strategy = this.recoveryStrategies.get(errorType);
    
    if (strategy) {
      errorLog.recoveryAttempted = true;
      
      try {
        const success = await strategy();
        errorLog.recoverySuccessful = success;
        return success;
      } catch (recoveryError) {
        console.error('❌ Recovery failed:', recoveryError);
        return false;
      }
    }
    
    // No recovery strategy available
    console.warn('⚠️ No recovery strategy for error type:', errorType);
    return false;
  }
  
  private classifyError(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
      return 'CONNECTION_LOST';
    }
    
    if (message.includes('microphone') || message.includes('camera') || 
        message.includes('media') || message.includes('permission')) {
      return 'MEDIA_DEVICE_ERROR';
    }
    
    if (message.includes('webrtc') || message.includes('rtc') || message.includes('ice')) {
      return 'WEBRTC_ERROR';
    }
    
    if (message.includes('database') || message.includes('supabase') || 
        message.includes('query')) {
      return 'DATABASE_ERROR';
    }
    
    if (message.includes('memory') || message.includes('heap')) {
      return 'MEMORY_PRESSURE';
    }
    
    return 'UNKNOWN';
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getErrorLog(): ErrorLog[] {
    return [...this.errorLog];
  }
  
  clearErrorLog(): void {
    this.errorLog = [];
  }
  
  getRecoveryRate(): number {
    if (this.errorLog.length === 0) return 100;
    
    const attempted = this.errorLog.filter(log => log.recoveryAttempted).length;
    const successful = this.errorLog.filter(log => log.recoverySuccessful).length;
    
    return attempted > 0 ? (successful / attempted) * 100 : 0;
  }
}

// Export singleton instance
export const errorRecovery = ErrorRecoverySystem.getInstance();

// React hook for error boundary
export function useErrorRecovery() {
  const handleError = async (error: Error, errorInfo?: React.ErrorInfo) => {
    const context: ErrorContext = {
      component: errorInfo?.componentStack?.split('\n')[1]?.trim(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      online: navigator.onLine,
    };
    
    return await errorRecovery.handleError(error, context);
  };
  
  return { handleError };
}

// Automatic recovery for common issues
export function setupAutomaticRecovery() {
  // Auto-recover from connection loss
  window.addEventListener('online', () => {
    console.log('✅ Internet connection restored');
    toast.success('Back online');
  });
  
  window.addEventListener('offline', () => {
    console.log('⚠️ Internet connection lost');
    toast.error('Connection lost. Trying to reconnect...');
  });
  
  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedPercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usedPercentage > 0.9) {
        console.warn('⚠️ High memory usage:', Math.round(usedPercentage * 100) + '%');
        
        errorRecovery.handleError(
          new Error('High memory usage detected'),
          {
            action: 'memory_monitor',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            online: navigator.onLine,
          }
        );
      }
    }, 30000); // Check every 30s
  }
}

// Initialize automatic recovery on app load
if (typeof window !== 'undefined') {
  setupAutomaticRecovery();
}

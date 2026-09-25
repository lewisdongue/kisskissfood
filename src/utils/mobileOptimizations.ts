/**
 * MOBILE PWA OPTIMIZATIONS
 * Utilities for detecting and optimizing for mobile devices
 */

// Detect if running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

// Detect mobile device
export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detect iOS
export function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Detect Android
export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

// Check if device has touch support
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Get network connection type
export function getNetworkType(): '4g' | '3g' | '2g' | 'slow-2g' | 'wifi' | 'unknown' {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return 'unknown';
  
  const effectiveType = connection.effectiveType;
  
  if (effectiveType) {
    return effectiveType as '4g' | '3g' | '2g' | 'slow-2g';
  }
  
  // Fallback: check if saveData is enabled (indicates slow network)
  if (connection.saveData) return '2g';
  
  return 'unknown';
}

// Check if on metered connection
export function isMeteredConnection(): boolean {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.saveData === true;
}

// Get device memory (in GB)
export function getDeviceMemory(): number {
  const memory = (navigator as any).deviceMemory;
  return typeof memory === 'number' ? memory : 4; // Default to 4GB
}

// Get hardware concurrency (CPU cores)
export function getCPUCores(): number {
  return navigator.hardwareConcurrency || 2; // Default to 2 cores
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  const memory = getDeviceMemory();
  const cores = getCPUCores();
  
  // Consider low-end if less than 2GB RAM or less than 4 cores
  return memory < 2 || cores < 4;
}

// Optimal video resolution based on device
export function getOptimalVideoResolution(): { width: number; height: number } {
  if (isLowEndDevice()) {
    return { width: 320, height: 240 }; // QVGA
  }
  
  const networkType = getNetworkType();
  
  if (networkType === '2g' || networkType === 'slow-2g') {
    return { width: 320, height: 240 }; // QVGA
  }
  
  if (networkType === '3g') {
    return { width: 480, height: 360 }; // 360p
  }
  
  // 4g/wifi - use 480p max on mobile to save battery
  if (isMobileDevice()) {
    return { width: 640, height: 480 }; // VGA
  }
  
  // Desktop can handle higher resolution
  return { width: 1280, height: 720 }; // HD
}

// Optimal video frame rate
export function getOptimalFrameRate(): number {
  if (isLowEndDevice()) return 15;
  
  const networkType = getNetworkType();
  
  if (networkType === '2g' || networkType === 'slow-2g') return 15;
  if (networkType === '3g') return 24;
  
  return 30; // Max 30fps for mobile efficiency
}

// Optimal audio bitrate (in kbps)
export function getOptimalAudioBitrate(): number {
  const networkType = getNetworkType();
  
  if (networkType === '2g' || networkType === 'slow-2g') return 16; // Very low
  if (networkType === '3g') return 32; // Low
  
  return 48; // Standard quality
}

// Prevent screen sleep during call
export function preventScreenSleep(): Promise<WakeLock | null> {
  if (!('wakeLock' in navigator)) {
    console.warn('Wake Lock API not supported');
    return Promise.resolve(null);
  }
  
  return (navigator as any).wakeLock.request('screen')
    .then((wakeLock: WakeLock) => {
      console.log('✅ Screen wake lock active');
      return wakeLock;
    })
    .catch((err: Error) => {
      console.warn('Failed to acquire wake lock:', err);
      return null;
    });
}

interface WakeLock {
  release(): Promise<void>;
}

// Enable performance mode (reduce animations, etc.)
export function shouldReduceMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Check battery status
export async function getBatteryInfo(): Promise<{
  level: number;
  charging: boolean;
  lowBattery: boolean;
} | null> {
  if (!('getBattery' in navigator)) return null;
  
  try {
    const battery = await (navigator as any).getBattery();
    return {
      level: battery.level,
      charging: battery.charging,
      lowBattery: battery.level < 0.2 && !battery.charging,
    };
  } catch {
    return null;
  }
}

// Adaptive quality based on device and network
export async function getAdaptiveQualitySettings() {
  const battery = await getBatteryInfo();
  const lowBattery = battery?.lowBattery ?? false;
  const isLowEnd = isLowEndDevice();
  const network = getNetworkType();
  const { width, height } = getOptimalVideoResolution();
  
  return {
    video: {
      width,
      height,
      frameRate: lowBattery ? 15 : getOptimalFrameRate(),
      bitrate: lowBattery ? 200 : (isLowEnd ? 400 : 800), // kbps
    },
    audio: {
      bitrate: getOptimalAudioBitrate(),
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    enableVideo: !lowBattery && network !== '2g' && network !== 'slow-2g',
    reducedUI: isLowEnd || lowBattery,
  };
}

// Haptic feedback (if supported)
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!('vibrate' in navigator)) return;
  
  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
  };
  
  navigator.vibrate(patterns[type]);
}

// Request permissions with better mobile UX
export async function requestMediaPermissions(video: boolean = true): Promise<{
  audio: boolean;
  video: boolean;
}> {
  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: video ? {
      ...getOptimalVideoResolution(),
      facingMode: 'user',
    } : false,
  };
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Immediately stop tracks - we just wanted to check permissions
    stream.getTracks().forEach(track => track.stop());
    
    return {
      audio: true,
      video: video,
    };
  } catch (err: any) {
    console.error('Media permission error:', err);
    
    return {
      audio: false,
      video: false,
    };
  }
}

// Optimize images for mobile
export function getOptimizedImageURL(url: string, width: number = 400): string {
  // If using Supabase storage, add transformation params
  if (url.includes('supabase')) {
    return `${url}?width=${width}&quality=80`;
  }
  
  return url;
}

// Preload critical assets
export function preloadCriticalAssets(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
      link.as = 'image';
    } else {
      link.as = 'fetch';
      link.setAttribute('crossorigin', 'anonymous');
    }
    
    link.href = url;
    document.head.appendChild(link);
  });
}

// Defer non-critical scripts
export function deferNonCriticalScripts() {
  // Find all scripts with data-defer attribute
  const scripts = document.querySelectorAll('script[data-defer]');
  
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (!src) return;
    
    const newScript = document.createElement('script');
    newScript.src = src;
    newScript.async = true;
    
    // Load after page is interactive
    if (document.readyState === 'complete') {
      document.body.appendChild(newScript);
    } else {
      window.addEventListener('load', () => {
        document.body.appendChild(newScript);
      });
    }
  });
}

// Memory pressure detection
export function onMemoryPressure(callback: () => void) {
  if ('memory' in performance) {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      const usedPercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usedPercentage > 0.9) {
        callback();
      }
    };
    
    // Check every 30 seconds
    return setInterval(checkMemory, 30000);
  }
  
  return null;
}

// Clear caches to free memory
export async function clearMemoryCaches() {
  // Clear all caches except critical ones
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const nonCriticalCaches = cacheNames.filter(name => 
      !name.includes('critical') && !name.includes('core')
    );
    
    await Promise.all(
      nonCriticalCaches.map(name => caches.delete(name))
    );
    
    console.log(`🧹 Cleared ${nonCriticalCaches.length} non-critical caches`);
  }
}

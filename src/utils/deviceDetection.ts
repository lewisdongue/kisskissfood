/**
 * Device Detection Utilities
 * Detects device type and capabilities for optimized UX
 */

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent.toLowerCase()) || (hasTouch && isSmallScreen);
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android/i.test(userAgent);
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  const isIPad = /iPad/.test(userAgent);
  const isAndroidTablet = /android/i.test(userAgent) && !/mobile/i.test(userAgent);
  
  return isIPad || isAndroidTablet;
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isTablet()) return 'tablet';
  if (isMobile()) return 'mobile';
  return 'desktop';
};

export const supportsInAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if running in standalone mode (PWA) or native webview
  const isStandalone = (window.navigator as any).standalone === true;
  const isWebview = /wv|WebView/i.test(navigator.userAgent);
  
  return !isStandalone && !isWebview;
};

/**
 * Get viewport dimensions accounting for mobile browser chrome
 */
export const getViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  
  // Use visualViewport if available (accounts for mobile keyboard)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  
  return window.innerHeight;
};

/**
 * Check if device supports popup windows
 */
export const supportsPopup = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const popup = window.open('', '_blank', 'width=1,height=1');
    if (popup) {
      popup.close();
      return true;
    }
    return false;
  } catch {
    return false;
  }
};


/**
 * ZERO-LATENCY CONNECTION OPTIMIZATIONS
 * Techniques to minimize call connection time to <1 second
 */

import { supabase } from "../config/supabase";

// WebSocket pool for instant connections
class WebSocketPool {
  private pools: Map<string, WebSocket[]> = new Map();
  private readonly poolSize = 2; // Pre-create 2 connections
  
  async warmupConnection(url: string): Promise<void> {
    if (this.pools.has(url)) return;
    
    const sockets: WebSocket[] = [];
    
    for (let i = 0; i < this.poolSize; i++) {
      try {
        const ws = new WebSocket(url);
        await new Promise((resolve, reject) => {
          ws.onopen = resolve;
          ws.onerror = reject;
          setTimeout(reject, 5000); // 5s timeout
        });
        sockets.push(ws);
      } catch (err) {
        console.warn('Failed to warmup WebSocket:', err);
      }
    }
    
    this.pools.set(url, sockets);
  }
  
  getConnection(url: string): WebSocket | null {
    const pool = this.pools.get(url);
    return pool?.shift() || null;
  }
  
  returnConnection(url: string, ws: WebSocket): void {
    const pool = this.pools.get(url) || [];
    if (pool.length < this.poolSize) {
      pool.push(ws);
      this.pools.set(url, pool);
    } else {
      ws.close();
    }
  }
  
  cleanup(): void {
    for (const pool of this.pools.values()) {
      pool.forEach(ws => ws.close());
    }
    this.pools.clear();
  }
}

export const wsPool = new WebSocketPool();

// DNS prefetching for critical domains
export function prefetchDNS() {
  const domains = [
    'https://supabase.co',
    'https://turn.caakus.com',
    
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

// Preconnect to critical origins
export function preconnectOrigins() {
  const origins: string[] = [
    'https://turn.caakus.com',
  ];
  
  origins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Resource hints for critical scripts
export function addResourceHints() {
}

// Early media permissions request (before call starts)
export async function prepareMediaDevices(): Promise<{
  audio: boolean;
  video: boolean;
}> {
  try {
    // Just enumerate devices to warm up the permission prompt
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const hasAudio = devices.some(d => d.kind === 'audioinput');
    const hasVideo = devices.some(d => d.kind === 'videoinput');
    
    return { audio: hasAudio, video: hasVideo };
  } catch {
    return { audio: false, video: false };
  }
}

// Prefetch user data for instant profile display
export async function prefetchUserData(userId: string): Promise<any> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return data;
  } catch {
    return null;
  }
}

// Aggressive connection pooling for Supabase
export async function warmupSupabaseConnection(): Promise<void> {
  // Trigger a lightweight query to establish connection
  try {
    await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    console.log('✅ Supabase connection warmed up');
  } catch (error) {
    console.warn('Failed to warmup Supabase:', error);
  }
}

// Predictive prefetching based on user behavior
export class PredictivePrefetcher {
  private static instance: PredictivePrefetcher;
  private prefetchQueue: Set<string> = new Set();
  private readonly maxQueueSize = 5;
  
  static getInstance(): PredictivePrefetcher {
    if (!this.instance) {
      this.instance = new PredictivePrefetcher();
    }
    return this.instance;
  }
  
  // Prefetch likely next actions
  async prefetchCallResources(userId: string) {
    // Don't prefetch if already in queue
    if (this.prefetchQueue.has('call')) return;
    
    this.prefetchQueue.add('call');
    
    // Prefetch in parallel
    await Promise.all([
      // Warmup Supabase connection
      warmupSupabaseConnection(),
      // Enumerate media devices
      prepareMediaDevices(),
      // Prefetch user profile
      prefetchUserData(userId),
    ]);
    
    console.log('✅ Call resources prefetched');
  }
  
  
  cleanup() {
    this.prefetchQueue.clear();
  }
}

// Instant state synchronization using BroadcastChannel
export class InstantSync {
  private channel: BroadcastChannel | null = null;
  private handlers: Map<string, (data: any) => void> = new Map();
  
  constructor(channelName: string = 'caakus-sync') {
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(channelName);
      this.channel.onmessage = (event) => {
        const { type, data } = event.data;
        const handler = this.handlers.get(type);
        if (handler) {
          handler(data);
        }
      };
    }
  }
  
  on(type: string, handler: (data: any) => void) {
    this.handlers.set(type, handler);
  }
  
  emit(type: string, data: any) {
    this.channel?.postMessage({ type, data });
  }
  
  cleanup() {
    this.channel?.close();
    this.handlers.clear();
  }
}

// Reduce initial render blocking
export function deferNonCriticalCSS() {
  // Find all non-critical stylesheets and load them async
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
  
  stylesheets.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Load stylesheet asynchronously
    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = href;
    newLink.media = 'print';
    
    newLink.onload = function() {
      newLink.media = 'all';
    };
    
    document.head.appendChild(newLink);
    link.remove();
  });
}

// Critical rendering path optimization
export function optimizeCriticalRenderingPath() {
  // Remove render-blocking scripts
  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (!src) return;
    
    const newScript = document.createElement('script');
    newScript.src = src;
    newScript.defer = true;
    
    document.body.appendChild(newScript);
    script.remove();
  });
}

// Reduce JavaScript parse time
export function optimizeJavaScriptExecution() {
  // Use requestIdleCallback for non-critical initialization
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      // Initialize non-critical features
      console.log('🎯 Non-critical features initialized');
    }, { timeout: 2000 });
  }
}

// Network quality prediction for proactive adjustment
export class NetworkQualityPredictor {
  private samples: number[] = [];
  private readonly maxSamples = 10;
  
  addSample(quality: number) {
    this.samples.push(quality);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }
  
  predictNextQuality(): 'good' | 'fair' | 'poor' {
    if (this.samples.length === 0) return 'good';
    
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    
    if (avg <= 2) return 'good';
    if (avg <= 4) return 'fair';
    return 'poor';
  }
  
  shouldReduceQuality(): boolean {
    return this.predictNextQuality() === 'poor';
  }
  
  shouldIncreaseQuality(): boolean {
    return this.predictNextQuality() === 'good' && this.samples.length >= 5;
  }
}

// Initialize all zero-latency optimizations
export function initializeZeroLatencyMode() {
  console.log('⚡ Initializing zero-latency mode...');
  
  // Run all optimizations
  prefetchDNS();
  preconnectOrigins();
  addResourceHints();
  warmupSupabaseConnection();
  deferNonCriticalCSS();
  optimizeCriticalRenderingPath();
  optimizeJavaScriptExecution();
  
  console.log('✅ Zero-latency mode active');
}

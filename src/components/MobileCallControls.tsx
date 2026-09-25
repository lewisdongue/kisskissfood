/**
 * MOBILE-OPTIMIZED Call Controls Component
 * Touch-friendly buttons with haptic feedback
 */

import React from "react";
import { Button } from "./ui/button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  SkipForward,
  Gift,
  UserPlus,
  Camera,
} from "lucide-react";
import { triggerHapticFeedback, isTouchDevice } from "../utils/mobileOptimizations";
import { cn } from "@/lib/utils";

interface CallControlsProps {
  isMuted: boolean;
  isCameraOn: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  onNext?: () => void;
  onSendGift?: () => void;
  onAddFriend?: () => void;
  onRequestPhoto?: () => void;
  disabled?: boolean;
  isConnected?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export function MobileCallControls({
  isMuted,
  isCameraOn,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  onNext,
  onSendGift,
  onAddFriend,
  onRequestPhoto,
  disabled = false,
  isConnected = false,
  layout = 'horizontal',
  className,
}: CallControlsProps) {
  const isTouch = isTouchDevice();
  
  const handleAction = (action: () => void, haptic: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (isTouch) {
      triggerHapticFeedback(haptic);
    }
    action();
  };
  
  return (
    <div 
      className={cn(
        "flex gap-3 items-center justify-center",
        layout === 'vertical' && "flex-col",
        className
      )}
    >
      {/* Mute Toggle */}
      <Button
        onClick={() => handleAction(onToggleMute, 'light')}
        disabled={disabled}
        variant={isMuted ? "destructive" : "default"}
        size="lg"
        className={cn(
          "rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg transition-all duration-200",
          "active:scale-95 touch-manipulation",
          isMuted 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        )}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </Button>
      
      {/* Camera Toggle */}
      <Button
        onClick={() => handleAction(onToggleCamera, 'light')}
        disabled={disabled}
        variant={isCameraOn ? "default" : "destructive"}
        size="lg"
        className={cn(
          "rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg transition-all duration-200",
          "active:scale-95 touch-manipulation",
          !isCameraOn 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        )}
        aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
      >
        {isCameraOn ? (
          <Video className="w-6 h-6 text-white" />
        ) : (
          <VideoOff className="w-6 h-6 text-white" />
        )}
      </Button>
      
      {/* End Call */}
      <Button
        onClick={() => handleAction(onEndCall, 'heavy')}
        disabled={disabled && !isConnected}
        variant="destructive"
        size="lg"
        className={cn(
          "rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-xl transition-all duration-200",
          "active:scale-95 touch-manipulation",
          "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        )}
        aria-label="End call"
      >
        <Phone className="w-7 h-7 text-white rotate-[135deg]" />
      </Button>
      
      {/* Secondary Actions - Only show when connected */}
      {isConnected && (
        <>
          {/* Next Partner */}
          {onNext && (
            <Button
              onClick={() => handleAction(onNext, 'medium')}
              disabled={disabled}
              variant="default"
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg transition-all duration-200",
                "active:scale-95 touch-manipulation",
                "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              )}
              aria-label="Next partner"
            >
              <SkipForward className="w-6 h-6 text-white" />
            </Button>
          )}
          
          {/* Send Gift */}
          {onSendGift && (
            <Button
              onClick={() => handleAction(onSendGift, 'light')}
              disabled={disabled}
              variant="default"
              size="lg"
              className={cn(
                "rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg transition-all duration-200",
                "active:scale-95 touch-manipulation",
                "bg-purple-500/30 hover:bg-purple-500/40 backdrop-blur-sm"
              )}
              aria-label="Send gift"
            >
              <Gift className="w-5 h-5 text-white" />
            </Button>
          )}
          
          {/* Add Friend */}
          {onAddFriend && (
            <Button
              onClick={() => handleAction(onAddFriend, 'light')}
              disabled={disabled}
              variant="default"
              size="lg"
              className={cn(
                "rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg transition-all duration-200",
                "active:scale-95 touch-manipulation",
                "bg-blue-500/30 hover:bg-blue-500/40 backdrop-blur-sm"
              )}
              aria-label="Add friend"
            >
              <UserPlus className="w-5 h-5 text-white" />
            </Button>
          )}
          
          {/* Request Photo */}
          {onRequestPhoto && (
            <Button
              onClick={() => handleAction(onRequestPhoto, 'light')}
              disabled={disabled}
              variant="default"
              size="lg"
              className={cn(
                "rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg transition-all duration-200",
                "active:scale-95 touch-manipulation",
                "bg-pink-500/30 hover:bg-pink-500/40 backdrop-blur-sm"
              )}
              aria-label="Request photo"
            >
              <Camera className="w-5 h-5 text-white" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// Mobile-optimized video container
export function MobileVideoContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "relative w-full rounded-none sm:rounded-2xl overflow-hidden",
        "aspect-[9/16] sm:aspect-video",
        "bg-gradient-to-br from-gray-900 to-black",
        className
      )}
    >
      {children}
    </div>
  );
}

// Loading skeleton for video
export function VideoLoadingSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-pink-500 rounded-full animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '1s' }} 
          />
        </div>
        <p className="text-white/70 text-sm font-medium">Connecting...</p>
      </div>
    </div>
  );
}

// Network quality indicator
export function NetworkQualityIndicator({
  quality,
  className,
}: {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' | null;
  className?: string;
}) {
  if (!quality) return null;
  
  const colors = {
    excellent: 'bg-green-500',
    good: 'bg-green-500',
    fair: 'bg-yellow-500',
    poor: 'bg-orange-500',
    critical: 'bg-red-500',
  };
  
  const labels = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    critical: 'Critical',
  };
  
  const bars = quality === 'excellent' ? 4 
    : quality === 'good' ? 3 
    : quality === 'fair' ? 2 
    : 1;
  
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm", className)}>
      <div className="flex items-end gap-0.5 h-4">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-1 rounded-full transition-all duration-300",
              bar <= bars ? colors[quality] : 'bg-gray-600',
            )}
            style={{ height: `${bar * 25}%` }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-white/90">{labels[quality]}</span>
    </div>
  );
}

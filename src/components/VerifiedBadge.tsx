import React from 'react';
import { Badge as UIBadge } from '@/components/ui/badge';
import { ShieldCheck, Crown, GraduationCap, CheckCircle2 } from 'lucide-react';

interface VerifiedBadgeProps {
  subscriptionType?: string | null;
  isPremium?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  subscriptionType,
  isPremium = false,
  size = 'sm',
  showLabel = true,
  showIcon = true,
  className = '',
}) => {
  // Don't show badge if not premium
  if (!isPremium && !subscriptionType) {
    return null;
  }

  // Size mappings
  const sizeClasses = {
    xs: {
      badge: 'text-[9px] px-1.5 py-0.5',
      icon: 'w-2.5 h-2.5',
    },
    sm: {
      badge: 'text-[10px] px-2 py-0.5',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'text-xs px-2.5 py-1',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      badge: 'text-sm px-3 py-1.5',
      icon: 'w-4 h-4',
    },
  };

  // Get badge details based on subscription type
  const getBadgeDetails = () => {
    switch (subscriptionType?.toLowerCase()) {
      case 'lifetime':
        return {
          label: 'Verified Founder',
          shortLabel: 'Founder',
          icon: <Crown className={sizeClasses[size].icon} />,
          bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
          textColor: 'text-yellow-300',
          borderColor: 'border-yellow-400/50',
          glowColor: 'shadow-yellow-400/20',
        };
      case 'student':
        return {
          label: 'Verified Student',
          shortLabel: 'Student',
          icon: <GraduationCap className={sizeClasses[size].icon} />,
          bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          textColor: 'text-green-300',
          borderColor: 'border-green-400/50',
          glowColor: 'shadow-green-400/20',
        };
      case 'regular':
      case 'premium':
        return {
          label: 'Verified Professional',
          shortLabel: 'Professional',
          icon: <ShieldCheck className={sizeClasses[size].icon} />,
          bgColor: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20',
          textColor: 'text-blue-300',
          borderColor: 'border-blue-400/50',
          glowColor: 'shadow-blue-400/20',
        };
      default:
        // Generic verified badge for any premium user
        return {
          label: 'Verified',
          shortLabel: 'Verified',
          icon: <CheckCircle2 className={sizeClasses[size].icon} />,
          bgColor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
          textColor: 'text-purple-300',
          borderColor: 'border-purple-400/50',
          glowColor: 'shadow-purple-400/20',
        };
    }
  };

  const details = getBadgeDetails();

  return (
    <UIBadge
      className={`
        ${details.bgColor}
        ${details.textColor}
        ${details.borderColor}
        ${details.glowColor}
        ${sizeClasses[size].badge}
        border
        font-bold
        shadow-lg
        backdrop-blur-sm
        flex
        items-center
        gap-1
        ${className}
      `}
    >
      {showIcon && details.icon}
      {showLabel && <span>{details.shortLabel}</span>}
    </UIBadge>
  );
};

// Export SVG verified checkmark for profile pictures - Professional Yellow Tick
export const VerifiedCheckmarkSVG: React.FC<{ 
  size?: number; 
  className?: string;
  subscriptionType?: string | null;
}> = ({ 
  size = 20, 
  className = '',
  subscriptionType 
}) => {
  // Always use professional yellow/gold for verified tick
  const primaryColor = '#FFD700'; // Gold
  const secondaryColor = '#FFA500'; // Orange accent
  const darkAccent = '#B8860B'; // Dark goldenrod for depth

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Drop shadow for depth */}
      <defs>
        <filter id="verifiedShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3"/>
        </filter>
        <linearGradient id="verifiedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="50%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>
      </defs>
      
      {/* Background circle with gradient */}
      <circle 
        cx="12" 
        cy="12" 
        r="10.5" 
        fill="url(#verifiedGradient)" 
        filter="url(#verifiedShadow)"
      />
      
      {/* Inner circle for depth */}
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        fill="none" 
        stroke={darkAccent}
        strokeWidth="0.5"
        opacity="0.3"
      />
      
      {/* White checkmark */}
      <path
        d="M7 12.5L10.5 16L17 8.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#verifiedShadow)"
      />
      
      {/* Outer white ring */}
      <circle
        cx="12"
        cy="12"
        r="10.5"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
};

// Verified Avatar Wrapper - Wraps an avatar with verified tick
interface VerifiedAvatarWrapperProps {
  children: React.ReactNode;
  isVerified: boolean;
  subscriptionType?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Size mapping for tick position and size
const avatarSizeConfig = {
  xs: { tickSize: 12, position: '-bottom-0.5 -right-0.5' },
  sm: { tickSize: 14, position: '-bottom-0.5 -right-0.5' },
  md: { tickSize: 16, position: '-bottom-1 -right-1' },
  lg: { tickSize: 18, position: '-bottom-1 -right-1' },
  xl: { tickSize: 22, position: '-bottom-1.5 -right-1.5' },
};

export const VerifiedAvatarWrapper: React.FC<VerifiedAvatarWrapperProps> = ({
  children,
  isVerified,
  subscriptionType,
  size = 'md',
  className = '',
}) => {
  const config = avatarSizeConfig[size];

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      {isVerified && (
        <div className={`absolute ${config.position} z-10`}>
          <VerifiedCheckmarkSVG 
            size={config.tickSize} 
            subscriptionType={subscriptionType}
          />
        </div>
      )}
    </div>
  );
};

// Helper function to check if user should have verified badge
export const shouldShowVerifiedBadge = (user: {
  is_premium?: boolean;
  subscription_type?: string | null;
  subscription_status?: string | null;
}): boolean => {
  // Show badge for premium users even if subscription type is missing.
  const hasActiveSubscription = user.subscription_status === 'active';
  const hasValidSubscriptionType = ['lifetime', 'student', 'regular', 'premium'].includes(
    user.subscription_type?.toLowerCase() || ''
  );

  return Boolean(user.is_premium) || (hasActiveSubscription && hasValidSubscriptionType);
};

// Helper function to get verification level text
export const getVerificationLevel = (subscriptionType?: string | null): string => {
  switch (subscriptionType?.toLowerCase()) {
    case 'lifetime':
      return 'Verified Founder';
    case 'student':
      return 'Verified Student';
    case 'regular':
    case 'premium':
      return 'Verified Professional';
    default:
      return 'Verified Member';
  }
};

export default VerifiedBadge;

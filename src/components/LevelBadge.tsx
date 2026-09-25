import React from 'react';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';

interface LevelBadgeProps {
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

// Get badge tier based on level (as per your requirements)
export const getBadgeTier = (level: number): BadgeTier => {
  if (level >= 101) return 'legendary'; // Legendary (beyond max)
  if (level >= 51) return 'gold';       // Gold Badge + VIP (51-100)
  if (level >= 11) return 'silver';     // Silver Badge + Priority (11-50)
  return 'bronze';                      // Bronze Badge (1-10)
};

// Get badge benefits based on tier
export const getBadgeBenefits = (tier: BadgeTier): string[] => {
  switch (tier) {
    case 'legendary':
      return [
        'All VIP tier benefits',
        'Legendary status icon',
        'Platform-wide recognition',
        'Maximum benefits unlocked'
      ];
    case 'gold':
      return [
        'VIP Badge on profile',
        'Exclusive "VIP" Challenges',
        'Lower platform fees on fun',
        'Priority customer support',
        'Special VIP features'
      ];
    case 'silver':
      return [
        'Professional Badge on profile',
        'Priority Matching (faster connections)',
        'Enhanced profile visibility',
        'Access to premium gifts'
      ];
    case 'bronze':
      return [
        'Rising Star Badge on profile',
        'Access to basic gifts',
        'Community member status',
        'Unlock more at Level 11!'
      ];
    default:
      return [];
  }
};

// Get badge display name - Professional naming
export const getBadgeName = (tier: BadgeTier): string => {
  switch (tier) {
    case 'legendary': return 'Legendary';
    case 'gold': return 'VIP';
    case 'silver': return 'Professional';
    case 'bronze': return 'Rising Star';
    default: return 'Member';
  }
};

// Get full badge title with level range
export const getBadgeTitle = (tier: BadgeTier): string => {
  switch (tier) {
    case 'legendary': return 'Legendary Master';
    case 'gold': return 'VIP Member';
    case 'silver': return 'Professional';
    case 'bronze': return 'Rising Star';
    default: return 'Member';
  }
};

// Bronze Badge SVG Component
const BronzeBadgeSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer glow */}
    <circle cx="50" cy="50" r="48" fill="url(#bronzeGlow)" opacity="0.3" />
    
    {/* Badge base */}
    <circle cx="50" cy="50" r="42" fill="url(#bronzeGradient)" stroke="url(#bronzeBorder)" strokeWidth="3" />
    
    {/* Inner circle detail */}
    <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="1.5" />
    
    {/* Star shape in center */}
    <path
      d="M50 20 L54 38 L72 38 L58 48 L62 66 L50 56 L38 66 L42 48 L28 38 L46 38 Z"
      fill="rgba(205, 127, 50, 0.8)"
      stroke="rgba(139, 69, 19, 0.5)"
      strokeWidth="1"
    />
    
    {/* Bronze Level Number */}
    <text x="50" y="57" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#FFF" fontFamily="Arial, sans-serif">
      B
    </text>
    
    {/* Definitions */}
    <defs>
      <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CD7F32" />
        <stop offset="50%" stopColor="#8B4513" />
        <stop offset="100%" stopColor="#CD7F32" />
      </linearGradient>
      <linearGradient id="bronzeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4A574" />
        <stop offset="100%" stopColor="#8B4513" />
      </linearGradient>
      <radialGradient id="bronzeGlow">
        <stop offset="0%" stopColor="#CD7F32" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#CD7F32" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Silver Badge SVG Component
const SilverBadgeSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer glow */}
    <circle cx="50" cy="50" r="48" fill="url(#silverGlow)" opacity="0.4" />
    
    {/* Badge base */}
    <circle cx="50" cy="50" r="42" fill="url(#silverGradient)" stroke="url(#silverBorder)" strokeWidth="3" />
    
    {/* Inner circle detail */}
    <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(169, 169, 169, 0.4)" strokeWidth="1.5" />
    
    {/* Shield shape in center */}
    <path
      d="M50 22 L66 30 L66 48 C66 58 58 68 50 72 C42 68 34 58 34 48 L34 30 Z"
      fill="rgba(211, 211, 211, 0.8)"
      stroke="rgba(169, 169, 169, 0.6)"
      strokeWidth="1.5"
    />
    
    {/* Lightning bolt for priority */}
    <path
      d="M54 35 L46 50 L50 50 L48 60 L56 45 L52 45 Z"
      fill="rgba(255, 215, 0, 0.9)"
      stroke="rgba(255, 215, 0, 0.5)"
      strokeWidth="0.5"
    />
    
    {/* Definitions */}
    <defs>
      <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E8E8E8" />
        <stop offset="50%" stopColor="#A9A9A9" />
        <stop offset="100%" stopColor="#D3D3D3" />
      </linearGradient>
      <linearGradient id="silverBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F5F5" />
        <stop offset="100%" stopColor="#A9A9A9" />
      </linearGradient>
      <radialGradient id="silverGlow">
        <stop offset="0%" stopColor="#C0C0C0" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#C0C0C0" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Gold Badge SVG Component
const GoldBadgeSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer glow */}
    <circle cx="50" cy="50" r="48" fill="url(#goldGlow)" opacity="0.5" />
    
    {/* Badge base with crown shape */}
    <circle cx="50" cy="50" r="42" fill="url(#goldGradient)" stroke="url(#goldBorder)" strokeWidth="3" />
    
    {/* Inner circle detail */}
    <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(218, 165, 32, 0.4)" strokeWidth="2" />
    
    {/* Crown shape for VIP */}
    <path
      d="M32 55 L38 40 L44 48 L50 35 L56 48 L62 40 L68 55 L32 55 Z"
      fill="rgba(255, 215, 0, 0.9)"
      stroke="rgba(184, 134, 11, 0.8)"
      strokeWidth="1.5"
    />
    
    {/* VIP text */}
    <text x="50" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#FFF" fontFamily="Arial, sans-serif">
      VIP
    </text>
    
    {/* Sparkle effects */}
    <circle cx="35" cy="35" r="2" fill="#FFD700" opacity="0.8">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="65" cy="35" r="2" fill="#FFD700" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
    </circle>
    
    {/* Definitions */}
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#DAA520" />
        <stop offset="100%" stopColor="#FFD700" />
      </linearGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF4CC" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <radialGradient id="goldGlow">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Platinum Badge SVG Component (for levels 101+, future-proof)
const PlatinumBadgeSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer glow */}
    <circle cx="50" cy="50" r="48" fill="url(#platinumGlow)" opacity="0.5" />
    
    {/* Badge base */}
    <circle cx="50" cy="50" r="42" fill="url(#platinumGradient)" stroke="url(#platinumBorder)" strokeWidth="3" />
    
    {/* Inner circle detail */}
    <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(229, 228, 226, 0.5)" strokeWidth="2" />
    
    {/* Diamond shape */}
    <path
      d="M50 30 L60 45 L50 65 L40 45 Z"
      fill="rgba(240, 240, 240, 0.9)"
      stroke="rgba(200, 200, 200, 0.8)"
      strokeWidth="1.5"
    />
    
    {/* Star effects */}
    {[0, 72, 144, 216, 288].map((angle, i) => {
      const x = 50 + 25 * Math.cos((angle * Math.PI) / 180);
      const y = 50 + 25 * Math.sin((angle * Math.PI) / 180);
      return (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#E0E0E0">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </circle>
      );
    })}
    
    {/* Definitions */}
    <defs>
      <linearGradient id="platinumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E5E4E2" />
        <stop offset="50%" stopColor="#C0C0C0" />
        <stop offset="100%" stopColor="#E5E4E2" />
      </linearGradient>
      <linearGradient id="platinumBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F5F5" />
        <stop offset="100%" stopColor="#A8A8A8" />
      </linearGradient>
      <radialGradient id="platinumGlow">
        <stop offset="0%" stopColor="#E5E4E2" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#E5E4E2" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Legendary Badge SVG Component
const LegendaryBadgeSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Animated outer glow */}
    <circle cx="50" cy="50" r="48" fill="url(#legendaryGlow)" opacity="0.6">
      <animate attributeName="r" values="46;50;46" dur="3s" repeatCount="indefinite" />
    </circle>
    
    {/* Badge base */}
    <circle cx="50" cy="50" r="42" fill="url(#legendaryGradient)" stroke="url(#legendaryBorder)" strokeWidth="3" />
    
    {/* Inner rotating ring */}
    <circle cx="50" cy="50" r="36" fill="none" stroke="url(#legendaryRing)" strokeWidth="2">
      <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
    </circle>
    
    {/* Pentagram for legendary */}
    <path
      d="M50 25 L56 43 L75 43 L60 54 L66 72 L50 60 L34 72 L40 54 L25 43 L44 43 Z"
      fill="url(#starGradient)"
      stroke="rgba(148, 0, 211, 0.8)"
      strokeWidth="1.5"
    >
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
    </path>
    
    {/* Orbiting particles */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
      const x = 50 + 30 * Math.cos((angle * Math.PI) / 180);
      const y = 50 + 30 * Math.sin((angle * Math.PI) / 180);
      return (
        <circle key={i} cx={x} cy={y} r="2" fill="#FF69B4">
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from={`0 50 50`} 
            to={`360 50 50`} 
            dur="8s" 
            repeatCount="indefinite" 
          />
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      );
    })}
    
    {/* Definitions */}
    <defs>
      <linearGradient id="legendaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9400D3" />
        <stop offset="25%" stopColor="#FF1493" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="75%" stopColor="#FF1493" />
        <stop offset="100%" stopColor="#9400D3" />
      </linearGradient>
      <linearGradient id="legendaryBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FF69B4" />
        <stop offset="100%" stopColor="#9400D3" />
      </linearGradient>
      <linearGradient id="legendaryRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF1493" stopOpacity="0.6" />
        <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#9400D3" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FF69B4" />
        <stop offset="100%" stopColor="#9400D3" />
      </linearGradient>
      <radialGradient id="legendaryGlow">
        <stop offset="0%" stopColor="#FF69B4" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#9400D3" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Size mapping
const sizeMap = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96
};

// Main LevelBadge Component
export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const tier = getBadgeTier(level);
  const badgeName = getBadgeName(tier);
  const iconSize = sizeMap[size];

  const renderBadgeSVG = () => {
    switch (tier) {
      case 'legendary':
        return <LegendaryBadgeSVG size={iconSize} />;
      case 'platinum':
        return <PlatinumBadgeSVG size={iconSize} />;
      case 'gold':
        return <GoldBadgeSVG size={iconSize} />;
      case 'silver':
        return <SilverBadgeSVG size={iconSize} />;
      case 'bronze':
      default:
        return <BronzeBadgeSVG size={iconSize} />;
    }
  };

  const getBadgeColor = () => {
    switch (tier) {
      case 'legendary':
        return 'from-purple-500 via-pink-500 to-purple-500';
      case 'platinum':
        return 'from-gray-300 via-gray-100 to-gray-300';
      case 'gold':
        return 'from-yellow-400 via-amber-500 to-yellow-400';
      case 'silver':
        return 'from-gray-400 via-gray-300 to-gray-400';
      case 'bronze':
      default:
        return 'from-orange-600 via-orange-400 to-orange-600';
    }
  };

  if (!showLabel) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderBadgeSVG()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {renderBadgeSVG()}
      <div className="flex flex-col">
        <span className={`text-xs font-bold bg-gradient-to-r ${getBadgeColor()} bg-clip-text text-transparent`}>
          {badgeName}
        </span>
        <span className="text-[10px] text-gray-400">Level {level}</span>
      </div>
    </div>
  );
};

// Badge Info Card Component (for displaying benefits)
interface BadgeInfoCardProps {
  level: number;
  className?: string;
}

export const BadgeInfoCard: React.FC<BadgeInfoCardProps> = ({ level, className = '' }) => {
  const tier = getBadgeTier(level);
  const badgeName = getBadgeName(tier);
  const benefits = getBadgeBenefits(tier);

  const getCardGradient = () => {
    switch (tier) {
      case 'legendary':
        return 'from-purple-500/20 via-pink-500/20 to-purple-500/20';
      case 'platinum':
        return 'from-gray-400/20 via-gray-300/20 to-gray-400/20';
      case 'gold':
        return 'from-yellow-500/20 via-amber-500/20 to-yellow-500/20';
      case 'silver':
        return 'from-gray-500/20 via-gray-400/20 to-gray-500/20';
      case 'bronze':
      default:
        return 'from-orange-600/20 via-orange-500/20 to-orange-600/20';
    }
  };

  const getBorderColor = () => {
    switch (tier) {
      case 'legendary':
        return 'border-purple-500/40';
      case 'platinum':
        return 'border-gray-300/40';
      case 'gold':
        return 'border-yellow-500/40';
      case 'silver':
        return 'border-gray-400/40';
      case 'bronze':
      default:
        return 'border-orange-500/40';
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getCardGradient()} border ${getBorderColor()} rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <LevelBadge level={level} size="lg" />
        <div>
          <h3 className="font-bold text-white text-lg">{badgeName}</h3>
          <p className="text-xs text-gray-300">Level {level}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Benefits:</p>
        <ul className="space-y-1.5">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-gray-200">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LevelBadge;

import React from 'react';
import { LevelBadge, getBadgeTier } from '@/components/LevelBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@/lib/router-compat';
import { TrendingUp, Crown, Zap, Award, ArrowRight } from 'lucide-react';

interface LevelSystemShowcaseProps {
  userLevel?: number;
  className?: string;
}

export const LevelSystemShowcase: React.FC<LevelSystemShowcaseProps> = ({ 
  userLevel = 1, 
  className = '' 
}) => {
  const navigate = useNavigate();
  const currentTier = getBadgeTier(userLevel);

  const tiers = [
    {
      level: 5,
      name: 'Bronze',
      range: '1-10',
      feature: 'Basic Access',
      icon: <Award className="w-5 h-5" />
    },
    {
      level: 25,
      name: 'Silver',
      range: '11-50',
      feature: 'Priority Matching',
      icon: <Zap className="w-5 h-5 text-yellow-400" />
    },
    {
      level: 75,
      name: 'Gold VIP',
      range: '51-100',
      feature: 'Exclusive Features',
      icon: <Crown className="w-5 h-5 text-yellow-400" />
    }
  ];

  return (
    <Card className={`bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-xl border-purple-500/30 p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Level Up & Unlock Benefits
          </h3>
        </div>
        <p className="text-sm text-gray-400">
          Spend Yuyu to gain XP, unlock exclusive badges & premium features
        </p>
      </div>

      {/* Badge Showcase */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tiers.map((tier) => {
          const isUnlocked = userLevel >= parseInt(tier.range.split('-')[0]);
          const isCurrent = currentTier === tier.name.toLowerCase().replace(' vip', '');
          
          return (
            <div
              key={tier.name}
              className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400/50 shadow-lg shadow-purple-500/20'
                  : isUnlocked
                  ? 'bg-white/5 border border-white/10 hover:border-white/20'
                  : 'bg-white/5 border border-white/5 opacity-50'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    YOU
                  </div>
                </div>
              )}
              
              {/* Badge */}
              <div className={`mb-2 ${!isUnlocked && 'grayscale opacity-40'}`}>
                <LevelBadge level={tier.level} size="md" />
              </div>
              
              {/* Info */}
              <div className="text-center">
                <p className="text-xs font-bold text-white mb-1">{tier.name}</p>
                <p className="text-[10px] text-gray-400 mb-2">Lv {tier.range}</p>
                
                {/* Feature Badge */}
                <div className={`flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded-full ${
                  isUnlocked
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {tier.icon}
                  <span>{tier.feature}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* XP Info */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="text-gray-400 mb-1">Earn XP By:</p>
            <p className="text-white font-semibold">💰 1 Yuyu = 1 XP</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 mb-1">Level Up Every:</p>
            <p className="text-white font-semibold">100 XP</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={() => navigate('/level-system')}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3"
      >
        <span>Explore Level System</span>
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-xl font-bold text-purple-400">{userLevel}</p>
          <p className="text-[10px] text-gray-400">Your Level</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-xl font-bold text-pink-400">{100 - userLevel}</p>
          <p className="text-[10px] text-gray-400">To Max</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-xl font-bold text-yellow-400">
            {currentTier === 'gold' ? '🥇' : currentTier === 'silver' ? '🥈' : '🥉'}
          </p>
          <p className="text-[10px] text-gray-400 capitalize">{currentTier}</p>
        </div>
      </div>
    </Card>
  );
};

export default LevelSystemShowcase;

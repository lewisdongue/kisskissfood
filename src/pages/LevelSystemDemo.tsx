import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LevelBadge, BadgeInfoCard, getBadgeTier, getBadgeName, getBadgeBenefits } from '@/components/LevelBadge';
import { LevelProgressBar } from '@/components/LevelProgressBar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, TrendingUp, Award, Users, Zap, Crown, Shield, Star } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';

const LevelSystemDemo: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [demoLevel, setDemoLevel] = useState(1);
  const [demoXP, setDemoXP] = useState(0);

  // Calculate XP from level
  const calculateXP = (level: number) => {
    return (level - 1) * 100;
  };

  const handleLevelChange = (value: number[]) => {
    const newLevel = value[0];
    setDemoLevel(newLevel);
    setDemoXP(calculateXP(newLevel));
  };

  const tier = getBadgeTier(demoLevel);
  const allBadgeTiers: Array<{ tier: 'bronze' | 'silver' | 'gold'; levelRange: string; level: number }> = [
    { tier: 'bronze', levelRange: '1-10', level: 5 },
    { tier: 'silver', levelRange: '11-50', level: 25 },
    { tier: 'gold', levelRange: '51-100', level: 75 },
  ];

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen w-full overflow-x-hidden relative z-10 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              {t('levelSystem.title')}
            </h1>
            <Award className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            {t('levelSystem.subtitle')}
          </p>

        </div>

        {/* XP Earning System */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold">{t('levelSystem.howToEarnXP')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg p-4">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold mb-2">{t('levelSystem.spendYuyu')}</h3>
              <p className="text-sm text-gray-300">{t('levelSystem.spendYuyuDesc')}</p>
              <p className="text-xs text-gray-400 mt-2">{t('levelSystem.spendYuyuDetail')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4">
              <div className="text-3xl mb-2">⏱️</div>
              <h3 className="font-bold mb-2">{t('levelSystem.activeTime')}</h3>
              <p className="text-sm text-gray-300">{t('levelSystem.activeTimeDesc')}</p>
              <p className="text-xs text-gray-400 mt-2">{t('levelSystem.activeTimeDetail')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg p-4">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-bold mb-2">{t('levelSystem.completeChallenges')}</h3>
              <p className="text-sm text-gray-300">{t('levelSystem.completeChallengesDesc')}</p>
              <p className="text-xs text-gray-400 mt-2">{t('levelSystem.completeChallengesDetail')}</p>
            </div>
          </div>
        </Card>

        {/* Interactive Level Tester */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            {t('levelSystem.interactiveDemo')}
          </h2>
          
          <div className="space-y-6">
            {/* Level Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-300">{t('levelSystem.selectLevel', { level: demoLevel })}</label>
                <Badge className="bg-purple-500/30 text-purple-200 border border-purple-400/50">
                  {demoXP.toLocaleString()} XP
                </Badge>
              </div>
              <Slider
                value={[demoLevel]}
                onValueChange={handleLevelChange}
                min={1}
                max={100}
                step={1}
                className="mb-4"
              />
            </div>

            {/* Live Badge Preview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Badge Display */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">{t('levelSystem.yourBadge')}</h3>
                <LevelBadge level={demoLevel} size="xl" />
                <div className="mt-4 text-center">
                  <p className="text-lg font-bold">{getBadgeName(tier)}</p>
                  <p className="text-sm text-gray-400">{t('common.level')} {demoLevel}</p>
                </div>
              </div>

              {/* Benefits Card */}
              <BadgeInfoCard level={demoLevel} />
            </div>
          </div>
        </Card>

        {/* Badge Tiers Overview */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            {t('levelSystem.badgeTiers')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {allBadgeTiers.map(({ tier, levelRange, level }) => (
              <BadgeInfoCard key={tier} level={level} />
            ))}
          </div>
        </Card>

        {/* Detailed Benefits Breakdown */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            {t('levelSystem.benefitsByTier')}
          </h2>

          <div className="space-y-6">
            {/* Rising Star Tier (formerly Bronze) */}
            <div className="border-l-4 border-orange-500 pl-4">
              <div className="flex items-center gap-3 mb-3">
                <LevelBadge level={5} size="sm" />
                <div>
                  <h3 className="font-bold text-lg">{t('levelSystem.risingStar')}</h3>
                  <p className="text-xs text-gray-400">{t('levelSystem.risingStarDesc')}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitRisingStarBadge" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitBasicGifts" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitCommunityMember" components={{ bold: <strong /> }} /></span>
                </li>
              </ul>
            </div>

            {/* Professional Tier (formerly Silver) */}
            <div className="border-l-4 border-gray-400 pl-4">
              <div className="flex items-center gap-3 mb-3">
                <LevelBadge level={25} size="sm" />
                <div>
                  <h3 className="font-bold text-lg">{t('levelSystem.professional')}</h3>
                  <p className="text-xs text-gray-400">{t('levelSystem.professionalDesc')}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitProfessionalBadge" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitPriorityMatching" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitEnhancedVisibility" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitPremiumGifts" components={{ bold: <strong /> }} /></span>
                </li>
              </ul>
            </div>

            {/* VIP Tier (formerly Gold) */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <div className="flex items-center gap-3 mb-3">
                <LevelBadge level={75} size="sm" />
                <div>
                  <h3 className="font-bold text-lg">{t('levelSystem.vip')}</h3>
                  <p className="text-xs text-gray-400">{t('levelSystem.vipDesc')}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitGoldVipBadge" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitVipChallenges" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitLowerFees" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitPrioritySupport" components={{ bold: <strong /> }} /></span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                  <span><Trans i18nKey="levelSystem.benefitSpecialVip" components={{ bold: <strong /> }} /></span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* XP Calculation Guide */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
          <h2 className="text-2xl font-bold mb-6">{t('levelSystem.xpFormula')}</h2>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-lg p-4">
              <h3 className="font-bold mb-2">{t('levelSystem.levelCalculation')}</h3>
              <code className="text-sm bg-black/30 px-3 py-2 rounded block">
                {t('levelSystem.levelFormula')}
              </code>
              <p className="text-xs text-gray-400 mt-2">{t('levelSystem.xpPerLevel')}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4">
              <h3 className="font-bold mb-2">{t('levelSystem.xpSources')}</h3>
              <ul className="text-sm space-y-1 text-gray-300">
                <li><Trans i18nKey="levelSystem.xpSourceSpending" components={{ bold: <strong /> }} /></li>
                <li><Trans i18nKey="levelSystem.xpSourceActiveTime" components={{ bold: <strong /> }} /></li>
                <li><Trans i18nKey="levelSystem.xpSourceChallenges" components={{ bold: <strong /> }} /></li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4">
              <h3 className="font-bold mb-2">{t('levelSystem.examples')}</h3>
              <ul className="text-sm space-y-2 text-gray-300">
                <li><Trans i18nKey="levelSystem.exampleLevel1" components={{ bold: <strong /> }} /></li>
                <li><Trans i18nKey="levelSystem.exampleLevel10" components={{ bold: <strong /> }} /></li>
                <li><Trans i18nKey="levelSystem.exampleLevel11" components={{ bold: <strong /> }} /></li>
                <li><Trans i18nKey="levelSystem.exampleLevel50" components={{ bold: <strong /> }} /></li>
                <li><Trans i18nKey="levelSystem.exampleLevel51" components={{ bold: <strong /> }} /></li>
                <li><Trans i18nKey="levelSystem.exampleLevel100" components={{ bold: <strong /> }} /></li>
              </ul>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12 mb-8">
          <div className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 border-2 border-purple-400/50 rounded-xl p-8">
            <h2 className="text-3xl font-black mb-4">{t('levelSystem.startLevelingUp')}</h2>
            <p className="text-gray-300 mb-6">{t('levelSystem.startLevelingUpDesc')}</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-3 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t('common.getStarted')}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LevelSystemDemo;

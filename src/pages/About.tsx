// SEO Meta Tags for Search Engines
// Keywords: earn cryptocurrency, video chat platform, anonymous social network, make money online, 
// voice chat app, crypto rewards, blockchain social media, Yuyu, decentralized social platform,
// earn money chatting, free video calls, instant messaging crypto, web3 social network,
// peer-to-peer video chat, anonymous voice calls, cryptocurrency earnings, social finance platform,
// earn while socializing, crypto social app, blockchain rewards, decentralized chat

import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Link, useNavigate } from '@/lib/router-compat';
import { 
  ArrowLeft, 
  Heart, 
  Globe, 
  Shield, 
  Zap, 
  Sparkles,
  Video,
  Mic,
  Users,
  TrendingUp,
  Coins,
  Lock,
  Star,
  Award,
  Target,
  MessageCircle,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Waves,
  Building2,
  Crown,
  Flame
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ABOUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'mission' | 'features' | 'story'>('mission');

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-3">
            <Link
              to="/"
              className="rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 hover:bg-white/10 transition-all duration-200 group"
              aria-label={t('about.returnHome')}
            >
              <ArrowLeft className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 bg-white/0 overflow-hidden">
                <img src="/logo.webp" alt={t('common.logoAlt')} className="w-8 h-8 object-contain" />
              </div>
            </div>
            <div className="ml-1">
              <h2 className="text-lg font-black bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                Caakus
              </h2>
              <p className="text-xs text-blue-200/70 font-medium">{t('about.aboutUs')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">{t('about.futureOfConnection')}</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            {t('about.aboutCaakus')}
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
            {t('about.heroDesc')}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                {t('about.heroStats.usersValue')}
              </div>
              <div className="text-blue-200/70 font-semibold text-sm">{t('about.activeUsers')}</div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                {t('about.heroStats.countriesValue')}
              </div>
              <div className="text-blue-200/70 font-semibold text-sm">{t('about.countriesStat')}</div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                {t('about.heroStats.paidValue')}
              </div>
              <div className="text-blue-200/70 font-semibold text-sm">{t('about.paidToUsers')}</div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
                {t('about.heroStats.speedValue')}
              </div>
              <div className="text-blue-200/70 font-semibold text-sm">{t('about.matchSpeed')}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'mission'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-blue-200 hover:bg-white/10'
            }`}
          >
            {t('about.mission.title')}
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'features'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-blue-200 hover:bg-white/10'
            }`}
          >
            {t('about.keyFeatures')}
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'story'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-blue-200 hover:bg-white/10'
            }`}
          >
            {t('about.ourStory')}
          </button>
        </div>

        {/* Mission Tab Content */}
        {activeTab === 'mission' && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Primary Mission */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-2xl">
                  <Heart className="w-8 h-8 text-white" fill="currentColor" />
                </div>
                <h2 className="text-3xl font-black text-white">{t('about.mission.title')}</h2>
              </div>
              
              <p className="text-lg text-blue-100/90 leading-relaxed mb-6">
                {t('about.mission.body1')}
              </p>
              
              <p className="text-lg text-blue-100/90 leading-relaxed">
                {t('about.mission.body2')}
              </p>
            </div>

            {/* Core Values */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Value 1: Authenticity */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('about.values.authenticity.title')}</h3>
                <p className="text-blue-200/80 leading-relaxed">
                  {t('about.values.authenticity.body')}
                </p>
              </div>

              {/* Value 2: Privacy */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('about.values.privacy.title')}</h3>
                <p className="text-blue-200/80 leading-relaxed">
                  {t('about.values.privacy.body')}
                </p>
              </div>

              {/* Value 3: Fairness */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 hover:border-green-500/40 transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('about.values.fairness.title')}</h3>
                <p className="text-blue-200/80 leading-relaxed">
                  {t('about.values.fairness.body')}
                </p>
              </div>
            </div>

            {/* Vision Statement */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-10 border border-white/10">
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Target className="w-8 h-8 text-yellow-400" />
                {t('about.vision.title')}
              </h3>
              <p className="text-lg text-blue-100/90 leading-relaxed">
                {t('about.vision.body')}
              </p>
            </div>
          </div>
        )}

        {/* Features Tab Content */}
        {activeTab === 'features' && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Feature 1: HD Video & Voice */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('about.features.hdVideo.title')}</h3>
                    <p className="text-blue-200/80 leading-relaxed">
                      {t('about.features.hdVideo.body')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2: Instant Matching */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('about.features.matching.title')}</h3>
                    <p className="text-blue-200/80 leading-relaxed">
                      {t('about.features.matching.body')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3: Cryptocurrency Earnings */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 hover:border-green-500/40 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('about.features.crypto.title')}</h3>
                    <p className="text-blue-200/80 leading-relaxed">
                      {t('about.features.crypto.body')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4: Complete Anonymity */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('about.features.anonymousFull.title')}</h3>
                    <p className="text-blue-200/80 leading-relaxed">
                      {t('about.features.anonymousFull.body')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 5: Global Reach */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 backdrop-blur-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('about.features.globalReach.title')}</h3>
                    <p className="text-blue-200/80 leading-relaxed">
                      {t('about.features.globalReach.body')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 6: Virtual Gifts */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 backdrop-blur-xl border border-pink-500/20 hover:border-pink-500/40 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('about.features.gifts.title')}</h3>
                    <p className="text-blue-200/80 leading-relaxed">
                      {t('about.features.gifts.body')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Excellence */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-10 border border-white/10">
              <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-cyan-400" />
                {t('about.tech.title')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    {t('about.tech.infrastructure')}
                  </h4>
                  <ul className="space-y-2 text-blue-200/80">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                      <span>{t('about.tech.infra1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                      <span>{t('about.tech.infra2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                      <span>{t('about.tech.infra3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                      <span>{t('about.tech.infra4')}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    {t('about.tech.security')}
                  </h4>
                  <ul className="space-y-2 text-blue-200/80">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                      <span>{t('about.tech.sec1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                      <span>{t('about.tech.sec2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                      <span>{t('about.tech.sec3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                      <span>{t('about.tech.sec4')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story Tab Content */}
        {activeTab === 'story' && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Origin Story */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-10 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6">{t('about.story.beginningTitle')}</h2>
              
              <div className="space-y-6 text-lg text-blue-100/90 leading-relaxed">
                <p>
                  {t('about.story.p1')}
                </p>
                
                <p>
                  {t('about.story.p2')}
                </p>
                
                <p>
                  {t('about.story.p3')}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">{t('about.story.journey')}</h3>
              
              {/* Timeline Item 1 */}
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20">
                  <div className="text-sm text-blue-400 font-bold mb-2">{t('about.story.timeline1.date')}</div>
                  <h4 className="text-xl font-bold text-white mb-2">{t('about.story.timeline1.title')}</h4>
                  <p className="text-blue-200/80">
                    {t('about.story.timeline1.desc')}
                  </p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20">
                  <div className="text-sm text-purple-400 font-bold mb-2">{t('about.story.timeline2.date')}</div>
                  <h4 className="text-xl font-bold text-white mb-2">{t('about.story.timeline2.title')}</h4>
                  <p className="text-blue-200/80">
                    {t('about.story.timeline2.desc')}
                  </p>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20">
                  <div className="text-sm text-green-400 font-bold mb-2">{t('about.story.timeline3.date')}</div>
                  <h4 className="text-xl font-bold text-white mb-2">{t('about.story.timeline3.title')}</h4>
                  <p className="text-blue-200/80">
                    {t('about.story.timeline3.desc')}
                  </p>
                </div>
              </div>

              {/* Timeline Item 4 */}
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20">
                  <div className="text-sm text-yellow-400 font-bold mb-2">{t('about.story.timeline4.date')}</div>
                  <h4 className="text-xl font-bold text-white mb-2">{t('about.story.timeline4.title')}</h4>
                  <p className="text-blue-200/80">
                    {t('about.story.timeline4.desc')}
                  </p>
                </div>
              </div>

              {/* Timeline Item 5 - Future */}
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 backdrop-blur-xl border border-indigo-500/20">
                  <div className="text-sm text-indigo-400 font-bold mb-2">{t('about.story.timeline5.date')}</div>
                  <h4 className="text-xl font-bold text-white mb-2">{t('about.story.timeline5.title')}</h4>
                  <p className="text-blue-200/80">
                    {t('about.story.timeline5.desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Philosophy */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-10 border border-white/10">
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                {t('about.story.philosophyTitle')}
              </h3>
              <p className="text-lg text-blue-100/90 leading-relaxed mb-4">
                {t('about.story.philosophyIntro')}
              </p>
              <ul className="space-y-3 text-lg text-blue-100/90">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span>{t('about.story.philosophyPoint1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span>{t('about.story.philosophyPoint2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span>{t('about.story.philosophyPoint3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span>{t('about.story.philosophyPoint4')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span>{t('about.story.philosophyPoint5')}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 space-y-6">
          <h2 className="text-4xl font-black text-white text-center mb-12">{t('about.faq.title')}</h2>
          
          {/* FAQ Item 1 */}
          <details className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('about.faq.q1')}</h3>
              <ArrowRight className="w-6 h-6 text-blue-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 text-blue-200/80 leading-relaxed space-y-2">
              <p>
                {t('about.faq.a1p1')}
              </p>
              <p>
                {t('about.faq.a1p2')}
              </p>
            </div>
          </details>

          {/* FAQ Item 2 */}
          <details className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('about.faq.q2')}</h3>
              <ArrowRight className="w-6 h-6 text-purple-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 text-blue-200/80 leading-relaxed space-y-2">
              <p>{t('about.faq.a2Intro')}</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('about.faq.a2GiftsLabel')}</strong> {t('about.faq.a2GiftsDesc')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('about.faq.a2ChallengesLabel')}</strong> {t('about.faq.a2ChallengesDesc')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('about.faq.a2AchievementsLabel')}</strong> {t('about.faq.a2AchievementsDesc')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('about.faq.a2ReferralLabel')}</strong> {t('about.faq.a2ReferralDesc')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('about.faq.a2StreaksLabel')}</strong> {t('about.faq.a2StreaksDesc')}</span>
                </li>
              </ul>
            </div>
          </details>

          {/* FAQ Item 3 */}
          <details className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-green-500/30 transition-all">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('about.faq.q3')}</h3>
              <ArrowRight className="w-6 h-6 text-green-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 text-blue-200/80 leading-relaxed">
              <p>
                {t('about.faq.a3')}
              </p>
            </div>
          </details>

          {/* FAQ Item 4 */}
          <details className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-yellow-500/30 transition-all">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('about.faq.q4')}</h3>
              <ArrowRight className="w-6 h-6 text-yellow-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 text-blue-200/80 leading-relaxed space-y-2">
              <p>
                {t('about.faq.a4p1')}
              </p>
              <p>
                {t('about.faq.a4p2')}
              </p>
            </div>
          </details>

          {/* FAQ Item 5 */}
          <details className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 transition-all">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('about.faq.q5')}</h3>
              <ArrowRight className="w-6 h-6 text-indigo-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 text-blue-200/80 leading-relaxed">
              <p>
                {t('about.faq.a5')}
              </p>
            </div>
          </details>

          {/* FAQ Item 6 */}
          <details className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-pink-500/30 transition-all">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('about.faq.q6')}</h3>
              <ArrowRight className="w-6 h-6 text-pink-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 text-blue-200/80 leading-relaxed space-y-2">
              <p>{t('about.faq.a6Intro')}</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{t('about.faq.a6Item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{t('about.faq.a6Item2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{t('about.faq.a6Item3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{t('about.faq.a6Item4')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{t('about.faq.a6Item5')}</span>
                </li>
              </ul>
            </div>
          </details>

          {/* FAQ Item 7 */}
          <details className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('about.faq.q7')}</h3>
              <ArrowRight className="w-6 h-6 text-cyan-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 text-blue-200/80 leading-relaxed">
              <p>
                {t('about.faq.a7')}
              </p>
            </div>
          </details>

          {/* FAQ Item 8 */}
          <details className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-rose-500/30 transition-all">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('about.faq.q8')}</h3>
              <ArrowRight className="w-6 h-6 text-rose-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 text-blue-200/80 leading-relaxed">
              <p>
                {t('about.faq.a8')}
              </p>
            </div>
          </details>
        </div>

        {/* Statistics Section */}
        <div className="mt-16 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-10 border border-white/10">
          <h2 className="text-3xl font-black text-white text-center mb-12">{t('about.stats.title')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                {t('about.stats.totalPaidValue')}
              </div>
              <div className="text-blue-200/70 font-semibold">{t('about.stats.totalPaidLabel')}</div>
              <p className="text-sm text-blue-200/60 mt-2">{t('about.stats.totalPaidDesc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                {t('about.stats.conversationsValue')}
              </div>
              <div className="text-blue-200/70 font-semibold">{t('about.stats.conversationsLabel')}</div>
              <p className="text-sm text-blue-200/60 mt-2">{t('about.stats.conversationsDesc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                {t('about.stats.countriesValue')}
              </div>
              <div className="text-blue-200/70 font-semibold">{t('about.stats.countriesLabel')}</div>
              <p className="text-sm text-blue-200/60 mt-2">{t('about.stats.countriesDesc')}</p>
            </div>
          </div>
        </div>

        {/* User Testimonials */}
        <div className="mt-16 space-y-8">
          <h2 className="text-4xl font-black text-white text-center mb-12">{t('about.testimonials.title')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-blue-200/90 leading-relaxed mb-6 italic">
                &ldquo;{t('about.testimonials.t1.quote')}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                  {t('about.testimonials.t1.name').charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold">{t('about.testimonials.t1.name')}</div>
                  <div className="text-blue-200/60 text-sm">{t('about.testimonials.t1.location')}</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-blue-200/90 leading-relaxed mb-6 italic">
                &ldquo;{t('about.testimonials.t2.quote')}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                  {t('about.testimonials.t2.name').charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold">{t('about.testimonials.t2.name')}</div>
                  <div className="text-blue-200/60 text-sm">{t('about.testimonials.t2.location')}</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-blue-200/90 leading-relaxed mb-6 italic">
                &ldquo;{t('about.testimonials.t3.quote')}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {t('about.testimonials.t3.name').charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold">{t('about.testimonials.t3.name')}</div>
                  <div className="text-blue-200/60 text-sm">{t('about.testimonials.t3.location')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-10 rounded-3xl text-center bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-4">{t('about.cta.revolution')}</h2>
            <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
              {t('about.cta.revolutionDesc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('about.cta.startChatting')}
              </Button>
              
              <Button
                size="lg"
                onClick={() => navigate('/about-founder')}
                className="bg-white/10 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                {t('about.cta.meetFounder')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white font-semibold">{t('about.trust.secure')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white font-semibold">{t('about.trust.encrypted')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white font-semibold">{t('about.trust.noSignup')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white font-semibold">{t('about.trust.earnCrypto')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

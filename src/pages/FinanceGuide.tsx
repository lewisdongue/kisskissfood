import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Award, ChevronRight, Zap, Users, ArrowLeft, Home, Coins, Target, Clock, Shield, Star, Check, BarChart3, Wallet, Gift, Trophy, Repeat, Bitcoin, CreditCard, Sparkles, TrendingDown, Lock } from 'lucide-react';
import { ParticleBackground } from "@/components/ParticleBackground";
import { Helmet } from "@/lib/helmet";

interface EarningTier {
  name: string;
  hoursPerDay: string;
  callsPerDay: string;
  monthlyEarnings: string;
  yuyuCoins: string;
  level: string;
  color: string;
}

interface EarningMethod {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  earnings: string;
  description: string;
  gradient: string;
}

interface GiftTier {
  name: string;
  price: string;
  earnedByReceiver: string;
  popularity: string;
  color: string;
}

interface BetStrategy {
  title: string;
  stakes: string;
  winRate: string;
  monthlyPotential: string;
  riskLevel: string;
}

const FinanceGuide: React.FC = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 50);
      const sections = document.querySelectorAll<HTMLElement>('section[id]');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection(section.id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
  }, []);

  const earningTiers: EarningTier[] = [
    { name: "Casual User", hoursPerDay: "1-2h", callsPerDay: "10-20", monthlyEarnings: "$100-300", yuyuCoins: "5,000-15,000", level: "Starter", color: "from-green-400 to-emerald-600" },
    { name: "Active Member", hoursPerDay: "2-4h", callsPerDay: "20-40", monthlyEarnings: "$300-800", yuyuCoins: "15,000-40,000", level: "Regular", color: "from-blue-400 to-indigo-600" },
    { name: "Power User", hoursPerDay: "4-6h", callsPerDay: "40-80", monthlyEarnings: "$800-2,000", yuyuCoins: "40,000-100,000", level: "Premium", color: "from-purple-400 to-pink-600" },
    { name: "Pro Earner", hoursPerDay: "6-8h", callsPerDay: "80-120", monthlyEarnings: "$2,000-5,000", yuyuCoins: "100,000-250,000", level: "Elite", color: "from-orange-400 to-red-600" },
  ];

  const earningMethods: EarningMethod[] = [
    { icon: Users, title: "Video Calls", earnings: "$0.50-2/call", description: "Earn YUYU coins for every video conversation", gradient: "from-purple-500 to-pink-500" },
    { icon: Gift, title: "Receiving Gifts", earnings: "$1-50/gift", description: "Get virtual gifts from other users during calls", gradient: "from-blue-500 to-indigo-500" },
    { icon: Trophy, title: "Winning Fun", earnings: "$5-500/fun", description: "Challenge others and win YUYU coins", gradient: "from-orange-500 to-red-500" },
    { icon: Target, title: "Daily Challenges", earnings: "$2-20/day", description: "Complete daily tasks for bonus rewards", gradient: "from-green-500 to-emerald-500" },
    { icon: Users, title: "Referrals", earnings: "$10-100/friend", description: "Invite friends and earn from their activity", gradient: "from-cyan-500 to-blue-500" },
    { icon: Star, title: "Premium Bonus", earnings: "+50% earnings", description: "Premium members earn 50% more on everything", gradient: "from-yellow-500 to-amber-500" },
  ];

  const giftTiers: GiftTier[] = [
    { name: "Rose", price: "$1", earnedByReceiver: "$0.40", popularity: "Most Common", color: "from-pink-400 to-rose-500" },
    { name: "Diamond", price: "$5", earnedByReceiver: "$2.00", popularity: "Popular", color: "from-blue-400 to-cyan-500" },
    { name: "Crown", price: "$10", earnedByReceiver: "$4.00", popularity: "Premium", color: "from-yellow-400 to-amber-500" },
    { name: "Luxury Car", price: "$50", earnedByReceiver: "$20.00", popularity: "Exclusive", color: "from-purple-400 to-pink-500" },
  ];

  const betStrategies: BetStrategy[] = [
    { title: "Low Stakes Daily", stakes: "$5-10/fun", winRate: "60-70%", monthlyPotential: "$200-500", riskLevel: "Low" },
    { title: "Medium Challenges", stakes: "$20-50/fun", winRate: "55-65%", monthlyPotential: "$500-1,500", riskLevel: "Medium" },
    { title: "High Roller", stakes: "$100-500/fun", winRate: "50-60%", monthlyPotential: "$2,000-5,000", riskLevel: "High" },
  ];

  return (
    <>
      <Helmet>
        <meta name="description" content="Proven strategies to earn money on Caakus: video calls, virtual gifts ($0.40–$20 each), skill-based fun ($5–$500/fun), YUYU crypto & referral income. Real data from 1M+ users." />
        <meta name="keywords" content="earn money online 2026, caakus income guide, make money video chat, yuyu earnings, cryptocurrency earnings, virtual gifts income, video chat fun, passive income online, earn while chatting, social media earnings, online side hustle, crypto rewards platform" />
        <link rel="canonical" href="https://www.caakus.com/guides/earning-guide" />
        <meta property="og:title" content="How to Earn $100–$5,000/Month on Caakus – 2026 Guide" />
        <meta property="og:description" content="Turn video conversations into real income. Earn through gifts, fun, YUYU crypto & referrals. 1M+ users already earning on Caakus." />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Caakus" />
        <meta property="og:url" content="https://www.caakus.com/guides/earning-guide" />
        <meta property="og:image" content="https://www.caakus.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Caakus Earning Guide – How to Make Money Video Chatting" />
        <meta property="article:published_time" content="2026-02-20T00:00:00+00:00" />
        <meta property="article:modified_time" content="2026-03-02T00:00:00+00:00" />
        <meta property="article:author" content="https://www.caakus.com/about-founder" />
        <meta property="article:section" content="Earning Guide" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@caakus_official" />
        <meta name="twitter:title" content="How to Earn $100–$5,000/Month on Caakus – 2026 Guide" />
        <meta name="twitter:description" content="Maximize earnings through video chat, gifts, fun & YUYU crypto. Real strategies from 1M+ Caakus users." />
        <meta name="twitter:image" content="https://www.caakus.com/og-image.jpg" />
        <meta name="author" content="Bryan Lewis Dongue Ndiffo" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": "https://www.caakus.com/guides/earning-guide#article",
              "headline": "How to Earn $100–$5,000/Month on Caakus: Complete 2026 Income Guide",
              "description": "Proven strategies to earn money on Caakus through video calls, virtual gifts, skill-based fun, YUYU cryptocurrency rewards, and passive referral income.",
              "url": "https://www.caakus.com/guides/earning-guide",
              "datePublished": "2026-02-20T00:00:00+00:00",
              "dateModified": "2026-03-02T00:00:00+00:00",
              "author": {
                "@type": "Person",
                "name": "Bryan Lewis Dongue Ndiffo",
                "url": "https://www.caakus.com/about-founder"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Caakus",
                "url": "https://www.caakus.com/",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.caakus.com/logo.webp",
                  "width": 512,
                  "height": 512
                }
              },
              "image": "https://www.caakus.com/og-image.jpg",
              "isPartOf": { "@id": "https://www.caakus.com/#website" }
            },
            {
              "@type": "HowTo",
              "@id": "https://www.caakus.com/guides/earning-guide#howto",
              "name": "How to Earn Money on Caakus",
              "description": "Step-by-step guide to earning $100–$5,000/month on Caakus through video chat, gifts, challenges, and YUYU cryptocurrency.",
              "totalTime": "PT30M",
              "supply": [
                { "@type": "HowToSupply", "name": "Caakus account (free)" },
                { "@type": "HowToSupply", "name": "Webcam or smartphone" },
                { "@type": "HowToSupply", "name": "Internet connection" }
              ],
              "step": [
                {
                  "@type": "HowToStep",
                  "position": 1,
                  "name": "Create a free Caakus account",
                  "text": "Sign up at caakus.com with your email. Verification takes under 2 minutes.",
                  "url": "https://www.caakus.com/"
                },
                {
                  "@type": "HowToStep",
                  "position": 2,
                  "name": "Start video chatting and earn YUYU coins",
                  "text": "Every video call earns you YUYU cryptocurrency. Casual users earn $100–$300/month just from calls.",
                  "url": "https://www.caakus.com/guides/earning-guide#video-calls"
                },
                {
                  "@type": "HowToStep",
                  "position": 3,
                  "name": "Receive virtual gifts during calls",
                  "text": "Other users can send you gifts worth $1–$50. You keep 40% commission on every gift received.",
                  "url": "https://www.caakus.com/guides/earning-guide#gifts"
                },
                {
                  "@type": "HowToStep",
                  "position": 4,
                  "name": "Win skill-based challenges",
                  "text": "Participate in trivia, talent shows, and speed games. Stakes range from $5–$500 per challenge.",
                  "url": "https://www.caakus.com/guides/earning-guide#challenges"
                },
                {
                  "@type": "HowToStep",
                  "position": 5,
                  "name": "Refer friends for passive income",
                  "text": "Earn $10–$100 per referred friend plus lifetime commissions on their activity.",
                  "url": "https://www.caakus.com/guides/earning-guide#referrals"
                },
                {
                  "@type": "HowToStep",
                  "position": 6,
                  "name": "Withdraw your earnings",
                  "text": "Withdraw via PayPal, bank transfer, or crypto wallet. Minimum $10. Payments processed within 24-48 hours.",
                  "url": "https://www.caakus.com/guides/earning-guide#withdrawal"
                }
              ]
            },
            {
              "@type": "WebPage",
              "@id": "https://www.caakus.com/guides/earning-guide#webpage",
              "url": "https://www.caakus.com/guides/earning-guide",
              "name": "How to Earn $100–$5,000/Month on Caakus – Complete 2026 Income Guide",
              "isPartOf": { "@id": "https://www.caakus.com/#website" },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.caakus.com/" },
                  { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://www.caakus.com/guides/" },
                  { "@type": "ListItem", "position": 3, "name": "Earning Guide", "item": "https://www.caakus.com/guides/earning-guide" }
                ]
              }
            }
          ]
        })}</script>
      </Helmet>

      <ParticleBackground />

      <div className="min-h-screen w-full overflow-x-hidden relative z-10 font-sans text-white antialiased">
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#020617]/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/10' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link to="/" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors group" aria-label="Back to home">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <Home className="w-4 h-4" />
                </Link>
                <div className="w-px h-5 bg-white/20" />
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
                    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src="/logo.webp" alt="Caakus Logo" className="w-6 h-6 object-contain" />
                    </div>
                  </div>
                  <span className="font-black text-xl sm:text-2xl tracking-tighter text-white">CAAKUS</span>
                </Link>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-[10px] font-bold uppercase tracking-widest text-purple-300">
                  <DollarSign className="w-3 h-3" />
                  Earnings
                </span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'gifts', label: 'Gifts' },
                  { id: 'fun', label: 'Fun' },
                  { id: 'crypto', label: 'Crypto' },
                ].map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={`text-sm font-semibold tracking-wide transition-colors ${activeSection === item.id ? 'text-purple-400' : 'text-slate-300 hover:text-white'}`}>
                    {item.label}
                  </a>
                ))}
                <Link to="/" className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all">
                  Start Earning
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-24">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/15 border border-purple-400/30 rounded-full mb-6 sm:mb-8 group hover:scale-105 transition-transform">
                  <Coins className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-300">Complete Earnings Guide 2026</span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.05] mb-6 sm:mb-8 tracking-tight text-white">
                  Earn{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                    $500-$5,000+
                  </span>
                  {' '}Per Month
                </h2>

                <p className="text-base sm:text-xl text-slate-200 leading-relaxed mb-8 sm:mb-10">
                  Turn your video conversations into real income. Complete breakdown of how Caakus users are earning anywhere from $100 to $5,000+ monthly through video calls, virtual gifts, skill-based fun, YUYU cryptocurrency, and referrals.
                </p>

                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <a href="#gifts" className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2">
                    Explore Income Streams
                    <ChevronRight className="w-5 h-5" />
                  </a>
                  <Link to="/" className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm sm:text-base hover:border-purple-400/50 hover:bg-white/15 transition-all">
                    Start Now
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: DollarSign, label: "Average Monthly", value: "$800", change: "Active users" },
                  { icon: TrendingUp, label: "Top Earners", value: "$5,000+", change: "Per month" },
                  { icon: Users, label: "Active Earners", value: "1M+", change: "Worldwide" },
                  { icon: Clock, label: "Avg. Time", value: "3-4h/day", change: "To earn $800" },
                ].map((metric, idx) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={idx} className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/15 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/10 transition-all group">
                      <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-xs sm:text-sm text-slate-300 font-semibold mb-1 sm:mb-2">{metric.label}</p>
                      <p className="text-2xl sm:text-3xl font-black text-white mb-0.5 sm:mb-1">{metric.value}</p>
                      <p className="text-xs text-emerald-400 font-bold">{metric.change}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="overview" className="py-16 sm:py-24 border-y border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">How Caakus Earnings Work</h2>
                <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto">Everything you do on Caakus earns you YUYU coins, which convert to real money you can withdraw instantly</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
                {[
                  { step: "1", title: "Chat & Connect", desc: "Start video calls with people worldwide and earn per minute" },
                  { step: "2", title: "Earn Yuyu", desc: "Get rewarded for every interaction, gift, and challenge won" },
                  { step: "3", title: "Withdraw Money", desc: "Convert coins to cash via PayPal, bank, or crypto wallet" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-purple-400/40 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg">{item.step}</div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-400/30 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Real Money, Real Fast</h3>
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed">YUYU coins convert at a rate of 500 coins = $1 USD. Minimum withdrawal is just $10 (5,000 YUYU). Payments processed within 24-48 hours to PayPal, bank transfer, or cryptocurrency wallet. No hidden fees, no minimum activity requirements.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="gifts" className="py-16 sm:py-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/15 border border-pink-400/30 rounded-full mb-6">
                  <Gift className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-pink-300">Virtual Gifts Income</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">Earn $100-1,000+/Month from Virtual Gifts</h2>
                <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto">Receive virtual gifts during video calls and earn 40% of their value instantly. Top earners make $1,000+/month from gifts alone.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                {giftTiers.map((gift, idx) => (
                  <div key={idx} className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-6 border border-white/15 hover:border-pink-400/40 hover:shadow-xl hover:shadow-pink-500/10 transition-all group">
                    <div className={`w-16 h-16 bg-gradient-to-br ${gift.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{gift.name}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-400">Gift Value: <span className="text-pink-400 font-bold">{gift.price}</span></p>
                      <p className="text-sm text-slate-400">You Earn: <span className="text-emerald-400 font-bold">{gift.earnedByReceiver}</span></p>
                      <span className="inline-block px-2 py-1 bg-white/10 text-xs font-bold rounded-full text-slate-200">{gift.popularity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/30 rounded-2xl p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-pink-400" />
                  How to Maximize Gift Earnings
                </h3>
                <ul className="grid sm:grid-cols-2 gap-4 text-slate-200">
                  {[
                    "Be entertaining and engaging during calls to encourage gifting",
                    "Maintain high ratings (4.5+ stars) to get more premium users",
                    "Use Premium subscription for priority matching with high spenders",
                    "Build rapport quickly - gifts often come from repeat callers",
                    "Stream during peak hours (7-11 PM) for maximum gift potential",
                    "Express gratitude for gifts to encourage repeat gifting"
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="fun" className="py-16 sm:py-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/15 border border-orange-400/30 rounded-full mb-6">
                  <Trophy className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-300">Skill-Based Fun</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">Win $200-5,000+/Month Through Challenges</h2>
                <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto">Challenge other users to skill-based competitions. Win fun ranging from $5 to $500+ per challenge. Strategic players earn $2,000-5,000/month.</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
                {betStrategies.map((strategy, idx) => (
                  <div key={idx} className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/15 hover:border-orange-400/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">{strategy.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${strategy.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' : strategy.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {strategy.riskLevel} Risk
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Typical Stakes</p>
                        <p className="text-lg font-bold text-orange-400">{strategy.stakes}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Win Rate</p>
                        <p className="text-lg font-bold text-white">{strategy.winRate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Monthly Potential</p>
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">{strategy.monthlyPotential}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-2xl p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-orange-400" />
                  Popular Challenge Types
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: "Trivia Challenges", stakes: "$5-50", desc: "Test knowledge on various topics" },
                    { name: "Speed Games", stakes: "$10-100", desc: "Reaction-based mini-games" },
                    { name: "Talent Shows", stakes: "$20-200", desc: "Showcase skills, viewers vote" },
                    { name: "Prediction Fun", stakes: "$50-500", desc: "Predict outcomes, winner takes all" }
                  ].map((challenge, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white">{challenge.name}</h4>
                        <span className="text-xs font-bold text-orange-400">{challenge.stakes}</span>
                      </div>
                      <p className="text-sm text-slate-300">{challenge.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-slate-200 flex items-start gap-2">
                    <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Fair Play Guarantee:</strong> All challenges are skill-based with transparent rules. Caakus moderates all fun to ensure fairness. Only challenge users with verified accounts and good ratings.</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="crypto" className="py-16 sm:py-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/15 border border-blue-400/30 rounded-full mb-6">
                  <Bitcoin className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-300">YUYU Cryptocurrency</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">Yuyu: Your Earnings, Your Asset</h2>
                <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto">YUYU is Caakus's native cryptocurrency. Earn it, hold it as it appreciates, trade it, or convert to cash instantly.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/30 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">YUYU Economics</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { label: "Conversion Rate", value: "500 YUYU = $1 USD" },
                      { label: "Total Supply", value: "8 Billion YUYU" },
                      { label: "Starting Price", value: "$0.01 per YUYU" },
                      { label: "Blockchain", value: "BASE (Coinbase L2)" },
                      { label: "Tradeable", value: "Yes, on DEXs when launched" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center justify-between text-sm sm:text-base">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-bold text-blue-400">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Price Appreciation Potential</h3>
                  </div>
                  <p className="text-slate-200 mb-6 text-sm sm:text-base leading-relaxed">
                    YUYU price increases based on platform activity. As more users join and engage, demand for YUYU rises. Early earners benefit from price appreciation - your 100,000 YUYU worth $200 today could be worth $500+ in 6 months.
                  </p>
                  <div className="space-y-3">
                    {[
                      { milestone: "100K Users", priceTarget: "$0.05-0.10" },
                      { milestone: "500K Users", priceTarget: "$0.25-0.50" },
                      { milestone: "1M+ Users", priceTarget: "$1.00+ 🚀" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm font-semibold text-white">{item.milestone}</span>
                        <span className="text-sm font-bold text-purple-400">{item.priceTarget}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-400/30 rounded-2xl p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-blue-400" />
                  Withdrawal & Trading Options
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { method: "Instant Cash", icon: CreditCard, desc: "Convert to USD/EUR and withdraw to PayPal or bank", fee: "2% fee" },
                    { method: "Hold & Appreciate", icon: TrendingUp, desc: "Keep YUYU in wallet as price increases", fee: "No fee" },
                    { method: "Trade on DEX", icon: Repeat, desc: "Trade YUYU for other crypto when blockchain launches", fee: "Network fees" }
                  ].map((option, i) => {
                    const Icon = option.icon;
                    return (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <Icon className="w-8 h-8 text-blue-400 mb-3" />
                        <h4 className="font-bold text-white mb-2">{option.method}</h4>
                        <p className="text-sm text-slate-300 mb-2">{option.desc}</p>
                        <span className="text-xs font-bold text-blue-400">{option.fee}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 sm:py-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">Monthly Income Tiers</h2>
                <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto">Your earnings scale with your activity. Here's what real Caakus users are making through gifts, fun, calls, and crypto</p>
              </div>

              <div className="space-y-4 sm:space-y-6 mb-12">
                {earningTiers.map((tier, idx) => (
                  <div key={idx} className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/15 hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-500/10 transition-all group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                          <span className="text-white font-black text-2xl sm:text-3xl">{idx + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{tier.name}</h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-white/10 text-slate-200 rounded-full text-xs font-bold border border-white/10">{tier.level}</span>
                            <span className="text-sm text-slate-300">{tier.hoursPerDay} • {tier.callsPerDay} calls</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 sm:gap-8 pl-20 lg:pl-0">
                        <div className="text-left lg:text-right">
                          <p className="text-sm text-slate-400 font-semibold mb-1">Monthly Earnings</p>
                          <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{tier.monthlyEarnings}</p>
                          <p className="text-xs text-slate-400 mt-1">{tier.yuyuCoins} YUYU</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-green-500/15 to-emerald-500/15 border border-green-500/30 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <Trophy className="w-8 h-8 text-green-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Pro Tips: Maximize Your Monthly Earnings</h3>
                    <ul className="space-y-2 text-slate-200 text-sm sm:text-base">
                      {[
                        "Upgrade to Premium ($21.99/month) for 50% earning boost - pays for itself at just 2h/day activity",
                        "Focus on gifts during peak hours (7-11 PM) when high spenders are online",
                        "Build a reputation with 4.5+ star ratings to unlock premium matchers",
                        "Master 2-3 challenge types to maintain 60%+ win rate on fun",
                        "Hold YUYU instead of instant withdrawal to benefit from price appreciation",
                        "Refer 10+ friends to create $50-100/month passive income stream"
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 sm:py-24 relative overflow-hidden">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-20 animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(168,85,247,0.2),transparent)]" />
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl max-w-4xl mx-4 sm:mx-auto">
              <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-xl">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-white">Ready to Start Earning $500-5,000+/Month?</h2>
                <p className="text-base sm:text-xl mb-8 sm:mb-10 text-slate-200">Join 1,000,000+ users already making money through video conversations, gifts, fun, and YUYU crypto</p>
                <Link to="/" className="inline-flex items-center gap-2 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-black text-base sm:text-lg hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transition-all">
                  Start Earning Today
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <p className="mt-6 text-sm text-slate-400">No credit card required • Instant signup • Withdraw anytime</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default FinanceGuide;

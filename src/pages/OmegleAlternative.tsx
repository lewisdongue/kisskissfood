import React, { Suspense, useEffect, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ClientOnly } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Home, Video, DollarSign, Shield, Users, Zap, Gift, Trophy, Check, X, Star, TrendingUp, Lock, Globe, Coins, Award, ChevronRight, MessageCircle, Heart, Sparkles, Rocket, Target, BarChart3, Clock } from 'lucide-react';
import { OmegleDirectoryGrid } from "@/components/pseo/OmegleBridge";
import { omegleDirectoryClusters } from "@/lib/omegleBridge";

// Decorative canvas background: never part of the critical path. Loaded after
// hydration so it cannot delay LCP or block the main thread on mobile.
const ParticleBackground = React.lazy(() =>
  import("@/components/ParticleBackground").then((m) => ({ default: m.ParticleBackground })),
);

const DIRECTORY_CLUSTERS = omegleDirectoryClusters("en");

const OmegleAlternative: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'earnings' | 'safety' | 'features'>('all');
  const [decorReady, setDecorReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Wait for the browser to be idle before mounting decorative work.
    const w = window as typeof window & { requestIdleCallback?: (cb: () => void) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const id = schedule(() => setDecorReady(true));
    return () => {
      if (typeof id === "number") window.clearTimeout(id);
    };
  }, []);

  const comparisonTable = [
    { feature: "Random Video Chat", omegle: true, chatroulette: true, monkey: true, caakus: true },
    { feature: "Earn Real Money", omegle: false, chatroulette: false, monkey: false, caakus: true },
    { feature: "YUYU Reward Points", omegle: false, chatroulette: false, monkey: false, caakus: true },
    { feature: "Virtual Gifts System", omegle: false, chatroulette: false, monkey: false, caakus: true },
    { feature: "Skill-Based Fun", omegle: false, chatroulette: false, monkey: false, caakus: true },
    { feature: "24/7 AI Moderation", omegle: false, chatroulette: false, monkey: true, caakus: true },
    { feature: "User Verification", omegle: false, chatroulette: false, monkey: true, caakus: true },
    { feature: "Gender Filters", omegle: false, chatroulette: true, monkey: true, caakus: true },
    { feature: "Region Filters", omegle: false, chatroulette: false, monkey: true, caakus: true },
    { feature: "Age Filters", omegle: false, chatroulette: false, monkey: true, caakus: true },
    { feature: "Interest Tags", omegle: true, chatroulette: false, monkey: false, caakus: true },
    { feature: "Mobile App", omegle: false, chatroulette: false, monkey: true, caakus: true },
    { feature: "Profile System", omegle: false, chatroulette: false, monkey: true, caakus: true },
    { feature: "Friends List", omegle: false, chatroulette: false, monkey: true, caakus: true },
    { feature: "Chat History", omegle: false, chatroulette: false, monkey: false, caakus: true },
    { feature: "Referral Program", omegle: false, chatroulette: false, monkey: false, caakus: true },
    { feature: "Premium Tiers", omegle: false, chatroulette: true, monkey: true, caakus: true },
    { feature: "Active Users 2026", omegle: "0 (Closed)", chatroulette: "500K", monkey: "2M", caakus: "1M+" },
    { feature: "Platform Status", omegle: "Shut Down", chatroulette: "Active", monkey: "Active", caakus: "Growing Fast" },
    { feature: "Monthly Earnings Potential", omegle: "$0", chatroulette: "$0", monkey: "$0", caakus: "$100-$5,000" },
  ];

  const whyCaakusBetter = [
    {
      icon: DollarSign,
      title: "Earn While Chatting",
      description: "Make $100-$5,000+ monthly through video calls, gifts, challenges, and YUYU reward points. The ONLY platform that pays you for video chatting. Omegle, Chatroulette, and Monkey never paid users.",
      gradient: "from-green-400 to-emerald-500",
      stats: "$5M+ paid out"
    },
    {
      icon: Shield,
      title: "Ultra-Safe Platform",
      description: "Military-grade AI moderation, mandatory verification, real-time content filtering, and human moderator team. Safer than Omegle ever was. 99.9% ban rate for inappropriate content.",
      gradient: "from-blue-400 to-indigo-500",
      stats: "24/7 Protection"
    },
    {
      icon: Coins,
      title: "YUYU Reward Points",
      description: "Yuyu are internal reward points you collect from calls, gifts and community activity. They track your contribution inside Caakus and convert to payouts through the official withdrawal flow. No wallet, no trading, no external market.",
      gradient: "from-purple-400 to-pink-500",
      stats: "Earned in-app only"
    },
    {
      icon: Users,
      title: "Quality Connections",
      description: "Advanced matching algorithm with 200+ filters. Profile ratings, verified badges, and interest-based matching ensure high-quality conversations. No bots, no spam.",
      gradient: "from-orange-400 to-red-500",
      stats: "4.8/5 Avg Rating"
    },
    {
      icon: Gift,
      title: "Virtual Gifts Economy",
      description: "Receive premium gifts ($1-$50) and keep 40% commission. Send roses, diamonds, luxury cars. Complete marketplace with 100+ gift types. Passive income stream.",
      gradient: "from-pink-400 to-rose-500",
      stats: "100+ Gift Types"
    },
    {
      icon: Trophy,
      title: "Skill-Based Fun",
      description: "Win real money through trivia, talent shows, speed games. Stakes from $5-$500 per challenge. Fair competition with transparent rules and instant payouts.",
      gradient: "from-yellow-400 to-amber-500",
      stats: "60% Avg Win Rate"
    },
    {
      icon: Target,
      title: "Premium Filters",
      description: "Filter by gender, age, location, interests, languages. Priority matching for premium members. Advanced preferences not available on Omegle, Chatroulette, or Monkey.",
      gradient: "from-cyan-400 to-blue-500",
      stats: "200+ Filter Options"
    },
    {
      icon: MessageCircle,
      title: "Multi-Format Chat",
      description: "Video, voice-only, text chat with translation in 50+ languages. Screen sharing, AR filters, beauty mode. Most versatile chat platform available.",
      gradient: "from-indigo-400 to-purple-500",
      stats: "50+ Languages"
    },
  ];

  const stats = [
    { value: "1M+", label: "Active Users", icon: Users, color: "from-purple-400 to-pink-500" },
    { value: "$5M+", label: "Paid to Users", icon: DollarSign, color: "from-green-400 to-emerald-500" },
    { value: "150+", label: "Countries", icon: Globe, color: "from-blue-400 to-indigo-500" },
    { value: "99.9%", label: "Uptime", icon: TrendingUp, color: "from-orange-400 to-red-500" },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      location: "United States",
      text: "I was looking for Omegle alternatives after it shut down. Found Caakus and I'm earning $800/month just chatting! The YUYU reward-point system is genius.",
      earnings: "$800/mo",
      avatar: "from-pink-400 to-rose-500"
    },
    {
      name: "David K.",
      location: "Germany",
      text: "Way better than Chatroulette or Monkey. The moderation is top-notch, no inappropriate content. Plus I can actually make money - made $2,300 last month!",
      earnings: "$2,300/mo",
      avatar: "from-blue-400 to-indigo-500"
    },
    {
      name: "Priya S.",
      location: "India",
      text: "Best Omegle replacement by far. The filters work perfectly, and I love receiving virtual gifts. Already withdrew $500 to my bank account!",
      earnings: "$500/mo",
      avatar: "from-purple-400 to-pink-500"
    },
  ];

  const faq = [
    {
      q: "Why did Omegle shut down in 2023?",
      a: "Omegle shut down on November 8, 2023, after 14 years of operation. Founder Leif K-Brooks cited overwhelming stress from fighting misuse, expensive legal battles, and mental health impact. The platform faced criticism for inadequate moderation, allowing inappropriate content and predatory behavior. Caakus learned from Omegle's mistakes with 24/7 AI moderation, mandatory verification, and comprehensive safety systems."
    },
    {
      q: "Is Caakus safer than Omegle, Chatroulette, and Monkey App?",
      a: "Yes, significantly safer. Caakus uses military-grade AI content detection, real-time image filtering, mandatory phone/ID verification, human moderator team working 24/7, and instant ban system for violations. We maintain 99.9% inappropriate content prevention rate. Omegle had minimal moderation (which caused its shutdown), Chatroulette has basic filters, and Monkey has moderate safety. Caakus invests 40% of revenue in safety infrastructure."
    },
    {
      q: "How much money can I really make on Caakus?",
      a: "Real earnings data: Casual users (1-2h/day) make $100-$300/month. Active users (2-4h/day) earn $300-$800/month. Power users (4-6h/day) make $800-$2,000/month. Top earners (6-8h/day) earn $2,000-$5,000+/month. Income sources: base call earnings, virtual gifts (40% commission), skill-based challenges ($5-$500 per fun), referrals ($10-$100 per friend), and YUYU reward-point bonuses. Average user makes $450/month."
    },
    {
      q: "What makes Caakus different from Chatroulette, Monkey, and other Omegle alternatives?",
      a: "Caakus is the ONLY platform combining random video chat with real money earnings. Unique features: the YUYU reward-point economy, virtual gifts marketplace with 100+ items, skill-based fun system, referral program with lifetime commissions, premium subscription tiers ($4.99-$299 lifetime), advanced AI matching algorithm, 200+ filters (gender, age, location, interests, language), profile system with ratings and verification, friends list and chat history, multi-format chat (video/voice/text), 50+ language translation, and mobile apps for iOS/Android."
    },
    {
      q: "Is Caakus completely free to use like Omegle was?",
      a: "Yes! Free users can: video chat unlimited, earn money from all activities, use basic filters (gender, region), send/receive gifts, participate in challenges, refer friends, and withdraw earnings. Premium subscriptions unlock: advanced filters (age, interests, distance), 50% earnings boost, priority matching (connect 3x faster), ad-free experience, custom profile themes, verified badge, and exclusive challenges. Student plan: $4.99/month. Regular: $21.99/month. Founder's Club: $299 lifetime (10,000 slots only)."
    },
    {
      q: "How do I withdraw my Caakus earnings?",
      a: "Super simple: Minimum withdrawal is $10 (5,000 YUYU points). Payment methods: PayPal (instant, 2% fee), Bank transfer (1-3 days, no fee), Venmo/Cash App (US only, instant). Process: Click 'Withdraw' in settings, choose amount and method, verify with 2FA code, receive payment in 24-48 hours. No hidden fees, no minimum activity requirements. Over $5M paid out to users since launch."
    },
    {
      q: "Can I use Caakus on my phone like I used Omegle?",
      a: "Yes! Caakus works on: iOS app (App Store), Android app (Google Play), Mobile web browser (Progressive Web App), Tablet devices (iPad, Android tablets), Desktop web browser (Chrome, Safari, Firefox, Edge). Features are identical across all platforms. Mobile apps include: push notifications for matches, background audio mode, data saver option, offline message queue, and biometric login (Face ID, fingerprint)."
    },
    {
      q: "How does Caakus compare to Chatroulette and Monkey App?",
      a: "Caakus vs Chatroulette: We have earnings system (Chatroulette has none), better moderation (24/7 AI vs basic), mobile app (Chatroulette is web-only), more active users (1M vs 500K), and modern UI. Caakus vs Monkey: We pay users (Monkey doesn't), have reward points (Monkey doesn't), offer skill-based fun (Monkey doesn't), provide better filters (200+ vs 10), and have higher age limit (18+ vs 13+). Caakus combines the best of all platforms plus unique monetization."
    },
  ];

  return (
    <>
      {/* Page metadata lives in the route head(); only structured data stays here. */}
      <>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://www.caakus.com/omegle-alternative#webpage",
              "url": "https://www.caakus.com/omegle-alternative",
              "name": "Best Omegle Alternative 2026 – Caakus | Random Video Chat & Earn Money",
              "description": "Caakus is the #1 Omegle alternative. Random video chat with strangers plus earn $100–$5,000/month through YUYU reward points, virtual gifts, and challenges.",
              "isPartOf": { "@id": "https://www.caakus.com/#website" },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.caakus.com/" },
                  { "@type": "ListItem", "position": 2, "name": "Omegle Alternative", "item": "https://www.caakus.com/omegle-alternative" }
                ]
              }
            },
            {
              "@type": "SoftwareApplication",
              "name": "Caakus – Omegle Alternative",
              "applicationCategory": "SocialNetworkingApplication",
              "operatingSystem": "Web, iOS, Android",
              "url": "https://www.caakus.com/",
              "description": "The best Omegle alternative in 2026. Random video chat with real money earnings through YUYU reward points, virtual gifts, and skill-based challenges.",
              "browserRequirements": "Requires a browser with WebRTC support",
              "isAccessibleForFree": true
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Why did Omegle shut down in 2023?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Omegle shut down on November 8, 2023, after 14 years. Founder Leif K-Brooks cited overwhelming stress from fighting misuse, expensive legal battles, and mental health impact. The platform faced criticism for inadequate moderation. Caakus learned from Omegle's mistakes with 24/7 AI moderation, mandatory verification, and comprehensive safety systems."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Caakus safer than Omegle, Chatroulette, and Monkey App?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, significantly safer. Caakus uses military-grade AI content detection, real-time image filtering, mandatory phone/ID verification, human moderator team working 24/7, and instant ban system for violations. We maintain 99.9% inappropriate content prevention rate."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much money can I really make on Caakus?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Casual users (1-2h/day) make $100–$300/month. Active users (2-4h/day) earn $300–$800/month. Power users (4-6h/day) make $800–$2,000/month. Top earners (6-8h/day) earn $2,000–$5,000+/month. Income sources include base call earnings, virtual gifts (40% commission), skill-based challenges, referrals, and YUYU reward-point bonuses."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What makes Caakus different from Chatroulette, Monkey, and other Omegle alternatives?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Caakus is the ONLY platform combining random video chat with real money earnings. Unique features include the YUYU reward-point economy, virtual gifts marketplace with 100+ items, skill-based fun system, referral program, premium subscription tiers ($4.99–$299 lifetime), advanced AI matching, 200+ filters, and 50+ language translation."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Caakus completely free to use like Omegle was?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Free users can video chat unlimited, earn money from all activities, use basic filters, send/receive gifts, and withdraw earnings. Premium subscriptions unlock advanced filters, 50% earnings boost, priority matching, and ad-free experience. Student plan: $4.99/month. Regular: $21.99/month."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I withdraw my Caakus earnings?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Minimum withdrawal is $10 (5,000 YUYU points). Payment methods: PayPal (instant, 2% fee), Bank transfer (1-3 days, no fee), Process: Click Withdraw in settings, choose amount and method, verify with 2FA, receive payment in 24-48 hours. Over $5M paid out to users since launch."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use Caakus on my phone like I used Omegle?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Caakus works on iOS app (App Store), Android app (Google Play), mobile web browser (Progressive Web App), tablet devices, and desktop browsers. Features are identical across all platforms with push notifications, background audio mode, and biometric login."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does Caakus compare to Chatroulette and Monkey App?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Caakus vs Chatroulette: earnings system (Chatroulette has none), better moderation, mobile app, more active users (1M vs 500K). Caakus vs Monkey: pays users (Monkey doesn't), has reward points, offers skill-based fun, provides better filters (200+ vs 10), higher age limit (18+ vs 13+)."
                  }
                }
              ]
            }
          ]
        })}</script>
      </>

      {decorReady ? (
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <ParticleBackground />
          </Suspense>
        </ClientOnly>
      ) : null}

      <div className="min-h-screen w-full overflow-x-hidden relative z-10 font-sans text-white antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-white/10">
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
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src="/logo.webp" alt="Caakus - Best Omegle Alternative" className="w-6 h-6 object-contain" />
                    </div>
                  </div>
                  <span className="font-black text-xl sm:text-2xl tracking-tighter bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">CAAKUS</span>
                </Link>
              </div>
              <Link to="/" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-lg font-bold text-sm hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all">
                Start Earning Now
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-24">
          <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-32">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
            <div className="relative text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/40 rounded-full mb-8 backdrop-blur-sm">
                <X className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-red-300">Omegle Shut Down November 2023</span>
              </div>
              
              <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[1.02] mb-8 sm:mb-10 tracking-tighter">
                The #1{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 animate-gradient">
                  Omegle Alternative
                </span>
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl text-white/80">That Pays You Real Money</span>
              </h2>

              <p className="text-xl sm:text-2xl lg:text-3xl text-slate-200 leading-relaxed mb-10 sm:mb-12 max-w-5xl mx-auto font-medium">
                After Omegle shut down, <strong className="text-white font-black">Caakus</strong> became the world's #1 replacement. Random video chat with strangers worldwide — <strong className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 font-black">PLUS earn $100-$5,000+ monthly</strong> through YUYU reward points, virtual gifts, and skill-based challenges.
              </p>

              <div className="flex flex-wrap justify-center gap-5 mb-16">
                <Link to="/call" className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-black text-lg hover:scale-105 transition-all flex items-center gap-3 shadow-2xl">
                    <Video className="w-6 h-6" />
                    Start Video Chat Free
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                </Link>
                <a href="#comparison" className="px-10 py-5 bg-white/10 border-2 border-white/20 text-white rounded-2xl font-bold text-lg hover:border-purple-400/50 hover:bg-white/15 transition-all backdrop-blur-sm">
                  Compare Platforms
                </a>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="group relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group-hover:border-white/20 group-hover:scale-105 transition-all">
                        <Icon className={`w-10 h-10 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-3 mx-auto`} />
                        <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                        <div className="text-sm text-white/70 font-bold">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-32 border-y border-white/10 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_70%)]" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/15 border border-purple-400/30 rounded-full mb-6">
                  <Rocket className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-300">Platform Comparison</span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">Why Caakus Beats Omegle, Chatroulette & Monkey</h2>
                <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">Omegle pioneered random video chat but shut down due to safety issues. Chatroulette and Monkey improved moderation but still don't pay users. Caakus combines the best of all platforms plus real earnings.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {whyCaakusBetter.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="group relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 group-hover:border-white/30 transition-all h-full">
                        <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3">{item.title}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">{item.description}</p>
                        <div className={`inline-block px-3 py-1.5 bg-gradient-to-r ${item.gradient} rounded-full text-xs font-bold text-white`}>
                          {item.stats}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="comparison" className="py-20 sm:py-32 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">Complete Platform Comparison</h2>
                <p className="text-xl text-slate-300 max-w-4xl mx-auto">Side-by-side feature comparison: Caakus vs Omegle vs Chatroulette vs Monkey App</p>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 border-b border-white/10">
                        <th className="text-left p-6 font-black text-white text-lg">Feature</th>
                        <th className="text-center p-6 font-black text-red-400 text-lg">Omegle<br /><span className="text-xs font-normal text-red-300">(Closed)</span></th>
                        <th className="text-center p-6 font-black text-blue-400 text-lg">Chatroulette</th>
                        <th className="text-center p-6 font-black text-yellow-400 text-lg">Monkey App</th>
                        <th className="text-center p-6 font-black text-purple-400 text-lg">Caakus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonTable.map((row, idx) => (
                        <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'} border-b border-white/5 hover:bg-white/10 transition-colors`}>
                          <td className="p-4 sm:p-6 text-sm sm:text-base text-white font-semibold">{row.feature}</td>
                          <td className="text-center p-4 sm:p-6">
                            {typeof row.omegle === 'boolean' ? (
                              row.omegle ? <Check className="w-6 h-6 text-green-400 mx-auto" /> : <X className="w-6 h-6 text-red-400 mx-auto" />
                            ) : (
                              <span className="text-sm font-bold text-red-400">{row.omegle}</span>
                            )}
                          </td>
                          <td className="text-center p-4 sm:p-6">
                            {typeof row.chatroulette === 'boolean' ? (
                              row.chatroulette ? <Check className="w-6 h-6 text-green-400 mx-auto" /> : <X className="w-6 h-6 text-red-400 mx-auto" />
                            ) : (
                              <span className="text-sm font-bold text-blue-400">{row.chatroulette}</span>
                            )}
                          </td>
                          <td className="text-center p-4 sm:p-6">
                            {typeof row.monkey === 'boolean' ? (
                              row.monkey ? <Check className="w-6 h-6 text-green-400 mx-auto" /> : <X className="w-6 h-6 text-red-400 mx-auto" />
                            ) : (
                              <span className="text-sm font-bold text-yellow-400">{row.monkey}</span>
                            )}
                          </td>
                          <td className="text-center p-4 sm:p-6">
                            {typeof row.caakus === 'boolean' ? (
                              row.caakus ? <Check className="w-6 h-6 text-purple-400 mx-auto" /> : <X className="w-6 h-6 text-red-400 mx-auto" />
                            ) : (
                              <span className="text-sm font-black text-purple-400">{row.caakus}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-32 border-t border-white/10 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">Real Users, Real Earnings</h2>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">See what former Omegle, Chatroulette, and Monkey users are saying about Caakus</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.avatar} rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 group-hover:border-white/20 transition-all">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonial.avatar} flex items-center justify-center text-2xl font-black text-white`}>
                          {testimonial.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{testimonial.name}</div>
                          <div className="text-sm text-white/60">{testimonial.location}</div>
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                      <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full">
                        <span className="text-green-400 font-black">{testimonial.earnings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-32 border-t border-white/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">Frequently Asked Questions</h2>
                <p className="text-xl text-slate-300">Everything you need to know about switching from Omegle, Chatroulette, or Monkey to Caakus</p>
              </div>

              <div className="space-y-5">
                {faq.map((item, idx) => (
                  <details key={idx} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/40 transition-all">
                    <summary className="cursor-pointer p-8 font-bold text-xl text-white flex items-center justify-between">
                      <span className="flex-1">{item.q}</span>
                      <ChevronRight className="w-6 h-6 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                    </summary>
                    <div className="px-8 pb-8 text-slate-300 leading-relaxed text-lg">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <OmegleDirectoryGrid clusters={DIRECTORY_CLUSTERS} lang="en" />

          <section className="py-20 sm:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.2),transparent_70%)]" />
            <div className="relative max-w-5xl mx-4 sm:mx-auto">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-12 sm:p-16 md:p-20 shadow-2xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-8 shadow-2xl">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white leading-tight">Ready to Start Earning $100-$5,000/Month?</h2>
                  <p className="text-xl sm:text-2xl mb-10 text-slate-200 max-w-3xl mx-auto leading-relaxed">Join 1,000,000+ users who switched from Omegle to Caakus and started making real money through video chat</p>
                  <Link to="/call" className="group relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl">
                      <Video className="w-6 h-6" />
                      Start Video Chat Free
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                  </Link>
                  <p className="mt-8 text-sm text-slate-400 flex flex-wrap items-center justify-center gap-4">
                    <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-400" /> No credit card</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-400" /> Instant access</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-400" /> 100% free to start</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default OmegleAlternative;

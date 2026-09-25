import { useState, useEffect } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useNavigate } from "@/lib/router-compat";
import {
  ArrowLeft,
  HelpCircle,
  Bug,
  Shield,
  Trophy,
  Mail,
  Sparkles,
  MessageCircle,
  Zap,
  Users,
  CheckCircle2,
  Star,
  Clock,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Support() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
  }, []);

  const supportCategories = [
    {
      icon: HelpCircle,
      titleKey: "support.categories.general.title",
      descriptionKey: "support.categories.general.description",
      actionKey: "support.categories.general.action",
      link: "#faq",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      icon: Bug,
      titleKey: "support.categories.tech.title",
      descriptionKey: "support.categories.tech.description",
      actionKey: "support.categories.tech.action",
      link: "/contact",
      gradient: "from-pink-400 to-pink-600",
    },
    {
      icon: Shield,
      titleKey: "support.categories.security.title",
      descriptionKey: "support.categories.security.description",
      actionKey: "support.categories.security.action",
      link: "/contact",
      gradient: "from-orange-400 to-orange-600",
    },
    {
      icon: Trophy,
      titleKey: "support.categories.yuyu.title",
      descriptionKey: "support.categories.yuyu.description",
      actionKey: "support.categories.yuyu.action",
      link: "/contact",
      gradient: "from-blue-400 to-blue-600",
    },
  ];

  const faqs = [
    { question: "support.faq.q1", answer: "support.faq.a1" },
    { question: "support.faq.q2", answer: "support.faq.a2" },
    { question: "support.faq.q3", answer: "support.faq.a3" },
    { question: "support.faq.q4", answer: "support.faq.a4" },
    { question: "support.faq.q5", answer: "support.faq.a5" },
    { question: "How do I start earning money on Caakus?", answer: "Simply sign up, complete your profile, and start video chatting with other users. You earn YUYU coins through video calls, receiving gifts, winning fun, and completing challenges. The more you engage, the more you earn!" },
    { question: "What are YUYU coins and how do they work?", answer: "YUYU coins are Caakus's virtual currency. You earn them through platform activities and can use them for premium features, gifts, fun, or convert them to real money once you reach the minimum withdrawal threshold." },
    { question: "How long does it take to receive a match?", answer: "Our advanced matching algorithm connects you with other users in less than 1 second on average. This ensures you spend more time chatting and earning, not waiting." },
    { question: "Is Caakus available on mobile devices?", answer: "Yes! Caakus is a Progressive Web App (PWA) that works seamlessly on all devices - smartphones, tablets, and computers. Simply visit caakus.com on any browser and you can install it like a native app." },
    { question: "How do I withdraw my earnings?", answer: "Once you reach the minimum withdrawal threshold, go to your wallet, select 'Withdraw', choose your preferred payment method, and follow the instructions. Withdrawals are typically processed within 24-48 hours." },
    { question: "What payment methods are supported?", answer: "We support multiple payment methods including bank transfers, PayPal, cryptocurrency wallets, and various regional payment providers. Check your account settings for available options in your region." },
    { question: "Can I use Caakus in my country?", answer: "Caakus is available in 150+ countries worldwide. If you can access the website, you can use Caakus. Regional features and payment methods may vary by location." },
    { question: "How do video fun and challenges work?", answer: "You can challenge other users to skill-based competitions during video calls. Both users agree on stakes using YUYU coins, complete the challenge, and the winner takes the prize. All challenges are fair and transparent." },
    { question: "What is the Founder's Club?", answer: "Founder's Club is our exclusive premium tier (limited to 10,000 members) offering maximum earnings, priority matching, exclusive badges, zero platform fees, and VIP support. It's the ultimate Caakus experience." },
    { question: "How do I report inappropriate behavior?", answer: "Click the flag icon during any video call or go to the user's profile and select 'Report'. Our moderation team reviews all reports within 24 hours and takes appropriate action to keep Caakus safe." },
    { question: "What are the age requirements?", answer: "You must be at least 18 years old to use Caakus. We verify ages during registration and use AI moderation to ensure compliance. Underage users are permanently banned." },
    { question: "How does the Premium subscription work?", answer: "Premium unlocks enhanced features including priority matching, no ads, increased earning rates, exclusive filters, and advanced statistics. You can choose Student ($4.99/month), Regular ($21.99/month), or Founder's Club ($299 lifetime)." },
    { question: "Can I use Caakus without video?", answer: "Yes! Caakus supports voice-only calls and text chat. You can disable your camera in settings while still earning and connecting with others. However, video calls typically earn more YUYU coins." },
    { question: "How is my privacy protected?", answer: "We use end-to-end encryption for all calls, never store video content, and give you full control over your data. You can block users, control who sees your profile, and delete your account anytime with all data removed." },
    { question: "What happens if my connection drops during a call?", answer: "Our system automatically attempts to reconnect you within 10 seconds. If reconnection fails, the call ends and any active fun are refunded. Your earnings up to that point are saved." },
    { question: "How do I increase my earnings on Caakus?", answer: "Stay active daily, maintain high ratings from other users, participate in challenges and fun, refer friends, upgrade to Premium for bonus multipliers, and engage in longer conversations. Consistency is key!" },
    { question: "Can I have multiple accounts?", answer: "No, multiple accounts are strictly prohibited and will result in permanent ban of all associated accounts. Each person is allowed one account to ensure fair earning opportunities for everyone." },
    { question: "How does the referral program work?", answer: "Share your unique invite link with friends. When they sign up and become active users, you earn 100 YUYU coins per referral plus 5% of their earnings for their first 30 days. There's no limit to how many people you can refer!" },
    { question: "What should I do if I experience technical issues?", answer: "First, try refreshing your browser and checking your internet connection. If issues persist, contact our support team at hello@caakus.com with details about your device, browser, and the problem. We typically respond within 24 hours." },
    { question: "How do advertising spots work on Caakus?", answer: "Businesses can purchase advertising spots to reach our 1M+ active users. As a user, you may see occasional ads which help keep Caakus free. Premium members enjoy an ad-free experience." },
    { question: "What makes Caakus different from other video chat platforms?", answer: "Caakus is the world's first Social Stock Market where you earn real money through video conversations. We combine random video chat with cryptocurrency rewards, skill-based challenges, and a vibrant earning ecosystem - all in one platform." },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>

      <ParticleBackground />

      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-2xl">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-3">
              <button onClick={() => navigate("/")} className="group rounded-full p-2 hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50" aria-label="Back to home">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-300" />
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 overflow-hidden">
                  <img src="/logo.webp" alt="Caakus Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                </div>
              </div>
              <div className="ml-1">
                <h2 className="text-base sm:text-lg font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Caakus</h2>
                <p className="text-xs text-white/60 font-medium hidden sm:block">Support Center</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl sm:rounded-3xl mb-4 sm:mb-5 shadow-2xl shadow-purple-500/30 animate-float relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl sm:rounded-3xl blur-xl opacity-50 animate-pulse" />
                <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
              </div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                <span className="text-xs sm:text-sm font-semibold text-purple-300">{t("support.tagline") || "24/7 Expert Support"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight drop-shadow-2xl">{t("support.title") || "Support Center"}</h2>
              <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-6">{t("support.description") || "Get instant help with video chat, YUYU coins, and earning"}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white">Fast Response</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 backdrop-blur-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white">Expert Team</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-12">
            {supportCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-2 hover:border-white/30 hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors duration-700" />
                  <div className="relative z-10">
                    <div className="relative mb-4 inline-block">
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-xl blur-lg opacity-40 group-hover:opacity-70 group-hover:blur-xl transition-all duration-500`} />
                      <div className={`relative w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-2 ring-white/20`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2 text-white group-hover:text-purple-300 transition-colors duration-300">{t(category.titleKey) || "Support Category"}</h3>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-4 group-hover:text-white/80 transition-colors duration-300">{t(category.descriptionKey) || "Get help with this"}</p>
                    {category.link.startsWith("/") ? (
                      <button onClick={() => navigate(category.link)} className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-purple-200 transition-colors group/link">
                        {t(category.actionKey) || "Learn More"}
                        <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                      </button>
                    ) : (
                      <a
                        href={category.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-purple-200 transition-colors group/link"
                      >
                        {t(category.actionKey) || "Learn More"}
                        <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div id="faq" className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/20 mb-8 sm:mb-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{t("support.faq.title") || "Frequently Asked Questions"}</h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-white/70">{t("support.faq.description") || "Find quick answers to common questions"}</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all overflow-hidden">
                    <button onClick={() => toggleFaq(index)} className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-xl" aria-expanded={openFaq === index}>
                      <span className="flex items-center gap-3 flex-1 text-left">
                        <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">{index + 1}</span>
                        <span className="font-semibold text-sm sm:text-base text-white">{typeof faq.question === "string" && faq.question.startsWith("support.") ? t(faq.question) : faq.question}</span>
                      </span>
                      <span className={`text-2xl transition-transform ml-2 flex-shrink-0 text-purple-300 ${openFaq === index ? "rotate-45" : ""}`}>+</span>
                    </button>
                    {openFaq === index && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 animate-fade-in">
                        <div className="pt-3 sm:pt-4 border-t border-white/10">
                          <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{typeof faq.answer === "string" && faq.answer.startsWith("support.") ? t(faq.answer) : faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-10">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base sm:text-lg text-white mb-2">Average Response Time</h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">Our expert team typically responds within 24-48 hours to all support inquiries</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base sm:text-lg text-white mb-2">Community Support</h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">Join our growing community of 1M+ users helping each other succeed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-purple-400/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white">{t("support.needHelp") || "Still Need Help?"}</h3>
              <p className="text-sm sm:text-base text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">{t("support.teamAvailable") || "Our support team is available every day at all hours to assist you"}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate("/contact")} className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-white text-purple-600 hover:bg-white/90 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/btn active:scale-95">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:rotate-12 transition-transform" />
                  {t("support.contactUs") || "Contact Support"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group">
              <Globe className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              <p className="text-xs sm:text-sm text-white/70">Helping <span className="font-bold text-white">1,000,000+</span> users earn online</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

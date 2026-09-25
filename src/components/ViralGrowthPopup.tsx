import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  X, Users, Zap, TrendingUp, Heart, Share2, Sparkles, 
  Gift, Crown, Rocket, MessageCircle, Instagram, 
  Send, Link as LinkIcon, CheckCircle2, Award, 
  Globe, ShieldCheck, Flame, MousePointer2, 
  Trophy, Star, Target, ZapOff, Share, Copy, Check
} from "lucide-react";
// @ts-ignore
import confetti from "canvas-confetti";
import { supabase, TABLES } from '../config/supabase';


// ============================================================================
// TYPES ET INTERFACES STRICTES POUR PRODUCTION
// ============================================================================

interface TranslationContent {
  title: string;
  subtitle: string;
  callToAction: string;
  step1: string;
  step2: string;
  step3: string;
  shareButton: string;
  laterButton: string;
  urgency: string;
  rewardTitle: string;
  rewardSubtitle: string;
  bonus: string;
  powerMove: string;
  copySuccess: string;
  shareTitle: string;
  shareMessage: string;
  pointsLabel: string;
  statusLabel: string;
  viralGrowth: string;
}

// ============================================================================
// DICTIONNAIRE MULTILINGUE MASSIF
// ============================================================================

const getPopupMessages = (): TranslationContent => {
  const browserLang = typeof navigator !== "undefined" 
    ? navigator.language.toLowerCase().split("-")[0] 
    : "en";

  const translations: Record<string, TranslationContent> = {
    fr: {
      title: "Ambassadeur Officiel Caakus",
      subtitle: "Le monde attend votre voix. Ne restez pas discret, devenez une légende !",
      callToAction: "Propulsez Caakus vers les sommets (Objectif: 8 partages)",
      step1: "📱 Partagez sur WhatsApp, Insta, Snap & TikTok",
      step2: "🔥 Invitez 8 amis à rejoindre la révolution vocale",
      step3: "✨ Débloquez des badges VIP et boostez votre score YUYU",
      shareButton: "Partager & Devenir Viral",
      laterButton: "Peut-être plus tard",
      urgency: "MOUVEMENT VIRAL EN COURS : +450% d'activité ! 🌍",
      rewardTitle: "Récompenses Légendaires",
      rewardSubtitle: "Gagnez des Yuyu pour chaque nouvel arrivant",
      bonus: "BONUS CRITIQUE",
      powerMove: "Votre influence change le destin de la communauté.",
      copySuccess: "Lien copié ! Prêt à conquérir le monde.",
      shareTitle: "Rejoins-moi sur Caakus !",
      shareMessage: "Je viens de découvrir Caakus, c'est incroyable pour parler en direct avec le monde entier ! Clique ici :",
      pointsLabel: "+800 Yuyu",
      statusLabel: "Statut VIP Gold",
      viralGrowth: "Croissance Virale Active"
    },
    en: {
      title: "Official Caakus Ambassador",
      subtitle: "The world is waiting for your voice. Don't stay quiet, become a legend!",
      callToAction: "Propel Caakus to the top (Goal: 8 shares)",
      step1: "📱 Share on WhatsApp, Insta, Snap & TikTok",
      step2: "🔥 Invite 8 friends to join the voice revolution",
      step3: "✨ Unlock VIP badges and boost your Yuyu",
      shareButton: "Share & Go Viral",
      laterButton: "Maybe later",
      urgency: "VIRAL MOVEMENT DETECTED: +450% activity! 🌍",
      rewardTitle: "Legendary Rewards",
      rewardSubtitle: "Earn Yuyu for every newcomer",
      bonus: "CRITICAL BONUS",
      powerMove: "Your influence changes the community's destiny.",
      copySuccess: "Link copied! Ready to conquer the world.",
      shareTitle: "Join me on Caakus!",
      shareMessage: "I just found Caakus, it's amazing for live voice chat with the world! Click here:",
      pointsLabel: "+800 Yuyu",
      statusLabel: "VIP Gold Status",
      viralGrowth: "Active Viral Growth"
    },
    es: {
      title: "Embajador Oficial de Caakus",
      subtitle: "El mundo espera tu voz. ¡No te quedes callado, conviértete en leyenda!",
      callToAction: "Impulsa a Caakus hacia la cima (Objetivo: 8 compartidos)",
      step1: "📱 Comparte en WhatsApp, Insta, Snap y TikTok",
      step2: "🔥 Invita a 8 amigos a la revolución de voz",
      step3: "✨ Desbloquea insignias VIP y mejora tus Yuyu",
      shareButton: "Compartir y Volverse Viral",
      laterButton: "Tal vez más tarde",
      urgency: "MOVIMIENTO VIRAL DETECTADO: ¡+450% de actividad! 🌍",
      rewardTitle: "Recompensas Legendarias",
      rewardSubtitle: "Gana Yuyu por cada nuevo usuario",
      bonus: "BONO CRÍTICO",
      powerMove: "Tu influencia cambia el destino de la comunidad.",
      copySuccess: "¡Enlace copiado! Listo para conquistar el mundo.",
      shareTitle: "¡Únete a mí en Caakus!",
      shareMessage: "¡Acabo de descubrir Caakus, es increíble para hablar en vivo con todo el mundo! Haz clic aquí:",
      pointsLabel: "+800 Yuyu",
      statusLabel: "Estado VIP Oro",
      viralGrowth: "Crecimiento Viral Activo"
    }
  };

  return translations[browserLang] || translations["en"];
};

// ============================================================================
// COMPOSANT VIRAL GROWTH POPUP - VERSION INTÉGRALE
// ============================================================================

interface ViralGrowthPopupProps {
  onClose: () => void;
  userId?: string;
}

export const ViralGrowthPopup: React.FC<ViralGrowthPopupProps> = ({ onClose, userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [sharingPlatform, setSharingPlatform] = useState<string | null>(null);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const messages = getPopupMessages();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Generate real invitation link with user's referral ID (same format as YuyuScore)
  const inviteLink = userId ? `${window.location.origin}?ref=${userId}` : window.location.origin;

  // --- LOGIQUE CONFETTI COMPLEXE ---
  const triggerEpicConfetti = useCallback(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    triggerEpicConfetti();

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(stepInterval);
    };
  }, [triggerEpicConfetti]);

  // ============================================================================
  // LOGIQUE DE PARTAGE ET RÉCOMPENSE SUPABASE
  // ============================================================================
  const handleShare = async () => {
    const fullMessage = `${messages.shareMessage} ${inviteLink}`;
    
    try {
      // 1. Déclencher le partage natif ou copie
      if (navigator.share) {
        await navigator.share({
          title: "Caakus",
          text: fullMessage,
          url: inviteLink,
        });
      } else {
        await navigator.clipboard.writeText(fullMessage);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
      }

      // 2. CRÉATION DE L'ADDICTION : Récompense réelle dans Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // REMOVED: Free coin distribution - DESTROYS ECONOMY!
        /* REMOVED: Free coins code
        const { error } = await supabase
          .from('profiles')
          .update({ yuyu_score: supabase.rpc('increment', { row_id: user.id, x: 100 }) }) 
          .eq('id', user.id);

        if (!error) {
          triggerEpicConfetti();
          setShowRewardToast(true);
          setTimeout(() => setShowRewardToast(false), 4000);
          console.log("Score boosté ! +100 Yuyu");
        }
        */
      }
    } catch (err) {
      console.log("L'utilisateur a annulé ou erreur technique");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(text);
      triggerEpicConfetti();
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const closeWithAnimation = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 overflow-hidden antialiased">
      {/* OVERLAY DE FOND DYNAMIQUE */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-3xl transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeWithAnimation}
      />

      {/* SYSTÈME DE PARTICULES CSS GÉANTES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* MODAL PRINCIPAL ULTRA-LARGES */}
      <div 
        ref={modalRef}
        className={`relative w-full max-w-6xl bg-white dark:bg-[#030712] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'}`}
      >
        {/* LIGNE DE GRADIENT ANIMÉE SUPÉRIEURE */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 animate-gradient-x" />

        <div className="flex flex-col lg:flex-row min-h-[700px]">
          
          {/* SECTION GAUCHE : STORYTELLING & RECOMPENSES */}
          <div className="lg:w-[42%] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] p-10 sm:p-16 text-white relative flex flex-col justify-between overflow-hidden">
            
            {/* MOTIFS DE FOND GÉOMÉTRIQUES */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
              <div className="absolute bottom-20 right-10 w-60 h-60 border-2 border-white rounded-full opacity-20" />
            </div>

            <div className="relative z-10 space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 animate-bounce">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-black tracking-[0.2em] uppercase">{messages.rewardTitle}</span>
                </div>
                <h2 className="text-5xl sm:text-7xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                  {messages.title}
                </h2>
                <p className="text-xl text-indigo-100/80 leading-relaxed font-medium">
                  {messages.subtitle}
                </p>
              </div>

              {/* GRILLE DE RÉCOMPENSES DÉTAILLÉE */}
              <div className="grid gap-6">
                <div className="group flex items-center gap-6 p-6 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/10 transition-all duration-500">
                  <div className="p-4 bg-yellow-400 rounded-2xl group-hover:rotate-12 transition-transform">
                    <Zap className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">{messages.pointsLabel}</h4>
                    <p className="text-indigo-200/60 font-semibold">{messages.rewardSubtitle}</p>
                  </div>
                </div>

                <div className="group flex items-center gap-6 p-6 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/10 transition-all duration-500">
                  <div className="p-4 bg-fuchsia-500 rounded-2xl group-hover:-rotate-12 transition-transform">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">{messages.statusLabel}</h4>
                    <p className="text-indigo-200/60 font-semibold">Matching ultra-prioritaire</p>
                  </div>
                </div>

                <div className="group flex items-center gap-6 p-6 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/10 transition-all duration-500">
                  <div className="p-4 bg-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">Badge Ambassadeur</h4>
                    <p className="text-indigo-200/60 font-semibold">Visible sur votre profil public</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-12 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} className="w-12 h-12 rounded-full border-4 border-[#1e1b4b]" src={`https://i.pravatar.cc/100?u=caakus${i}`} alt="user" />
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-[#1e1b4b] bg-indigo-600 flex items-center justify-center text-xs font-bold">
                    +2k
                  </div>
                </div>
                <div className="text-sm">
                  <span className="block font-black text-white">{messages.viralGrowth}</span>
                  <span className="text-indigo-300 font-medium italic">+450% cette semaine</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION DROITE : ACTIONS ET RÉSEAUX */}
          <div className="lg:w-[58%] p-10 sm:p-20 relative flex flex-col bg-white dark:bg-[#030712]">
            
            <button 
              onClick={closeWithAnimation}
              className="absolute top-8 right-8 p-4 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-all hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-grow flex flex-col justify-center space-y-12">
              <div className="text-center lg:text-left space-y-4">
                <h3 className="text-3xl sm:text-4xl font-black dark:text-white">
                  {messages.callToAction}
                </h3>
                <div className="h-2 w-32 bg-indigo-600 rounded-full mx-auto lg:mx-0" />
              </div>

              {/* ÉTAPES INTERACTIVES ÉTENDUES */}
              <div className="grid gap-4">
                {[
                  { icon: <MessageCircle />, text: messages.step1, color: "text-green-500", bg: "bg-green-500/10" },
                  { icon: <Users />, text: messages.step2, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { icon: <Sparkles />, text: messages.step3, color: "text-purple-500", bg: "bg-purple-500/10" }
                ].map((step, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all duration-700 ${activeStep === idx ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 scale-[1.03] shadow-xl' : 'border-gray-100 dark:border-gray-800 opacity-60'}`}
                  >
                    <div className={`p-4 rounded-2xl ${activeStep === idx ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      {step.icon}
                    </div>
                    <span className={`text-xl font-bold ${activeStep === idx ? 'text-indigo-900 dark:text-white' : 'text-gray-400'}`}>
                      {step.text}
                    </span>
                    {activeStep === idx && <CheckCircle2 className="w-8 h-8 text-indigo-600 ml-auto animate-pulse" />}
                  </div>
                ))}
              </div>

              {/* PLATEFORMES DE PARTAGE AVEC HOVER EFFECTS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { icon: <MessageCircle />, name: "WhatsApp", color: "hover:bg-green-500" },
                  { icon: <Instagram />, name: "Instagram", color: "hover:bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" },
                  { icon: <Send />, name: "Telegram", color: "hover:bg-blue-500" },
                  { icon: <Copy />, name: "Copier", color: "hover:bg-black" }
                ].map((social, i) => (
                  <button 
                    key={i}
                    onClick={() => social.name === "Copier" ? copyToClipboard(inviteLink) : handleShare()}
                    className={`flex flex-col items-center justify-center p-8 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-transparent transition-all duration-500 hover:text-white group hover:shadow-2xl hover:-translate-y-2 ${social.color}`}
                  >
                    <div className="mb-4 transform group-hover:scale-125 transition-transform duration-500">
                      {social.icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">{social.name}</span>
                  </button>
                ))}
              </div>

              {/* WIDGET D'URGENCE ANIMÉ */}
              <div className="relative p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-[2rem] overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="relative flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <Flame className="w-8 h-8 animate-bounce" />
                    <span className="text-lg font-black uppercase tracking-tighter">{messages.urgency}</span>
                  </div>
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* BARRE D'ACTIONS FINALE */}
            <div className="mt-16 flex flex-col sm:flex-row gap-6">
              <button 
                onClick={handleShare}
                className="flex-[3] relative group h-24 overflow-hidden rounded-[2rem] bg-gray-900 dark:bg-white transition-all active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative flex items-center justify-center gap-4 text-white dark:text-gray-900 group-hover:text-white font-black text-2xl tracking-tight transition-colors">
                  <Rocket className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  <span>{isCopying ? messages.copySuccess : messages.shareButton}</span>
                </div>
              </button>
              
              <button 
                onClick={closeWithAnimation}
                className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black text-lg rounded-[2rem] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {messages.laterButton}
              </button>
            </div>
          </div>
        </div>

        {/* TOAST RÉCOMPENSE (FLOATING) */}
        {showRewardToast && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10002] flex items-center gap-4 px-8 py-4 bg-green-500 text-white rounded-full shadow-2xl animate-bounce">
            <Star className="w-6 h-6 fill-current" />
            <span className="font-black text-lg">+100 Yuyu CRÉDITÉS !</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s linear infinite;
        }
        .cubic-bezier {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ViralGrowthPopup;

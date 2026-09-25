import React from "react";
import { useNavigate, useParams } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AnonymousVoiceInterface } from "@/components/AnonymousVoiceInterface";
import { ArrowLeft, Mic, Waves, Volume2, Radio, Zap, Shield, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LottieAnimation } from "@/components/LottieAnimation";
import blinkingEyeAnimation from "@/assets/Blinking Eye.json";
import globeAnimation from "@/assets/globe.json";

export default function VoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const closeFeature = () => {
    navigate("/");
  };

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
      {/* Dynamic Background with multiple layers */}
      <div className="absolute inset-0 overflow-hidden">

        {/* Primary gradient orbs - responsive sizing */}
        <div className="absolute -top-40 -right-40 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-pink-400/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        
        {/* Secondary floating elements - responsive positioning */}
        <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-green-400/20 to-teal-500/20 rounded-full blur-2xl animate-float animation-delay-1000"></div>
        
        {/* Animated Lottie elements - mobile optimized */}
        <div className="absolute top-8 right-8 sm:top-16 sm:right-16 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 opacity-60 sm:opacity-40 animate-float">
          <LottieAnimation animationData={blinkingEyeAnimation} />
        </div>
        <div className="absolute bottom-8 left-8 sm:bottom-16 sm:left-16 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 opacity-50 sm:opacity-30 animate-float animation-delay-1000">
          <LottieAnimation animationData={globeAnimation} />
        </div>
        
        {/* Floating icons with enhanced animations - mobile responsive */}
        <div className="absolute top-1/4 left-4 sm:left-12 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 opacity-40 sm:opacity-30 animate-bounce">
          <Volume2 className="w-full h-full text-cyan-400 drop-shadow-lg" />
        </div>
        <div className="absolute top-3/4 right-4 sm:right-12 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 opacity-35 sm:opacity-25 animate-bounce animation-delay-500">
          <Radio className="w-full h-full text-pink-400 drop-shadow-lg" />
        </div>
        <div className="absolute top-1/2 right-1/6 sm:right-1/4 w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 opacity-30 sm:opacity-20 animate-bounce animation-delay-1000">
          <Zap className="w-full h-full text-yellow-400 drop-shadow-lg" />
        </div>
        
        {/* Enhanced animated dots - mobile visible */}
        <div className="absolute top-1/3 left-1/6 sm:left-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-cyan-400 rounded-full animate-ping shadow-lg"></div>
        <div className="absolute top-2/3 right-1/6 sm:right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-ping animation-delay-1000 shadow-lg"></div>
        <div className="absolute top-1/2 left-1/6 sm:left-1/3 w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-ping animation-delay-2000 shadow-lg"></div>
        <div className="absolute top-1/4 right-1/6 sm:right-1/3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-ping animation-delay-1500 shadow-lg"></div>
      </div>

      {/* Modern Header with responsive glass morphism */}
      <div className="relative z-10 bg-white/5 sm:bg-white/10 dark:bg-black/10 sm:dark:bg-black/20 backdrop-blur-sm sm:backdrop-blur-xl border-b border-white/10 sm:border-white/20 dark:border-white/5 sm:dark:border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeFeature}
                className="cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 text-white/90 hover:text-white backdrop-blur-sm border border-white/20 sm:text-base text-sm"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('common.back')}</span>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500/20 sm:from-indigo-500/30 to-purple-600/20 sm:to-purple-600/30 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/10 sm:border-white/20">
                  <Waves className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg">
                    {t('voicePage.title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/80 drop-shadow-md hidden sm:block">
                    {t('voicePage.subtitle')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 bg-white/5 sm:bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2 border border-white/10 sm:border-white/20">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-xs sm:text-sm text-white/90 font-medium">{t('common.live')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Responsive */}
      <div className="relative z-10 flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-5xl px-2 sm:px-4 lg:px-6">
          <div className="bg-white/5 sm:bg-white/10 backdrop-blur-sm sm:backdrop-blur-xl rounded-xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/10 sm:border-white/20 overflow-hidden">
            <AnonymousVoiceInterface closeFeature={closeFeature} sharedMessageId={id} />
          </div>
        </div>
      </div>

      {/* Enhanced Footer - Responsive */}
      <div className="relative z-10 bg-white/3 sm:bg-white/5 backdrop-blur-sm sm:backdrop-blur-xl border-t border-white/5 sm:border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-white/70">
            <div className="flex items-center gap-1 sm:gap-2 bg-white/5 sm:bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2 border border-white/10 sm:border-white/20">
              <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
              <span className="font-medium text-xs sm:text-sm">{t('voicePage.hd')}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-white/5 sm:bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2 border border-white/10 sm:border-white/20">
              <Waves className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="font-medium text-xs sm:text-sm">{t('voicePage.live')}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-white/5 sm:bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2 border border-white/10 sm:border-white/20">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
              <span className="font-medium text-xs sm:text-sm">{t('voicePage.secure')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

import { useEffect, useState, useRef, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { getLevelInfo, XP_PER_MINUTE_PRESENCE } from "@/services/progressionService";
import { supabase } from "@/config/supabase";
import { TABLES } from "@/config/supabase";
import { LevelBadge } from "@/components/LevelBadge";

interface LevelProgressBarProps {
  userId: string;
  initialXp: number;
  initialLevel: number;
  onLevelUp?: (newLevel: number) => void;
  onXpUpdate?: (newXp: number) => void;
  compact?: boolean;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  userId,
  initialXp,
  initialLevel,
  onLevelUp,
  onXpUpdate,
  compact = false,
}) => {
  const [currentXp, setCurrentXp] = useState(initialXp);
  const calculatedLevelInfo = getLevelInfo(initialXp);
  const [levelInfo, setLevelInfo] = useState({
    ...calculatedLevelInfo,
    level: initialLevel
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousLevelRef = useRef(initialLevel);
  const onXpUpdateRef = useRef(onXpUpdate);
  const onLevelUpRef = useRef(onLevelUp);
  onXpUpdateRef.current = onXpUpdate;
  onLevelUpRef.current = onLevelUp;

  // XP is awarded globally by GlobalLevelProgress (1 XP per minute on any page). We only display and sync here.
  const XP_PER_MINUTE = XP_PER_MINUTE_PRESENCE;
  const DB_SYNC_INTERVAL = 120000; // Sync with DB every 2 minutes for freshness

  // Sync from parent: never overwrite with stale lower values (fixes client appearing stuck)
  useEffect(() => {
    setCurrentXp(prev => (initialXp > prev ? initialXp : prev));
    if (initialLevel > previousLevelRef.current) {
      previousLevelRef.current = initialLevel;
    }
  }, [initialXp, initialLevel]);

  // Periodic DB sync: only ever increase currentXp (never go backwards) to prevent 7%→8%→7% flip-flop
  const syncFromDatabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('total_xp, level')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const dbXp = data.total_xp ?? 0;
        const dbLevel = data.level ?? 1;
        // NOTE: never call parent callbacks inside a state updater (React may
        // invoke it twice) -> caused "Maximum update depth exceeded"
        setCurrentXp((prev) => (dbXp >= prev ? dbXp : prev));
        if (dbLevel > previousLevelRef.current) {
          previousLevelRef.current = dbLevel;
          onLevelUpRef.current?.(dbLevel);
        }
      }
    } catch {
      // Silent fail - will retry on next interval
    }
  }, [userId]);

  useEffect(() => {
    syncFromDatabase();
    syncTimerRef.current = setInterval(syncFromDatabase, DB_SYNC_INTERVAL);
    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [syncFromDatabase, DB_SYNC_INTERVAL]);

  // XP/level is intentionally NOT realtime. The users row is written on almost
  // every user action (last_active_at, streaks, balances), so a subscription
  // here produced a realtime message per write for a purely cosmetic bar.
  // The periodic DB sync above already keeps it accurate.

  // Notify the parent AFTER commit (never during a state update) to avoid
  // cross-component update loops.
  const lastReportedXpRef = useRef(initialXp);
  useEffect(() => {
    if (currentXp > lastReportedXpRef.current) {
      lastReportedXpRef.current = currentXp;
      onXpUpdateRef.current?.(currentXp);
    }
  }, [currentXp]);

  useEffect(() => {
    const calculatedInfo = getLevelInfo(currentXp);
    const displayedLevel = Math.max(calculatedInfo.level, previousLevelRef.current);
    const useCalculatedLevel = calculatedInfo.level >= previousLevelRef.current;

    setLevelInfo({
      ...calculatedInfo,
      level: displayedLevel,
      progress: useCalculatedLevel ? calculatedInfo.progress : 0,
      xpToNext: calculatedInfo.xpToNext,
    });

    // Check for level up
    if (calculatedInfo.level > previousLevelRef.current) {
      setIsAnimating(true);
      toast.success(
        `Level Up! You've reached Level ${calculatedInfo.level}!`,
        {
          duration: 5000,
          icon: "🎊",
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontWeight: "bold",
          },
        }
      );
      onLevelUpRef.current?.(calculatedInfo.level);
      previousLevelRef.current = calculatedInfo.level;

      setTimeout(() => setIsAnimating(false), 2000);
    }
    // onLevelUp is read through a ref: unstable inline callbacks must not
    // retrigger this effect (update-loop guard)
  }, [currentXp]);

  // XP is awarded by GlobalLevelProgress every minute on any page; sync/realtime above update display.

  const getLevelTitle = (level: number) => {
    if (level >= 100) return 'Legendary';
    if (level >= 51) return 'VIP';
    if (level >= 11) return 'Professional';
    return 'Rising Star';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-yellow-400 via-orange-400 to-red-500';
    if (progress >= 50) return 'from-purple-400 via-pink-400 to-red-500';
    if (progress >= 25) return 'from-blue-400 via-indigo-400 to-purple-500';
    return 'from-green-400 via-blue-400 to-indigo-500';
  };

  // Compact mode — small so level system doesn’t dominate the card
  if (compact) {
    return (
      <div className="w-full space-y-0.5 sm:space-y-1">
        <div className="flex items-center justify-between gap-0.5 sm:gap-1">
          <div className="flex items-center gap-0.5 sm:gap-1.5 min-w-0">
            <LevelBadge level={levelInfo.level} size="xs" />
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-white whitespace-nowrap">Lv {levelInfo.level}</span>
            <span className="text-[6px] sm:text-[10px] text-gray-400 hidden sm:inline">·</span>
            <span className="text-[6px] sm:text-[9px] font-medium text-gray-400 truncate max-w-[2.5rem] sm:max-w-none">{levelInfo.badgeName || getLevelTitle(levelInfo.level)}</span>
            <Badge className={`bg-gradient-to-r ${getProgressColor(levelInfo.progress)} text-white border-none text-[6px] sm:text-[8px] px-0.5 sm:px-1 py-0 font-bold leading-tight ${isAnimating ? 'animate-pulse' : ''}`}>{levelInfo.progress}%</Badge>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {xpGained > 0 && <span className="text-[6px] sm:text-[9px] font-bold text-green-400 animate-fade-in-up">+{xpGained}</span>}
            <span className="text-[6px] sm:text-[9px] text-gray-400">{currentXp.toLocaleString()} XP</span>
          </div>
        </div>
        <div className="relative">
          <Progress value={levelInfo.progress} className="h-0.5 sm:h-1.5 bg-gray-800/50" />
          <div className={`absolute top-0 left-0 h-0.5 sm:h-1.5 bg-gradient-to-r ${getProgressColor(levelInfo.progress)} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, Math.max(0, levelInfo.progress))}%` }}>
            <div className="absolute inset-0 bg-white/30 rounded-full animate-shimmer-slow" />
          </div>
        </div>
        <div className="flex items-center justify-between text-[5px] sm:text-[8px]">
          <div className="flex items-center gap-0.5 text-gray-500">
            <Zap className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 text-yellow-400" />
            <span>+{XP_PER_MINUTE} XP/min</span>
          </div>
          {levelInfo.level < 100 ? (
            <span className="text-indigo-300/80 truncate max-w-[3.5rem] sm:max-w-none">{levelInfo.xpToNext} → Lv{levelInfo.level + 1}</span>
          ) : (
            <span className="text-yellow-400 font-semibold">Max!</span>
          )}
        </div>
      </div>
    );
  }

  // Full mode (original design)
  return (
    <div className="w-full space-y-3">
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`relative ${isAnimating ? 'animate-bounce' : ''}`}>
            <LevelBadge level={levelInfo.level} size="lg" />
            {isAnimating && (
              <div className="absolute inset-0 bg-yellow-400/50 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-white">
                Level {levelInfo.level}
              </h3>
              <Badge className={`bg-gradient-to-r ${getProgressColor(levelInfo.progress)} text-white border-none text-xs px-3 py-1 font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
                {levelInfo.badgeName || getLevelTitle(levelInfo.level)}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {levelInfo.level >= 100 ? 'Maximum Level Reached!' : `${levelInfo.xpToNext} XP to Level ${levelInfo.level + 1}`}
            </p>
          </div>
        </div>

        {/* XP Gain Indicator */}
        {xpGained > 0 && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/40 rounded-lg px-3 py-1.5 animate-fade-in-up">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-300">+{xpGained} XP</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-30 animate-pulse-gentle" />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="space-y-3">
            {/* Progress Percentage and Stats */}
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                <span className="text-gray-300">Progress</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-300">{levelInfo.progress}%</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{currentXp.toLocaleString()} Total XP</span>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="relative">
              <Progress 
                value={levelInfo.progress} 
                className="h-3 bg-gray-800/50"
              />
              {/* Glow effect on progress */}
              <div 
                className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${getProgressColor(levelInfo.progress)} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${levelInfo.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-full animate-shimmer-slow" />
              </div>
            </div>

            {/* XP Info */}
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>+{XP_PER_MINUTE} XP per minute</span>
              </div>
              {levelInfo.level < 100 && (
                <span className="text-indigo-300">
                  {Math.ceil(levelInfo.xpToNext / XP_PER_MINUTE)} min to next level
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {levelInfo.level < 100 && levelInfo.progress >= 80 && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg px-3 py-2 animate-fade-in-up">
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-xs font-bold text-purple-200">
            Almost there! Keep going to reach Level {levelInfo.level + 1}! 🚀
          </span>
        </div>
      )}
    </div>
  );
};

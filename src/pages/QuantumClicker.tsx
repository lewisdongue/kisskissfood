// src/pages/QuantumClicker.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Zap, 
  Atom, 
  Sparkles, 
  Crown, 
  Trophy, 
  Star,
  Rocket,
  Globe,
  Infinity as InfinityIcon,
  TrendingUp,
  Award,
  Target,
  RefreshCw,
  Volume2,
  VolumeX,
  X,
  Check,
  Lock,
  LockOpen,
  ArrowLeft,
  Gamepad2,
  Car,
  Gauge,
  Flag,
  Timer,
  Coins,
  Settings,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { ParticleBackground } from "@/components/ParticleBackground";

// ==================== TYPES ====================

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'click' | 'auto' | 'prestige' | 'speed';
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  currentCost: number;
  owned: number;
  production: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  unlockThreshold: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  unlocked: boolean;
  icon: React.ComponentType<{ className?: string }>;
  requirement: number;
  type: 'energy' | 'clicks' | 'upgrades' | 'prestige' | 'race' | 'distance';
}

interface GameStats {
  totalEnergy: number;
  totalClicks: number;
  totalUpgrades: number;
  prestigeCount: number;
  lifetimeEnergy: number;
  startTime: number;
  playTime: number;
  totalRaces: number;
  totalDistance: number;
  bestTime: number;
}

interface SaveData {
  energy: number;
  energyPerClick: number;
  energyPerSecond: number;
  upgrades: Array<{
    id: string;
    owned: number;
    currentCost: number;
  }>;
  achievements: Array<{
    id: string;
    unlocked: boolean;
  }>;
  stats: GameStats;
  prestigePoints: number;
  prestigeMultiplier: number;
  lastSaveTime: number;
  soundEnabled: boolean;
  racingCoins: number;
  unlockedCars: string[];
  selectedCar: string;
}

interface RaceCar {
  id: string;
  name: string;
  color: string;
  speed: number;
  acceleration: number;
  handling: number;
  cost: number;
  unlocked: boolean;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cone' | 'barrier' | 'oil';
}

// ==================== CONSTANTS ====================

const SAVE_KEY = "quantum_gaming_hub_v1";
const SAVE_INTERVAL = 5000;
const PRESTIGE_THRESHOLD = 1e12;
const OFFLINE_PRODUCTION_CAP = 3600;

const UPGRADE_COLORS = {
  tier1: "from-blue-500 to-cyan-500",
  tier2: "from-purple-500 to-pink-500",
  tier3: "from-orange-500 to-red-500",
  tier4: "from-emerald-500 to-teal-500",
  tier5: "from-yellow-500 to-amber-500",
  tier6: "from-indigo-500 to-violet-500",
};

const RACING_TRACK_WIDTH = 400;
const RACING_TRACK_HEIGHT = 600;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;

// ==================== INITIAL DATA ====================

const createInitialUpgrades = (): Upgrade[] => [
  {
    id: "cursor",
    name: "Quantum Cursor",
    description: "+1 energy per click",
    baseCost: 15,
    currentCost: 15,
    owned: 0,
    production: 0,
    icon: Zap,
    color: UPGRADE_COLORS.tier1,
    unlockThreshold: 0,
  },
  {
    id: "atom",
    name: "Atom Generator",
    description: "+0.1 energy/sec",
    baseCost: 100,
    currentCost: 100,
    owned: 0,
    production: 0.1,
    icon: Atom,
    color: UPGRADE_COLORS.tier1,
    unlockThreshold: 0,
  },
  {
    id: "molecule",
    name: "Molecule Synthesizer",
    description: "+1 energy/sec",
    baseCost: 1100,
    currentCost: 1100,
    owned: 0,
    production: 1,
    icon: Sparkles,
    color: UPGRADE_COLORS.tier2,
    unlockThreshold: 500,
  },
  {
    id: "particle",
    name: "Particle Accelerator",
    description: "+8 energy/sec",
    baseCost: 12000,
    currentCost: 12000,
    owned: 0,
    production: 8,
    icon: Target,
    color: UPGRADE_COLORS.tier2,
    unlockThreshold: 5000,
  },
  {
    id: "reactor",
    name: "Fusion Reactor",
    description: "+47 energy/sec",
    baseCost: 130000,
    currentCost: 130000,
    owned: 0,
    production: 47,
    icon: Rocket,
    color: UPGRADE_COLORS.tier3,
    unlockThreshold: 50000,
  },
  {
    id: "star",
    name: "Star Forge",
    description: "+260 energy/sec",
    baseCost: 1400000,
    currentCost: 1400000,
    owned: 0,
    production: 260,
    icon: Star,
    color: UPGRADE_COLORS.tier3,
    unlockThreshold: 500000,
  },
  {
    id: "nebula",
    name: "Nebula Harvester",
    description: "+1400 energy/sec",
    baseCost: 20000000,
    currentCost: 20000000,
    owned: 0,
    production: 1400,
    icon: Globe,
    color: UPGRADE_COLORS.tier4,
    unlockThreshold: 5000000,
  },
  {
    id: "galaxy",
    name: "Galaxy Generator",
    description: "+7800 energy/sec",
    baseCost: 330000000,
    currentCost: 330000000,
    owned: 0,
    production: 7800,
    icon: TrendingUp,
    color: UPGRADE_COLORS.tier4,
    unlockThreshold: 100000000,
  },
  {
    id: "blackhole",
    name: "Black Hole Engine",
    description: "+44000 energy/sec",
    baseCost: 5100000000,
    currentCost: 5100000000,
    owned: 0,
    production: 44000,
    icon: InfinityIcon,
    color: UPGRADE_COLORS.tier5,
    unlockThreshold: 1000000000,
  },
  {
    id: "dimension",
    name: "Dimension Rift",
    description: "+260000 energy/sec",
    baseCost: 75000000000,
    currentCost: 75000000000,
    owned: 0,
    production: 260000,
    icon: Crown,
    color: UPGRADE_COLORS.tier5,
    unlockThreshold: 10000000000,
  },
  {
    id: "universe",
    name: "Universe Fabric",
    description: "+1600000 energy/sec",
    baseCost: 1000000000000,
    currentCost: 1000000000000,
    owned: 0,
    production: 1600000,
    icon: Award,
    color: UPGRADE_COLORS.tier6,
    unlockThreshold: 100000000000,
  },
  {
    id: "multiverse",
    name: "Multiverse Core",
    description: "+10000000 energy/sec",
    baseCost: 14000000000000,
    currentCost: 14000000000000,
    owned: 0,
    production: 10000000,
    icon: Trophy,
    color: UPGRADE_COLORS.tier6,
    unlockThreshold: 500000000000,
  },
];

const createInitialAchievements = (): Achievement[] => [
  {
    id: "first_click",
    name: "First Spark",
    description: "Click for the first time",
    reward: 10,
    unlocked: false,
    icon: Zap,
    requirement: 1,
    type: "clicks",
  },
  {
    id: "hundred_energy",
    name: "Energy Novice",
    description: "Reach 100 energy",
    reward: 50,
    unlocked: false,
    icon: Star,
    requirement: 100,
    type: "energy",
  },
  {
    id: "thousand_energy",
    name: "Energy Adept",
    description: "Reach 1,000 energy",
    reward: 500,
    unlocked: false,
    icon: Sparkles,
    requirement: 1000,
    type: "energy",
  },
  {
    id: "million_energy",
    name: "Energy Master",
    description: "Reach 1 Million energy",
    reward: 50000,
    unlocked: false,
    icon: Crown,
    requirement: 1000000,
    type: "energy",
  },
  {
    id: "billion_energy",
    name: "Energy God",
    description: "Reach 1 Billion energy",
    reward: 10000000,
    unlocked: false,
    icon: Trophy,
    requirement: 1000000000,
    type: "energy",
  },
  {
    id: "hundred_clicks",
    name: "Clicker",
    description: "Click 100 times",
    reward: 100,
    unlocked: false,
    icon: Target,
    requirement: 100,
    type: "clicks",
  },
  {
    id: "thousand_clicks",
    name: "Power Clicker",
    description: "Click 1,000 times",
    reward: 1000,
    unlocked: false,
    icon: Zap,
    requirement: 1000,
    type: "clicks",
  },
  {
    id: "ten_upgrades",
    name: "Upgrader",
    description: "Purchase 10 total upgrades",
    reward: 500,
    unlocked: false,
    icon: TrendingUp,
    requirement: 10,
    type: "upgrades",
  },
  {
    id: "hundred_upgrades",
    name: "Upgrade Master",
    description: "Purchase 100 total upgrades",
    reward: 50000,
    unlocked: false,
    icon: Award,
    requirement: 100,
    type: "upgrades",
  },
  {
    id: "first_prestige",
    name: "Ascension Beginner",
    description: "Prestige for the first time",
    reward: 1000000,
    unlocked: false,
    icon: Rocket,
    requirement: 1,
    type: "prestige",
  },
  {
    id: "first_race",
    name: "Speed Demon",
    description: "Complete your first race",
    reward: 1000,
    unlocked: false,
    icon: Flag,
    requirement: 1,
    type: "race",
  },
  {
    id: "distance_1000",
    name: "Road Warrior",
    description: "Travel 1000m total",
    reward: 5000,
    unlocked: false,
    icon: Gauge,
    requirement: 1000,
    type: "distance",
  },
];

const createInitialCars = (): RaceCar[] => [
  {
    id: "basic",
    name: "Starter Kart",
    color: "#3b82f6",
    speed: 5,
    acceleration: 1,
    handling: 1,
    cost: 0,
    unlocked: true,
  },
  {
    id: "sport",
    name: "Sport Coupe",
    color: "#ef4444",
    speed: 7,
    acceleration: 1.5,
    handling: 1.3,
    cost: 1000,
    unlocked: false,
  },
  {
    id: "muscle",
    name: "Muscle Car",
    color: "#f59e0b",
    speed: 9,
    acceleration: 2,
    handling: 1.5,
    cost: 5000,
    unlocked: false,
  },
  {
    id: "supercar",
    name: "Hyperion GT",
    color: "#8b5cf6",
    speed: 12,
    acceleration: 3,
    handling: 2,
    cost: 20000,
    unlocked: false,
  },
  {
    id: "ultimate",
    name: "Quantum Racer",
    color: "#ec4899",
    speed: 15,
    acceleration: 4,
    handling: 3,
    cost: 100000,
    unlocked: false,
  },
];

// ==================== MAIN COMPONENT ====================

export default function QuantumGamingHub() {
  // Game selection
  const [selectedGame, setSelectedGame] = useState<'menu' | 'clicker' | 'racing'>('menu');

  // Quantum Clicker state
  const [energy, setEnergy] = useState(0);
  const [energyPerClick, setEnergyPerClick] = useState(1);
  const [energyPerSecond, setEnergyPerSecond] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(createInitialUpgrades());
  const [achievements, setAchievements] = useState<Achievement[]>(createInitialAchievements());
  const [prestigePoints, setPrestigePoints] = useState(0);
  const [prestigeMultiplier, setPrestigeMultiplier] = useState(1);

  // Racing game state
  const [racingCoins, setRacingCoins] = useState(0);
  const [cars, setCars] = useState<RaceCar[]>(createInitialCars());
  const [selectedCar, setSelectedCar] = useState("basic");
  const [carX, setCarX] = useState(RACING_TRACK_WIDTH / 2 - CAR_WIDTH / 2);
  const [carY, setCarY] = useState(RACING_TRACK_HEIGHT - CAR_HEIGHT - 50);
  const [carSpeed, setCarSpeed] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [raceDistance, setRaceDistance] = useState(0);
  const [raceTime, setRaceTime] = useState(0);
  const [raceActive, setRaceActive] = useState(false);
  const [racePaused, setRacePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // UI state
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [showAchievementNotif, setShowAchievementNotif] = useState(false);
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'upgrades' | 'achievements' | 'stats'>('upgrades');

  // Stats
  const [stats, setStats] = useState<GameStats>({
    totalEnergy: 0,
    totalClicks: 0,
    totalUpgrades: 0,
    prestigeCount: 0,
    lifetimeEnergy: 0,
    startTime: Date.now(),
    playTime: 0,
    totalRaces: 0,
    totalDistance: 0,
    bestTime: 0,
  });

  // Refs
  const particleIdCounter = useRef(0);
  const lastTickTime = useRef(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const obstacleIdCounter = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());

  // ==================== FORMATTED NUMBERS ====================

  const formatNumber = (num: number): string => {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(2) + "K";
    if (num < 1000000000) return (num / 1000000).toFixed(2) + "M";
    if (num < 1000000000000) return (num / 1000000000).toFixed(2) + "B";
    if (num < 1000000000000000) return (num / 1000000000000).toFixed(2) + "T";
    return (num / 1000000000000000).toFixed(2) + "Q";
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatRaceTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // ==================== PARTICLE SYSTEM ====================

  const createParticle = useCallback((x: number, y: number, type: Particle['type'] = 'click') => {
    const colors = {
      click: ['#3b82f6', '#8b5cf6', '#ec4899'],
      auto: ['#10b981', '#14b8a6', '#06b6d4'],
      prestige: ['#f59e0b', '#f97316', '#ef4444'],
      speed: ['#fbbf24', '#f59e0b', '#ef4444'],
    };

    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;

    const particle: Particle = {
      id: particleIdCounter.current++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      maxLife: 1,
      size: 4 + Math.random() * 4,
      color: colors[type][Math.floor(Math.random() * colors[type].length)],
      type,
    };

    setParticles(prev => [...prev, particle]);
  }, []);

  const updateParticles = useCallback(() => {
    setParticles(prev => {
      return prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2,
          life: p.life - 0.02,
        }))
        .filter(p => p.life > 0);
    });
  }, []);

  // ==================== QUANTUM CLICKER HANDLERS ====================

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setEnergy(prev => prev + energyPerClick * prestigeMultiplier);
    setStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      totalEnergy: prev.totalEnergy + energyPerClick * prestigeMultiplier,
      lifetimeEnergy: prev.lifetimeEnergy + energyPerClick * prestigeMultiplier,
    }));

    for (let i = 0; i < 3; i++) {
      createParticle(x, y, 'click');
    }

    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }, [energyPerClick, prestigeMultiplier, soundEnabled, createParticle]);

  const calculateUpgradeCost = (baseCost: number, owned: number): number => {
    return Math.floor(baseCost * Math.pow(1.15, owned));
  };

  const buyUpgrade = useCallback((upgradeId: string) => {
    setUpgrades(prev => {
      const upgrade = prev.find(u => u.id === upgradeId);
      if (!upgrade || energy < upgrade.currentCost) return prev;

      setEnergy(e => e - upgrade.currentCost);
      setStats(s => ({
        ...s,
        totalUpgrades: s.totalUpgrades + 1,
      }));

      return prev.map(u => {
        if (u.id === upgradeId) {
          const newOwned = u.owned + 1;
          const newCost = calculateUpgradeCost(u.baseCost, newOwned);

          if (u.id === 'cursor') {
            setEnergyPerClick(prev => prev + 1);
          } else {
            setEnergyPerSecond(prev => prev + u.production * prestigeMultiplier);
          }

          return {
            ...u,
            owned: newOwned,
            currentCost: newCost,
          };
        }
        return u;
      });
    });
  }, [energy, prestigeMultiplier]);

  const buyMaxUpgrade = useCallback((upgradeId: string) => {
    setUpgrades(prev => {
      const upgrade = prev.find(u => u.id === upgradeId);
      if (!upgrade) return prev;

      let currentEnergy = energy;
      let bought = 0;
      let currentOwned = upgrade.owned;

      while (currentEnergy >= calculateUpgradeCost(upgrade.baseCost, currentOwned) && bought < 100) {
        const cost = calculateUpgradeCost(upgrade.baseCost, currentOwned);
        currentEnergy -= cost;
        currentOwned++;
        bought++;
      }

      if (bought === 0) return prev;

      setEnergy(currentEnergy);
      setStats(s => ({
        ...s,
        totalUpgrades: s.totalUpgrades + bought,
      }));

      return prev.map(u => {
        if (u.id === upgradeId) {
          const newCost = calculateUpgradeCost(u.baseCost, currentOwned);

          if (u.id === 'cursor') {
            setEnergyPerClick(prev => prev + bought);
          } else {
            setEnergyPerSecond(prev => prev + (u.production * bought * prestigeMultiplier));
          }

          return {
            ...u,
            owned: currentOwned,
            currentCost: newCost,
          };
        }
        return u;
      });
    });
  }, [energy, prestigeMultiplier]);

  const calculatePrestigeGain = useCallback((currentEnergy: number): number => {
    if (currentEnergy < PRESTIGE_THRESHOLD) return 0;
    return Math.floor(Math.sqrt(currentEnergy / PRESTIGE_THRESHOLD));
  }, []);

  const handlePrestige = useCallback(() => {
    const gain = calculatePrestigeGain(energy);
    if (gain === 0) return;

    setPrestigePoints(prev => prev + gain);
    const newMultiplier = 1 + ((prestigePoints + gain) * 0.01);
    setPrestigeMultiplier(newMultiplier);

    setStats(prev => ({
      ...prev,
      prestigeCount: prev.prestigeCount + 1,
    }));

    setEnergy(0);
    setEnergyPerClick(1);
    setEnergyPerSecond(0);
    setUpgrades(createInitialUpgrades());
    setShowPrestigeModal(false);
  }, [energy, prestigePoints, calculatePrestigeGain]);

  // ==================== RACING GAME HANDLERS ====================

  const startRace = useCallback(() => {
    setRaceActive(true);
    setGameOver(false);
    setRaceDistance(0);
    setRaceTime(0);
    setCarSpeed(0);
    setCarX(RACING_TRACK_WIDTH / 2 - CAR_WIDTH / 2);
    setCarY(RACING_TRACK_HEIGHT - CAR_HEIGHT - 50);
    setObstacles([]);
    setRacePaused(false);
  }, []);

  const pauseRace = useCallback(() => {
    setRacePaused(prev => !prev);
  }, []);

  const endRace = useCallback((crashed: boolean) => {
    setRaceActive(false);
    setGameOver(true);

    if (!crashed) {
      const reward = Math.floor(raceDistance / 10);
      setRacingCoins(prev => prev + reward);
      setStats(prev => ({
        ...prev,
        totalRaces: prev.totalRaces + 1,
        totalDistance: prev.totalDistance + raceDistance,
        bestTime: prev.bestTime === 0 || raceTime < prev.bestTime ? raceTime : prev.bestTime,
      }));
    }
  }, [raceDistance, raceTime]);

  const buyCar = useCallback((carId: string) => {
    setCars(prev => {
      const car = prev.find(c => c.id === carId);
      if (!car || car.unlocked || racingCoins < car.cost) return prev;

      setRacingCoins(c => c - car.cost);
      return prev.map(c => c.id === carId ? { ...c, unlocked: true } : c);
    });
  }, [racingCoins]);

  const createObstacle = useCallback(() => {
    const types: Obstacle['type'][] = ['cone', 'barrier', 'oil'];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (RACING_TRACK_WIDTH - 50);

    const obstacle: Obstacle = {
      id: obstacleIdCounter.current++,
      x,
      y: -50,
      width: type === 'oil' ? 60 : 40,
      height: type === 'oil' ? 40 : 50,
      type,
    };

    setObstacles(prev => [...prev, obstacle]);
  }, []);

  // ==================== RACING GAME LOOP ====================

  const updateRacingGame = useCallback(() => {
    if (!raceActive || racePaused) return;

    const currentCar = cars.find(c => c.id === selectedCar)!;

    // Update car movement
    let newX = carX;
    let newSpeed = carSpeed;

    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
      newX = Math.max(0, carX - (5 * currentCar.handling));
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
      newX = Math.min(RACING_TRACK_WIDTH - CAR_WIDTH, carX + (5 * currentCar.handling));
    }
    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
      newSpeed = Math.min(currentCar.speed * 10, carSpeed + currentCar.acceleration);
    }
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
      newSpeed = Math.max(0, carSpeed - (currentCar.acceleration * 1.5));
    }

    // Natural deceleration
    if (!keysPressed.current.has('ArrowUp') && !keysPressed.current.has('w')) {
      newSpeed = Math.max(0, carSpeed - 0.2);
    }

    setCarX(newX);
    setCarSpeed(newSpeed);

    // Update distance and time
    setRaceDistance(prev => prev + newSpeed / 10);
    setRaceTime(prev => prev + 16); // ~60fps

    // Update obstacles
    setObstacles(prev => {
      const updated = prev
        .map(obs => ({ ...obs, y: obs.y + newSpeed }))
        .filter(obs => obs.y < RACING_TRACK_HEIGHT + 100);

      // Check collisions
      for (const obs of updated) {
        if (
          carX < obs.x + obs.width &&
          carX + CAR_WIDTH > obs.x &&
          carY < obs.y + obs.height &&
          carY + CAR_HEIGHT > obs.y
        ) {
          endRace(true);
          return prev;
        }
      }

      return updated;
    });

    // Create new obstacles
    if (Math.random() < 0.02 + (raceDistance / 100000)) {
      createObstacle();
    }

    // Create speed particles
    if (newSpeed > currentCar.speed * 5) {
      if (Math.random() < 0.3) {
        createParticle(
          carX + CAR_WIDTH / 2,
          carY + CAR_HEIGHT,
          'speed'
        );
      }
    }
  }, [raceActive, racePaused, carX, carSpeed, cars, selectedCar, raceDistance, carY, endRace, createObstacle, createParticle]);

  // ==================== ACHIEVEMENTS ====================

  const checkAchievements = useCallback(() => {
    setAchievements(prev => {
      let updated = false;
      const newAchievements = prev.map(achievement => {
        if (achievement.unlocked) return achievement;

        let shouldUnlock = false;

        switch (achievement.type) {
          case 'energy':
            shouldUnlock = energy >= achievement.requirement;
            break;
          case 'clicks':
            shouldUnlock = stats.totalClicks >= achievement.requirement;
            break;
          case 'upgrades':
            shouldUnlock = stats.totalUpgrades >= achievement.requirement;
            break;
          case 'prestige':
            shouldUnlock = stats.prestigeCount >= achievement.requirement;
            break;
          case 'race':
            shouldUnlock = stats.totalRaces >= achievement.requirement;
            break;
          case 'distance':
            shouldUnlock = stats.totalDistance >= achievement.requirement;
            break;
        }

        if (shouldUnlock) {
          updated = true;
          setEnergy(e => e + achievement.reward);
          setLatestAchievement(achievement);
          setShowAchievementNotif(true);
          setTimeout(() => setShowAchievementNotif(false), 3000);

          return { ...achievement, unlocked: true };
        }

        return achievement;
      });

      return updated ? newAchievements : prev;
    });
  }, [energy, stats]);

  // ==================== GAME LOOP ====================

  const gameLoop = useCallback(() => {
    const now = Date.now();
    const delta = (now - lastTickTime.current) / 1000;
    lastTickTime.current = now;

    // Quantum Clicker logic
    if (selectedGame === 'clicker' && energyPerSecond > 0) {
      const passiveGain = energyPerSecond * delta;
      setEnergy(prev => prev + passiveGain);
      setStats(prev => ({
        ...prev,
        totalEnergy: prev.totalEnergy + passiveGain,
        lifetimeEnergy: prev.lifetimeEnergy + passiveGain,
      }));
    }

    // Racing game logic
    if (selectedGame === 'racing') {
      updateRacingGame();
    }

    // Update particles
    updateParticles();

    // Update play time
    setStats(prev => ({
      ...prev,
      playTime: now - prev.startTime,
    }));

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [selectedGame, energyPerSecond, updateRacingGame, updateParticles]);

  // ==================== KEYBOARD CONTROLS ====================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ==================== SAVE/LOAD ====================

  const saveGame = useCallback(() => {
    const saveData: SaveData = {
      energy,
      energyPerClick,
      energyPerSecond,
      // Only store serializable state (icons/components cannot be JSON-serialized)
      upgrades: upgrades.map((u) => ({
        id: u.id,
        owned: u.owned,
        currentCost: u.currentCost,
      })),
      achievements: achievements.map((a) => ({
        id: a.id,
        unlocked: a.unlocked,
      })),
      stats,
      prestigePoints,
      prestigeMultiplier,
      lastSaveTime: Date.now(),
      soundEnabled,
      racingCoins,
      unlockedCars: cars.filter(c => c.unlocked).map(c => c.id),
      selectedCar,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }, [energy, energyPerClick, energyPerSecond, upgrades, achievements, stats, prestigePoints, prestigeMultiplier, soundEnabled, racingCoins, cars, selectedCar]);

  const loadGame = useCallback(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return;

    try {
      const data: SaveData = JSON.parse(savedData);
      
      const offlineTime = Math.min(
        (Date.now() - data.lastSaveTime) / 1000,
        OFFLINE_PRODUCTION_CAP
      );
      const offlineEarnings = data.energyPerSecond * offlineTime;

      setEnergy(data.energy + offlineEarnings);
      setEnergyPerClick(data.energyPerClick);
      setEnergyPerSecond(data.energyPerSecond);

      // Rehydrate upgrades/achievements from initial definitions so icons/components remain valid.
      const baseUpgrades = createInitialUpgrades();
      const savedUpgrades = Array.isArray((data as any).upgrades) ? (data as any).upgrades : [];
      const mergedUpgrades = baseUpgrades.map((u) => {
        const saved = savedUpgrades.find((su: any) => su && su.id === u.id);
        const owned = typeof saved?.owned === "number" ? saved.owned : Number(saved?.owned) || 0;
        const currentCost =
          typeof saved?.currentCost === "number"
            ? saved.currentCost
            : Number(saved?.currentCost) || calculateUpgradeCost(u.baseCost, owned);
        return {
          ...u,
          owned,
          currentCost,
        };
      });
      setUpgrades(mergedUpgrades);

      const baseAchievements = createInitialAchievements();
      const savedAchievements = Array.isArray((data as any).achievements) ? (data as any).achievements : [];
      const mergedAchievements = baseAchievements.map((a) => {
        const saved = savedAchievements.find((sa: any) => sa && sa.id === a.id);
        const unlocked = typeof saved?.unlocked === "boolean" ? saved.unlocked : Boolean(saved?.unlocked);
        return {
          ...a,
          unlocked,
        };
      });
      setAchievements(mergedAchievements);

      setStats(data.stats);
      setPrestigePoints(data.prestigePoints);
      setPrestigeMultiplier(data.prestigeMultiplier);
      setSoundEnabled(data.soundEnabled);
      setRacingCoins(data.racingCoins || 0);
      setSelectedCar(data.selectedCar || "basic");

      if (data.unlockedCars) {
        setCars(prev => prev.map(c => ({
          ...c,
          unlocked: data.unlockedCars.includes(c.id) || c.id === 'basic',
        })));
      }

      if (offlineEarnings > 0) {
        setTimeout(() => {
          alert(`Welcome back! You earned ${formatNumber(offlineEarnings)} energy while offline!`);
        }, 500);
      }
    } catch (error) {
      console.error("Failed to load save:", error);
    }
  }, []);

  const resetGame = useCallback(() => {
    if (!window.confirm("Are you sure you want to reset ALL progress? This cannot be undone!")) {
      return;
    }

    localStorage.removeItem(SAVE_KEY);
    setEnergy(0);
    setEnergyPerClick(1);
    setEnergyPerSecond(0);
    setUpgrades(createInitialUpgrades());
    setAchievements(createInitialAchievements());
    setPrestigePoints(0);
    setPrestigeMultiplier(1);
    setRacingCoins(0);
    setCars(createInitialCars());
    setSelectedCar("basic");
    setStats({
      totalEnergy: 0,
      totalClicks: 0,
      totalUpgrades: 0,
      prestigeCount: 0,
      lifetimeEnergy: 0,
      startTime: Date.now(),
      playTime: 0,
      totalRaces: 0,
      totalDistance: 0,
      bestTime: 0,
    });
    setSelectedGame('menu');
  }, []);

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    const interval = setInterval(saveGame, SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [saveGame]);

  useEffect(() => {
    checkAchievements();
  }, [energy, stats, checkAchievements]);

  useEffect(() => {
    return () => {
      saveGame();
    };
  }, [saveGame]);

  // ==================== RENDER ====================

  const canPrestige = energy >= PRESTIGE_THRESHOLD;
  const prestigeGain = calculatePrestigeGain(energy);

  // ==================== GAME MENU ====================

  if (selectedGame === 'menu') {
    return (
      <>
        <ParticleBackground />
        <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Quantum Gaming Hub
                  </h1>
                  <p className="text-sm text-gray-400">Choose Your Adventure</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-white" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={resetGame}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Reset All Progress"
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Menu */}
        <main className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-6xl md:text-8xl font-black text-white mb-6">
                SELECT YOUR
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse">
                  GAME
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Two epic games in one universe. Build your cosmic empire or race through neon highways!
              </p>
            </div>

            {/* Game Selection Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Quantum Clicker */}
              <div
                onClick={() => setSelectedGame('clicker')}
                className="group relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border-2 border-blue-500/50 rounded-3xl p-8 cursor-pointer hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/20 group-hover:from-blue-500/20 transition-all duration-500" />
                <div className="absolute top-4 right-4">
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Atom className="w-10 h-10 text-blue-400 animate-spin-slow" />
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="inline-block px-4 py-2 bg-blue-500/30 rounded-full border border-blue-400/50 mb-4">
                      <span className="text-blue-300 font-bold text-sm">CLICKER GAME</span>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4">
                      Quantum Clicker
                      <br />
                      Universe
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Build your cosmic empire from atoms to multiverses. Click, upgrade, and prestige your way to infinite energy!
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      <span>12+ Unique Upgrades</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Trophy className="w-5 h-5 text-blue-400" />
                      <span>12+ Achievements</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Crown className="w-5 h-5 text-blue-400" />
                      <span>Prestige System</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span>Offline Progress</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Total Energy</span>
                      <span className="font-bold text-blue-300">{formatNumber(stats.lifetimeEnergy)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Prestige Points</span>
                      <span className="font-bold text-blue-300">{prestigePoints}</span>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group-hover:scale-105 shadow-lg shadow-blue-500/30">
                    <Play className="w-6 h-6" />
                    START CLICKING
                  </button>
                </div>
              </div>

              {/* Neon Racing */}
              <div
                onClick={() => setSelectedGame('racing')}
                className="group relative bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border-2 border-orange-500/50 rounded-3xl p-8 cursor-pointer hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/20 group-hover:from-orange-500/20 transition-all duration-500" />
                <div className="absolute top-4 right-4">
                  <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Car className="w-10 h-10 text-orange-400" />
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="inline-block px-4 py-2 bg-orange-500/30 rounded-full border border-orange-400/50 mb-4">
                      <span className="text-orange-300 font-bold text-sm">RACING GAME</span>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4">
                      Neon Racing
                      <br />
                      Championship
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Race through infinite neon highways! Dodge obstacles, unlock cars, and become the ultimate speed champion!
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Car className="w-5 h-5 text-orange-400" />
                      <span>5 Unlockable Cars</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Gauge className="w-5 h-5 text-orange-400" />
                      <span>Endless Racing Mode</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Flag className="w-5 h-5 text-orange-400" />
                      <span>Progressive Difficulty</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Coins className="w-5 h-5 text-orange-400" />
                      <span>Earn Racing Coins</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Total Distance</span>
                      <span className="font-bold text-orange-300">{formatNumber(stats.totalDistance)}m</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Racing Coins</span>
                      <span className="font-bold text-orange-300">{formatNumber(racingCoins)}</span>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group-hover:scale-105 shadow-lg shadow-orange-500/30">
                    <Flag className="w-6 h-6" />
                    START RACING
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-yellow-400" />
                Overall Progress
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                    {formatTime(stats.playTime)}
                  </div>
                  <div className="text-sm text-gray-400">Play Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
                    {stats.totalRaces}
                  </div>
                  <div className="text-sm text-gray-400">Races Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-2">
                    {stats.prestigeCount}
                  </div>
                  <div className="text-sm text-gray-400">Total Prestiges</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
          }
        `}</style>
      </div>
    </>
    );
  }

  // Le reste du code sera dans le prochain message (QUANTUM CLICKER + RACING GAME)
  // Car la limite de caractères est atteinte

 // ==================== QUANTUM CLICKER GAME ====================

  if (selectedGame === 'clicker') {
    return (
      <>
        <ParticleBackground />
        <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedGame('menu')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Quantum Clicker Universe
                  </h1>
                  <p className="text-xs md:text-sm text-gray-400">Build Your Cosmic Empire</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  ) : (
                    <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-2 md:px-4 py-4 md:py-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Left Sidebar - Stats */}
            <div className="lg:col-span-3 space-y-4">
              {/* Energy Display */}
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-300 mb-2">Quantum Energy</p>
                  <p className="text-2xl md:text-4xl font-black text-white mb-4 font-mono break-all">
                    {formatNumber(energy)}
                  </p>
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Per Click:</span>
                      <span className="font-bold text-blue-300">
                        {formatNumber(energyPerClick * prestigeMultiplier)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Per Second:</span>
                      <span className="font-bold text-emerald-300">
                        {formatNumber(energyPerSecond)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prestige */}
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  <h3 className="text-base md:text-lg font-bold text-white">Prestige</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-xs md:text-sm text-gray-300">
                    <div className="flex justify-between mb-1">
                      <span>Points:</span>
                      <span className="font-bold text-amber-300">{prestigePoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multiplier:</span>
                      <span className="font-bold text-amber-300">x{prestigeMultiplier.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPrestigeModal(true)}
                    disabled={!canPrestige}
                    className={`w-full py-2 md:py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
                      canPrestige
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 text-white shadow-lg shadow-amber-500/50'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canPrestige ? (
                      <span className="flex items-center justify-center gap-2">
                        <span>Prestige +{prestigeGain}</span>
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                      </span>
                    ) : (
                      <span className="truncate">Need {formatNumber(PRESTIGE_THRESHOLD)}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-white mb-4">Statistics</h3>
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Clicks:</span>
                    <span className="font-bold">{formatNumber(stats.totalClicks)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Upgrades:</span>
                    <span className="font-bold">{stats.totalUpgrades}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Prestiges:</span>
                    <span className="font-bold">{stats.prestigeCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Play Time:</span>
                    <span className="font-bold">{formatTime(stats.playTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Clicker */}
            <div className="lg:col-span-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-8 h-full flex items-center justify-center relative overflow-hidden min-h-[400px]">
                <div
                  onClick={handleClick}
                  className="relative cursor-pointer group w-full max-w-[300px] md:max-w-[400px]"
                  style={{ aspectRatio: '1' }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse shadow-2xl shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Atom className="w-16 h-16 md:w-24 md:h-24 text-white animate-spin-slow" />
                  </div>

                  {particles.map(particle => (
                    <div
                      key={particle.id}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        left: particle.x + 'px',
                        top: particle.y + 'px',
                        width: particle.size + 'px',
                        height: particle.size + 'px',
                        backgroundColor: particle.color,
                        opacity: particle.life,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                      }}
                    />
                  ))}

                  <div className="absolute -bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 text-center">
                    <p className="text-xl md:text-2xl font-bold text-white mb-1">
                      +{formatNumber(energyPerClick * prestigeMultiplier)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400">per click</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Tabs */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setActiveTab('upgrades')}
                    className={`flex-1 py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-bold transition-colors ${
                      activeTab === 'upgrades' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Upgrades
                  </button>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className={`flex-1 py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-bold transition-colors ${
                      activeTab === 'achievements' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Achievements
                  </button>
                </div>

                <div className="p-3 md:p-4 max-h-[400px] md:max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                  {activeTab === 'upgrades' && (
                    <div className="space-y-3">
                      {upgrades
                        .filter(u => energy >= u.unlockThreshold * 0.5 || u.owned > 0)
                        .map((upgrade) => {
                          const canAfford = energy >= upgrade.currentCost;
                          const isLocked = energy < upgrade.unlockThreshold;
                          const IconComponent =
                            typeof (upgrade as any).icon === "function" ? (upgrade as any).icon : Zap;

                          return (
                            <div
                              key={upgrade.id}
                              className={`bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 transition-all ${
                                canAfford && !isLocked ? 'hover:bg-white/10' : 'opacity-50'
                              }`}
                            >
                              <div className="flex items-start gap-2 md:gap-3 mb-3">
                                <div className={`p-1.5 md:p-2 rounded-lg bg-gradient-to-br ${upgrade.color} flex-shrink-0`}>
                                  <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="text-xs md:text-sm font-bold text-white truncate">
                                      {upgrade.name}
                                    </h4>
                                    {isLocked && <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />}
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                    {upgrade.description}
                                  </p>
                                  <div className="flex items-center justify-between gap-2 text-xs">
                                    <span className="text-gray-400">
                                      Owned: <span className="font-bold text-white">{upgrade.owned}</span>
                                    </span>
                                    <span className={`font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {formatNumber(upgrade.currentCost)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => buyUpgrade(upgrade.id)}
                                  disabled={!canAfford || isLocked}
                                  className={`flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg text-xs font-bold transition-all ${
                                    canAfford && !isLocked
                                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 text-white'
                                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  Buy 1
                                </button>
                                <button
                                  onClick={() => buyMaxUpgrade(upgrade.id)}
                                  disabled={!canAfford || isLocked}
                                  className={`flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg text-xs font-bold transition-all ${
                                    canAfford && !isLocked
                                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 text-white'
                                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  Max
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {activeTab === 'achievements' && (
                    <div className="space-y-3">
                      {achievements.map((achievement) => {
                        const IconComponent =
                          typeof (achievement as any).icon === "function" ? (achievement as any).icon : Award;
                        return (
                          <div
                            key={achievement.id}
                            className={`bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 ${
                              achievement.unlocked ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${
                                achievement.unlocked
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                  : 'bg-gray-700'
                              }`}>
                                <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-xs md:text-sm font-bold text-white truncate">
                                    {achievement.name}
                                  </h4>
                                  {achievement.unlocked && (
                                    <Check className="w-3 h-3 md:w-4 md:h-4 text-emerald-400 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                  {achievement.description}
                                </p>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">
                                    Reward: <span className="font-bold text-amber-400">
                                      {formatNumber(achievement.reward)}
                                    </span>
                                  </span>
                                  {!achievement.unlocked && (
                                    <span className="text-gray-500 text-xs">
                                      {achievement.type === 'energy' && `${formatNumber(energy)}/${formatNumber(achievement.requirement)}`}
                                      {achievement.type === 'clicks' && `${formatNumber(stats.totalClicks)}/${formatNumber(achievement.requirement)}`}
                                      {achievement.type === 'upgrades' && `${stats.totalUpgrades}/${achievement.requirement}`}
                                      {achievement.type === 'prestige' && `${stats.prestigeCount}/${achievement.requirement}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Prestige Modal */}
        {showPrestigeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 border-2 border-amber-500 rounded-2xl p-6 md:p-8 max-w-md w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 animate-pulse" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                    <Crown className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
                    Prestige
                  </h2>
                  <button
                    onClick={() => setShowPrestigeModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/10 rounded-xl p-6 text-center">
                    <p className="text-gray-300 mb-2">You will gain</p>
                    <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2">
                      +{prestigeGain}
                    </p>
                    <p className="text-gray-300">Prestige Points</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="text-base md:text-lg font-bold text-white mb-3">Effects:</h3>
                    <ul className="space-y-2 text-xs md:text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>New multiplier: <span className="font-bold text-amber-400">
                          x{(1 + ((prestigePoints + prestigeGain) * 0.01)).toFixed(2)}
                        </span></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>Reset all energy and upgrades</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>Keep all achievements</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPrestigeModal(false)}
                      className="flex-1 py-2 md:py-3 px-4 md:px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors text-sm md:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePrestige}
                      className="flex-1 py-2 md:py-3 px-4 md:px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/50 text-sm md:text-base"
                    >
                      Prestige!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Notification */}
        {showAchievementNotif && latestAchievement && (
          <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 animate-slide-in-right max-w-sm">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-white rounded-2xl p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white rounded-xl flex-shrink-0">
                  {latestAchievement.icon && (
                    <latestAchievement.icon className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white/80 mb-1">Achievement Unlocked!</p>
                  <h4 className="text-sm md:text-lg font-black text-white mb-1 truncate">
                    {latestAchievement.name}
                  </h4>
                  <p className="text-xs md:text-sm text-white/90">
                    +{formatNumber(latestAchievement.reward)} Energy
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes slide-in-right {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
          }

          .animate-slide-in-right {
            animation: slide-in-right 0.5s ease-out;
          }
        `}</style>
      </div>
    </>
    );
  }

  // CONTINUE AVEC LE JEU DE RACING DANS LE PROCHAIN MESSAGE...

// ==================== NEON RACING CHAMPIONSHIP GAME ====================

  if (selectedGame === 'racing') {
    const currentCar = cars.find(c => c.id === selectedCar)!;

    return (
      <>
        <ParticleBackground />
        <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        {/* Header - Premium Design */}
        <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-orange-500/30 shadow-2xl shadow-orange-500/20">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => {
                    if (raceActive) {
                      if (window.confirm("Exit current race? Progress will be lost.")) {
                        setRaceActive(false);
                        setSelectedGame('menu');
                      }
                    } else {
                      setSelectedGame('menu');
                    }
                  }}
                  className="group p-2 rounded-lg hover:bg-orange-500/20 transition-all duration-300 border border-transparent hover:border-orange-500/50"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:text-orange-400 transition-colors" />
                </button>
                <div>
                  <h1 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 animate-gradient">
                    NEON RACING CHAMPIONSHIP
                  </h1>
                  <p className="text-xs md:text-sm text-gray-400 font-medium">Infinite Highway Challenge</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {/* Racing Coins Display - Enhanced */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2">
                    <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 animate-pulse" />
                    <span className="text-sm md:text-base font-black text-yellow-300">{formatNumber(racingCoins)}</span>
                  </div>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all border border-transparent hover:border-white/20"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  ) : (
                    <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Racing Content */}
        <main className="container mx-auto px-2 md:px-4 py-4 md:py-6 relative z-10">
          {!raceActive ? (
            /* ==================== GARAGE / CAR SELECTION - ULTRA PREMIUM ==================== */
            <div className="max-w-7xl mx-auto">
              {/* Welcome Banner */}
              <div className="relative mb-8 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/50" />
                <div className="relative p-8 md:p-12 text-center">
                  <div className="inline-block mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                      <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-black text-sm border-2 border-orange-300">
                        WELCOME TO THE CHAMPIONSHIP
                      </div>
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
                    CHOOSE YOUR
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-gradient">
                      RACING MACHINE
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Select your ride, dominate the highway, and become the ultimate speed champion!
                  </p>
                </div>
              </div>

              {/* Stats Dashboard - Ultra Enhanced */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
                {/* Total Races Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 md:p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 md:p-3 bg-orange-500/20 rounded-xl">
                        <Flag className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                      </div>
                      <span className="text-xs md:text-sm text-gray-300 font-bold">Total Races</span>
                    </div>
                    <p className="text-3xl md:text-4xl font-black text-white mb-1">{stats.totalRaces}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>

                {/* Total Distance Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 md:p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 md:p-3 bg-blue-500/20 rounded-xl">
                        <Gauge className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                      </div>
                      <span className="text-xs md:text-sm text-gray-300 font-bold">Distance</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-white mb-1">{formatNumber(stats.totalDistance)}</p>
                    <p className="text-xs text-gray-500">Meters Driven</p>
                  </div>
                </div>

                {/* Best Time Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 md:p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 md:p-3 bg-purple-500/20 rounded-xl">
                        <Timer className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                      </div>
                      <span className="text-xs md:text-sm text-gray-300 font-bold">Best Time</span>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-white mb-1 font-mono">
                      {stats.bestTime > 0 ? formatRaceTime(stats.bestTime) : '--:--:--'}
                    </p>
                    <p className="text-xs text-gray-500">Personal Record</p>
                  </div>
                </div>

                {/* Cars Unlocked Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 md:p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 md:p-3 bg-emerald-500/20 rounded-xl">
                        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                      </div>
                      <span className="text-xs md:text-sm text-gray-300 font-bold">Collection</span>
                    </div>
                    <p className="text-3xl md:text-4xl font-black text-white mb-1">
                      {cars.filter(c => c.unlocked).length}/{cars.length}
                    </p>
                    <p className="text-xs text-gray-500">Cars Unlocked</p>
                  </div>
                </div>
              </div>

              {/* Car Selection - Ultra Premium Garage */}
              <div className="relative mb-8 md:mb-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl blur-2xl" />
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
                  {/* Garage Header */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 md:mb-10">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 md:p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/50">
                          <Car className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                          THE GARAGE
                        </h2>
                      </div>
                      <p className="text-base md:text-lg text-gray-400 ml-16 md:ml-20">
                        Your collection of high-performance racing machines
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-2xl px-4 md:px-6 py-2 md:py-3 backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-sm md:text-base font-bold text-orange-300">Select Your Ride</span>
                      </div>
                    </div>
                  </div>

                  {/* Cars Grid - Ultra Premium Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {cars.map((car, index) => {
                      const isSelected = selectedCar === car.id;
                      const canBuy = racingCoins >= car.cost;

                      return (
                        <div
                          key={car.id}
                          onClick={() => {
                            if (car.unlocked) {
                              setSelectedCar(car.id);
                            }
                          }}
                          className={`group relative transition-all duration-500 ${
                            car.unlocked ? 'cursor-pointer' : ''
                          }`}
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          {/* Card Glow Effect */}
                          <div className={`absolute -inset-1 rounded-3xl blur-2xl transition-opacity duration-500 ${
                            isSelected 
                              ? 'opacity-75' 
                              : car.unlocked 
                                ? 'opacity-0 group-hover:opacity-50' 
                                : 'opacity-0'
                          }`}
                          style={{ background: `linear-gradient(135deg, ${car.color}80, ${car.color}40)` }}
                          />

                          {/* Main Card */}
                          <div className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 rounded-3xl overflow-hidden transition-all duration-500 ${
                            car.unlocked
                              ? isSelected
                                ? `scale-105 shadow-2xl`
                                : 'hover:scale-102'
                              : 'opacity-70'
                          }`}
                          style={{
                            borderColor: isSelected ? car.color : car.unlocked ? 'rgba(255,255,255,0.2)' : 'rgba(100,100,100,0.3)',
                            boxShadow: isSelected ? `0 20px 60px ${car.color}60` : '',
                          }}
                          >
                            {/* Lock Overlay for Locked Cars */}
                            {!car.unlocked && (
                              <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-20 flex items-center justify-center">
                                <div className="text-center p-6">
                                  <div className="relative inline-block mb-6">
                                    <div className="absolute inset-0 bg-gray-500 rounded-full blur-xl opacity-50 animate-pulse" />
                                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center border-4 border-gray-600">
                                      <Lock className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm md:text-base font-bold text-gray-300 mb-1">
                                    LOCKED
                                  </p>
                                  <p className="text-2xl md:text-3xl font-black text-white mb-4 flex items-center justify-center gap-2">
                                    <Coins className="w-6 h-6 text-yellow-400" />
                                    {formatNumber(car.cost)}
                                  </p>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (canBuy) {
                                        buyCar(car.id);
                                      }
                                    }}
                                    disabled={!canBuy}
                                    className={`px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-sm md:text-base transition-all duration-300 ${
                                      canBuy
                                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg shadow-yellow-500/50 hover:scale-105'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {canBuy ? (
                                      <span className="flex items-center gap-2">
                                        <LockOpen className="w-4 h-4" />
                                        UNLOCK NOW
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        INSUFFICIENT COINS
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Selected Badge */}
                            {isSelected && car.unlocked && (
                              <div className="absolute top-4 right-4 z-10">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-75 animate-pulse" />
                                  <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border-2 border-orange-300 shadow-lg">
                                    <Check className="w-3 h-3" />
                                    SELECTED
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="p-5 md:p-7">
                              {/* Car Visual Showcase */}
                              <div className="mb-6">
                                <div 
                                  className="relative w-full aspect-video rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500"
                                  style={{ 
                                    background: `linear-gradient(135deg, ${car.color}40 0%, ${car.color}10 100%)`,
                                    border: `3px solid ${car.color}60`,
                                    boxShadow: `inset 0 0 30px ${car.color}30`,
                                  }}
                                >
                                  {/* Animated Background Pattern */}
                                  <div className="absolute inset-0 opacity-20">
                                    <div className="absolute inset-0" style={{
                                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${car.color}40 10px, ${car.color}40 20px)`,
                                    }} />
                                  </div>

                                  {/* Car Icon with Glow */}
                                  <div className="relative z-10">
                                    <Car 
                                      className="w-24 h-24 md:w-36 md:h-36 transition-all duration-500 group-hover:scale-110" 
                                      style={{ 
                                        color: car.color,
                                        filter: `drop-shadow(0 0 20px ${car.color})`,
                                      }}
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 animate-pulse">
                                        <Car 
                                          className="w-24 h-24 md:w-36 md:h-36 blur-2xl opacity-60" 
                                          style={{ color: car.color }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Speed Lines Animation */}
                                  <div className="absolute inset-0 opacity-40 overflow-hidden">
                                    {[...Array(8)].map((_, i) => (
                                      <div
                                        key={i}
                                        className="absolute h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-speed-line-horizontal"
                                        style={{
                                          width: `${Math.random() * 60 + 40}%`,
                                          top: `${15 + i * 10}%`,
                                          right: '100%',
                                          animationDelay: `${i * 0.15}s`,
                                          animationDuration: '2s',
                                        }}
                                      />
                                    ))}
                                  </div>

                                  {/* Corner Accents */}
                                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: car.color }} />
                                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: car.color }} />
                                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: car.color }} />
                                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: car.color }} />
                                </div>
                              </div>

                              {/* Car Info */}
                              <div>
                                {/* Car Name & Price */}
                                <div className="mb-4">
                                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">
                                    {car.name}
                                  </h3>
                                  {car.cost > 0 && (
                                    <div className="flex items-center gap-2">
                                      <Coins className="w-4 h-4 text-yellow-400" />
                                      <span className="text-sm font-bold text-gray-400">
                                        {car.unlocked ? 'OWNED' : `${formatNumber(car.cost)} Coins`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Performance Stats */}
                                <div className="space-y-3">
                                  {/* Speed Stat */}
                                  <div>
                                    <div className="flex justify-between items-center text-xs mb-2">
                                      <span className="text-gray-400 flex items-center gap-1.5 font-semibold">
                                        <Gauge className="w-3.5 h-3.5" />
                                        MAX SPEED
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-1.5 h-3 rounded-full transition-all duration-500 ${
                                              i < Math.ceil((car.speed / 15) * 5)
                                                ? 'opacity-100'
                                                : 'opacity-20'
                                            }`}
                                            style={{
                                              background: i < Math.ceil((car.speed / 15) * 5) ? car.color : '#4B5563',
                                            }}
                                          />
                                        ))}
                                        <span className="ml-2 font-black text-white">{car.speed}/15</span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-800/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm border border-gray-700/50">
                                      <div 
                                        className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                                        style={{ 
                                          width: `${(car.speed / 15) * 100}%`,
                                          background: `linear-gradient(to right, ${car.color}, ${car.color}cc)`,
                                        }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Acceleration Stat */}
                                  <div>
                                    <div className="flex justify-between items-center text-xs mb-2">
                                      <span className="text-gray-400 flex items-center gap-1.5 font-semibold">
                                        <Zap className="w-3.5 h-3.5" />
                                        ACCELERATION
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-1.5 h-3 rounded-full transition-all duration-500 ${
                                              i < Math.ceil((car.acceleration / 4) * 5)
                                                ? 'opacity-100'
                                                : 'opacity-20'
                                            }`}
                                            style={{
                                              background: i < Math.ceil((car.acceleration / 4) * 5) ? car.color : '#4B5563',
                                            }}
                                          />
                                        ))}
                                        <span className="ml-2 font-black text-white">{car.acceleration}/4</span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-800/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm border border-gray-700/50">
                                      <div 
                                        className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                                        style={{ 
                                          width: `${(car.acceleration / 4) * 100}%`,
                                          background: `linear-gradient(to right, ${car.color}, ${car.color}cc)`,
                                        }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Handling Stat */}
                                  <div>
                                    <div className="flex justify-between items-center text-xs mb-2">
                                      <span className="text-gray-400 flex items-center gap-1.5 font-semibold">
                                        <Settings className="w-3.5 h-3.5" />
                                        HANDLING
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-1.5 h-3 rounded-full transition-all duration-500 ${
                                              i < Math.ceil((car.handling / 3) * 5)
                                                ? 'opacity-100'
                                                : 'opacity-20'
                                            }`}
                                            style={{
                                              background: i < Math.ceil((car.handling / 3) * 5) ? car.color : '#4B5563',
                                            }}
                                          />
                                        ))}
                                        <span className="ml-2 font-black text-white">{car.handling}/3</span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-800/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm border border-gray-700/50">
                                      <div 
                                        className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                                        style={{ 
                                          width: `${(car.handling / 3) * 100}%`,
                                          background: `linear-gradient(to right, ${car.color}, ${car.color}cc)`,
                                        }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Overall Rating */}
                                  <div className="pt-3 mt-3 border-t border-white/10">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-400 font-semibold">OVERALL RATING</span>
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => {
                                          const overall = (car.speed + car.acceleration + car.handling) / 3;
                                          const rating = Math.ceil((overall / 7.33) * 5);
                                          return (
                                            <Star
                                              key={i}
                                              className={`w-4 h-4 transition-all duration-300 ${
                                                i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                                              }`}
                                            />
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Start Race Button - EPIC */}
              <div className="text-center mb-10">
                <div className="relative inline-block">
                  {/* Button Glow */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-3xl blur-2xl opacity-75 animate-pulse" />
                  
                  {/* Main Button */}
                  <button
                    onClick={startRace}
                    className="group relative inline-flex items-center gap-4 px-10 md:px-16 py-5 md:py-7 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 text-white font-black text-2xl md:text-4xl rounded-2xl transition-all duration-500 hover:scale-110 shadow-2xl overflow-hidden border-4 border-orange-300"
                  >
                    {/* Animated Background Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/30 to-yellow-400/0 animate-shimmer" />
                    
                    {/* Content */}
                    <Flag className="w-7 h-7 md:w-10 md:h-10 animate-bounce relative z-10" />
                    <span className="relative z-10 tracking-wider">START RACE</span>
                    <Rocket className="w-7 h-7 md:w-10 md:h-10 group-hover:translate-x-2 transition-transform relative z-10" />
                  </button>
                </div>

                {/* Controls Info */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-4 text-sm md:text-base text-gray-400">
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2">
                    <span className="font-semibold">Steer:</span>
                    <kbd className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-mono border border-white/20">←→</kbd>
                    <span>or</span>
                    <kbd className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-mono border border-white/20">A/D</kbd>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2">
                    <span className="font-semibold">Accelerate:</span>
                    <kbd className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-mono border border-white/20">↑</kbd>
                    <span>or</span>
                    <kbd className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-mono border border-white/20">W</kbd>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2">
                    <span className="font-semibold">Brake:</span>
                    <kbd className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-mono border border-white/20">↓</kbd>
                    <span>or</span>
                    <kbd className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-mono border border-white/20">S</kbd>
                  </div>
                </div>
              </div>

              {/* CONTINUE DANS LE PROCHAIN MESSAGE... */}
              {/* How to Play Section - Ultra Detailed */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
                <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-6 md:p-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg shadow-blue-500/50">
                      <Gamepad2 className="w-7 h-7 md:w-9 md:h-9 text-white" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                      HOW TO DOMINATE
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Rule 1 */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 hover:scale-105 transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/50">
                          <span className="text-2xl font-black text-white">1</span>
                        </div>
                        <h4 className="text-xl font-black text-white mb-3">DODGE OBSTACLES</h4>
                        <p className="text-gray-400 leading-relaxed">
                          Navigate through traffic cones, barriers, and oil spills. One collision ends your run!
                        </p>
                        <div className="mt-4 flex gap-2">
                          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-orange-500 clip-triangle" />
                          </div>
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-3 bg-red-500 border-2 border-yellow-400" />
                          </div>
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rule 2 */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative bg-white/5 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
                          <span className="text-2xl font-black text-white">2</span>
                        </div>
                        <h4 className="text-xl font-black text-white mb-3">GO THE DISTANCE</h4>
                        <p className="text-gray-400 leading-relaxed">
                          The further you drive, the more coins you earn. Distance = Rewards!
                        </p>
                        <div className="mt-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-3 border border-blue-500/30">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Reward Rate:</span>
                            <span className="font-black text-blue-300">1 coin per 10m</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rule 3 */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative bg-white/5 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 hover:scale-105 transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/50">
                          <span className="text-2xl font-black text-white">3</span>
                        </div>
                        <h4 className="text-xl font-black text-white mb-3">UNLOCK CARS</h4>
                        <p className="text-gray-400 leading-relaxed">
                          Spend coins to unlock faster cars with better stats and dominate the highway!
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Coins className="w-5 h-5 text-yellow-400" />
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div className="w-3/4 h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" />
                          </div>
                          <Car className="w-5 h-5 text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tips */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
                    <h4 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-purple-400" />
                      PRO TIPS
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Zap className="w-4 h-4 text-purple-400" />
                        </div>
                        <p>Higher speed = More obstacles. Master control before going full throttle!</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Target className="w-4 h-4 text-purple-400" />
                        </div>
                        <p>Stay centered on the road for maximum reaction time to obstacles.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Settings className="w-4 h-4 text-purple-400" />
                        </div>
                        <p>Better handling = Easier dodging. Upgrade wisely based on your playstyle!</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="w-4 h-4 text-purple-400" />
                        </div>
                        <p>Challenge yourself! Try beating your personal best time and distance.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==================== ACTIVE RACE SCREEN - ULTRA IMMERSIVE ==================== */
            <div className="max-w-6xl mx-auto">
              {gameOver ? (
                /* ==================== GAME OVER SCREEN - EPIC RESULTS ==================== */
                <div className="max-w-3xl mx-auto animate-fade-in">
                  <div className="relative">
                    {/* Explosion Effect Background */}
                    <div className="absolute -inset-20 opacity-30">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-ping"
                          style={{
                            width: Math.random() * 100 + 50 + 'px',
                            height: Math.random() * 100 + 50 + 'px',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '2s',
                          }}
                        />
                      ))}
                    </div>

                    {/* Main Game Over Card */}
                    <div className="relative bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-2xl border-2 border-red-500/50 rounded-3xl p-8 md:p-14 text-center shadow-2xl shadow-red-500/50">
                      {/* Crash Icon */}
                      <div className="mb-10">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-600 rounded-full blur-3xl opacity-75 animate-pulse" />
                          <div className="relative w-24 h-24 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center animate-bounce shadow-2xl shadow-red-500/50 border-4 border-red-400">
                            <X className="w-12 h-12 md:w-20 md:h-20 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tighter animate-shake">
                        RACE OVER!
                      </h2>
                      <p className="text-xl md:text-3xl text-gray-300 mb-10 font-bold">
                        Crashed! Better luck next time, racer!
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {/* Distance Card */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                          <div className="relative bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-xl border border-blue-500/50 rounded-2xl p-6 md:p-8">
                            <div className="inline-block p-3 md:p-4 bg-blue-500/20 rounded-2xl mb-4">
                              <Gauge className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                            </div>
                            <p className="text-sm md:text-base text-gray-400 font-semibold mb-2">DISTANCE TRAVELED</p>
                            <p className="text-4xl md:text-5xl font-black text-white mb-1">
                              {formatNumber(raceDistance)}
                            </p>
                            <p className="text-lg text-blue-300 font-bold">meters</p>
                          </div>
                        </div>

                        {/* Time Card */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                          <div className="relative bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-6 md:p-8">
                            <div className="inline-block p-3 md:p-4 bg-purple-500/20 rounded-2xl mb-4">
                              <Timer className="w-8 h-8 md:w-12 md:h-12 text-purple-400" />
                            </div>
                            <p className="text-sm md:text-base text-gray-400 font-semibold mb-2">RACE DURATION</p>
                            <p className="text-4xl md:text-5xl font-black text-white mb-1 font-mono">
                              {formatRaceTime(raceTime)}
                            </p>
                            <p className="text-lg text-purple-300 font-bold">time survived</p>
                          </div>
                        </div>

                        {/* Coins Earned Card */}
                        <div className="relative group md:col-span-2">
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                          <div className="relative bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-xl border border-yellow-500/50 rounded-2xl p-6 md:p-8">
                            <div className="inline-block p-3 md:p-4 bg-yellow-500/20 rounded-2xl mb-4">
                              <Coins className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 animate-spin-slow" />
                            </div>
                            <p className="text-sm md:text-base text-gray-400 font-semibold mb-2">COINS EARNED</p>
                            <p className="text-5xl md:text-6xl font-black text-white mb-1">
                              +{Math.floor(raceDistance / 10)}
                            </p>
                            <p className="text-lg text-yellow-300 font-bold">racing coins collected</p>
                          </div>
                        </div>
                      </div>

                      {/* Performance Analysis */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-10">
                        <h3 className="text-xl font-black text-white mb-4 flex items-center justify-center gap-2">
                          <TrendingUp className="w-6 h-6 text-orange-400" />
                          PERFORMANCE ANALYSIS
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-400 mb-1">Avg Speed</p>
                            <p className="text-xl font-black text-white">
                              {Math.floor((raceDistance / (raceTime / 1000)) * 3.6)} km/h
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400 mb-1">Max Speed</p>
                            <p className="text-xl font-black text-white">
                              {Math.floor(currentCar.speed * 10)} km/h
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400 mb-1">Obstacles</p>
                            <p className="text-xl font-black text-white">
                              {Math.floor(raceDistance / 50)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400 mb-1">Difficulty</p>
                            <p className="text-xl font-black text-orange-400">
                              {raceDistance < 500 ? 'EASY' : raceDistance < 1500 ? 'MEDIUM' : raceDistance < 3000 ? 'HARD' : 'EXTREME'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={startRace}
                          className="group relative px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-lg md:text-xl rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-orange-500/50 flex items-center justify-center gap-3 overflow-hidden border-2 border-orange-400"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/30 to-yellow-400/0 animate-shimmer" />
                          <RotateCcw className="w-6 h-6 relative z-10" />
                          <span className="relative z-10">RACE AGAIN</span>
                        </button>
                        <button
                          onClick={() => setRaceActive(false)}
                          className="px-8 md:px-12 py-4 md:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold text-lg md:text-xl rounded-xl transition-all border border-white/20 hover:border-white/40"
                        >
                          Back to Garage
                        </button>
                      </div>

                      {/* Motivational Quote */}
                      <div className="mt-8 text-center">
                        <p className="text-gray-400 italic text-sm md:text-base">
                          "The road to victory is paved with persistence. Try again, champion!" 🏆
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ==================== ACTIVE RACING - FULL IMMERSION ==================== */
                <div>
                  {/* HUD - Advanced Racing Interface */}
                  <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                    {/* Left Side - Stats */}
                    <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                      {/* Distance Counter */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-2xl border border-blue-500/50 rounded-2xl px-4 md:px-6 py-2.5 md:py-3.5 shadow-lg">
                          <div className="flex items-center gap-2 md:gap-3">
                            <Gauge className="w-5 h-5 md:w-6 md:h-6 text-blue-400 animate-pulse" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold">DISTANCE</p>
                              <p className="text-xl md:text-2xl font-black text-white font-mono">
                                {formatNumber(raceDistance)}m
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Time Counter */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-2xl border border-purple-500/50 rounded-2xl px-4 md:px-6 py-2.5 md:py-3.5 shadow-lg">
                          <div className="flex items-center gap-2 md:gap-3">
                            <Timer className="w-5 h-5 md:w-6 md:h-6 text-purple-400 animate-pulse" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold">TIME</p>
                              <p className="text-xl md:text-2xl font-black text-white font-mono">
                                {formatRaceTime(raceTime)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coins Counter (Live) */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-2xl border border-yellow-500/50 rounded-2xl px-4 md:px-6 py-2.5 md:py-3.5 shadow-lg">
                          <div className="flex items-center gap-2 md:gap-3">
                            <Coins className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 animate-spin-slow" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold">EARNING</p>
                              <p className="text-xl md:text-2xl font-black text-white font-mono">
                                +{Math.floor(raceDistance / 10)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Controls */}
                    <div className="flex items-center gap-3">
                      {/* Pause/Play Button */}
                      <button
                        onClick={pauseRace}
                        className="group relative p-3 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/40 rounded-xl transition-all hover:scale-110 shadow-lg"
                      >
                        {racePaused ? (
                          <Play className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        ) : (
                          <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        )}
                      </button>

                      {/* Quit Button */}
                      <button
                        onClick={() => {
                          if (window.confirm("⚠️ Quit race? All progress will be lost!")) {
                            endRace(true);
                          }
                        }}
                        className="p-3 md:p-4 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-xl border border-red-500/50 hover:border-red-500/70 rounded-xl transition-all hover:scale-110 shadow-lg"
                      >
                        <X className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Racing Track - Ultra Detailed */}
                  <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl"
                    style={{ 
                      width: '100%',
                      maxWidth: `${RACING_TRACK_WIDTH}px`,
                      height: `${RACING_TRACK_HEIGHT}px`,
                    }}
                  >
                    {/* Track Base */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
                      {/* Asphalt Texture */}
                      <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
                      }} />
                    </div>

                    {/* Road Markings - Enhanced */}
                    <div className="absolute inset-0">
                      {/* Center Line - Animated */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 overflow-hidden">
                        {[...Array(25)].map((_, i) => (
                          <div
                            key={`center-${i}`}
                            className="absolute w-full h-12 bg-yellow-400 shadow-lg"
                            style={{
                              top: `${i * 4}%`,
                              animation: raceActive && !racePaused ? `roadLine ${2 - (carSpeed / 100)}s linear infinite` : 'none',
                              boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)',
                            }}
                          />
                        ))}
                      </div>

                      {/* Side Lines with Glow */}
                      <div className="absolute left-6 top-0 bottom-0 w-1.5 bg-white opacity-60 shadow-lg" style={{ boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
                      <div className="absolute right-6 top-0 bottom-0 w-1.5 bg-white opacity-60 shadow-lg" style={{ boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />

                      {/* Road Edge Markers */}
                      {[...Array(20)].map((_, i) => (
                        <React.Fragment key={`markers-${i}`}>
                          <div
                            className="absolute left-2 w-2 h-4 bg-red-500 opacity-70"
                            style={{
                              top: `${i * 5}%`,
                              animation: raceActive && !racePaused ? `roadLine ${2 - (carSpeed / 100)}s linear infinite` : 'none',
                            }}
                          />
                          <div
                            className="absolute right-2 w-2 h-4 bg-red-500 opacity-70"
                            style={{
                              top: `${i * 5}%`,
                              animation: raceActive && !racePaused ? `roadLine ${2 - (carSpeed / 100)}s linear infinite` : 'none',
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Track Border Glow */}
                    <div className="absolute inset-0 border-4 rounded-3xl pointer-events-none"
                      style={{
                        borderColor: currentCar.color,
                        boxShadow: `inset 0 0 30px ${currentCar.color}40, 0 0 30px ${currentCar.color}40`,
                      }}
                    />

                    {/* Obstacles - Enhanced Visuals */}
                    {obstacles.map((obstacle) => (
                      <div
                        key={obstacle.id}
                        className="absolute transition-all duration-75"
                        style={{
                          left: `${obstacle.x}px`,
                          top: `${obstacle.y}px`,
                          width: `${obstacle.width}px`,
                          height: `${obstacle.height}px`,
                        }}
                      >
                        {obstacle.type === 'cone' && (
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-700 clip-triangle shadow-2xl">
                              <div className="absolute inset-0 bg-orange-300/50 animate-pulse" />
                            </div>
                            {/* Cone Glow */}
                            <div className="absolute inset-0 bg-orange-500 clip-triangle blur-lg opacity-60" />
                            {/* Reflective Stripe */}
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/80" />
                          </div>
                        )}
                        {obstacle.type === 'barrier' && (
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-2 border-yellow-400 shadow-2xl">
                              <div className="absolute inset-0 bg-yellow-400/20 animate-pulse" />
                            </div>
                            {/* Barrier Glow */}
                            <div className="absolute inset-0 bg-red-600 blur-lg opacity-50" />
                            {/* Hazard Stripes */}
                            <div className="absolute inset-0" style={{
                              background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(251, 191, 36, 0.3) 8px, rgba(251, 191, 36, 0.3) 16px)',
                            }} />
                            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-yellow-400 shadow-lg" />
                          </div>
                        )}
                        {obstacle.type === 'oil' && (
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 rounded-full bg-gradient-radial from-purple-900 via-purple-800 to-purple-950 shadow-2xl">
                              <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-pulse" />
                            </div>
                            {/* Oil Glow */}
                            <div className="absolute inset-0 rounded-full bg-purple-600 blur-xl opacity-60" />
                            {/* Oil Shine Effect */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/40 to-transparent" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Player Car - Ultra Detailed */}
                    <div
                      className="absolute transition-all duration-75 z-10"
                      style={{
                        left: `${carX}px`,
                        top: `${carY}px`,
                        width: `${CAR_WIDTH}px`,
                        height: `${CAR_HEIGHT}px`,
                      }}
                    >
                      <div 
                        className="relative w-full h-full rounded-lg shadow-2xl transform hover:scale-105 transition-transform"
                        style={{ 
                          background: `linear-gradient(180deg, ${currentCar.color} 0%, ${currentCar.color}dd 50%, ${currentCar.color}aa 100%)`,
                          boxShadow: `
                            0 0 30px ${currentCar.color}80,
                            0 10px 40px rgba(0,0,0,0.5),
                            inset 0 2px 4px rgba(255,255,255,0.3)
                          `,
                        }}
                      >
                        {/* Car Body Shine */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                        
                        {/* Windshield */}
                        <div className="absolute top-3 left-3 right-3 h-8 bg-gradient-to-b from-cyan-400/40 to-cyan-600/30 rounded-t-lg backdrop-blur-sm border border-cyan-400/50 shadow-inner" />
                        
                        {/* Headlights */}
                        <div className="absolute top-1 left-2 w-3 h-2 bg-yellow-200 rounded-full shadow-lg" style={{ boxShadow: '0 0 10px rgba(254, 240, 138, 0.8)' }} />
                        <div className="absolute top-1 right-2 w-3 h-2 bg-yellow-200 rounded-full shadow-lg" style={{ boxShadow: '0 0 10px rgba(254, 240, 138, 0.8)' }} />
                        
                        {/* Wheels */}
                        <div className="absolute bottom-3 left-1.5 w-3 h-5 bg-gray-900 rounded-sm shadow-lg border border-gray-700" />
                        <div className="absolute bottom-3 right-1.5 w-3 h-5 bg-gray-900 rounded-sm shadow-lg border border-gray-700" />
                        <div className="absolute bottom-16 left-1.5 w-3 h-5 bg-gray-900 rounded-sm shadow-lg border border-gray-700" />
                        <div className="absolute bottom-16 right-1.5 w-3 h-5 bg-gray-900 rounded-sm shadow-lg border border-gray-700" />
                        
                        {/* Speed Glow Effect */}
                        {carSpeed > currentCar.speed * 5 && (
                          <div className="absolute inset-0 rounded-lg animate-pulse"
                            style={{ 
                              background: `linear-gradient(180deg, transparent 0%, ${currentCar.color}60 100%)`,
                              filter: 'blur(6px)',
                            }}
                          />
                        )}

                        {/* Turbo Boost Visual */}
                        {carSpeed > currentCar.speed * 7 && (
                          <>
                            {/* Exhaust Flames */}
                            <div className="absolute -bottom-3 left-4 w-2.5 h-6 bg-gradient-to-b from-orange-400 via-red-500 to-transparent animate-pulse shadow-lg" style={{ boxShadow: '0 0 15px rgba(251, 146, 60, 0.8)' }} />
                            <div className="absolute -bottom-3 right-4 w-2.5 h-6 bg-gradient-to-b from-orange-400 via-red-500 to-transparent animate-pulse shadow-lg" style={{ boxShadow: '0 0 15px rgba(251, 146, 60, 0.8)' }} />
                            
                            {/* Speed Trail */}
                            <div className="absolute inset-0 rounded-lg" style={{
                              background: `linear-gradient(to top, ${currentCar.color}40, transparent)`,
                              filter: 'blur(8px)',
                              transform: 'scaleY(1.5) translateY(20%)',
                            }} />
                          </>
                        )}

                        {/* Nitro Boost Effect */}
                        {carSpeed >= currentCar.speed * 9 && (
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-8 h-8">
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl animate-ping opacity-75" />
                            <div className="absolute inset-0 bg-cyan-300 rounded-full blur-lg animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Particles - Racing Effects */}
                    {particles.map(particle => (
                      <div
                        key={particle.id}
                        className="absolute rounded-full pointer-events-none z-5"
                        style={{
                          left: particle.x + 'px',
                          top: particle.y + 'px',
                          width: particle.size + 'px',
                          height: particle.size + 'px',
                          backgroundColor: particle.color,
                          opacity: particle.life,
                          transform: 'translate(-50%, -50%)',
                          boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
                        }}
                      />
                    ))}

                    {/* Pause Overlay - Enhanced */}
                    {racePaused && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
                        <div className="text-center animate-fade-in">
                          <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-50 animate-pulse" />
                            <Pause className="relative w-20 h-20 md:w-32 md:h-32 text-white" />
                          </div>
                          <h3 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                            PAUSED
                          </h3>
                          <p className="text-xl md:text-2xl text-gray-300 font-bold mb-6">
                            Hit Play to resume your race
                          </p>
                          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                            <p className="text-sm text-gray-400">
                              Current Progress: <span className="font-bold text-white">{formatNumber(raceDistance)}m</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CONTINUE DANS LE PROCHAIN MESSAGE... */}

                  {/* Speed Indicator - Ultra Premium */}
                  <div className="mt-6 max-w-2xl mx-auto">
                    <div className="relative">
                      {/* Speedometer Glow */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />
                      
                      {/* Main Speedometer Card */}
                      <div className="relative bg-gradient-to-r from-orange-500/30 via-red-500/30 to-pink-500/30 backdrop-blur-2xl border-2 border-orange-500/50 rounded-3xl p-6 md:p-8 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-500/20 rounded-xl">
                              <Gauge className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                            </div>
                            <span className="text-lg md:text-xl font-black text-white">VELOCITY</span>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl md:text-6xl font-black text-white font-mono">
                              {Math.floor(carSpeed * 10)}
                            </p>
                            <p className="text-sm md:text-base text-gray-400 font-bold">km/h</p>
                          </div>
                        </div>

                        {/* Speed Bar - Animated */}
                        <div className="relative">
                          {/* Background Track */}
                          <div className="w-full bg-gray-800/50 rounded-full h-5 md:h-6 overflow-hidden backdrop-blur-sm border border-gray-700/50 shadow-inner">
                            {/* Speed Fill with Gradient */}
                            <div 
                              className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
                              style={{ 
                                width: `${Math.min((carSpeed / (currentCar.speed * 10)) * 100, 100)}%`,
                                background: carSpeed > currentCar.speed * 8 
                                  ? 'linear-gradient(to right, #ef4444, #dc2626, #b91c1c, #991b1b)' 
                                  : carSpeed > currentCar.speed * 5 
                                    ? 'linear-gradient(to right, #f97316, #ea580c, #c2410c, #9a3412)'
                                    : 'linear-gradient(to right, #fb923c, #f97316, #ea580c)',
                                boxShadow: carSpeed > currentCar.speed * 5 ? '0 0 20px rgba(249, 115, 22, 0.6)' : '0 0 10px rgba(251, 146, 60, 0.4)',
                              }}
                            >
                              {/* Animated Shimmer Effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-fast" />
                              
                              {/* Pulsing Glow at High Speed */}
                              {carSpeed > currentCar.speed * 7 && (
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                              )}
                            </div>
                          </div>

                          {/* Speed Markers */}
                          <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500 font-bold">
                            <span>0</span>
                            <span>{Math.floor(currentCar.speed * 2.5)}</span>
                            <span>{Math.floor(currentCar.speed * 5)}</span>
                            <span>{Math.floor(currentCar.speed * 7.5)}</span>
                            <span className="text-red-400">{Math.floor(currentCar.speed * 10)}</span>
                          </div>
                        </div>

                        {/* Speed Status Indicator */}
                        <div className="mt-10 grid grid-cols-4 gap-2 md:gap-3">
                          <div className={`text-center p-2 md:p-3 rounded-xl border-2 transition-all ${
                            carSpeed < currentCar.speed * 3 
                              ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/50' 
                              : 'bg-gray-800/50 border-gray-700'
                          }`}>
                            <p className={`text-xs md:text-sm font-black ${
                              carSpeed < currentCar.speed * 3 ? 'text-blue-400' : 'text-gray-600'
                            }`}>CRUISE</p>
                          </div>
                          <div className={`text-center p-2 md:p-3 rounded-xl border-2 transition-all ${
                            carSpeed >= currentCar.speed * 3 && carSpeed < currentCar.speed * 6
                              ? 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/50' 
                              : 'bg-gray-800/50 border-gray-700'
                          }`}>
                            <p className={`text-xs md:text-sm font-black ${
                              carSpeed >= currentCar.speed * 3 && carSpeed < currentCar.speed * 6 ? 'text-orange-400' : 'text-gray-600'
                            }`}>FAST</p>
                          </div>
                          <div className={`text-center p-2 md:p-3 rounded-xl border-2 transition-all ${
                            carSpeed >= currentCar.speed * 6 && carSpeed < currentCar.speed * 8
                              ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/50' 
                              : 'bg-gray-800/50 border-gray-700'
                          }`}>
                            <p className={`text-xs md:text-sm font-black ${
                              carSpeed >= currentCar.speed * 6 && carSpeed < currentCar.speed * 8 ? 'text-red-400' : 'text-gray-600'
                            }`}>TURBO</p>
                          </div>
                          <div className={`text-center p-2 md:p-3 rounded-xl border-2 transition-all ${
                            carSpeed >= currentCar.speed * 8
                              ? 'bg-pink-500/20 border-pink-500 shadow-lg shadow-pink-500/50 animate-pulse' 
                              : 'bg-gray-800/50 border-gray-700'
                          }`}>
                            <p className={`text-xs md:text-sm font-black ${
                              carSpeed >= currentCar.speed * 8 ? 'text-pink-400' : 'text-gray-600'
                            }`}>MAX</p>
                          </div>
                        </div>

                        {/* Warning Message at High Speed */}
                        {carSpeed > currentCar.speed * 7 && (
                          <div className="mt-4 flex items-center justify-center gap-2 text-red-400 animate-pulse">
                            <Zap className="w-4 h-4" />
                            <p className="text-sm font-black">⚠️ EXTREME VELOCITY - DANGER ZONE!</p>
                            <Zap className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Car Info Display */}
                  <div className="mt-6 text-center">
                    <div className="inline-block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
                      <div className="flex items-center gap-4">
                        <Car className="w-6 h-6" style={{ color: currentCar.color }} />
                        <div className="text-left">
                          <p className="text-xs text-gray-400">Currently Driving</p>
                          <p className="text-lg font-black text-white">{currentCar.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Custom Animations & Styles - ULTRA COMPLETE */}
        <style>{`
          /* ==================== CORE ANIMATIONS ==================== */
          
          @keyframes roadLine {
            from {
              transform: translateY(-100%);
            }
            to {
              transform: translateY(100vh);
            }
          }

          @keyframes speedLine {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            to {
              transform: translateY(100vh);
              opacity: 0;
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes shimmer-fast {
            0% {
              transform: translateX(-200%);
            }
            100% {
              transform: translateX(200%);
            }
          }

          @keyframes speed-line-horizontal {
            from {
              right: 100%;
              opacity: 0;
            }
            20% {
              opacity: 1;
            }
            to {
              right: -100%;
              opacity: 0;
            }
          }

          @keyframes float {
            0%, 100% { 
              transform: translateY(0) translateX(0); 
            }
            50% { 
              transform: translateY(-20px) translateX(10px); 
            }
          }

          @keyframes spin-slow {
            from { 
              transform: rotate(0deg); 
            }
            to { 
              transform: rotate(360deg); 
            }
          }

          @keyframes slide-in-right {
            from { 
              transform: translateX(400px); 
              opacity: 0; 
            }
            to { 
              transform: translateX(0); 
              opacity: 1; 
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes shake {
            0%, 100% { 
              transform: translateX(0); 
            }
            10%, 30%, 50%, 70%, 90% { 
              transform: translateX(-10px); 
            }
            20%, 40%, 60%, 80% { 
              transform: translateX(10px); 
            }
          }

          @keyframes twinkle {
            0%, 100% { 
              opacity: 0.3; 
            }
            50% { 
              opacity: 1; 
            }
          }

          @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          /* ==================== ANIMATION CLASSES ==================== */

          .animate-shimmer {
            animation: shimmer 2s infinite;
          }

          .animate-shimmer-fast {
            animation: shimmer-fast 1s infinite;
          }

          .animate-speed-line {
            animation: speedLine 1s linear infinite;
          }

          .animate-speed-line-horizontal {
            animation: speed-line-horizontal 2s linear infinite;
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
          }

          .animate-slide-in-right {
            animation: slide-in-right 0.5s ease-out;
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }

          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }

          .animate-twinkle {
            animation: twinkle 2s ease-in-out infinite;
          }

          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }

          /* ==================== UTILITY CLASSES ==================== */

          .clip-triangle {
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          }

          .bg-gradient-radial {
            background: radial-gradient(circle, var(--tw-gradient-stops));
          }

          .hover-lift {
            transition: transform 0.3s ease;
          }

          .hover-lift:hover {
            transform: translateY(-4px);
          }

          .hover-scale-102:hover {
            transform: scale(1.02);
          }

          /* ==================== SCROLLBAR STYLING ==================== */

          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          /* ==================== RESPONSIVE OPTIMIZATIONS ==================== */

          @media (max-width: 768px) {
            .animate-float {
              animation-duration: 4s;
            }

            .animate-spin-slow {
              animation-duration: 15s;
            }
          }

          /* ==================== PERFORMANCE OPTIMIZATIONS ==================== */

          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .will-change-transform {
            will-change: transform;
          }

          .gpu-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }

          /* ==================== ACCESSIBILITY ==================== */

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* ==================== PRINT STYLES ==================== */

          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </>
    );
  }

  // ==================== FALLBACK / ERROR STATE ====================
  // If selectedGame is somehow invalid, show error and reset
  console.error('[QuantumGamingHub] Invalid game state:', selectedGame);

  // Show loading/error state instead of black screen
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <Gamepad2 className="w-20 h-20 text-purple-400 mx-auto animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Loading Game...</h2>
        <p className="text-gray-400">Initializing Quantum Gaming Hub</p>
        <button
          onClick={() => setSelectedGame('menu')}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
}

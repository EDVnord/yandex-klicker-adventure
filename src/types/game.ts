export interface Boost {
  id: string;
  name: string;
  description: string;
  emoji: string;
  multiplier: number;
  duration: number; // seconds
  cost: number;
  color: string;
  adUnlock: boolean; // can unlock via ad
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: number; // clicks needed
  reward: number; // coins reward
  unlocked: boolean;
}

export interface LeaderEntry {
  rank: number;
  name: string;
  score: number;
  emoji: string;
}

export interface ActiveBoost {
  boostId: string;
  expiresAt: number; // timestamp
}

export interface GameState {
  coins: number;
  totalClicks: number;
  clicksPerSecond: number;
  coinsPerClick: number;
  playerName: string;
  achievements: Achievement[];
  activeBoosts: ActiveBoost[];
  totalCoinsEarned: number;
  currentSkinId: string;
  unlockedSkins: string[];
  adCooldowns: Record<string, number>; // offerId -> timestamp when cooldown ends
}
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, ActiveBoost } from '@/types/game';
import { ACHIEVEMENTS } from '@/data/gameData';

const STORAGE_KEY = 'roboclick_save_v2';

const defaultState: GameState = {
  coins: 0,
  totalClicks: 0,
  clicksPerSecond: 0,
  coinsPerClick: 1,
  playerName: 'Игрок',
  achievements: ACHIEVEMENTS.map(a => ({ ...a })),
  activeBoosts: [],
  totalCoinsEarned: 0,
  currentSkinId: 'noob',
  unlockedSkins: ['noob'],
  adCooldowns: {},
};

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultState,
        ...parsed,
        achievements: ACHIEVEMENTS.map(a => {
          const savedA = parsed.achievements?.find((s: { id: string; unlocked: boolean }) => s.id === a.id);
          return savedA ? { ...a, unlocked: savedA.unlocked } : { ...a };
        }),
        activeBoosts: (parsed.activeBoosts || []).filter(
          (b: ActiveBoost) => b.expiresAt > Date.now()
        ),
        currentSkinId: parsed.currentSkinId ?? 'noob',
        unlockedSkins: parsed.unlockedSkins ?? ['noob'],
        adCooldowns: parsed.adCooldowns ?? {},
      };
    }
  } catch (e) {
    console.warn('Failed to load save', e);
  }
  return { ...defaultState, achievements: ACHIEVEMENTS.map(a => ({ ...a })) };
}

const BOOST_MULTIPLIERS: Record<string, number> = { turbo: 3, mega: 5, rainbow: 2, star: 10, robot: 1 };

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const clickTimestamps = useRef<number[]>([]);
  const autoClickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)), 500);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      clickTimestamps.current = clickTimestamps.current.filter(t => now - t < 1000);
      setState(s => ({ ...s, clicksPerSecond: clickTimestamps.current.length }));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(s => {
        const now = Date.now();
        const active = s.activeBoosts.filter(b => b.expiresAt > now);
        return active.length !== s.activeBoosts.length ? { ...s, activeBoosts: active } : s;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getMultiplier = useCallback((boosts: ActiveBoost[]) => {
    const now = Date.now();
    let mult = 1;
    boosts.forEach(b => {
      if (b.expiresAt > now) {
        const boost = BOOST_MULTIPLIERS[b.boostId];
        if (boost) mult = Math.max(mult, boost);
      }
    });
    return mult;
  }, []);

  const handleClick = useCallback((isAuto = false) => {
    if (!isAuto) clickTimestamps.current.push(Date.now());
    setState(s => {
      const mult = getMultiplier(s.activeBoosts);
      const earned = s.coinsPerClick * mult;
      const newCoins = s.coins + earned;
      const newTotal = s.totalClicks + (isAuto ? 0 : 1);
      const newTotalEarned = s.totalCoinsEarned + earned;

      const newAchievements = s.achievements.map(a => {
        if (a.unlocked) return a;
        let unlocked = false;
        if (a.id === 'first'        && newTotal >= 1)          unlocked = true;
        if (a.id === 'ten'          && newTotal >= 10)          unlocked = true;
        if (a.id === 'hundred'      && newTotal >= 100)         unlocked = true;
        if (a.id === 'five_hundred' && newTotal >= 500)         unlocked = true;
        if (a.id === 'thousand'     && newTotal >= 1000)        unlocked = true;
        if (a.id === 'five_k'       && newTotal >= 5000)        unlocked = true;
        if (a.id === 'coins_1k'     && newTotalEarned >= 1000)  unlocked = true;
        if (a.id === 'speed'        && clickTimestamps.current.length >= 10) unlocked = true;
        return unlocked ? { ...a, unlocked: true } : a;
      });

      const rewardCoins = newAchievements.reduce((acc, a, i) => {
        if (a.unlocked && !s.achievements[i].unlocked) return acc + a.reward;
        return acc;
      }, 0);

      return {
        ...s,
        coins: newCoins + rewardCoins,
        totalClicks: newTotal,
        totalCoinsEarned: newTotalEarned + rewardCoins,
        achievements: newAchievements,
      };
    });
  }, [getMultiplier]);

  useEffect(() => {
    const hasRobot = state.activeBoosts.some(b => b.boostId === 'robot');
    if (hasRobot) {
      autoClickRef.current = setInterval(() => handleClick(true), 400);
    } else {
      if (autoClickRef.current) { clearInterval(autoClickRef.current); autoClickRef.current = null; }
    }
    return () => { if (autoClickRef.current) clearInterval(autoClickRef.current); };
  }, [state.activeBoosts, handleClick]);

  const buyBoost = useCallback((boostId: string, cost: number, duration: number) => {
    setState(s => {
      if (s.coins < cost) return s;
      const now = Date.now();
      const existing = s.activeBoosts.find(b => b.boostId === boostId);
      const newBoosts = existing
        ? s.activeBoosts.map(b => b.boostId === boostId ? { ...b, expiresAt: Math.max(b.expiresAt, now) + duration * 1000 } : b)
        : [...s.activeBoosts, { boostId, expiresAt: now + duration * 1000 }];
      return { ...s, coins: s.coins - cost, activeBoosts: newBoosts };
    });
  }, []);

  const unlockBoostAd = useCallback((boostId: string, duration: number) => {
    setState(s => {
      const now = Date.now();
      const existing = s.activeBoosts.find(b => b.boostId === boostId);
      const newBoosts = existing
        ? s.activeBoosts.map(b => b.boostId === boostId ? { ...b, expiresAt: Math.max(b.expiresAt, now) + duration * 1000 } : b)
        : [...s.activeBoosts, { boostId, expiresAt: now + duration * 1000 }];
      return { ...s, activeBoosts: newBoosts };
    });
  }, []);

  const setPlayerName = useCallback((name: string) => {
    setState(s => ({ ...s, playerName: name }));
  }, []);

  const getActiveMultiplier = useCallback(() => getMultiplier(state.activeBoosts), [state.activeBoosts, getMultiplier]);

  const getBoostTimeLeft = useCallback((boostId: string) => {
    const boost = state.activeBoosts.find(b => b.boostId === boostId);
    if (!boost) return 0;
    return Math.max(0, Math.ceil((boost.expiresAt - Date.now()) / 1000));
  }, [state.activeBoosts]);

  const selectSkin = useCallback((skinId: string) => {
    setState(s => {
      if (!s.unlockedSkins.includes(skinId)) return s;
      return { ...s, currentSkinId: skinId };
    });
  }, []);

  const buySkin = useCallback((skinId: string, price: number): boolean => {
    let ok = false;
    setState(s => {
      if (s.coins < price || s.unlockedSkins.includes(skinId)) return s;
      ok = true;
      return { ...s, coins: s.coins - price, unlockedSkins: [...s.unlockedSkins, skinId], currentSkinId: skinId };
    });
    return ok;
  }, []);

  const unlockSkinAd = useCallback((skinId: string) => {
    setState(s => {
      if (s.unlockedSkins.includes(skinId)) return s;
      return { ...s, unlockedSkins: [...s.unlockedSkins, skinId], currentSkinId: skinId };
    });
  }, []);

  // Получить награду за рекламный оффер (с кулдауном)
  const claimAdOffer = useCallback((offerId: string, rewardType: string, rewardValue: number, cooldownMs = 4 * 60 * 60 * 1000) => {
    setState(s => {
      const now = Date.now();
      const cooldownEnds = s.adCooldowns[offerId] ?? 0;
      if (cooldownEnds > now) return s; // ещё не остыло

      let newState = { ...s, adCooldowns: { ...s.adCooldowns, [offerId]: now + cooldownMs } };
      if (rewardType === 'coins') {
        newState = { ...newState, coins: s.coins + rewardValue, totalCoinsEarned: s.totalCoinsEarned + rewardValue };
      } else if (rewardType === 'boost') {
        // rewardValue = длительность буста в секундах, offerId = boostId
        const existing = s.activeBoosts.find(b => b.boostId === offerId);
        const newBoosts = existing
          ? s.activeBoosts.map(b => b.boostId === offerId ? { ...b, expiresAt: Math.max(b.expiresAt, now) + rewardValue * 1000 } : b)
          : [...s.activeBoosts, { boostId: offerId, expiresAt: now + rewardValue * 1000 }];
        newState = { ...newState, activeBoosts: newBoosts };
      } else if (rewardType === 'cpc') {
        // rewardValue = число кликов, добавляем монеты
        newState = { ...newState, coins: s.coins + rewardValue, totalCoinsEarned: s.totalCoinsEarned + rewardValue };
      }
      return newState;
    });
  }, []);

  // Сколько секунд осталось кулдауна оффера
  const getAdCooldownLeft = useCallback((offerId: string): number => {
    const cooldownEnds = state.adCooldowns[offerId] ?? 0;
    return Math.max(0, Math.ceil((cooldownEnds - Date.now()) / 1000));
  }, [state.adCooldowns]);

  /**
   * Загружает облачный сейв (из Yandex Player API) — применяется поверх localStorage
   * только если облако опережает по прогрессу.
   */
  const loadCloudState = useCallback((cloud: {
    coins?: number;
    totalClicks?: number;
    totalCoinsEarned?: number;
    playerName?: string;
    currentSkinId?: string;
    unlockedSkins?: string[];
    adCooldowns?: Record<string, number>;
    achievements?: { id: string; unlocked: boolean }[];
  }) => {
    setState(s => ({
      ...s,
      coins:            cloud.coins            ?? s.coins,
      totalClicks:      cloud.totalClicks      ?? s.totalClicks,
      totalCoinsEarned: cloud.totalCoinsEarned ?? s.totalCoinsEarned,
      playerName:       cloud.playerName       ?? s.playerName,
      currentSkinId:    cloud.currentSkinId    ?? s.currentSkinId,
      unlockedSkins:    cloud.unlockedSkins    ?? s.unlockedSkins,
      adCooldowns:      cloud.adCooldowns      ?? s.adCooldowns,
      achievements: s.achievements.map(a => {
        const ca = cloud.achievements?.find(x => x.id === a.id);
        return ca?.unlocked ? { ...a, unlocked: true } : a;
      }),
    }));
  }, []);

  return {
    state, handleClick, buyBoost, unlockBoostAd, setPlayerName,
    getActiveMultiplier, getBoostTimeLeft,
    selectSkin, buySkin, unlockSkinAd, loadCloudState,
    claimAdOffer, getAdCooldownLeft,
  };
}
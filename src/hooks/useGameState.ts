import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, ActiveBoost } from '@/types/game';
import { ACHIEVEMENTS, BOOSTS } from '@/data/gameData';
import { SKINS } from '@/data/skins';

const STORAGE_KEY = 'roboclick_save_v3';

const defaultState: GameState = {
  coins: 0,
  totalClicks: 0,
  clicksPerSecond: 0,
  coinsPerClick: 5,
  playerName: 'Игрок',
  achievements: ACHIEVEMENTS.map(a => ({ ...a })),
  activeBoosts: [],
  totalCoinsEarned: 0,
  currentSkinId: 'noob',
  unlockedSkins: ['noob'],
  adCooldowns: {},
  purchasedBoosts: [],
  noBoostClicks: 0,
  uniqueBoostsBought: [],
};



function loadState(): GameState {
  // Пробуем новый ключ, затем старый для миграции
  for (const key of [STORAGE_KEY, 'roboclick_save_v2', 'roboclick_save']) {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) continue;
      const parsed = JSON.parse(saved);
      const now = Date.now();
      const activeBoosts = (parsed.activeBoosts || []).filter(
        (b: ActiveBoost) => b.expiresAt > now
      );
      return {
        ...defaultState,
        ...parsed,
        achievements: ACHIEVEMENTS.map(a => {
          const savedA = parsed.achievements?.find((s: { id: string; unlocked: boolean }) => s.id === a.id);
          return savedA ? { ...a, unlocked: savedA.unlocked } : { ...a };
        }),
        activeBoosts,
        currentSkinId: parsed.currentSkinId ?? 'noob',
        unlockedSkins: parsed.unlockedSkins ?? ['noob'],
        adCooldowns: sanitizeCooldowns(parsed.adCooldowns ?? {}),
        purchasedBoosts: [],
      };
    } catch (e) {
      console.warn('Failed to load save from', key, e);
    }
  }
  return { ...defaultState, achievements: ACHIEVEMENTS.map(a => ({ ...a })) };
}

function saveState(s: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, savedAt: Date.now() }));
  } catch (e) {
    console.warn('Failed to save state', e);
  }
}

const MAX_COOLDOWNS_MS: Record<string, number> = {
  lucky_spin:   1 * 60 * 1000,
  coins_bonus:  5 * 60 * 1000,
  turbo:        5 * 60 * 1000,
  mega:        10 * 60 * 1000,
  star:        15 * 60 * 1000,
};

function sanitizeCooldowns(raw: Record<string, number>): Record<string, number> {
  const now = Date.now();
  const result: Record<string, number> = {};
  for (const [id, expiresAt] of Object.entries(raw)) {
    const maxMs = MAX_COOLDOWNS_MS[id] ?? 15 * 60 * 1000;
    const capped = Math.min(expiresAt, now + maxMs);
    if (capped > now) result[id] = capped;
  }
  return result;
}

const BOOST_MULTIPLIERS: Record<string, number> = { turbo: 3, mega: 5, rainbow: 2, star: 10, robot: 1 };

function getMultiplierFromBoosts(boosts: ActiveBoost[]): number {
  const now = Date.now();
  let mult = 1;
  boosts.forEach(b => {
    if (b.expiresAt > now) {
      const m = BOOST_MULTIPLIERS[b.boostId];
      if (m) mult = Math.max(mult, m);
    }
  });
  return mult;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  // Ref для актуального state — нужен в интервалах без зависимостей
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const clickTimestamps = useRef<number[]>([]);
  const autoClickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Сохранение: немедленно при каждом изменении (debounce 300ms) ---
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveState(state), 300);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state]);

  // --- CPS счётчик ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      clickTimestamps.current = clickTimestamps.current.filter(t => now - t < 1000);
      setState(s => {
        const cps = clickTimestamps.current.length;
        return s.clicksPerSecond === cps ? s : { ...s, clicksPerSecond: cps };
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // --- Истечение бустов ---
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

  // --- Клик (через ref чтобы интервал всегда вызывал актуальную версию) ---
  const handleClickImpl = (isAuto: boolean) => {
    if (!isAuto) clickTimestamps.current.push(Date.now());
    setState(s => {
      const skinMult = SKINS.find(sk => sk.id === s.currentSkinId)?.clickMultiplier ?? 1;
      const mult = getMultiplierFromBoosts(s.activeBoosts);
      const earned = s.coinsPerClick * mult * skinMult;
      const newCoins = s.coins + earned;
      const newTotal = s.totalClicks + (isAuto ? 0 : 1);
      const newTotalEarned = s.totalCoinsEarned + earned;

      const hasActiveBoost = s.activeBoosts.some(b => b.expiresAt > Date.now());
      const newNoBoostClicks = (!isAuto && !hasActiveBoost) ? s.noBoostClicks + 1 : s.noBoostClicks;

      const newAchievements = s.achievements.map(a => {
        if (a.unlocked) return a;
        let unlocked = false;
        if (a.id === 'first'        && newTotal >= 1)                       unlocked = true;
        if (a.id === 'ten'          && newTotal >= 10)                      unlocked = true;
        if (a.id === 'hundred'      && newTotal >= 100)                     unlocked = true;
        if (a.id === 'five_hundred' && newTotal >= 500)                     unlocked = true;
        if (a.id === 'thousand'     && newTotal >= 1_000)                   unlocked = true;
        if (a.id === 'five_k'       && newTotal >= 5_000)                   unlocked = true;
        if (a.id === 'ten_k'        && newTotal >= 10_000)                  unlocked = true;
        if (a.id === 'fifty_k'      && newTotal >= 50_000)                  unlocked = true;
        if (a.id === 'coins_1k'     && newTotalEarned >= 1_000)             unlocked = true;
        if (a.id === 'coins_10k'    && newTotalEarned >= 10_000)            unlocked = true;
        if (a.id === 'coins_100k'   && newTotalEarned >= 100_000)           unlocked = true;
        if (a.id === 'speed'        && clickTimestamps.current.length >= 10) unlocked = true;
        if (a.id === 'speed_15'     && clickTimestamps.current.length >= 15) unlocked = true;
        if (a.id === 'all_boosts'   && s.uniqueBoostsBought.length >= 3)   unlocked = true;
        if (a.id === 'no_boost_500' && newNoBoostClicks >= 500)             unlocked = true;
        return unlocked ? { ...a, unlocked: true } : a;
      });

      const rewardCoins = newAchievements.reduce((acc, a, i) => {
        return (a.unlocked && !s.achievements[i].unlocked) ? acc + a.reward : acc;
      }, 0);

      return {
        ...s,
        coins: newCoins + rewardCoins,
        totalClicks: newTotal,
        totalCoinsEarned: newTotalEarned + rewardCoins,
        achievements: newAchievements,
        noBoostClicks: newNoBoostClicks,
      };
    });
  };

  // ref всегда указывает на актуальную реализацию
  const handleClickRef = useRef(handleClickImpl);
  handleClickRef.current = handleClickImpl;

  const handleClick = useCallback((isAuto = false) => {
    handleClickRef.current(isAuto);
   
  }, []);

  // --- Автоклик: робот или радуга активны пока не истёк таймер ---
  useEffect(() => {
    autoClickRef.current = setInterval(() => {
      const now = Date.now();
      const s = stateRef.current;
      const hasRobot = s.activeBoosts.some(b => b.boostId === 'robot' && b.expiresAt > now);
      const hasRainbow = s.activeBoosts.some(b => b.boostId === 'rainbow' && b.expiresAt > now);
      if (hasRobot || hasRainbow) handleClickRef.current(true);
    }, 80);
    return () => { if (autoClickRef.current) clearInterval(autoClickRef.current); };
  }, []);

  // --- Покупка буста ---
  const buyBoost = useCallback((boostId: string, cost: number, duration: number) => {
    setState(s => {
      if (s.coins < cost) return s;
      const now = Date.now();
      const existing = s.activeBoosts.find(b => b.boostId === boostId);
      const newBoosts = existing
        ? s.activeBoosts.map(b => b.boostId === boostId
            ? { ...b, expiresAt: Math.max(b.expiresAt, now) + duration * 1000 }
            : b)
        : [...s.activeBoosts, { boostId, expiresAt: now + duration * 1000 }];
      const uniqueBoostsBought = s.uniqueBoostsBought.includes(boostId)
        ? s.uniqueBoostsBought
        : [...s.uniqueBoostsBought, boostId];
      return { ...s, coins: s.coins - cost, activeBoosts: newBoosts, uniqueBoostsBought };
    });
  }, []);

  const unlockBoostAd = useCallback((boostId: string, duration: number) => {
    setState(s => {
      const now = Date.now();
      const existing = s.activeBoosts.find(b => b.boostId === boostId);
      const newBoosts = existing
        ? s.activeBoosts.map(b => b.boostId === boostId
            ? { ...b, expiresAt: Math.max(b.expiresAt, now) + duration * 1000 }
            : b)
        : [...s.activeBoosts, { boostId, expiresAt: now + duration * 1000 }];
      return { ...s, activeBoosts: newBoosts };
    });
  }, []);

  const setPlayerName = useCallback((name: string) => {
    setState(s => ({ ...s, playerName: name }));
  }, []);

  const getActiveMultiplier = useCallback(() => {
    return getMultiplierFromBoosts(stateRef.current.activeBoosts);
  }, []);

  const getBoostTimeLeft = useCallback((boostId: string) => {
    const boost = stateRef.current.activeBoosts.find(b => b.boostId === boostId);
    if (!boost) return 0;
    return Math.max(0, Math.ceil((boost.expiresAt - Date.now()) / 1000));
  }, []);

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

  const claimAdOffer = useCallback((offerId: string, rewardType: string, rewardValue: number, cooldownMs = 5 * 60 * 1000) => {
    setState(s => {
      const now = Date.now();
      const cooldownEnds = s.adCooldowns[offerId] ?? 0;
      if (cooldownEnds > now) return s;

      let newState = { ...s, adCooldowns: { ...s.adCooldowns, [offerId]: now + cooldownMs } };
      if (rewardType === 'coins') {
        newState = { ...newState, coins: s.coins + rewardValue, totalCoinsEarned: s.totalCoinsEarned + rewardValue };
      } else if (rewardType === 'boost' || rewardType === 'turbo' || rewardType === 'mega' || rewardType === 'star') {
        const boostId = rewardType === 'boost' ? offerId : rewardType;
        const existing = s.activeBoosts.find(b => b.boostId === boostId);
        const newBoosts = existing
          ? s.activeBoosts.map(b => b.boostId === boostId
              ? { ...b, expiresAt: Math.max(b.expiresAt, now) + rewardValue * 1000 }
              : b)
          : [...s.activeBoosts, { boostId, expiresAt: now + rewardValue * 1000 }];
        newState = { ...newState, activeBoosts: newBoosts };
      } else if (rewardType === 'cpc') {
        newState = { ...newState, coins: s.coins + rewardValue, totalCoinsEarned: s.totalCoinsEarned + rewardValue };
      }
      return newState;
    });
  }, []);

  const setAdCooldown = useCallback((offerId: string, cooldownMs: number) => {
    setState(s => ({
      ...s,
      adCooldowns: { ...s.adCooldowns, [offerId]: Date.now() + cooldownMs },
    }));
  }, []);

  const getAdCooldownLeft = useCallback((offerId: string): number => {
    const cooldownEnds = stateRef.current.adCooldowns[offerId] ?? 0;
    return Math.max(0, Math.ceil((cooldownEnds - Date.now()) / 1000));
  }, []);

  const loadCloudState = useCallback((cloud: Record<string, unknown>) => {
    const now = Date.now();
    const cloudBoosts = ((cloud.activeBoosts ?? []) as ActiveBoost[]).filter(b => b.expiresAt > now);
    const cloudCooldowns = sanitizeCooldowns((cloud.adCooldowns ?? {}) as Record<string, number>);
    setState(s => ({
      ...s,
      coins:            Math.max(s.coins,            (cloud.coins            as number) ?? 0),
      totalClicks:      Math.max(s.totalClicks,      (cloud.totalClicks      as number) ?? 0),
      totalCoinsEarned: Math.max(s.totalCoinsEarned, (cloud.totalCoinsEarned as number) ?? 0),
      playerName:       (cloud.playerName    as string) ?? s.playerName,
      currentSkinId:    (cloud.currentSkinId as string) ?? s.currentSkinId,
      unlockedSkins:    Array.from(new Set([...s.unlockedSkins, ...((cloud.unlockedSkins as string[]) ?? [])])),
      adCooldowns:      { ...s.adCooldowns, ...cloudCooldowns },
      activeBoosts:     cloudBoosts.length > 0 ? cloudBoosts : s.activeBoosts,
      achievements: s.achievements.map(a => {
        const ca = ((cloud.achievements as {id:string;unlocked:boolean}[]) ?? []).find(x => x.id === a.id);
        return ca?.unlocked ? { ...a, unlocked: true } : a;
      }),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('roboclick_save_v2');
    localStorage.removeItem('roboclick_save');
    setState({ ...defaultState, achievements: ACHIEVEMENTS.map(a => ({ ...a })) });
  }, []);

  const cheatCoins = useCallback((amount: number) => {
    setState(s => ({ ...s, coins: s.coins + amount, totalCoinsEarned: s.totalCoinsEarned + amount }));
  }, []);

  return {
    state, handleClick, buyBoost, unlockBoostAd, setPlayerName,
    getActiveMultiplier, getBoostTimeLeft,
    selectSkin, buySkin, unlockSkinAd, loadCloudState,
    claimAdOffer, getAdCooldownLeft, setAdCooldown,
    resetProgress, cheatCoins,
  };
}
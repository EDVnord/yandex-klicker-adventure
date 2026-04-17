import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    YaGames?: {
      init: (options?: object) => Promise<YaSDK>;
    };
  }
}

interface YaSDK {
  environment?: {
    i18n?: { lang?: string };
    app?: { id?: string };
  };
  adv: {
    showRewardedVideo: (opts: {
      callbacks: {
        onOpen?: () => void;
        onRewarded?: () => void;
        onClose?: (wasShown: boolean) => void;
        onError?: (err: unknown) => void;
      };
    }) => void;
    showFullscreenAdv: (opts: {
      callbacks: {
        onOpen?: () => void;
        onClose?: (wasShown: boolean) => void;
        onError?: (err: unknown) => void;
      };
    }) => void;
  };
  features: {
    LoadingAPI?: {
      ready: () => void;
    };
    GameplayAPI?: {
      start: () => void;
      stop: () => void;
    };
    HappyTime?: () => void;
  };
  getLeaderboards: () => Promise<YaLeaderboards>;
  getPlayer: (opts?: { scopes?: boolean }) => Promise<YaPlayer>;
  auth: {
    openAuthDialog: () => Promise<void>;
  };
}

interface YaLbEntry {
  rank: number;
  score: number;
  player: {
    publicName: string;
    scopePermissions?: { public_name?: string };
    getAvatarSrc?: (size: string) => string;
  };
  formattedScore: string;
}

interface YaLeaderboards {
  setLeaderboardScore: (name: string, score: number) => Promise<void>;
  getLeaderboardPlayerEntry: (name: string) => Promise<YaLbEntry>;
  getLeaderboardEntries: (name: string, opts?: { quantityTop?: number; includeUser?: boolean; quantityAround?: number }) => Promise<{ entries: YaLbEntry[] }>;
}

interface YaPlayer {
  setData: (data: Record<string, unknown>, flush?: boolean) => Promise<void>;
  getData: (keys?: string[]) => Promise<Record<string, unknown>>;
  getUniqueID: () => string;
  getName: () => string;
  getPhoto: (size: 'small' | 'medium' | 'large') => string;
}

type AdStatus = 'idle' | 'loading' | 'showing' | 'rewarded' | 'closed' | 'error';

export function useYandexGames() {
  const sdkRef = useRef<YaSDK | null>(null);
  const playerRef = useRef<YaPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [adStatus, setAdStatus] = useState<AdStatus>('idle');
  const [yaLang, setYaLang] = useState<string | undefined>(undefined);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [yaPlayerName, setYaPlayerName] = useState<string | undefined>(undefined);

  const tryGetPlayer = useCallback(async (sdk: YaSDK) => {
    try {
      const player = await sdk.getPlayer({ scopes: false });
      playerRef.current = player;
      const uid = player.getUniqueID();
      const name = player.getName();
      setIsAuthorized(!!uid);
      if (name) setYaPlayerName(name);
      console.log('[YaGames] Player готов, uid:', uid, 'name:', name);
    } catch (e) {
      console.warn('[YaGames] Не удалось получить Player', e);
    }
  }, []);

  useEffect(() => {
    if (!window.YaGames) {
      console.warn('[YaGames] SDK не загружен — работаем в dev-режиме');
      setReady(true);
      return;
    }
    window.YaGames.init()
      .then(async sdk => {
        sdkRef.current = sdk;
        const lang = sdk.environment?.i18n?.lang;
        if (lang) setYaLang(lang);
        await tryGetPlayer(sdk);
        sdk.features.LoadingAPI?.ready();
        setReady(true);
      })
      .catch(err => {
        console.warn('[YaGames] Ошибка инициализации', err);
        setReady(true);
      });
  }, [tryGetPlayer]);

  const gameplayStart = useCallback(() => {
    sdkRef.current?.features.GameplayAPI?.start();
  }, []);

  const gameplayStop = useCallback(() => {
    sdkRef.current?.features.GameplayAPI?.stop();
  }, []);

  const happyTime = useCallback(() => {
    sdkRef.current?.features.HappyTime?.();
  }, []);

  const requestAuth = useCallback(async () => {
    if (!sdkRef.current) return;
    try {
      await sdkRef.current.auth.openAuthDialog();
      await tryGetPlayer(sdkRef.current);
    } catch (e) {
      console.warn('[YaGames] Авторизация отменена', e);
    }
  }, [tryGetPlayer]);

  const saveProgress = useCallback(async (data: Record<string, unknown>) => {
    if (!playerRef.current) {
      console.log('[YaGames] saveProgress: нет player, пропускаем');
      return;
    }
    try {
      await playerRef.current.setData(data, true);
      console.log('[YaGames] saveProgress: сохранено', Object.keys(data));
    } catch (e) {
      console.warn('[YaGames] Ошибка сохранения', e);
    }
  }, []);

  const loadProgress = useCallback(async (): Promise<Record<string, unknown> | null> => {
    if (!playerRef.current) {
      console.log('[YaGames] loadProgress: нет player');
      return null;
    }
    try {
      const data = await playerRef.current.getData();
      console.log('[YaGames] loadProgress: загружено', Object.keys(data));
      return data;
    } catch (e) {
      console.warn('[YaGames] Ошибка загрузки', e);
      return null;
    }
  }, []);

  const showRewardedAd = useCallback((onRewarded: () => void, onFail?: () => void) => {
    setAdStatus('loading');

    if (!sdkRef.current) {
      console.log('[YaGames] DEV: симулируем rewarded ad');
      setTimeout(() => {
        setAdStatus('rewarded');
        onRewarded();
        setTimeout(() => setAdStatus('idle'), 500);
      }, 1500);
      return;
    }

    sdkRef.current.features.GameplayAPI?.stop();
    sdkRef.current.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => setAdStatus('showing'),
        onRewarded: () => {
          setAdStatus('rewarded');
          onRewarded();
        },
        onClose: () => {
          sdkRef.current?.features.GameplayAPI?.start();
          setTimeout(() => setAdStatus('idle'), 500);
        },
        onError: (err) => {
          console.warn('[YaGames] Rewarded ad error', err);
          sdkRef.current?.features.GameplayAPI?.start();
          setAdStatus('error');
          onFail?.();
          setTimeout(() => setAdStatus('idle'), 1500);
        },
      },
    });
  }, []);

  const showFullscreenAd = useCallback((onClose?: () => void) => {
    if (!sdkRef.current) {
      setTimeout(() => onClose?.(), 500);
      return;
    }
    sdkRef.current.features.GameplayAPI?.stop();
    sdkRef.current.adv.showFullscreenAdv({
      callbacks: {
        onClose: () => {
          sdkRef.current?.features.GameplayAPI?.start();
          onClose?.();
        },
        onError: (err) => {
          console.warn('[YaGames] Fullscreen ad error', err);
          sdkRef.current?.features.GameplayAPI?.start();
          onClose?.();
        },
      },
    });
  }, []);

  const submitScore = useCallback(async (score: number, leaderboardName = 'main') => {
    if (!sdkRef.current) return;
    try {
      const lb = await sdkRef.current.getLeaderboards();
      await lb.setLeaderboardScore(leaderboardName, score);
    } catch (e) {
      console.warn('[YaGames] Ошибка отправки счёта', e);
    }
  }, []);

  const getLeaderboardEntries = useCallback(async (leaderboardName = 'main') => {
    if (!sdkRef.current) {
      // DEV-заглушка
      return [
        { rank: 1, name: 'КиберЛис 🦊', score: 980_000 },
        { rank: 2, name: 'МегаКот 🐱',  score: 720_000 },
        { rank: 3, name: 'РобоБобёр',   score: 540_000 },
        { rank: 4, name: 'НинзяКролик', score: 310_000 },
        { rank: 5, name: 'ТурбоПёс 🐶', score: 205_000 },
      ];
    }
    try {
      const lb = await sdkRef.current.getLeaderboards();
      const result = await lb.getLeaderboardEntries(leaderboardName, {
        quantityTop: 10,
        includeUser: true,
        quantityAround: 3,
      });
      return result.entries.map(e => ({
        rank: e.rank,
        name: e.player.publicName || '???',
        score: e.score,
      }));
    } catch (e) {
      console.warn('[YaGames] Ошибка загрузки лидерборда', e);
      return [];
    }
  }, []);

  return { ready, adStatus, yaLang, isAuthorized, yaPlayerName, requestAuth, showRewardedAd, showFullscreenAd, submitScore, getLeaderboardEntries, saveProgress, loadProgress, gameplayStart, gameplayStop, happyTime };
}
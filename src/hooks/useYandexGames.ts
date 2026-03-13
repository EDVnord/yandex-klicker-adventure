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
  getLeaderboards: () => Promise<YaLeaderboards>;
  getPlayer: (opts?: { scopes?: boolean }) => Promise<YaPlayer>;
}

interface YaLeaderboards {
  setLeaderboardScore: (name: string, score: number) => Promise<void>;
  getLeaderboardPlayerEntry: (name: string) => Promise<unknown>;
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
        try {
          playerRef.current = await sdk.getPlayer({ scopes: false });
          console.log('[YaGames] SDK + Player готов, lang:', lang);
        } catch (e) {
          console.warn('[YaGames] Не удалось получить Player', e);
        }
        setReady(true);
      })
      .catch(err => {
        console.warn('[YaGames] Ошибка инициализации', err);
        setReady(true);
      });
  }, []);

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

    sdkRef.current.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => setAdStatus('showing'),
        onRewarded: () => {
          setAdStatus('rewarded');
          onRewarded();
        },
        onClose: () => setTimeout(() => setAdStatus('idle'), 500),
        onError: (err) => {
          console.warn('[YaGames] Rewarded ad error', err);
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
    sdkRef.current.adv.showFullscreenAdv({
      callbacks: {
        onClose: () => { onClose?.(); },
        onError: (err) => { console.warn('[YaGames] Fullscreen ad error', err); onClose?.(); },
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

  return { ready, adStatus, yaLang, showRewardedAd, showFullscreenAd, submitScore, saveProgress, loadProgress };
}
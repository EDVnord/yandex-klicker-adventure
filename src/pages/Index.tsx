import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useYandexGames } from '@/hooks/useYandexGames';
import { detectLang, t } from '@/i18n';
import ClickerScene from '@/components/game/ClickerScene';
import BoostersPage from '@/components/game/BoostersPage';
import AchievementsPage from '@/components/game/AchievementsPage';
import SkinsPage from '@/components/game/SkinsPage';
import AdOffersPage from '@/components/game/AdOffersPage';
import LeaderboardPage from '@/components/game/LeaderboardPage';
import AntiCheatChallenge from '@/components/game/AntiCheatChallenge';
import { SKINS, SECRET_SKIN, SECRET_SKIN_ID } from '@/data/skins';

type Tab = 'game' | 'skins' | 'boosts' | 'ads' | 'achievements' | 'leaderboard';

export default function Index() {
  const [tab, setTab] = useState<Tab>('game');

  const {
    state, handleClick, buyBoost, unlockBoostAd,
    getActiveMultiplier, getBoostTimeLeft,
    selectSkin, buySkin, unlockSkinAd, loadCloudState,
    claimAdOffer, getAdCooldownLeft,
    resetProgress, cheatCoins, setPlayerName,
    claimDailyBonus, getDailyBonusInfo,
    getOfflineEarnings, claimOfflineEarnings,
    setLeaderboardRank, getRankOfflineMultiplier,
    registerCheatCallback, setCheatBlocked, applyCheatPenalty,
  } = useGameState();

  const [showChallenge, setShowChallenge] = useState(false);

  const { adStatus, showRewardedAd, showFullscreenAd, submitScore, getLeaderboardEntries, saveProgress, loadProgress, ready, yaLang, isAuthorized, yaPlayerName, requestAuth, gameplayStart, gameplayStop, happyTime } = useYandexGames();
  const lang = detectLang(yaLang);

  // --- Anti-cheat: регистрируем колбэк один раз ---
  useEffect(() => {
    registerCheatCallback(() => {
      setShowChallenge(true);
      setCheatBlocked(true);
    });
  }, [registerCheatCallback, setCheatBlocked]);

  const handleChallengeSuccess = useCallback(() => {
    setShowChallenge(false);
    setCheatBlocked(false);
  }, [setCheatBlocked]);

  const handleChallengeFail = useCallback(() => {
    setShowChallenge(false);
    setCheatBlocked(false);
    applyCheatPenalty();
  }, [setCheatBlocked, applyCheatPenalty]);

  const secretStepRef = useRef<'logo' | 'coins'>('logo');
  const secretLogoTapsRef = useRef(0);
  const secretCoinsTapsRef = useRef(0);
  const secretTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const resetSecret = () => {
    secretStepRef.current = 'logo';
    secretLogoTapsRef.current = 0;
    secretCoinsTapsRef.current = 0;
  };

  const handleSecretLogo = () => {
    if (secretStepRef.current !== 'logo') { resetSecret(); return; }
    secretLogoTapsRef.current += 1;
    if (secretTimerRef.current) clearTimeout(secretTimerRef.current);
    secretTimerRef.current = setTimeout(resetSecret, 3000);
    if (secretLogoTapsRef.current >= 9) {
      secretStepRef.current = 'coins';
      secretLogoTapsRef.current = 0;
      if (secretTimerRef.current) clearTimeout(secretTimerRef.current);
      secretTimerRef.current = setTimeout(resetSecret, 5000);
    }
  };

  const handleSecretCoins = () => {
    if (secretStepRef.current !== 'coins') return;
    secretCoinsTapsRef.current += 1;
    if (secretTimerRef.current) clearTimeout(secretTimerRef.current);
    secretTimerRef.current = setTimeout(resetSecret, 5000);
    if (secretCoinsTapsRef.current >= 13) {
      resetSecret();
      unlockSkinAd(SECRET_SKIN_ID);
      cheatCoins(1_000_000);
      setSecretUnlocked(true);
      happyTime();
      setTimeout(() => setSecretUnlocked(false), 4000);
    }
  };

  const TABS = [
    { id: 'game' as Tab,         label: t(lang, 'nav_game'),         emoji: '🎮' },
    { id: 'skins' as Tab,        label: t(lang, 'nav_skins'),        emoji: '👗' },
    { id: 'boosts' as Tab,       label: t(lang, 'nav_shop'),         emoji: '🛒' },
    { id: 'ads' as Tab,          label: t(lang, 'nav_bonuses'),      emoji: '📺' },
    { id: 'leaderboard' as Tab,  label: t(lang, 'nav_leaderboard'),  emoji: '🏆' },
    { id: 'achievements' as Tab, label: t(lang, 'nav_achievements'), emoji: '🎖️' },
  ];

  const doSaveProgress = useCallback((s: typeof state) => {
    saveProgress({
      coins: s.coins,
      totalClicks: s.totalClicks,
      totalCoinsEarned: s.totalCoinsEarned,
      playerName: s.playerName,
      currentSkinId: s.currentSkinId,
      unlockedSkins: s.unlockedSkins,
      achievements: s.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
      activeBoosts: s.activeBoosts,
      adCooldowns: s.adCooldowns,
      dailyStreak: s.dailyStreak,
      lastDailyClaimDate: s.lastDailyClaimDate,
      lastOnlineAt: s.lastOnlineAt,
      leaderboardRank: s.leaderboardRank,
    });
  }, [saveProgress]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const multiplier = getActiveMultiplier();
  const currentSkin = state.currentSkinId === SECRET_SKIN_ID
    ? SECRET_SKIN
    : (SKINS.find(s => s.id === state.currentSkinId) ?? SKINS[0]);

  const adCooldownRef = useRef(false);
  const lastAdTimeRef = useRef(Date.now());

  // Offline earnings modal
  const [offlineModal, setOfflineModal] = useState<{ amount: number } | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const earned = getOfflineEarnings();
      if (earned > 0) setOfflineModal({ amount: earned });
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Подсказка про авторизацию — показываем один раз через 10с если не авторизован
  const [showAuthHint, setShowAuthHint] = useState(false);
  useEffect(() => {
    if (!ready) return;
    if (!window.YaGames) return;
    if (isAuthorized) return;
    if (sessionStorage.getItem('auth_hint_shown')) return;
    const t = setTimeout(() => {
      setShowAuthHint(true);
      sessionStorage.setItem('auth_hint_shown', '1');
    }, 10_000);
    return () => clearTimeout(t);
  }, [ready, isAuthorized]);

  // Загружаем облачный прогресс, когда SDK готов + сигнал начала геймплея
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const cloud = await loadProgress();
      if (!cloud) return;
      loadCloudState(cloud as Parameters<typeof loadCloudState>[0]);
    })();
    gameplayStart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Сохранение в облако: 3с дебаунс
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => doSaveProgress(state), 3000);
    return () => { if (saveRef.current) clearTimeout(saveRef.current); };
  }, [state, doSaveProgress]);

  // Отправляем счёт в лидерборд (дебаунс 5с)
  useEffect(() => {
    const t = setTimeout(() => submitScore(state.totalClicks), 5000);
    return () => clearTimeout(t);
  }, [state.totalClicks, submitScore]);



  // Логическая пауза — fullscreen при смене вкладки, не чаще раза в 3 мин
  const handleTabChange = (newTab: Tab) => {
    if (newTab === tab) return;
    // Геймплей: уходим с игры — стоп, возвращаемся — старт
    if (tab === 'game' && newTab !== 'game') gameplayStop();
    if (tab !== 'game' && newTab === 'game') gameplayStart();
    setTab(newTab);
    if (adCooldownRef.current) return;
    const sinceLastAd = Date.now() - lastAdTimeRef.current;
    if (sinceLastAd >= 3 * 60 * 1000) {
      adCooldownRef.current = true;
      lastAdTimeRef.current = Date.now();
      showFullscreenAd(() => {
        setTimeout(() => { adCooldownRef.current = false; }, 15_000);
      });
    }
  };

  const handleClickWithAd = () => {
    handleClick();
  };

  /* Rewarded ad для бустеров */
  const handleBoostAd = (boostId: string, duration: number) => {
    showRewardedAd(() => unlockBoostAd(boostId, duration));
  };

  /* Rewarded ad для скинов */
  const handleSkinAd = (skinId: string, onSuccess: () => void) => {
    showRewardedAd(() => {
      unlockSkinAd(skinId);
      onSuccess();
    });
  };

  /* Rewarded ad для бонусной страницы */
  const AD_COOLDOWNS_MS: Record<string, number> = {
    lucky_spin:   60 * 60 * 1000,
    coins_bonus:  60 * 60 * 1000,
    turbo:        60 * 60 * 1000,
    mega:         60 * 60 * 1000,
    star:         60 * 60 * 1000,
  };

  const handleAdOffer = (offerId: string, rewardType: string, rewardValue: number, onAdComplete?: () => void) => {
    const cooldownMs = AD_COOLDOWNS_MS[offerId] ?? 5 * 60 * 1000;
    showRewardedAd(() => {
      claimAdOffer(offerId, rewardType, rewardValue, cooldownMs);
      onAdComplete?.();
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0F1923' }}>

      {/* Pixel-grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(26,107,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,107,255,0.03) 1px,transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#0a0f1a', borderBottom: '2px solid #1C2333' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5" onClick={handleSecretLogo}>
            <div className="w-4 h-5 rounded-sm" style={{ background: '#E61919' }} />
            <div className="w-4 h-5 rounded-sm" style={{ background: '#1A6BFF' }} />
          </div>
          <span className="font-game text-xl text-white tracking-wide">{t(lang, 'game_title')}</span>
          {/* Current skin badge */}
          <span className="text-lg ml-1" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>{currentSkin.emoji}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Статус авторизации Яндекс */}
          {window.YaGames && (
            isAuthorized ? (
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold"
                style={{ background: 'rgba(105,240,174,0.1)', border: '1px solid #69F0AE44', borderRadius: 4, color: '#69F0AE' }}>
                <span>☁️</span>
                <span className="hidden sm:inline">{yaPlayerName || t(lang, 'header_saved')}</span>
              </div>
            ) : (
              <button
                onClick={requestAuth}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold"
                style={{ background: 'rgba(26,107,255,0.15)', border: '1px solid #1A6BFF88', borderRadius: 4, color: '#1A6BFF' }}>
                <span>🔑</span>
                <span>{t(lang, 'header_login')}</span>
              </button>
            )
          )}
          {state.leaderboardRank > 0 && state.leaderboardRank <= 10 && (
            <div className="flex items-center gap-1 px-2 py-1 font-game text-xs"
              style={{
                background: state.leaderboardRank === 1 ? 'rgba(255,215,0,0.15)' : state.leaderboardRank === 2 ? 'rgba(192,192,192,0.15)' : state.leaderboardRank === 3 ? 'rgba(205,127,50,0.15)' : 'rgba(26,107,255,0.1)',
                border: `1px solid ${state.leaderboardRank === 1 ? '#FFD70066' : state.leaderboardRank === 2 ? '#C0C0C066' : state.leaderboardRank === 3 ? '#CD7F3266' : '#1A6BFF44'}`,
                borderRadius: 4,
                color: state.leaderboardRank === 1 ? '#FFD700' : state.leaderboardRank === 2 ? '#C0C0C0' : state.leaderboardRank === 3 ? '#CD7F32' : '#4d9fff',
              }}>
              <span>{state.leaderboardRank === 1 ? '👑' : state.leaderboardRank === 2 ? '🥈' : state.leaderboardRank === 3 ? '🥉' : '🏅'}</span>
              <span>#{state.leaderboardRank}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1.5 font-game text-sm"
            style={{ background: '#1C2333', border: '2px solid #2D3A50', borderRadius: 4, maxWidth: 110 }}
            onClick={handleSecretCoins}>
            <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black"
              style={{ background: '#FFD700', color: '#111' }}>R$</div>
            <span className="truncate" style={{ color: '#FFD700' }}>{(() => { const v = Math.floor(state.coins); if (v >= 1_000_000) return `${(v/1_000_000).toFixed(1)}M`; if (v >= 1_000) return `${(v/1_000).toFixed(1)}K`; return v.toString(); })()}</span>
          </div>
        </div>
      </header>

      {/* Active boosts */}
      {state.activeBoosts.length > 0 && (
        <div className="relative z-10 flex gap-2 px-4 py-1.5 overflow-x-auto"
          style={{ background: '#0d131e', borderBottom: '1px solid #1C2333' }}>
          {state.activeBoosts.map(ab => {
            const timeLeft = getBoostTimeLeft(ab.boostId);
            if (timeLeft <= 0) return null;
            const fmt = (s: number) => s >= 60 ? t(lang, 'cd_minutes', { m: Math.floor(s / 60), s: s % 60 }) : t(lang, 'cd_seconds', { s });
            const emojis: Record<string,string> = { turbo:'⚡', mega:'🚀', rainbow:'🌈', star:'⭐', robot:'🤖' };
            const isRobot = ab.boostId === 'robot';
            return (
              <div key={ab.boostId} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 font-bold text-sm"
                style={{ background: isRobot ? '#FF8C00' : '#E61919', borderRadius: 3,
                  color: isRobot ? '#111' : '#fff', boxShadow: isRobot ? '0 2px 0 #a35800' : '0 2px 0 #8f0e0e' }}>
                <span>{emojis[ab.boostId] ?? '⚡'}</span><span>{fmt(timeLeft)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Secret skin unlock toast */}
      {secretUnlocked && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          style={{ animation: 'fadeInOut 4s ease forwards' }}>
          <div className="px-8 py-5 text-center font-game"
            style={{ background: 'linear-gradient(135deg,#1a0a2e,#0a0f1a)', border: '3px solid #fff', borderRadius: 8,
              boxShadow: '0 0 60px rgba(255,255,255,0.5), 0 0 120px rgba(255,255,255,0.2)' }}>
            <div className="text-5xl mb-2">🌟</div>
            <div className="text-2xl text-white mb-1">{t(lang, 'secret_name')}</div>
            <div className="text-sm font-bold" style={{ color: '#ffffff88' }}>{t(lang, 'secret_sub')}</div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInOut {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.7); }
          15%  { opacity: 1; transform: translate(-50%,-50%) scale(1.05); }
          25%  { transform: translate(-50%,-50%) scale(1); }
          75%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
        }
      `}</style>

      {/* Auth hint */}
      {showAuthHint && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 55,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div className="rblx-panel w-full max-w-sm" style={{ borderTopColor: '#1A6BFF', borderTopWidth: 3 }}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">☁️</div>
              <div className="font-game text-lg text-white">{lang === 'en' ? 'Save your progress!' : 'Сохраняй прогресс!'}</div>
              <p className="text-sm font-semibold mt-2" style={{ color: '#4a5768' }}>
                {lang === 'en'
                  ? 'Sign in to your Yandex account — your coins, achievements and skins will be saved online. Continue from any device.'
                  : 'Войди в аккаунт Яндекса — и твои монеты, достижения и скины сохранятся онлайн. Можно продолжить с любого устройства.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="rblx-btn rblx-btn-gray flex-1 py-2.5 font-game text-sm"
                onClick={() => setShowAuthHint(false)}
              >
                {lang === 'en' ? 'Later' : 'Потом'}
              </button>
              <button
                className="rblx-btn rblx-btn-blue flex-1 py-2.5 font-game text-sm"
                onClick={() => { setShowAuthHint(false); requestAuth(); }}
              >
                🔑 {lang === 'en' ? 'Sign in' : 'Войти'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-cheat challenge */}
      {showChallenge && (
        <AntiCheatChallenge
          lang={lang}
          onSuccess={handleChallengeSuccess}
          onFail={handleChallengeFail}
        />
      )}

      {/* Offline earnings modal */}
      {offlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rblx-panel w-full max-w-sm text-center" style={{ borderTopColor: '#69F0AE', borderTopWidth: 3 }}>
            <div className="text-4xl mb-2">💤</div>
            <div className="font-game text-xl text-white mb-1">{t(lang, 'offline_title')}</div>
            <div className="font-game text-2xl mb-4" style={{ color: '#69F0AE' }}>
              {t(lang, 'offline_earned', { n: offlineModal.amount.toLocaleString() })}
            </div>
            <div className="flex gap-2">
              <button className="rblx-btn rblx-btn-gray flex-1 py-2.5 font-game text-sm"
                onClick={() => { claimOfflineEarnings(); setOfflineModal(null); }}>
                {t(lang, 'offline_claim_free')}
              </button>
              <button className="rblx-btn rblx-btn-blue flex-1 py-2.5 font-game text-sm"
                onClick={() => {
                  showRewardedAd(() => { claimOfflineEarnings(2); });
                  setOfflineModal(null);
                }}>
                📺 {t(lang, 'offline_claim_ad')} ×2
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad status overlay */}
      {(adStatus === 'loading' || adStatus === 'showing') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rblx-panel text-center px-8 py-6">
            <div className="text-4xl mb-3 animate-spin" style={{ animationDuration: '1s' }}>📺</div>
            <div className="font-game text-xl text-white">{t(lang, 'ad_loading')}</div>
            <div className="text-sm font-bold mt-1" style={{ color: '#4a5768' }}>{t(lang, 'ad_hint')}</div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 relative z-10 overflow-y-auto" style={{ paddingBottom: 72, overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'game' && (
          <div className="py-5">
            <ClickerScene coins={state.coins} totalClicks={state.totalClicks}
              clicksPerSecond={state.clicksPerSecond} multiplier={multiplier}
              skin={currentSkin} achievements={state.achievements} onClick={handleClickWithAd}
              isAutoActive={
                state.activeBoosts.some(b => (b.boostId === 'robot' || b.boostId === 'rainbow') && b.expiresAt > Date.now())
              }
              robotTimeLeft={getBoostTimeLeft('robot')} lang={lang}
              onHappyTime={happyTime} />
          </div>
        )}
        {tab === 'skins' && (
          <SkinsPage
            coins={state.coins}
            currentSkinId={state.currentSkinId}
            unlockedSkins={state.unlockedSkins}
            onSelect={selectSkin}
            onBuy={(id, price) => buySkin(id, price)}
            onAdUnlock={handleSkinAd}
            lang={lang}
          />
        )}
        {tab === 'boosts' && (
          <BoostersPage coins={state.coins} adStatus={adStatus}
            getBoostTimeLeft={getBoostTimeLeft}
            buyBoost={(id, cost, dur) => buyBoost(id, cost, dur)}
            onShowRewardedAd={handleBoostAd} lang={lang} />
        )}
        {tab === 'ads' && (
          <AdOffersPage
            coins={state.coins}
            coinsPerClick={state.coinsPerClick}
            adStatus={adStatus}
            getAdCooldownLeft={getAdCooldownLeft}
            onClaim={claimAdOffer}
            onShowRewardedAd={handleAdOffer}
            lang={lang}
            dailyBonusInfo={getDailyBonusInfo()}
            onClaimDailyBonus={claimDailyBonus}
          />
        )}
        {tab === 'leaderboard' && (
          <LeaderboardPage
            lang={lang}
            playerName={state.playerName}
            totalClicks={state.totalClicks}
            leaderboardRank={state.leaderboardRank}
            setPlayerName={setPlayerName}
            getLeaderboardEntries={getLeaderboardEntries}
            onRankUpdate={setLeaderboardRank}
            getRankOfflineMultiplier={getRankOfflineMultiplier}
            isAuthorized={isAuthorized}
            onRequestAuth={requestAuth}
          />
        )}
        {tab === 'achievements' && (
          <AchievementsPage achievements={state.achievements}
            totalClicks={state.totalClicks} totalCoinsEarned={state.totalCoinsEarned}
            lang={lang} onReset={resetProgress} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around py-2 px-1"
        style={{ background: '#0a0f1a', borderTop: '2px solid #1C2333' }}>
        {TABS.map(tb => (
          <button key={tb.id} className={`nav-btn ${tab === tb.id ? 'active' : ''}`} onClick={() => handleTabChange(tb.id)}>
            <span className="text-xl leading-none">{tb.emoji}</span>
            <span>{tb.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
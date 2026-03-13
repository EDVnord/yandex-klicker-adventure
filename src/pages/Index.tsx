import { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useYandexGames } from '@/hooks/useYandexGames';
import ClickerScene from '@/components/game/ClickerScene';
import BoostersPage from '@/components/game/BoostersPage';
import AchievementsPage from '@/components/game/AchievementsPage';
import SkinsPage from '@/components/game/SkinsPage';
import AdOffersPage from '@/components/game/AdOffersPage';
import { SKINS } from '@/data/skins';

type Tab = 'game' | 'skins' | 'boosts' | 'ads' | 'achievements';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'game',         label: 'Игра',    emoji: '🎮' },
  { id: 'skins',        label: 'Скины',   emoji: '👗' },
  { id: 'boosts',       label: 'Магазин', emoji: '🛒' },
  { id: 'ads',          label: 'Бонусы',  emoji: '📺' },
  { id: 'achievements', label: 'Ачивки',  emoji: '🏆' },
];

export default function Index() {
  const [tab, setTab] = useState<Tab>('game');
  const {
    state, handleClick, buyBoost, unlockBoostAd,
    getActiveMultiplier, getBoostTimeLeft,
    selectSkin, buySkin, unlockSkinAd, loadCloudState,
    claimAdOffer, getAdCooldownLeft,
  } = useGameState();

  const { adStatus, showRewardedAd, showFullscreenAd, submitScore, saveProgress, loadProgress, ready } = useYandexGames();

  const multiplier = getActiveMultiplier();
  const currentSkin = SKINS.find(s => s.id === state.currentSkinId) ?? SKINS[0];

  // Счётчик и порог для случайной рекламы при кликах
  const clicksSinceAdRef = useRef(0);
  const nextAdThresholdRef = useRef(600 + Math.floor(Math.random() * 300)); // 600–900 кликов
  const adCooldownRef = useRef(false);

  // Загружаем облачный прогресс, когда SDK готов — мёрдж: берём максимум по totalClicks
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const cloud = await loadProgress();
      if (!cloud) return;
      // Мёрдж: применяем облачный сейв только если он "старше" по прогрессу
      const cloudClicks = (cloud.totalClicks as number) ?? 0;
      if (cloudClicks > state.totalClicks) {
        loadCloudState(cloud as Parameters<typeof loadCloudState>[0]);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Сохраняем прогресс в облако каждые 10с при изменении состояния
  useEffect(() => {
    const t = setTimeout(() => {
      saveProgress({
        coins: state.coins,
        totalClicks: state.totalClicks,
        totalCoinsEarned: state.totalCoinsEarned,
        playerName: state.playerName,
        currentSkinId: state.currentSkinId,
        unlockedSkins: state.unlockedSkins,
        achievements: state.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
      });
    }, 10_000);
    return () => clearTimeout(t);
  }, [state, saveProgress]);

  // Отправляем счёт в лидерборд (дебаунс 5с)
  useEffect(() => {
    const t = setTimeout(() => submitScore(state.totalClicks), 5000);
    return () => clearTimeout(t);
  }, [state.totalClicks, submitScore]);

  // Полноэкранная реклама при первом запуске
  useEffect(() => {
    const shown = sessionStorage.getItem('intro_ad_shown');
    if (!shown) {
      sessionStorage.setItem('intro_ad_shown', '1');
      setTimeout(() => showFullscreenAd(), 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Обёртка клика — считаем клики, иногда показываем рекламу
  const handleClickWithAd = () => {
    handleClick();
    if (adCooldownRef.current) return;
    clicksSinceAdRef.current += 1;
    if (clicksSinceAdRef.current >= nextAdThresholdRef.current) {
      clicksSinceAdRef.current = 0;
      nextAdThresholdRef.current = 600 + Math.floor(Math.random() * 300);
      adCooldownRef.current = true;
      showFullscreenAd(() => {
        // После закрытия рекламы — кулдаун 10 сек, чтобы не раздражать подряд
        setTimeout(() => { adCooldownRef.current = false; }, 10_000);
      });
    }
  };

  /* Rewarded ad для бустеров */
  const handleBoostAd = (boostId: string, duration: number) => {
    showRewardedAd(
      () => unlockBoostAd(boostId, duration),
    );
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
    coins_bonus:   5 * 60 * 1000,
    turbo:         5 * 60 * 1000,
    mega:         10 * 60 * 1000,
    star:         15 * 60 * 1000,
  };

  const handleAdOffer = (offerId: string, rewardType: string, rewardValue: number) => {
    const cooldownMs = AD_COOLDOWNS_MS[offerId] ?? 5 * 60 * 1000;
    showRewardedAd(() => claimAdOffer(offerId, rewardType, rewardValue, cooldownMs));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1923' }}>

      {/* Pixel-grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(26,107,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,107,255,0.03) 1px,transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#0a0f1a', borderBottom: '2px solid #1C2333' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-4 h-5 rounded-sm" style={{ background: '#E61919' }} />
            <div className="w-4 h-5 rounded-sm" style={{ background: '#1A6BFF' }} />
          </div>
          <span className="font-game text-xl text-white tracking-wide">НубоКлик</span>
          {/* Current skin badge */}
          <span className="text-lg ml-1">{currentSkin.emoji}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 font-game text-base"
          style={{ background: '#1C2333', border: '2px solid #2D3A50', borderRadius: 4 }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
            style={{ background: '#FFD700', color: '#111' }}>R$</div>
          <span style={{ color: '#FFD700' }}>{state.coins.toLocaleString('ru')}</span>
        </div>
      </header>

      {/* Active boosts */}
      {state.activeBoosts.length > 0 && (
        <div className="relative z-10 flex gap-2 px-4 py-1.5 overflow-x-auto"
          style={{ background: '#0d131e', borderBottom: '1px solid #1C2333' }}>
          {state.activeBoosts.map(ab => {
            const t = getBoostTimeLeft(ab.boostId);
            if (t <= 0) return null;
            const emojis: Record<string,string> = { turbo:'⚡', mega:'🚀', rainbow:'🌈', star:'⭐', robot:'🤖' };
            return (
              <div key={ab.boostId} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 font-bold text-sm"
                style={{ background: '#E61919', borderRadius: 3, color: '#fff', boxShadow: '0 2px 0 #8f0e0e' }}>
                <span>{emojis[ab.boostId] ?? '⚡'}</span><span>{t}с</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Ad status overlay */}
      {(adStatus === 'loading' || adStatus === 'showing') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rblx-panel text-center px-8 py-6">
            <div className="text-4xl mb-3 animate-spin" style={{ animationDuration: '1s' }}>📺</div>
            <div className="font-game text-xl text-white">Загрузка рекламы...</div>
            <div className="text-sm font-bold mt-1" style={{ color: '#4a5768' }}>Досмотри до конца для получения бонуса!</div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 relative z-10 overflow-y-auto" style={{ paddingBottom: 72 }}>
        {tab === 'game' && (
          <div className="py-5">
            <ClickerScene coins={state.coins} totalClicks={state.totalClicks}
              clicksPerSecond={state.clicksPerSecond} multiplier={multiplier}
              skin={currentSkin} achievements={state.achievements} onClick={handleClickWithAd}
              isAutoActive={state.activeBoosts.some(b => (b.boostId === 'robot' || b.boostId === 'rainbow') && b.expiresAt > Date.now())} />
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
          />
        )}
        {tab === 'boosts' && (
          <BoostersPage coins={state.coins} adStatus={adStatus}
            getBoostTimeLeft={getBoostTimeLeft} buyBoost={buyBoost}
            onShowRewardedAd={handleBoostAd} />
        )}
        {tab === 'ads' && (
          <AdOffersPage
            coins={state.coins}
            coinsPerClick={state.coinsPerClick}
            adStatus={adStatus}
            getAdCooldownLeft={getAdCooldownLeft}
            onClaim={claimAdOffer}
            onShowRewardedAd={handleAdOffer}
          />
        )}
        {tab === 'achievements' && (
          <AchievementsPage achievements={state.achievements}
            totalClicks={state.totalClicks} totalCoinsEarned={state.totalCoinsEarned} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around py-2 px-1"
        style={{ background: '#0a0f1a', borderTop: '2px solid #1C2333' }}>
        {TABS.map(t => (
          <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="text-xl leading-none">{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
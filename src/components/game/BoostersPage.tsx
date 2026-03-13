import { BOOSTS } from '@/data/gameData';
import Icon from '@/components/ui/icon';
import { type Lang, t } from '@/i18n';

interface Props {
  lang: Lang;
  coins: number;
  adStatus: string;
  getBoostTimeLeft: (id: string) => number;
  buyBoost: (id: string, cost: number, duration: number) => void;
  onShowRewardedAd: (boostId: string, duration: number) => void;
}

export default function BoostersPage({ lang, coins, adStatus, getBoostTimeLeft, buyBoost, onShowRewardedAd }: Props) {
  const isAdBusy = adStatus === 'loading' || adStatus === 'showing';

  const formatTime = (s: number) => s >= 60 ? `${Math.floor(s / 60)}м ${s % 60}с` : `${s}с`;

  const BOOST_COLOR: Record<string, string> = {
    turbo: '#FFD700', mega: '#FF6BC8', rainbow: '#4FC3F7', star: '#00B06F', robot: '#FFB74D',
  };

  return (
    <div className="px-4 py-3 space-y-3 pb-6">
      <div className="rblx-panel flex items-center gap-3">
        <span className="text-2xl">🛒</span>
        <div>
          <div className="font-game text-lg text-white leading-none">{t(lang, 'shop_title')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'shop_subtitle')}</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 font-game text-base"
          style={{ background: '#0F1923', border: '2px solid #2D3A50', borderRadius: 4 }}>
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: '#FFD700', color: '#111' }}>R$</div>
          <span style={{ color: '#FFD700' }}>{coins.toLocaleString('ru')}</span>
        </div>
      </div>

      {BOOSTS.map(boost => {
        const timeLeft = getBoostTimeLeft(boost.id);
        const isActive = timeLeft > 0;
        const canBuy = coins >= boost.cost && boost.cost > 0;
        const color = BOOST_COLOR[boost.id] ?? '#fff';

        return (
          <div key={boost.id} className="rblx-panel"
            style={{ borderTopColor: isActive ? color : '#2D3A50', borderTopWidth: 3, padding: '10px 12px' }}>
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: '#0F1923', border: `2px solid ${color}44`, borderRadius: 5 }}>
                {boost.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-game text-base text-white leading-none">{t(lang, `boost_${boost.id}_name` as Parameters<typeof t>[1])}</span>
                  {isActive && (
                    <span className="text-xs font-black px-1.5 py-0.5 tracking-widest"
                      style={{ background: color, color: '#000', borderRadius: 3 }}>
                      {t(lang, 'boost_active')}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 font-semibold" style={{ color: '#4a5768' }}>{t(lang, `boost_${boost.id}_desc` as Parameters<typeof t>[1])}</p>
                {timeLeft > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color }}>
                    <Icon name="Clock" size={11} /> {formatTime(timeLeft)} {t(lang, 'boost_left')}
                  </div>
                )}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {boost.adUnlock && (
                    <button
                      className="rblx-btn rblx-btn-blue text-xs py-1.5 px-2.5"
                      style={{ opacity: isAdBusy ? 0.65 : 1 }}
                      onClick={() => !isAdBusy && onShowRewardedAd(boost.id, boost.adDuration ?? boost.duration)}
                    >
                      {isAdBusy
                        ? <Icon name="Loader2" size={13} className="animate-spin" />
                        : <><Icon name="Play" size={13} /> {t(lang, 'btn_watch_ad')}</>
                      }
                    </button>
                  )}
                  {boost.cost > 0 && (
                    <button
                      className={`rblx-btn text-xs py-1.5 px-2.5 ${canBuy ? 'rblx-btn-yellow' : 'rblx-btn-gray'}`}
                      onClick={() => canBuy && buyBoost(boost.id, boost.cost, boost.duration)}
                    >
                      {!canBuy && <Icon name="Lock" size={12} />}
                      💰 {boost.cost.toLocaleString('ru')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="rblx-panel text-center py-2">
        <p className="text-xs font-bold tracking-wide" style={{ color: '#2D3A50' }}>
          {t(lang, 'ad_support')}
        </p>
      </div>
    </div>
  );
}
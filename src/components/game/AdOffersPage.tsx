import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { type Lang, t } from '@/i18n';

interface Props {
  lang: Lang;
  coins: number;
  coinsPerClick: number;
  adStatus: string;
  getAdCooldownLeft: (offerId: string) => number;
  onClaim: (offerId: string, rewardType: string, rewardValue: number) => void;
  onShowRewardedAd: (offerId: string, rewardType: string, rewardValue: number, onAdComplete?: () => void) => void;
}

const SPIN_PRIZES = [
  { emoji: '💰', labelKey: null,        label: '2 000',  type: 'coins', value: 2_000,  weight: 35, color: '#FFD700' },
  { emoji: '⚡',  labelKey: 'spin_turbo' as const, label: '',       type: 'turbo', value: 60,     weight: 25, color: '#FFD700' },
  { emoji: '💰', labelKey: null,        label: '5 000',  type: 'coins', value: 5_000,  weight: 20, color: '#4FC3F7' },
  { emoji: '🚀', labelKey: 'spin_mega' as const,  label: '',        type: 'mega',  value: 30,     weight: 12, color: '#FF6BC8' },
  { emoji: '💰', labelKey: null,        label: '10 000', type: 'coins', value: 10_000, weight: 6,  color: '#a855f7' },
  { emoji: '⭐',  labelKey: 'spin_star' as const,  label: '',        type: 'star',  value: 20,     weight: 2,  color: '#69F0AE' },
];

function weightedRandom() {
  const total = SPIN_PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SPIN_PRIZES.length; i++) {
    r -= SPIN_PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

function formatCooldown(sec: number) {
  if (sec <= 0) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

const ITEM_H = 80;
const VISIBLE = 3; // видимых строк
const LOOPS = 6;   // полных оборотов перед победным

// Барабан строится так:
// [LOOPS полных копий призов] + [prizes до winIndex включительно]
// Победный элемент всегда последний в списке → он встаёт ровно по центру
function buildItems(winIndex: number) {
  const items: typeof SPIN_PRIZES[number][] = [];
  for (let i = 0; i < LOOPS; i++) {
    SPIN_PRIZES.forEach(p => items.push(p));
  }
  // добавляем 0..winIndex чтобы победный оказался последним
  for (let i = 0; i <= winIndex; i++) {
    items.push(SPIN_PRIZES[i]);
  }
  return items;
}

// Итоговый translateY: победный элемент (последний) должен быть по центру окна
// центр окна = ITEM_H * floor(VISIBLE/2) = ITEM_H * 1 (при VISIBLE=3)
// последний элемент начинается с (items.length - 1) * ITEM_H
// нужно translateY = -( (items.length - 1) * ITEM_H - ITEM_H * Math.floor(VISIBLE/2) )
function calcTargetY(items: typeof SPIN_PRIZES[number][]) {
  const centerRow = Math.floor(VISIBLE / 2); // = 1 (средняя строка)
  return -((items.length - 1) * ITEM_H - centerRow * ITEM_H);
}

function SpinDrum({ spinning, winIndex, onDone, lang }: {
  spinning: boolean;
  winIndex: number;
  onDone: () => void;
  lang: Lang;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const [items, setItems] = useState(() => buildItems(0));

  useEffect(() => {
    if (!spinning) return;
    doneRef.current = false;

    const newItems = buildItems(winIndex);
    setItems(newItems);

    const el = ref.current;
    if (!el) return;

    // Сброс без анимации
    el.style.transition = 'none';
    el.style.transform = 'translateY(0)';

    // Через 2 фрейма запускаем прокрутку
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const targetY = calcTargetY(newItems);
        el.style.transition = 'transform 3.2s cubic-bezier(0.25, 0.1, 0.1, 1.0)';
        el.style.transform = `translateY(${targetY}px)`;
      });
    });

    const timer = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onDone(); }
    }, 3400);

    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, winIndex]);

  const prize = SPIN_PRIZES[winIndex];

  return (
    <div style={{
      height: ITEM_H * VISIBLE,
      overflow: 'hidden',
      position: 'relative',
      borderRadius: 8,
      border: `2px solid ${spinning ? '#1A6BFF' : '#2D3A50'}`,
      background: '#0a0f1a',
      transition: 'border-color 0.3s',
    }}>
      {/* Подсветка центральной строки */}
      <div style={{
        position: 'absolute',
        top: ITEM_H * Math.floor(VISIBLE / 2),
        left: 0, right: 0,
        height: ITEM_H,
        background: spinning ? 'rgba(26,107,255,0.10)' : `${prize.color}18`,
        borderTop: `2px solid ${spinning ? '#1A6BFF55' : prize.color + '88'}`,
        borderBottom: `2px solid ${spinning ? '#1A6BFF55' : prize.color + '88'}`,
        zIndex: 2,
        pointerEvents: 'none',
        transition: 'all 0.5s',
      }} />
      {/* Затемнение краёв */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, #0a0f1a 0%, transparent 30%, transparent 70%, #0a0f1a 100%)',
      }} />
      <div ref={ref}>
        {items.map((p, i) => (
          <div key={i} style={{
            height: ITEM_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 30, lineHeight: 1 }}>{p.emoji}</span>
            <span style={{
              color: p.color,
              fontWeight: 900,
              fontSize: 17,
              fontFamily: 'Nunito, sans-serif',
              letterSpacing: '0.5px',
            }}>
              {p.labelKey ? t(lang, p.labelKey, { s: String(p.value) }) : p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Конфетти-джекпот
function Jackpot({ show, onHide, lang: jackpotLang }: { show: boolean; onHide: () => void; lang: Lang }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onHide, 4000);
    return () => clearTimeout(t);
  }, [show, onHide]);

  if (!show) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    dur: `${0.8 + Math.random() * 1.2}s`,
    emoji: ['🎉', '⭐', '💎', '💰', '✨', '🌟'][Math.floor(Math.random() * 6)],
    size: 16 + Math.floor(Math.random() * 18),
  }));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Центральный баннер */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #f0abfc)',
        border: '3px solid #f0abfc',
        borderRadius: 16,
        padding: '20px 36px',
        textAlign: 'center',
        boxShadow: '0 0 60px #f0abfc88, 0 0 20px #7c3aed88',
        animation: 'jackpotPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 48, lineHeight: 1 }}>💎</div>
        <div style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: 28,
          fontWeight: 900,
          color: '#fff',
          textShadow: '0 2px 8px #0008',
          marginTop: 6,
        }}>{t(jackpotLang, 'offer_jackpot')}</div>
        <div style={{ color: '#f0abfc', fontWeight: 900, fontSize: 18, marginTop: 4 }}>
          {t(jackpotLang, 'offer_jackpot_sub')}
        </div>
      </div>

      {/* Частицы */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '-10%',
          left: p.left,
          fontSize: p.size,
          animation: `confettiFall ${p.dur} ${p.delay} ease-in forwards`,
        }}>
          {p.emoji}
        </div>
      ))}

      <style>{`
        @keyframes jackpotPop {
          from { transform: scale(0.3); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes confettiFall {
          from { transform: translateY(0) rotate(0deg); opacity: 1; }
          to   { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function AdOffersPage({
  lang, coins, adStatus, getAdCooldownLeft, onClaim, onShowRewardedAd,
}: Props) {
  const isAdBusy = adStatus === 'loading' || adStatus === 'showing';

  const spinCooldown = getAdCooldownLeft('lucky_spin');
  const [spinning, setSpinning] = useState(false);
  const [winIndex, setWinIndex] = useState(0);
  const [winPrize, setWinPrize] = useState<typeof SPIN_PRIZES[number] | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showJackpot, setShowJackpot] = useState(false);
  const pendingIdx = useRef(0);
  const pendingPrize = useRef(SPIN_PRIZES[0]);

  const handleSpin = () => {
    if (spinning || spinCooldown > 0 || isAdBusy) return;
    const idx = weightedRandom();
    pendingIdx.current = idx;
    pendingPrize.current = SPIN_PRIZES[idx];
    setWinIndex(idx);
    setShowWin(false);
    setWinPrize(null);
    setShowJackpot(false);

    // Сначала показываем рекламу, спин крутится только после просмотра
    onShowRewardedAd('lucky_spin', pendingPrize.current.type, pendingPrize.current.value, () => {
      setSpinning(true);
    });
  };

  const handleSpinDone = () => {
    setSpinning(false);
    const prize = pendingPrize.current;
    setWinPrize(prize);
    setShowWin(true);
    if (prize.type === 'star') {
      setTimeout(() => setShowJackpot(true), 300);
    }
  };

  const OFFERS = [
    { id: 'coins_bonus', emoji: '💰', title: t(lang, 'offer_coins_title'), description: t(lang, 'offer_coins_desc'), rewardType: 'coins', rewardValue: 5_000,  cooldownSec: 5 * 60,  color: '#FFD700' },
    { id: 'turbo',       emoji: '⚡', title: t(lang, 'offer_turbo_title'), description: t(lang, 'offer_turbo_desc'), rewardType: 'boost', rewardValue: 60,    cooldownSec: 5 * 60,  color: '#FFD700' },
    { id: 'mega',        emoji: '🚀', title: t(lang, 'offer_mega_title'),  description: t(lang, 'offer_mega_desc'),  rewardType: 'boost', rewardValue: 30,    cooldownSec: 10 * 60, color: '#FF6BC8' },
    { id: 'star',        emoji: '⭐', title: t(lang, 'offer_star_title'),  description: t(lang, 'offer_star_desc'),  rewardType: 'boost', rewardValue: 20,    cooldownSec: 15 * 60, color: '#69F0AE' },
  ];

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="px-4 py-3 space-y-3 pb-6">
      <Jackpot show={showJackpot} onHide={() => setShowJackpot(false)} lang={lang} />

      <div className="rblx-panel flex items-center gap-3">
        <span className="text-2xl">📺</span>
        <div>
          <div className="font-game text-lg text-white leading-none">{t(lang, 'offers_title')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>
            {t(lang, 'offers_subtitle')}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 font-game text-base"
          style={{ background: '#0F1923', border: '2px solid #2D3A50', borderRadius: 4 }}>
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: '#FFD700', color: '#111' }}>R$</div>
          <span style={{ color: '#FFD700' }}>{coins.toLocaleString('ru')}</span>
        </div>
      </div>

      {/* Удачный спин */}
      <div className="rblx-panel" style={{ borderTopColor: '#a855f7', borderTopWidth: 3 }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎰</span>
          <div>
            <div className="font-game text-lg text-white leading-none">{t(lang, 'spin_title')}</div>
            <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
              {t(lang, 'spin_subtitle')}
            </div>
          </div>
        </div>

        <SpinDrum spinning={spinning} winIndex={winIndex} onDone={handleSpinDone} lang={lang} />

        {showWin && winPrize && (
          <div className="mt-3 text-center py-3 rounded-md font-game text-xl"
            style={{
              background: `${winPrize.color}18`,
              border: `2px solid ${winPrize.color}`,
              animation: 'fadeInUp 0.4s ease',
            }}>
            <span style={{ fontSize: 32 }}>{winPrize.emoji}</span>
            <div style={{ color: winPrize.color, marginTop: 4 }}>
              {winPrize.type === 'coins'
                ? t(lang, 'spin_coins', { n: winPrize.label })
                : t(lang, 'spin_boost', { n: winPrize.label })}
            </div>
          </div>
        )}

        {spinCooldown > 0 && (
          <div className="mt-3 mb-1">
            <div className="flex items-center justify-between text-xs font-bold mb-1" style={{ color: '#a855f7' }}>
              <span><Icon name="Clock" size={12} /> {t(lang, 'spin_next')}</span>
              <span>{formatCooldown(spinCooldown)}</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: '#1C2333' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.max(2, (spinCooldown / 3600) * 100))}%`,
                background: 'linear-gradient(90deg, #7c3aed88, #a855f7)',
                borderRadius: 9999,
                transition: 'width 1s linear',
                boxShadow: '0 0 8px #a855f766',
              }} />
            </div>
          </div>
        )}
        <div className="mt-2">
          {spinCooldown > 0 ? (
            <button className="rblx-btn rblx-btn-gray w-full py-3 font-game" disabled>
              {t(lang, 'spin_charging')}
            </button>
          ) : (
            <button
              className="rblx-btn rblx-btn-blue w-full py-3 font-game text-base"
              style={{ opacity: spinning || isAdBusy ? 0.65 : 1 }}
              onClick={handleSpin}
              disabled={spinning || isAdBusy}
            >
              {spinning
                ? <><Icon name="Loader2" size={15} className="animate-spin" /> {t(lang, 'spin_spinning')}</>
                : isAdBusy
                  ? <><Icon name="Loader2" size={15} className="animate-spin" /> {t(lang, 'btn_ad_busy')}</>
                  : <><Icon name="Play" size={15} /> {t(lang, 'spin_btn')}</>}
            </button>
          )}
        </div>
      </div>

      {/* Остальные офферы */}
      {OFFERS.map(offer => {
        const cd = getAdCooldownLeft(offer.id);
        const ready = cd <= 0;
        return (
          <div key={offer.id} className="rblx-panel" style={{ borderTopColor: offer.color, borderTopWidth: 3, padding: '10px 12px' }}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: '#0F1923', border: `2px solid ${offer.color}44`, borderRadius: 5 }}>
                {offer.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-game text-base text-white leading-none">{offer.title}</div>
                <p className="text-xs mt-0.5 font-semibold" style={{ color: '#4a5768' }}>{offer.description}</p>
                {!ready && (
                  <>
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: offer.color }}>
                      <Icon name="Clock" size={11} /> {formatCooldown(cd)}
                    </div>
                    <div className="mt-1 w-full rounded-full overflow-hidden" style={{ height: 4, background: '#1C2333' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, Math.max(2, (cd / offer.cooldownSec) * 100))}%`,
                        background: `linear-gradient(90deg, ${offer.color}88, ${offer.color})`,
                        borderRadius: 9999,
                      }} />
                    </div>
                  </>
                )}
              </div>
              <button
                className={`rblx-btn text-xs py-1.5 px-3 flex-shrink-0 ${ready && !isAdBusy ? 'rblx-btn-blue' : 'rblx-btn-gray'}`}
                disabled={!ready || isAdBusy}
                onClick={() => {
                  if (!ready || isAdBusy) return;
                  onShowRewardedAd(offer.id, offer.rewardType, offer.rewardValue);
                }}
              >
                {!ready
                  ? formatCooldown(cd)
                  : isAdBusy
                    ? <Icon name="Loader2" size={13} className="animate-spin" />
                    : <><Icon name="Play" size={13} /> {t(lang, 'offer_watch')}</>}
              </button>
            </div>
          </div>
        );
      })}

      <div className="rblx-panel text-center py-2">
        <p className="text-xs font-bold tracking-wide" style={{ color: '#2D3A50' }}>
          {t(lang, 'ad_support')}
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
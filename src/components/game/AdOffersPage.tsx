import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  coins: number;
  coinsPerClick: number;
  adStatus: string;
  getAdCooldownLeft: (offerId: string) => number;
  onClaim: (offerId: string, rewardType: string, rewardValue: number) => void;
  onShowRewardedAd: (offerId: string, rewardType: string, rewardValue: number) => void;
}

// Сектора барабана: [эмодзи, метка, тип, значение, вес, цвет]
const SPIN_PRIZES = [
  { emoji: '🪙', label: '5 000',    type: 'coins', value: 5_000,   weight: 30, color: '#FFD700' },
  { emoji: '⚡',  label: 'Турбо 30с', type: 'turbo', value: 30,    weight: 20, color: '#FFD700' },
  { emoji: '🪙', label: '15 000',  type: 'coins', value: 15_000, weight: 20, color: '#4FC3F7' },
  { emoji: '🚀', label: 'Мега 20с', type: 'mega',  value: 20,    weight: 15, color: '#FF6BC8' },
  { emoji: '🪙', label: '50 000',  type: 'coins', value: 50_000, weight: 10, color: '#a855f7' },
  { emoji: '⭐',  label: 'Звезда 15с', type: 'star', value: 15,  weight: 4,  color: '#69F0AE' },
  { emoji: '💎', label: '200 000', type: 'coins', value: 200_000, weight: 1, color: '#f0abfc' },
];

// Получить случайный индекс с учётом весов
function weightedRandom() {
  const total = SPIN_PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SPIN_PRIZES.length; i++) {
    r -= SPIN_PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

const ITEM_H = 80; // высота одного сектора в барабане

function formatCooldown(sec: number) {
  if (sec <= 0) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

// Компонент барабана-слота
function SpinDrum({ spinning, winIndex, onDone }: { spinning: boolean; winIndex: number; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!spinning) return;
    doneRef.current = false;
    const el = ref.current;
    if (!el) return;

    // Строим длинный список: 5 полных оборотов + победный элемент по центру
    const loops = 5;
    const totalItems = SPIN_PRIZES.length * loops + winIndex + 1;
    const targetOffset = -(totalItems * ITEM_H - ITEM_H * 2.5 + ITEM_H / 2);

    el.style.transition = 'none';
    el.style.transform = 'translateY(0)';

    // Запускаем анимацию через один фрейм
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform 3s cubic-bezier(0.17, 0.67, 0.12, 1.0)`;
        el.style.transform = `translateY(${targetOffset}px)`;
      });
    });

    const timer = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onDone(); }
    }, 3200);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, winIndex]);

  // Генерируем элементы барабана: 5 полных оборотов + победный
  const items: typeof SPIN_PRIZES[number][] = [];
  const loops = 5;
  for (let i = 0; i < loops; i++) {
    SPIN_PRIZES.forEach(p => items.push(p));
  }
  items.push(SPIN_PRIZES[winIndex]);

  return (
    <div style={{ height: ITEM_H * 3, overflow: 'hidden', position: 'relative', borderRadius: 8,
      border: '2px solid #2D3A50', background: '#0a0f1a' }}>
      {/* Подсветка центра */}
      <div style={{ position: 'absolute', top: ITEM_H, left: 0, right: 0, height: ITEM_H,
        background: 'rgba(26,107,255,0.12)', borderTop: '2px solid #1A6BFF', borderBottom: '2px solid #1A6BFF',
        zIndex: 2, pointerEvents: 'none' }} />
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((p, i) => (
          <div key={i} style={{ height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 28 }}>{p.emoji}</span>
            <span style={{ color: p.color, fontWeight: 900, fontSize: 18, fontFamily: 'Fredoka One, sans-serif' }}>
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdOffersPage({ coins, coinsPerClick, adStatus, getAdCooldownLeft, onClaim, onShowRewardedAd }: Props) {
  const isAdBusy = adStatus === 'loading' || adStatus === 'showing';

  // --- Удачный спин ---
  const spinCooldown = getAdCooldownLeft('lucky_spin');
  const [spinning, setSpinning] = useState(false);
  const [winIndex, setWinIndex] = useState(0);
  const [winPrize, setWinPrize] = useState<typeof SPIN_PRIZES[number] | null>(null);
  const [showWin, setShowWin] = useState(false);
  const pendingPrize = useRef<typeof SPIN_PRIZES[number] | null>(null);

  const handleSpin = () => {
    if (spinning || spinCooldown > 0 || isAdBusy) return;
    const idx = weightedRandom();
    pendingPrize.current = SPIN_PRIZES[idx];
    setWinIndex(idx);
    setShowWin(false);
    setWinPrize(null);

    onShowRewardedAd('lucky_spin', pendingPrize.current.type, pendingPrize.current.value);
    // Барабан запускается после того как реклама закончится — но т.к. onShowRewardedAd async,
    // мы запускаем анимацию сразу а onClaim будет вызван в callback.
    // Здесь просто крутим барабан локально для UX
    setSpinning(true);
  };

  const handleSpinDone = () => {
    setSpinning(false);
    if (pendingPrize.current) {
      setWinPrize(pendingPrize.current);
      setShowWin(true);
    }
  };

  // --- Остальные офферы ---
  const OFFERS = [
    {
      id: 'coins_bonus',
      emoji: '💰',
      title: 'Куча монет',
      description: 'Получи 10 000 монет прямо сейчас!',
      rewardType: 'coins',
      rewardValue: 10_000,
      cooldownLabel: '4 часа',
      color: '#FFD700',
    },
    {
      id: 'turbo',
      emoji: '⚡',
      title: 'Турбо на час',
      description: 'Активируй Турбо-клик ×3 на 60 секунд бесплатно!',
      rewardType: 'boost',
      rewardValue: 60,
      cooldownLabel: '4 часа',
      color: '#FFD700',
    },
    {
      id: 'mega',
      emoji: '🚀',
      title: 'МЕГА-буст',
      description: '×5 монет за клик на 30 секунд — за рекламу!',
      rewardType: 'boost',
      rewardValue: 30,
      cooldownLabel: '4 часа',
      color: '#FF6BC8',
    },
    {
      id: 'star',
      emoji: '⭐',
      title: 'Звёздный дождь',
      description: '×10 монет на 20 секунд — очень редко!',
      rewardType: 'boost',
      rewardValue: 20,
      cooldownLabel: '6 часов',
      color: '#69F0AE',
    },
  ];

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  void tick; // используем для ре-рендера кулдаунов

  return (
    <div className="px-4 py-3 space-y-3 pb-6">
      <div className="rblx-panel flex items-center gap-3">
        <span className="text-2xl">📺</span>
        <div>
          <div className="font-game text-lg text-white leading-none">Бонусы за рекламу</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>
            СМОТРИ РЕКЛАМУ — ПОЛУЧАЙ ПРИЗЫ
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
            <div className="font-game text-lg text-white leading-none">Удачный спин</div>
            <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
              Крути барабан — выигрывай монеты и бусты!
            </div>
          </div>
        </div>

        <SpinDrum spinning={spinning} winIndex={winIndex} onDone={handleSpinDone} />

        {showWin && winPrize && (
          <div className="mt-3 text-center py-3 rounded-md font-game text-xl animate-bounce"
            style={{ background: `${winPrize.color}22`, border: `2px solid ${winPrize.color}` }}>
            <span className="text-3xl">{winPrize.emoji}</span>
            <div style={{ color: winPrize.color }}>+{winPrize.label}!</div>
          </div>
        )}

        <div className="mt-3">
          {spinCooldown > 0 ? (
            <button className="rblx-btn rblx-btn-gray w-full py-3 font-game" disabled>
              <Icon name="Clock" size={15} /> Следующий спин через {formatCooldown(spinCooldown)}
            </button>
          ) : (
            <button
              className="rblx-btn rblx-btn-blue w-full py-3 font-game text-base"
              style={{ opacity: spinning || isAdBusy ? 0.65 : 1 }}
              onClick={handleSpin}
              disabled={spinning || isAdBusy}
            >
              {spinning
                ? <><Icon name="Loader2" size={15} className="animate-spin" /> Крутим...</>
                : isAdBusy
                  ? <><Icon name="Loader2" size={15} className="animate-spin" /> Реклама...</>
                  : <><Icon name="Play" size={15} /> Смотреть рекламу и крутить!</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Обычные офферы */}
      {OFFERS.map(offer => {
        const cd = getAdCooldownLeft(offer.id);
        const ready = cd <= 0;
        return (
          <div key={offer.id} className="rblx-panel" style={{ borderTopColor: offer.color, borderTopWidth: 3 }}>
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: '#0F1923', border: `2px solid ${offer.color}44`, borderRadius: 5 }}>
                {offer.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-game text-lg text-white leading-none">{offer.title}</div>
                <p className="text-sm mt-0.5 font-semibold" style={{ color: '#4a5768' }}>{offer.description}</p>
                {!ready && (
                  <div className="mt-1 flex items-center gap-1 text-sm font-bold" style={{ color: offer.color }}>
                    <Icon name="Clock" size={13} /> {formatCooldown(cd)} до следующего
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3">
              <button
                className={`rblx-btn w-full py-2.5 text-sm ${ready && !isAdBusy ? 'rblx-btn-blue' : 'rblx-btn-gray'}`}
                disabled={!ready || isAdBusy}
                onClick={() => {
                  if (!ready || isAdBusy) return;
                  onShowRewardedAd(offer.id, offer.rewardType, offer.rewardValue);
                  onClaim(offer.id, offer.rewardType, offer.rewardValue);
                }}
              >
                {!ready
                  ? <><Icon name="Lock" size={13} /> Кулдаун {offer.cooldownLabel}</>
                  : isAdBusy
                    ? <><Icon name="Loader2" size={14} className="animate-spin" /> Реклама...</>
                    : <><Icon name="Play" size={14} /> Смотреть рекламу</>
                }
              </button>
            </div>
          </div>
        );
      })}

      <div className="rblx-panel text-center py-2">
        <p className="text-xs font-bold tracking-wide" style={{ color: '#2D3A50' }}>
          РЕКЛАМА ПОМОГАЕТ РАЗВИТИЮ ИГРЫ 🙏
        </p>
      </div>
    </div>
  );
}

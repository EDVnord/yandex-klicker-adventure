import { useState, useCallback, useRef } from 'react';
import type { Skin } from '@/data/skins';
import type { Achievement } from '@/types/game';
import AchievementToast from './AchievementToast';

interface CoinParticle { id: number; x: number; y: number; label: string; }

interface Props {
  coins: number;
  totalClicks: number;
  clicksPerSecond: number;
  multiplier: number;
  skin: Skin;
  achievements: Achievement[];
  onClick: () => void;
}

export default function ClickerScene({ coins, totalClicks, clicksPerSecond, multiplier, skin, achievements, onClick }: Props) {
  const [particles, setParticles] = useState<CoinParticle[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const particleId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatCoins = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}М`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}К`;
    return n.toString();
  };

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    let x = 50, y = 50;
    if (rect) {
      const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? rect.left + rect.width / 2) : e.clientX;
      const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? rect.top + rect.height / 2) : e.clientY;
      x = ((clientX - rect.left) / rect.width) * 100;
      y = ((clientY - rect.top) / rect.height) * 100;
    }
    const id = particleId.current++;
    const pool = multiplier >= 10 ? ['💎','💎','⭐'] : multiplier >= 5 ? ['🌟','⚡'] : ['⚡','🪙'];
    const label = pool[Math.floor(Math.random() * pool.length)];
    setParticles(p => [...p, { id, x, y, label }]);
    setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 750);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 160);
    onClick();
  }, [onClick, multiplier]);

  return (
    <div className="flex flex-col items-center gap-4 px-4">

      {/* Stats */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2">
        {[
          { label: 'МОНЕТЫ',  value: formatCoins(coins),        color: '#FFD700' },
          { label: 'КЛИКОВ',  value: formatCoins(totalClicks),  color: '#fff'    },
          { label: 'КЛ/СЕК', value: String(clicksPerSecond),   color: '#00B06F' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rblx-panel text-center py-2">
            <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#4a5768' }}>{label}</div>
            <div className="font-game text-xl leading-none" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Multiplier */}
      {multiplier > 1 && (
        <div
          className="animate-bounce-in flex items-center gap-2 px-5 py-2 font-game text-base"
          style={{ background: 'linear-gradient(90deg,#E61919,#ff4444)', borderRadius: 4, boxShadow: '0 4px 0 #8f0e0e', color: '#fff' }}
        >
          🔥 МНОЖИТЕЛЬ x{multiplier} АКТИВЕН!
        </div>
      )}

      {/* Character zone */}
      <div ref={containerRef} className="relative cursor-pointer select-none touch-none"
        style={{ width: 240, height: 280 }} onClick={handleClick} onTouchStart={handleClick}>

        {/* Ground shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{ width: 150, height: 16, background: 'radial-gradient(ellipse,rgba(0,0,0,0.55) 0%,transparent 70%)', borderRadius: '50%' }} />

        {/* Skin image */}
        <div className="absolute inset-x-8 top-0 bottom-8" style={{
          animation: isClicking ? 'click-burst 0.3s ease-out' : 'float-rblx 2.8s ease-in-out infinite',
          filter: isClicking ? `drop-shadow(0 0 24px ${skin.borderColor})` : `drop-shadow(0 8px 14px rgba(0,0,0,0.7))`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            border: `3px solid ${skin.borderColor}88`,
            borderRadius: 6,
            overflow: 'hidden',
            background: '#0F1923',
            boxShadow: isClicking
              ? `0 0 32px ${skin.glowColor}, inset 0 0 20px ${skin.glowColor}`
              : `0 0 0 2px ${skin.borderColor}22, 0 2px 16px rgba(0,0,0,0.5)`,
          }}>
            <img src={skin.img} alt={skin.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }}
              draggable={false}
            />
          </div>
          {/* Name tag */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
            style={{ background: '#000c', border: `1px solid ${skin.borderColor}55`, borderRadius: 3, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
            {skin.tag}
          </div>
        </div>

        {/* Particles */}
        {particles.map(p => (
          <span key={p.id} className="coin-float" style={{ left: `${p.x}%`, top: `${p.y}%` }}>{p.label}</span>
        ))}

        {/* Hint */}
        {totalClicks === 0 && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold tracking-widest"
            style={{ color: '#3d4a60' }}>
            ▼ НАЖИМАЙ НА ПЕРСОНАЖА! ▼
          </div>
        )}
      </div>

      {/* Big click button */}
      <button className="rblx-btn rblx-btn-blue btn-click-pulse mt-4"
        style={{ fontSize: '1.35rem', padding: '14px 52px', borderRadius: 5 }}
        onClick={handleClick} onTouchStart={handleClick}>
        🪙 ТЫК! {multiplier > 1 ? `+${multiplier}` : '+1'}
      </button>

      {/* Balance */}
      <div className="flex items-center gap-2 mt-0.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{ background: '#FFD700', color: '#111' }}>R$</div>
        <span className="font-game text-base" style={{ color: '#FFD700' }}>{formatCoins(coins)} монет</span>
      </div>

      {/* Achievement toast — под кнопкой, не перекрывает статистику */}
      <AchievementToast achievements={achievements} />
    </div>
  );
}
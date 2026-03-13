import { useState, useCallback, useRef, useEffect } from 'react';
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
  isAutoActive?: boolean;
}

export default function ClickerScene({ coins, totalClicks, clicksPerSecond, multiplier, skin, achievements, onClick, isAutoActive = false }: Props) {
  const [particles, setParticles] = useState<CoinParticle[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [autoPulse, setAutoPulse] = useState(false);
  const particleId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatCoins = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}М`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}К`;
    return n.toString();
  };

  // Пульсация для автоклика — синхронизирована с реальным интервалом 80мс
  useEffect(() => {
    if (!isAutoActive) { setAutoPulse(false); return; }
    const t = setInterval(() => {
      setAutoPulse(true);
      // Спавним частицу в случайной точке персонажа
      const x = 30 + Math.random() * 40;
      const y = 20 + Math.random() * 60;
      const id = particleId.current++;
      const pool = multiplier >= 10 ? ['💎','💎','⭐'] : multiplier >= 5 ? ['🌟','⚡'] : ['⚡','🪙'];
      const label = pool[Math.floor(Math.random() * pool.length)];
      setParticles(p => [...p, { id, x, y, label }]);
      setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 500);
      setTimeout(() => setAutoPulse(false), 60);
    }, 80);
    return () => clearInterval(t);
  }, [isAutoActive, multiplier]);

  const spawnParticle = useCallback((x: number, y: number) => {
    const id = particleId.current++;
    const pool = multiplier >= 10 ? ['💎','💎','⭐'] : multiplier >= 5 ? ['🌟','⚡'] : ['⚡','🪙'];
    const label = pool[Math.floor(Math.random() * pool.length)];
    setParticles(p => [...p, { id, x, y, label }]);
    setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 750);
  }, [multiplier]);

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
    spawnParticle(x, y);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 160);
    onClick();
  }, [onClick, spawnParticle]);

  const isActive = isClicking || autoPulse;

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

      {/* Статус бустов */}
      <div className="flex flex-col items-center gap-1.5 w-full max-w-sm">
        {multiplier > 1 && (
          <div className="animate-bounce-in w-full flex items-center justify-center gap-2 px-5 py-2 font-game text-base"
            style={{ background: 'linear-gradient(90deg,#E61919,#ff4444)', borderRadius: 4, boxShadow: '0 4px 0 #8f0e0e', color: '#fff' }}>
            🔥 МНОЖИТЕЛЬ x{multiplier} АКТИВЕН!
          </div>
        )}
        {isAutoActive && (
          <div className="w-full flex items-center justify-center gap-2 px-5 py-1.5 font-game text-sm"
            style={{ background: 'linear-gradient(90deg,#FF8C00,#FFB74D)', borderRadius: 4, boxShadow: '0 3px 0 #a35800', color: '#111',
              animation: 'autoPulseBar 0.08s ease-in-out infinite alternate' }}>
            🤖 АВТО-РОБОТ КЛИКАЕТ!
          </div>
        )}
      </div>

      {/* Character zone */}
      <div ref={containerRef} className="relative cursor-pointer select-none touch-none"
        style={{ width: 280, height: 330 }}
        onClick={handleClick}
        onTouchStart={handleClick}
        onContextMenu={e => e.preventDefault()}>

        {/* Ground shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{ width: 180, height: 16,
            background: 'radial-gradient(ellipse,rgba(0,0,0,0.55) 0%,transparent 70%)',
            borderRadius: '50%',
            transform: isActive ? 'scaleX(1.1)' : 'scaleX(1)',
            transition: 'transform 0.15s',
          }} />

        {/* Skin image */}
        <div className="absolute inset-x-6 top-0 bottom-8" style={{
          animation: isActive
            ? 'click-burst 0.15s ease-out'
            : isAutoActive
              ? 'autoFloat 0.08s ease-in-out infinite alternate'
              : 'float-rblx 2.8s ease-in-out infinite',
          filter: isActive
            ? `drop-shadow(0 0 28px ${skin.borderColor})`
            : isAutoActive
              ? `drop-shadow(0 0 12px #FFB74D88)`
              : `drop-shadow(0 8px 14px rgba(0,0,0,0.7))`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            border: isAutoActive
              ? '3px solid #FFB74D88'
              : `3px solid ${skin.borderColor}88`,
            borderRadius: 6,
            overflow: 'hidden',
            background: '#0F1923',
            boxShadow: isActive
              ? `0 0 32px ${skin.glowColor}, inset 0 0 20px ${skin.glowColor}`
              : isAutoActive
                ? '0 0 16px rgba(255,183,77,0.4)'
                : `0 0 0 2px ${skin.borderColor}22, 0 2px 16px rgba(0,0,0,0.5)`,
            transition: 'box-shadow 0.15s, border-color 0.3s',
          }}>
            <img src={skin.img} alt={skin.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', pointerEvents: 'none' }}
              draggable={false}
              onContextMenu={e => e.preventDefault()}
            />
          </div>
          {/* Name tag */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
            style={{ background: '#000c', border: `1px solid ${isAutoActive ? '#FFB74D55' : skin.borderColor + '55'}`,
              borderRadius: 3, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
            {skin.tag}
          </div>
        </div>

        {/* Particles */}
        {particles.map(p => (
          <span key={p.id} className="coin-float" style={{ left: `${p.x}%`, top: `${p.y}%` }}>{p.label}</span>
        ))}

      </div>

      {/* Hint — over button, visible only on first launch */}
      {totalClicks === 0 && (
        <div className="text-xs font-bold tracking-widest mt-2"
          style={{ color: '#3d4a60' }}>
          ▼ НАЖИМАЙ НА ПЕРСОНАЖА ИЛИ КНОПКУ! ▼
        </div>
      )}

      {/* Skin multiplier badge */}
      {skin.clickMultiplier > 1 && (
        <div className="flex items-center gap-1.5 px-3 py-1 font-game text-sm mt-1"
          style={{ background: skin.borderColor + '22', border: `1px solid ${skin.borderColor}55`, borderRadius: 4, color: skin.borderColor }}>
          {skin.emoji} ×{skin.clickMultiplier} ЗА КЛИК
        </div>
      )}

      {/* Big click button */}
      <button className="rblx-btn rblx-btn-blue btn-click-pulse mt-3"
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

      <AchievementToast achievements={achievements} />

      <style>{`
        @keyframes autoFloat {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes autoPulseBar {
          from { opacity: 0.75; transform: scaleX(0.98); }
          to   { opacity: 1;    transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Skin } from '@/data/skins';
import { SECRET_SKIN_ID } from '@/data/skins';
import type { Achievement } from '@/types/game';
import AchievementToast from './AchievementToast';
import { type Lang, t } from '@/i18n';

interface CoinParticle { id: number; x: number; y: number; label: string; }

interface Props {
  lang: Lang;
  coins: number;
  totalClicks: number;
  clicksPerSecond: number;
  multiplier: number;
  skin: Skin;
  achievements: Achievement[];
  onClick: () => void;
  isAutoActive?: boolean;
  robotTimeLeft?: number;
  onHappyTime?: () => void;
}

export default function ClickerScene({ lang, coins, totalClicks, clicksPerSecond, multiplier, skin, achievements, onClick, isAutoActive = false, robotTimeLeft = 0, onHappyTime }: Props) {
  const [particles, setParticles] = useState<CoinParticle[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [autoPulse, setAutoPulse] = useState(false);
  const particleId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSecret = skin.id === SECRET_SKIN_ID;

  const SKIN_SYMBOLS: Record<string, string[]> = {
    noob:    ['?', '!', 'lol', 'gg', 'noob', '...'],
    alien:   ['👽', 'UFO', '∞', '◈', '⊕', '✦'],
    ninja:   ['*', '|', '/', '\\', '+', 'x'],
    cowboy:  ['*', 'o', '~', '-', '+', '.'],
    pirate:  ['*', 'X', 'o', '+', '~', '-'],
    vip:     ['$', '*', 'o', '+', '-', '.'],
    cyborg:  ['0', '1', '+', '-', '|', '/'],
    witch:   ['*', '+', 'o', '~', '-', '.'],
    samurai: ['|', '/', '\\', '-', '+', '*'],
    hero:    ['*', '+', 'o', '-', '~', '.'],
    dragon:  ['*', 'o', '+', '~', '-', '.'],
    god:     ['*', '+', 'o', '~', '-', '.'],
  };

  const skinSymbols = isSecret
    ? ['✦', '★', '⚡', '🌟', '✨']
    : (SKIN_SYMBOLS[skin.id] ?? ['*', '+', 'o', '-', '~', '.']);

  const formatCoins = (n: number) => {
    const v = Math.floor(n);
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K`;
    return v.toString();
  };

  const formatTime = (s: number) => s >= 60 ? t(lang, 'cd_minutes', { m: Math.floor(s / 60), s: s % 60 }) : t(lang, 'cd_seconds', { s });

  // Пульсация для автоклика — визуальная раз в 600мс, не дёргает анимацию
  useEffect(() => {
    if (!isAutoActive) { setAutoPulse(false); return; }
    const t = setInterval(() => {
      setAutoPulse(true);
      const x = 30 + Math.random() * 40;
      const y = 20 + Math.random() * 60;
      const id = particleId.current++;
      const total = Math.floor(multiplier * skin.clickMultiplier);
      const label = `+${total}`;
      setParticles(p => [...p, { id, x, y, label }]);
      setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 700);
      setTimeout(() => setAutoPulse(false), 200);
    }, 600);
    return () => clearInterval(t);
  }, [isAutoActive, multiplier]);

  const spawnParticle = useCallback((x: number, y: number) => {
    const id = particleId.current++;
    const total = Math.floor(multiplier * skin.clickMultiplier);
    const label = `+${total}`;
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
    <div className="flex flex-col items-center gap-4 px-4" style={{ position: 'relative' }}>

      {/* Skin ambient background symbols */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, overflow: 'hidden' }}>
        {isSecret && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 40%, rgba(255,215,0,0.12) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)',
            animation: 'divinePulse 2.5s ease-in-out infinite',
          }} />
        )}
        {[...Array(16)].map((_, i) => (
          <div key={`${skin.id}-${i}`} style={{
            position: 'absolute',
            left: `${4 + (i * 57 % 88)}%`,
            top: `${4 + (i * 41 % 86)}%`,
            fontSize: isSecret ? `${12 + (i % 4) * 5}px` : `${11 + (i % 3) * 4}px`,
            color: skin.borderColor,
            opacity: isSecret ? 0.7 : 0.25,
            fontWeight: 900,
            fontFamily: 'monospace',
            lineHeight: 1,
            animationName: 'skinSymbolFloat',
            animationDuration: `${2.2 + (i % 5) * 0.6}s`,
            animationDelay: `${(i * 0.31) % 3}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: i % 2 === 0 ? 'alternate' : 'alternate-reverse',
            animationFillMode: 'both',
          }}>
            {skinSymbols[i % skinSymbols.length]}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2">
        {[
          { label: t(lang, 'stat_coins'),  value: formatCoins(coins),        color: '#FFD700' },
          { label: t(lang, 'stat_clicks'),  value: formatCoins(totalClicks),  color: '#fff'    },
          { label: t(lang, 'stat_cps'), value: String(clicksPerSecond),   color: '#00B06F' },
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
            {t(lang, 'multiplier_active', { m: multiplier })}
          </div>
        )}
        {isAutoActive && (
          <div className="w-full flex items-center justify-center gap-2 px-5 py-1.5 font-game text-sm"
            style={{ background: 'linear-gradient(90deg,#FF8C00,#FFB74D)', borderRadius: 4, boxShadow: '0 3px 0 #a35800', color: '#111' }}>
            {t(lang, 'auto_robot')}
            {robotTimeLeft > 0 && (
              <span className="text-xs font-bold opacity-75">{formatTime(robotTimeLeft)}</span>
            )}
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
            : isSecret
              ? 'divineFloat 2s ease-in-out infinite'
              : isAutoActive
                ? 'autoFloat 0.08s ease-in-out infinite alternate'
                : 'float-rblx 2.8s ease-in-out infinite',
          filter: isActive
            ? `drop-shadow(0 0 40px #FFD700) drop-shadow(0 0 60px #fff8)`
            : isSecret
              ? `drop-shadow(0 0 24px #FFD700) drop-shadow(0 0 48px rgba(255,215,0,0.5))`
              : isAutoActive
                ? `drop-shadow(0 0 12px #FFB74D88)`
                : `drop-shadow(0 8px 14px rgba(0,0,0,0.7))`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            border: isSecret
              ? '3px solid #FFD700'
              : isAutoActive
                ? '3px solid #FFB74D88'
                : `3px solid ${skin.borderColor}88`,
            borderRadius: 6,
            overflow: 'hidden',
            background: '#0F1923',
            boxShadow: isActive && isSecret
              ? '0 0 60px #FFD700, 0 0 120px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,215,0,0.3)'
              : isActive
                ? `0 0 32px ${skin.glowColor}, inset 0 0 20px ${skin.glowColor}`
                : isSecret
                  ? '0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.2), inset 0 0 12px rgba(255,215,0,0.1)'
                  : isAutoActive
                    ? '0 0 16px rgba(255,183,77,0.4)'
                    : `0 0 0 2px ${skin.borderColor}22, 0 2px 16px rgba(0,0,0,0.5)`,
            animation: isSecret ? 'borderGlow 1.5s ease-in-out infinite' : undefined,
            transition: 'box-shadow 0.15s, border-color 0.3s',
          }}>
            <img src={skin.img} alt={skin.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }}
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
          {t(lang, 'click_hint')}
        </div>
      )}

      {/* Skin multiplier badge */}
      {skin.clickMultiplier > 1 && (
        <div className="flex items-center gap-1.5 px-3 py-1 font-game text-sm mt-1"
          style={isSecret ? {
            background: 'linear-gradient(90deg,rgba(255,215,0,0.15),rgba(255,255,255,0.08))',
            border: '1px solid #FFD700',
            borderRadius: 4,
            color: '#FFD700',
            animation: 'divinePulse 1.5s ease-in-out infinite',
            boxShadow: '0 0 12px rgba(255,215,0,0.4)',
          } : {
            background: skin.borderColor + '22',
            border: `1px solid ${skin.borderColor}55`,
            borderRadius: 4,
            color: skin.borderColor,
          }}>
          {skin.emoji} ×{skin.clickMultiplier} {t(lang, 'per_click')}
        </div>
      )}

      {/* Big click button */}
      <button className="rblx-btn rblx-btn-blue btn-click-pulse mt-3"
        style={{ fontSize: '1.35rem', padding: '14px 52px', borderRadius: 5 }}
        onClick={handleClick} onTouchStart={handleClick}>
        💰 {t(lang, 'btn_tyk')} {multiplier > 1 ? `+${multiplier}` : '+1'}
      </button>

      {/* Balance */}
      <div className="flex items-center gap-2 mt-0.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{ background: '#FFD700', color: '#111' }}>R$</div>
        <span className="font-game text-base" style={{ color: '#FFD700' }}>{formatCoins(coins)} {t(lang, 'stat_coins').toLowerCase()}</span>
      </div>

      <AchievementToast lang={lang} achievements={achievements} onHappyTime={onHappyTime} />

      <style>{`
        @keyframes autoFloat {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes autoPulseBar {
          from { opacity: 0.75; transform: scaleX(0.98); }
          to   { opacity: 1;    transform: scaleX(1); }
        }
        @keyframes divineFloat {
          0%   { transform: translateY(0px) scale(1) rotate(-0.5deg); }
          50%  { transform: translateY(-10px) scale(1.03) rotate(0.5deg); }
          100% { transform: translateY(0px) scale(1) rotate(-0.5deg); }
        }
        @keyframes divinePulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.2), inset 0 0 12px rgba(255,215,0,0.1); }
          50%       { box-shadow: 0 0 50px rgba(255,215,0,0.8), 0 0 100px rgba(255,215,0,0.35), inset 0 0 24px rgba(255,215,0,0.2); }
        }
        @keyframes skinSymbolFloat {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-16px) scale(1.12); }
        }
      `}</style>
    </div>
  );
}
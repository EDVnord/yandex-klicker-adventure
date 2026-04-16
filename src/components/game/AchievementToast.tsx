import { useEffect, useState } from 'react';
import type { Achievement } from '@/types/game';
import { type Lang, t } from '@/i18n';

interface Props { lang: Lang; achievements: Achievement[]; onHappyTime?: () => void; }

export default function AchievementToast({ lang, achievements, onHappyTime }: Props) {
  const [shown, setShown] = useState<Set<string>>(() =>
    new Set(achievements.filter(a => a.unlocked).map(a => a.id))
  );
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    const newlyUnlocked = achievements.find(a => a.unlocked && !shown.has(a.id));
    if (newlyUnlocked && !current) {
      setShown(s => new Set([...s, newlyUnlocked.id]));
      setCurrent(newlyUnlocked);
      onHappyTime?.();
      setTimeout(() => setCurrent(null), 3200);
    }
  }, [achievements, shown, current, onHappyTime]);

  if (!current) return null;

  return (
    <div className="w-full flex justify-center px-4 animate-bounce-in">
      <div className="flex items-center gap-3 px-4 py-3 w-full max-w-sm"
        style={{
          background: '#1C2333',
          border: '3px solid #FFD700',
          borderRadius: 6,
          boxShadow: '0 6px 0 #9a8200, 0 0 30px rgba(255,215,0,0.35)',
        }}>
        <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ background: '#FFD700' }} />
        <span className="text-2xl">{current.emoji}</span>
        <div>
          <div className="text-[10px] font-black tracking-widest mb-0.5" style={{ color: '#FFD700' }}>
            {t(lang, 'ach_toast_title')}
          </div>
          <div className="font-game text-sm text-white leading-none">{t(lang, `ach_${current.id}_name` as Parameters<typeof t>[1])}</div>
          <div className="text-[11px] font-bold mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'ach_reward', { n: current.reward })}</div>
        </div>
      </div>
    </div>
  );
}
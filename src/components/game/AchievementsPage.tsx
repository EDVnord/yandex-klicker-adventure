import type { Achievement } from '@/types/game';
import { type Lang, t } from '@/i18n';

interface Props {
  lang: Lang;
  achievements: Achievement[];
  totalClicks: number;
  totalCoinsEarned: number;
}

export default function AchievementsPage({ lang, achievements, totalClicks, totalCoinsEarned }: Props) {
  const unlocked = achievements.filter(a => a.unlocked).length;
  const pct = Math.round((unlocked / achievements.length) * 100);

  return (
    <div className="px-4 py-3 space-y-3 pb-6">
      {/* Header */}
      <div className="rblx-panel-blue flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <div>
          <div className="font-game text-lg text-white leading-none">{t(lang, 'ach_title')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>
            {t(lang, 'ach_unlocked', { n: unlocked, total: achievements.length })}
          </div>
        </div>
        <div className="ml-auto font-game text-xl" style={{ color: '#1A6BFF' }}>{pct}%</div>
      </div>

      {/* XP bar */}
      <div className="rblx-panel">
        <div className="flex justify-between text-xs font-bold tracking-widest mb-2"
          style={{ color: '#4a5768' }}>
          <span>ПРОГРЕСС</span>
          <span style={{ color: '#1A6BFF' }}>{unlocked}/{achievements.length}</span>
        </div>
        <div className="rblx-progress-track">
          <div className="rblx-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rblx-panel text-center py-3">
          <div className="text-2xl mb-1">👆</div>
          <div className="font-game text-xl text-white">{totalClicks.toLocaleString('ru')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>КЛИКОВ</div>
        </div>
        <div className="rblx-panel text-center py-3">
          <div className="text-2xl mb-1">🪙</div>
          <div className="font-game text-xl" style={{ color: '#FFD700' }}>{totalCoinsEarned.toLocaleString('ru')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>ЗАРАБОТАНО</div>
        </div>
      </div>

      {/* Achievement list */}
      <div className="space-y-2">
        {achievements.filter(a => !a.unlocked).map(a => (
          <div
            key={a.id}
            className="rblx-panel flex items-center gap-3"
            style={{
              borderTopColor: a.unlocked ? '#FFD700' : '#2D3A50',
              borderTopWidth: 3,
              opacity: a.unlocked ? 1 : 0.55,
            }}
          >
            {/* Badge */}
            <div className="w-13 h-13 w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: a.unlocked ? 'rgba(255,215,0,0.1)' : '#0F1923',
                border: `2px solid ${a.unlocked ? '#FFD70044' : '#2D3A50'}`,
                borderRadius: 5,
                filter: a.unlocked ? 'none' : 'grayscale(1)',
              }}>
              {a.unlocked ? a.emoji : '🔒'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-game text-base text-white leading-none">{a.name}</span>
                {a.unlocked && (
                  <span className="text-xs font-black px-2 py-0.5"
                    style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', borderRadius: 3 }}>
                    {t(lang, 'ach_reward', { n: a.reward })}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#4a5768' }}>{a.description}</p>

              {!a.unlocked && a.requirement > 0 && (
                <div className="mt-1.5">
                  <div className="rblx-progress-track" style={{ height: 8 }}>
                    <div className="rblx-progress-fill"
                      style={{ width: `${Math.min(100, (totalClicks / a.requirement) * 100)}%` }} />
                  </div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: '#2D3A50' }}>
                    {Math.min(totalClicks, a.requirement)}/{a.requirement}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
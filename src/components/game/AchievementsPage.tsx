import { useState } from 'react';
import type { Achievement } from '@/types/game';
import { type Lang, t } from '@/i18n';
import Icon from '@/components/ui/icon';

interface Props {
  lang: Lang;
  achievements: Achievement[];
  totalClicks: number;
  totalCoinsEarned: number;
  onReset: () => void;
}

export default function AchievementsPage({ lang, achievements, totalClicks, totalCoinsEarned, onReset }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const unlocked = achievements.filter(a => a.unlocked).length;
  const pct = Math.round((unlocked / achievements.length) * 100);

  return (
    <div className="px-4 py-3 space-y-3 pb-6">
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="rblx-panel w-full max-w-sm" style={{ borderTopColor: '#ef4444', borderTopWidth: 3 }}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <div className="font-game text-lg text-white">{t(lang, 'ach_reset_confirm_title')}</div>
              <p className="text-sm font-semibold mt-2" style={{ color: '#4a5768' }}>
                {t(lang, 'ach_reset_confirm_desc')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="rblx-btn rblx-btn-gray flex-1 py-2.5 font-game"
                onClick={() => setShowConfirm(false)}
              >
                {t(lang, 'ach_reset_cancel')}
              </button>
              <button
                className="rblx-btn flex-1 py-2.5 font-game"
                style={{ background: '#ef4444', color: '#fff', border: '2px solid #ef444488' }}
                onClick={() => { onReset(); setShowConfirm(false); }}
              >
                {t(lang, 'ach_reset_confirm_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

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

      <div className="rblx-panel">
        <div className="flex justify-between text-xs font-bold tracking-widest mb-2" style={{ color: '#4a5768' }}>
          <span>{t(lang, 'ach_progress')}</span>
          <span style={{ color: '#1A6BFF' }}>{unlocked}/{achievements.length}</span>
        </div>
        <div className="rblx-progress-track">
          <div className="rblx-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rblx-panel text-center py-3">
          <div className="text-2xl mb-1">👆</div>
          <div className="font-game text-xl text-white">{totalClicks.toLocaleString()}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'ach_clicks_stat')}</div>
        </div>
        <div className="rblx-panel text-center py-3">
          <div className="text-2xl mb-1">💰</div>
          <div className="font-game text-xl" style={{ color: '#FFD700' }}>{totalCoinsEarned.toLocaleString()}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'ach_earned_stat')}</div>
        </div>
      </div>

      <div className="space-y-2">
        {[...achievements].sort((a, b) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0)).map(a => (
          <div
            key={a.id}
            className="rblx-panel flex items-center gap-3"
            style={{
              borderTopColor: a.unlocked ? '#FFD700' : '#2D3A50',
              borderTopWidth: 3,
              opacity: a.unlocked ? 1 : 0.55,
            }}
          >
            <div className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
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
                <span className="font-game text-base text-white leading-none">{t(lang, `ach_${a.id}_name` as Parameters<typeof t>[1])}</span>
                {a.unlocked && (
                  <span className="text-xs font-black px-2 py-0.5"
                    style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', borderRadius: 3 }}>
                    {t(lang, 'ach_reward', { n: a.reward })}
                  </span>
                )}
                {a.unlocked && (
                  <span className="text-xs font-black px-2 py-0.5"
                    style={{ background: 'rgba(105,240,174,0.15)', color: '#69F0AE', borderRadius: 3 }}>
                    {t(lang, 'ach_done')}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#4a5768' }}>{t(lang, `ach_${a.id}_desc` as Parameters<typeof t>[1])}</p>

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

      <div className="rblx-panel" style={{ borderTopColor: '#ef4444', borderTopWidth: 3 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid #ef444444', borderRadius: 5 }}>
            🔄
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-game text-base text-white leading-none">{t(lang, 'ach_reset_title')}</div>
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#4a5768' }}>
              {t(lang, 'ach_reset_desc')}
            </p>
          </div>
          <button
            className="rblx-btn px-4 py-2 text-sm font-game flex items-center gap-1.5 flex-shrink-0"
            style={{ background: '#ef4444', color: '#fff', border: '2px solid #ef444488' }}
            onClick={() => setShowConfirm(true)}
          >
            <Icon name="RotateCcw" size={13} /> {t(lang, 'ach_reset_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
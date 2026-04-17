import { type Lang, t } from '@/i18n';

interface DailyBonusInfo {
  canClaim: boolean;
  streak: number;
  nextDay: number;
  reward: number;
}

interface Props {
  lang: Lang;
  info: DailyBonusInfo;
  onClaim: () => void;
}

const DAILY_BASE = 50;
const getDailyReward = (day: number) => {
  const d = Math.min(Math.max(day, 1), 7);
  return d === 7 ? DAILY_BASE * d * 3 : DAILY_BASE * d;
};

const DAY_EMOJIS = ['🌱', '🔥', '⚡', '💫', '🚀', '💎', '👑'];

export default function DailyBonus({ lang, info, onClaim }: Props) {
  const { canClaim, streak, nextDay } = info;

  return (
    <div className="rblx-panel" style={{ borderTopColor: '#FFD700', borderTopWidth: 3 }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📅</span>
        <div>
          <div className="font-game text-lg text-white leading-none">{t(lang, 'daily_title')}</div>
          <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
            {t(lang, 'daily_subtitle')}
          </div>
        </div>
        {streak > 0 && (
          <div className="ml-auto px-2 py-1 text-xs font-black rounded"
            style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid #FFD70044' }}>
            {t(lang, 'daily_streak', { n: streak })}
          </div>
        )}
      </div>

      {/* 7 дней */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {Array.from({ length: 7 }, (_, i) => {
          const day = i + 1;
          const isPast = streak >= day && !canClaim;
          const isCurrent = day === nextDay && canClaim;
          const isFuture = !isPast && !isCurrent;
          const reward = getDailyReward(day);
          return (
            <div key={day} className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded"
              style={{
                background: isCurrent ? 'rgba(255,215,0,0.15)' : isPast ? 'rgba(105,240,174,0.08)' : '#0F1923',
                border: isCurrent ? '2px solid #FFD700' : isPast ? '2px solid #69F0AE44' : '2px solid #1C2333',
                transition: 'all 0.3s',
              }}>
              <span style={{ fontSize: 14 }}>{DAY_EMOJIS[i]}</span>
              <div className="font-game text-[9px] leading-none"
                style={{ color: isCurrent ? '#FFD700' : isPast ? '#69F0AE' : '#4a5768' }}>
                {t(lang, 'daily_day', { n: day })}
              </div>
              <div className="text-[9px] font-black leading-none"
                style={{ color: isCurrent ? '#FFD700' : isFuture ? '#2D3A50' : '#69F0AE' }}>
                +{reward}
              </div>
            </div>
          );
        })}
      </div>

      {canClaim ? (
        <button
          className="rblx-btn rblx-btn-blue w-full py-3 font-game text-base"
          onClick={onClaim}
        >
          🎁 {t(lang, 'daily_claim')} — {t(lang, 'daily_reward', { n: getDailyReward(nextDay).toLocaleString() })}
        </button>
      ) : (
        <div className="text-center py-2">
          <div className="text-xs font-bold" style={{ color: '#4a5768' }}>
            ✓ {t(lang, 'daily_tomorrow')}
          </div>
        </div>
      )}
    </div>
  );
}

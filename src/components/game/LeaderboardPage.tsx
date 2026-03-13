import { useState } from 'react';
import { LEADERBOARD } from '@/data/gameData';
import Icon from '@/components/ui/icon';
import { type Lang, t } from '@/i18n';

interface Props {
  lang: Lang;
  playerName: string;
  totalClicks: number;
  setPlayerName: (name: string) => void;
}

export default function LeaderboardPage({ lang, playerName, totalClicks, setPlayerName }: Props) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);

  const saveName = () => {
    const v = nameInput.trim();
    if (v.length >= 2) setPlayerName(v);
    setEditing(false);
  };

  const allEntries = [
    ...LEADERBOARD,
    { rank: LEADERBOARD.length + 1, name: playerName, score: totalClicks, emoji: '⭐' },
  ].sort((a, b) => b.score - a.score).slice(0, 12);

  const myRank = allEntries.findIndex(e => e.name === playerName && e.score === totalClicks) + 1;

  const rankColor = (r: number) => r === 1 ? '#FFD700' : r === 2 ? '#C0C0C0' : r === 3 ? '#CD7F32' : '#4a5768';
  const rankBg   = (r: number) => r === 1 ? '#FFD70015' : r === 2 ? '#C0C0C015' : r === 3 ? '#CD7F3215' : 'transparent';

  return (
    <div className="px-4 py-3 pb-6 space-y-3">
      <div className="rblx-panel-gold flex items-center gap-3">
        <span className="text-2xl">👑</span>
        <div>
          <div className="font-game text-lg text-white leading-none">{t(lang, 'lb_title')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'lb_subtitle')}</div>
        </div>
      </div>

      <div className="rblx-panel" style={{ borderTopColor: '#1A6BFF', borderTopWidth: 3 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center text-2xl"
            style={{ background: '#0F1923', border: '2px solid #1A6BFF33', borderRadius: 5 }}>⭐</div>

          <div className="flex-1">
            {editing ? (
              <div className="flex gap-2">
                <input
                  className="flex-1 text-white text-sm font-bold outline-none px-3 py-1.5"
                  style={{ background: '#0F1923', border: '2px solid #1A6BFF', borderRadius: 4 }}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  maxLength={16}
                  autoFocus
                />
                <button className="rblx-btn rblx-btn-blue px-3 py-1.5 text-sm" onClick={saveName}>
                  <Icon name="Check" size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-game text-base text-white">{playerName}</span>
                <button onClick={() => setEditing(true)} style={{ color: '#2D3A50' }}
                  className="hover:text-white transition-colors">
                  <Icon name="Pencil" size={13} />
                </button>
              </div>
            )}
            <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
              💰 {totalClicks.toLocaleString()} {t(lang, 'lb_clicks')}
            </div>
          </div>

          <div className="text-right">
            <div className="font-game text-2xl" style={{ color: '#1A6BFF' }}>#{myRank}</div>
            <div className="text-xs font-bold" style={{ color: '#4a5768' }}>{t(lang, 'lb_rank')}</div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {allEntries.map((entry, idx) => {
          const rank = idx + 1;
          const isMe = entry.name === playerName && entry.score === totalClicks;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

          return (
            <div
              key={`${entry.name}-${entry.score}`}
              className="flex items-center gap-3 px-3 py-2.5"
              style={{
                background: isMe ? 'rgba(26,107,255,0.1)' : rankBg(rank),
                border: `2px solid ${isMe ? '#1A6BFF44' : rank <= 3 ? rankColor(rank) + '33' : '#2D3A50'}`,
                borderRadius: 5,
              }}
            >
              <div className="w-8 text-center font-game text-lg flex-shrink-0" style={{ color: rankColor(rank) }}>
                {medal || <span className="text-sm font-bold" style={{ color: '#2D3A50' }}>#{rank}</span>}
              </div>
              <div className="w-9 h-9 flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: rank <= 3 ? `${rankColor(rank)}22` : '#0F1923',
                  border: `2px solid ${rank <= 3 ? rankColor(rank) + '55' : '#2D3A50'}`,
                  borderRadius: 4,
                }}>
                {entry.emoji || '🏅'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-game text-sm" style={{ color: isMe ? '#4d9fff' : '#fff' }}>
                  {entry.name}
                  {isMe && <span className="ml-1 text-xs font-bold" style={{ color: '#4a5768' }}>{t(lang, 'lb_you')}</span>}
                </span>
              </div>
              <div className="text-right">
                <div className="font-game text-sm text-white">{entry.score.toLocaleString()}</div>
                <div className="text-[10px] font-bold tracking-wide" style={{ color: '#4a5768' }}>{t(lang, 'lb_clicks_stat')}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

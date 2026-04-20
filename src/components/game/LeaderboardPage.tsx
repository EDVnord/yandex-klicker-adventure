import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { type Lang, t } from '@/i18n';

interface LbEntry {
  rank: number;
  name: string;
  score: number;
  avatar?: string;
  isCurrentPlayer?: boolean;
}

interface Props {
  lang: Lang;
  playerName: string;
  totalClicks: number;
  leaderboardRank: number;
  setPlayerName: (name: string) => void;
  getLeaderboardEntries: () => Promise<LbEntry[]>;
  onRankUpdate: (rank: number) => void;
  getRankOfflineMultiplier: (rank: number) => number;
  isAuthorized: boolean;
  onRequestAuth: () => void;
}

const rankColor = (r: number) =>
  r === 1 ? '#FFD700' : r === 2 ? '#C0C0C0' : r === 3 ? '#CD7F32' : '#4a5768';

function crownEmoji(rank: number) {
  if (rank === 1) return '👑';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '🏅';
  return null;
}

function formatScore(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function Avatar({ src, name, size = 36 }: { src?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const letter = (name || '?')[0].toUpperCase();
  if (!src || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #1A6BFF44, #E6191944)',
        border: '2px solid #2D3A50',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, fontWeight: 900, color: '#fff', flexShrink: 0,
        fontFamily: 'Nunito, sans-serif',
      }}>
        {letter}
      </div>
    );
  }
  return (
    <img src={src} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #2D3A50' }} />
  );
}

function RankBonus({ rank, mult, lang }: { rank: number; mult: number; lang: Lang }) {
  if (rank <= 0 || mult <= 1) return null;
  const crown = crownEmoji(rank);
  const color = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#4d9fff';
  const bg    = rank === 1 ? 'rgba(255,215,0,0.10)' : rank === 2 ? 'rgba(192,192,192,0.10)' : rank === 3 ? 'rgba(205,127,50,0.10)' : 'rgba(26,107,255,0.08)';
  return (
    <div className="rblx-panel" style={{ borderTopColor: color, borderTopWidth: 3, background: bg }}>
      <div className="flex items-center gap-3">
        <span className="text-3xl" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>{crown}</span>
        <div className="flex-1">
          <div className="font-game text-sm text-white">
            {lang === 'ru' ? 'Бонус лидерборда' : 'Leaderboard Bonus'}
          </div>
          <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
            {lang === 'ru' ? `${rank} место в рейтинге` : `Rank #${rank} worldwide`}
          </div>
        </div>
        <div className="font-game text-lg px-3 py-1 rounded" style={{ background: '#0F1923', border: `1px solid ${color}55`, color }}>
          ×{mult} offline
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage({
  lang, playerName, totalClicks, leaderboardRank,
  setPlayerName, getLeaderboardEntries, onRankUpdate,
  getRankOfflineMultiplier, isAuthorized, onRequestAuth,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [entries, setEntries] = useState<LbEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myEntry, setMyEntry] = useState<LbEntry | null>(null);

  const saveName = () => {
    const v = nameInput.trim();
    if (v.length >= 2) setPlayerName(v);
    setEditing(false);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getLeaderboardEntries();
    const me = data.find(e => e.isCurrentPlayer) ?? null;
    setMyEntry(me);
    if (me) onRankUpdate(me.rank);
    // В таблицу топ-10 не включаем себя если мы вне топа (чтобы не нарушать порядок)
    const top10 = data.filter(e => e.rank <= 10);
    setEntries(top10);
    setLoading(false);
  }, [getLeaderboardEntries, onRankUpdate]);

  useEffect(() => { load(); }, [load]);

  const myRank = myEntry?.rank ?? leaderboardRank ?? 0;
  const myMult = getRankOfflineMultiplier(myRank);

  return (
    <div className="px-4 py-3 pb-6 space-y-3">

      {/* Заголовок */}
      <div className="rblx-panel-gold flex items-center gap-3">
        <span className="text-2xl" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>🏆</span>
        <div className="flex-1">
          <div className="font-game text-lg text-white leading-none">{t(lang, 'lb_title')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'lb_subtitle')}</div>
        </div>
        <button onClick={load} disabled={loading} className="p-1.5 rounded"
          style={{ color: loading ? '#2D3A50' : '#4a5768', transition: 'color 0.2s' }}>
          <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Баннер авторизации */}
      {!isAuthorized && (
        <div className="rblx-panel flex items-center gap-3" style={{ borderTopColor: '#1A6BFF', borderTopWidth: 3 }}>
          <span className="text-2xl" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>🔑</span>
          <div className="flex-1">
            <div className="font-game text-sm text-white">
              {lang === 'ru' ? 'Войди через Яндекс' : 'Sign in via Yandex'}
            </div>
            <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
              {lang === 'ru' ? 'чтобы попасть в рейтинг и сохранить прогресс' : 'to appear in rankings and save progress'}
            </div>
          </div>
          <button className="rblx-btn rblx-btn-blue px-3 py-1.5 text-xs font-game" onClick={onRequestAuth}>
            {lang === 'ru' ? 'Войти' : 'Sign in'}
          </button>
        </div>
      )}

      {/* Бонус лидера */}
      {myRank > 0 && myRank <= 10 && (
        <RankBonus rank={myRank} mult={myMult} lang={lang} />
      )}

      {/* Моя карточка */}
      <div className="rblx-panel" style={{ borderTopColor: '#1A6BFF', borderTopWidth: 3 }}>
        <div className="flex items-center gap-3">
          <Avatar src={myEntry?.avatar} name={playerName} size={44} />
          <div className="flex-1 min-w-0">
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
                <span className="font-game text-base text-white truncate">{playerName}</span>
                {!isAuthorized && (
                  <button onClick={() => setEditing(true)} style={{ color: '#2D3A50', flexShrink: 0 }}
                    className="hover:text-white transition-colors">
                    <Icon name="Pencil" size={13} />
                  </button>
                )}
              </div>
            )}
            <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
              {lang === 'ru' ? '💰' : '💰'} {formatScore(totalClicks)} {t(lang, 'lb_clicks')}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {myRank > 0 ? (
              <>
                <div className="font-game text-xl" style={{ color: rankColor(myRank) }}>
                  #{myRank}
                </div>
                <div className="text-xs font-bold" style={{ color: '#4a5768' }}>
                  {lang === 'ru' ? 'место' : 'rank'}
                </div>
              </>
            ) : (
              <div className="text-xs font-bold" style={{ color: '#2D3A50' }}>
                {lang === 'ru' ? 'нет в топе' : 'not ranked'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Таблица лидеров */}
      <div className="rblx-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="px-4 py-2.5 flex items-center gap-2"
          style={{ borderBottom: '1px solid #1C2333' }}>
          <Icon name="Trophy" size={14} color="#FFD700" />
          <span className="font-game text-sm text-white">
            {lang === 'ru' ? 'ТОП ИГРОКОВ' : 'TOP PLAYERS'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-3">
            <Icon name="Loader2" size={20} className="animate-spin" color="#2D3A50" />
            <span className="text-sm font-bold" style={{ color: '#2D3A50' }}>
              {lang === 'ru' ? 'Загружаем рейтинг...' : 'Loading rankings...'}
            </span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <span className="text-3xl" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>🌐</span>
            <span className="text-sm font-bold text-center px-4" style={{ color: '#2D3A50' }}>
              {lang === 'ru' ? 'Рейтинг пока пуст.\nСтань первым!' : 'No rankings yet.\nBe the first!'}
            </span>
          </div>
        ) : (
          <div>
            {entries.map((entry, i) => {
              const isMe = entry.isCurrentPlayer;
              const color = rankColor(entry.rank);
              const crown = crownEmoji(entry.rank);
              return (
                <div key={entry.rank}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{
                    background: isMe
                      ? 'linear-gradient(90deg, rgba(26,107,255,0.12), rgba(26,107,255,0.05))'
                      : entry.rank <= 3 ? `${color}08` : 'transparent',
                    borderBottom: i < entries.length - 1 ? '1px solid #1C2333' : 'none',
                    borderLeft: isMe ? '3px solid #1A6BFF' : '3px solid transparent',
                  }}>

                  {/* Место */}
                  <div className="w-8 text-center flex-shrink-0">
                    {crown ? (
                      <span className="text-lg" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>{crown}</span>
                    ) : (
                      <span className="font-game text-sm" style={{ color }}>{entry.rank}</span>
                    )}
                  </div>

                  {/* Аватарка */}
                  <Avatar src={entry.avatar} name={entry.name} size={34} />

                  {/* Имя */}
                  <div className="flex-1 min-w-0">
                    <div className="font-game text-sm truncate" style={{ color: isMe ? '#fff' : entry.rank <= 3 ? color : '#c0cdd8' }}>
                      {entry.name}
                      {isMe && (
                        <span className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded"
                          style={{ background: '#1A6BFF22', color: '#1A6BFF', border: '1px solid #1A6BFF44' }}>
                          {lang === 'ru' ? 'ТЫ' : 'YOU'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Счёт */}
                  <div className="font-game text-sm flex-shrink-0" style={{ color: isMe ? '#1A6BFF' : color }}>
                    {formatScore(entry.score)}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Место вне топ-10 */}
      {myEntry && myEntry.rank > 10 && (
        <div className="rblx-panel flex items-center gap-3" style={{ borderTopColor: '#2D3A50', borderTopWidth: 2 }}>
          <Avatar src={myEntry.avatar} name={myEntry.name} size={40} />
          <div className="flex-1">
            <div className="font-game text-sm text-white">
              {t(lang, 'lb_out_of_top', { rank: myEntry.rank })}
            </div>
            <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
              {t(lang, 'lb_out_of_top_sub')} • {formatScore(myEntry.score)} {t(lang, 'lb_clicks')}
            </div>
          </div>
          <div className="font-game text-2xl" style={{ color: '#2D3A50' }}>#{myEntry.rank}</div>
        </div>
      )}

      {/* Бонусы за места */}
      <div className="rblx-panel" style={{ borderTopColor: '#2D3A50', borderTopWidth: 2 }}>
        <div className="text-xs font-black tracking-widest mb-2" style={{ color: '#4a5768' }}>
          {lang === 'ru' ? 'БОНУСЫ ЗА РЕЙТИНГ' : 'RANK BONUSES'}
        </div>
        <div className="space-y-1.5">
          {[
            { rank: 1, label: lang === 'ru' ? '1 место' : '1st place', crown: '👑' },
            { rank: 2, label: lang === 'ru' ? '2 место' : '2nd place', crown: '🥈' },
            { rank: 3, label: lang === 'ru' ? '3 место' : '3rd place', crown: '🥉' },
            { rank: 4, label: lang === 'ru' ? 'Топ 10' : 'Top 10',     crown: '🏅' },
          ].map(row => {
            const mult = getRankOfflineMultiplier(row.rank);
            const color = rankColor(row.rank);
            return (
              <div key={row.rank} className="flex items-center gap-2 px-2 py-1.5 rounded"
                style={{ background: '#0F1923', border: `1px solid ${color}22` }}>
                <span className="text-base w-6 text-center" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>{row.crown}</span>
                <span className="font-game text-sm flex-1" style={{ color }}>{row.label}</span>
                <span className="font-game text-sm" style={{ color }}>×{mult}</span>
                <span className="text-xs font-bold" style={{ color: '#4a5768' }}>offline</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
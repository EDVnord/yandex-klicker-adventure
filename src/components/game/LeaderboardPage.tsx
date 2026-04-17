import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { type Lang, t } from '@/i18n';

interface LbEntry {
  rank: number;
  name: string;
  score: number;
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

const rankColor = (r: number) => r === 1 ? '#FFD700' : r === 2 ? '#C0C0C0' : r === 3 ? '#CD7F32' : '#4a5768';
const rankBg    = (r: number) => r === 1 ? '#FFD70015' : r === 2 ? '#C0C0C015' : r === 3 ? '#CD7F3215' : 'transparent';

function crownEmoji(rank: number) {
  if (rank === 1) return '👑';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '🏅';
  return null;
}

function RankBonus({ rank, mult, lang }: { rank: number; mult: number; lang: Lang }) {
  if (rank <= 0 || mult <= 1) return null;
  const crown = crownEmoji(rank);
  const color = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#4d9fff';
  const bg    = rank === 1 ? 'rgba(255,215,0,0.12)' : rank === 2 ? 'rgba(192,192,192,0.12)' : rank === 3 ? 'rgba(205,127,50,0.12)' : 'rgba(26,107,255,0.10)';
  return (
    <div className="rblx-panel space-y-2" style={{ borderTopColor: color, borderTopWidth: 3 }}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{crown}</span>
        <div>
          <div className="font-game text-base text-white leading-none">
            {lang === 'ru' ? 'Бонус лидера' : 'Leader Bonus'}
          </div>
          <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
            {lang === 'ru' ? `Ты на ${rank} месте в рейтинге` : `You're ranked #${rank}`}
          </div>
        </div>
        <div className="ml-auto px-2 py-1 font-game text-sm rounded"
          style={{ background: bg, border: `1px solid ${color}55`, color }}>
          ×{mult} offline
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="px-3 py-2 rounded text-center" style={{ background: '#0F1923', border: '1px solid #1C2333' }}>
          <div className="text-lg">{crown}</div>
          <div className="font-game text-xs mt-0.5" style={{ color }}>
            {lang === 'ru' ? 'Корона' : 'Crown'}
          </div>
          <div className="text-[10px] font-bold" style={{ color: '#4a5768' }}>
            {lang === 'ru' ? 'Топ рейтинга' : 'Top rank'}
          </div>
        </div>
        <div className="px-3 py-2 rounded text-center" style={{ background: '#0F1923', border: '1px solid #1C2333' }}>
          <div className="font-game text-lg" style={{ color }}>×{mult}</div>
          <div className="font-game text-xs mt-0.5" style={{ color }}>
            {lang === 'ru' ? 'Offline-доход' : 'Offline income'}
          </div>
          <div className="text-[10px] font-bold" style={{ color: '#4a5768' }}>
            {lang === 'ru' ? 'Пока офлайн' : 'While away'}
          </div>
        </div>
      </div>
    </div>
  );
}

function BonusTable({ lang, getRankOfflineMultiplier }: { lang: Lang; getRankOfflineMultiplier: (r: number) => number }) {
  const rows = [
    { rank: 1, label: lang === 'ru' ? '1 место' : '1st place', crown: '👑' },
    { rank: 2, label: lang === 'ru' ? '2 место' : '2nd place', crown: '🥈' },
    { rank: 3, label: lang === 'ru' ? '3 место' : '3rd place', crown: '🥉' },
    { rank: 4, label: lang === 'ru' ? 'Топ-10' : 'Top 10', crown: '🏅' },
  ];
  return (
    <div className="rblx-panel" style={{ borderTopColor: '#2D3A50', borderTopWidth: 2 }}>
      <div className="text-xs font-black tracking-widest mb-2" style={{ color: '#4a5768' }}>
        {lang === 'ru' ? 'БОНУСЫ ЗА РЕЙТИНГ' : 'RANK BONUSES'}
      </div>
      <div className="space-y-1.5">
        {rows.map(row => {
          const mult = getRankOfflineMultiplier(row.rank);
          const color = rankColor(row.rank);
          return (
            <div key={row.rank} className="flex items-center gap-2 px-2 py-1.5 rounded"
              style={{ background: '#0F1923', border: `1px solid ${color}22` }}>
              <span className="text-base w-6 text-center">{row.crown}</span>
              <span className="font-game text-sm flex-1" style={{ color }}>{row.label}</span>
              <span className="font-game text-sm" style={{ color }}>×{mult}</span>
              <span className="text-xs font-bold" style={{ color: '#4a5768' }}>
                {lang === 'ru' ? 'offline' : 'offline'}
              </span>
            </div>
          );
        })}
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
    const me = data.find(e => e.name === playerName) ?? null;
    setMyEntry(me);
    if (me) onRankUpdate(me.rank);
    setEntries(data.slice(0, 10));
    setLoading(false);
  }, [getLeaderboardEntries, playerName, onRankUpdate]);

  useEffect(() => { load(); }, [load]);

  const myRank = myEntry?.rank ?? leaderboardRank ?? null;
  const myMult = getRankOfflineMultiplier(myRank ?? 0);

  return (
    <div className="px-4 py-3 pb-6 space-y-3">
      {/* Заголовок */}
      <div className="rblx-panel-gold flex items-center gap-3">
        <span className="text-2xl">👑</span>
        <div className="flex-1">
          <div className="font-game text-lg text-white leading-none">{t(lang, 'lb_title')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'lb_subtitle')}</div>
        </div>
        <button onClick={load} disabled={loading} className="p-1.5 rounded"
          style={{ color: loading ? '#2D3A50' : '#4a5768', transition: 'color 0.2s' }}>
          <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Бонус лидера — показываем если в топе */}
      {myRank != null && myRank > 0 && myRank <= 10 && (
        <RankBonus rank={myRank} mult={myMult} lang={lang} />
      )}

      {/* Моя карточка */}
      <div className="rblx-panel" style={{ borderTopColor: '#1A6BFF', borderTopWidth: 3 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: '#0F1923', border: '2px solid #1A6BFF33', borderRadius: 5 }}>
            {myRank && myRank <= 10 ? crownEmoji(myRank) : '⭐'}
          </div>

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
                <button onClick={() => setEditing(true)} style={{ color: '#2D3A50', flexShrink: 0 }}
                  className="hover:text-white transition-colors">
                  <Icon name="Pencil" size={13} />
                </button>
              </div>
            )}
            <div className="text-xs font-bold mt-0.5" style={{ color: '#4a5768' }}>
              💰 {totalClicks.toLocaleString()} {t(lang, 'lb_clicks')}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            {myRank ? (
              <>
                <div className="font-game text-2xl" style={{ color: myRank <= 3 ? rankColor(myRank) : '#1A6BFF' }}>
                  #{myRank}
                </div>
                <div className="text-xs font-bold" style={{ color: '#4a5768' }}>{t(lang, 'lb_rank')}</div>
              </>
            ) : (
              <div className="text-xs font-bold" style={{ color: '#4a5768' }}>—</div>
            )}
          </div>
        </div>

        {!isAuthorized && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded"
            style={{ background: 'rgba(26,107,255,0.08)', border: '1px solid #1A6BFF33' }}>
            <Icon name="Info" size={14} style={{ color: '#1A6BFF', flexShrink: 0 }} />
            <span className="text-xs font-semibold flex-1" style={{ color: '#4a5768' }}>
              {lang === 'ru' ? 'Войди в Яндекс, чтобы попасть в рейтинг' : 'Sign in to appear in the leaderboard'}
            </span>
            <button className="rblx-btn rblx-btn-blue px-2 py-1 text-xs flex-shrink-0" onClick={onRequestAuth}>
              🔑 {t(lang, 'header_login')}
            </button>
          </div>
        )}
      </div>

      {/* Таблица */}
      {loading ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <Icon name="Loader2" size={32} className="animate-spin" style={{ color: '#1A6BFF' }} />
          <span className="text-sm font-bold" style={{ color: '#4a5768' }}>
            {lang === 'ru' ? 'Загружаем рейтинг...' : 'Loading leaderboard...'}
          </span>
        </div>
      ) : entries.length === 0 ? (
        <div className="rblx-panel text-center py-6">
          <div className="text-3xl mb-2">🏆</div>
          <div className="font-game text-base text-white mb-1">
            {lang === 'ru' ? 'Рейтинг пока пуст' : 'No entries yet'}
          </div>
          <p className="text-xs font-semibold" style={{ color: '#4a5768' }}>
            {lang === 'ru' ? 'Будь первым!' : 'Be the first!'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => {
            const rank = entry.rank;
            const isMe = entry.name === playerName;
            const crown = crownEmoji(rank);
            const mult = getRankOfflineMultiplier(rank);

            return (
              <div key={`${rank}-${entry.name}`} className="flex items-center gap-3 px-3 py-2.5"
                style={{
                  background: isMe ? 'rgba(26,107,255,0.1)' : rankBg(rank),
                  border: `2px solid ${isMe ? '#1A6BFF44' : rank <= 3 ? rankColor(rank) + '33' : '#2D3A50'}`,
                  borderRadius: 5,
                }}>
                <div className="w-8 text-center font-game text-lg flex-shrink-0" style={{ color: rankColor(rank) }}>
                  {crown || <span className="text-sm font-bold" style={{ color: '#2D3A50' }}>#{rank}</span>}
                </div>
                <div className="w-9 h-9 flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: rank <= 3 ? `${rankColor(rank)}22` : '#0F1923',
                    border: `2px solid ${rank <= 3 ? rankColor(rank) + '55' : '#2D3A50'}`,
                    borderRadius: 4,
                  }}>
                  {crown || '🏅'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-game text-sm" style={{ color: isMe ? '#4d9fff' : '#fff' }}>
                    {entry.name}
                    {isMe && <span className="ml-1 text-xs font-bold" style={{ color: '#4a5768' }}>{t(lang, 'lb_you')}</span>}
                  </span>
                  {mult > 1 && (
                    <div className="text-[10px] font-bold" style={{ color: rankColor(rank) }}>
                      ×{mult} offline
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-game text-sm text-white">{entry.score.toLocaleString()}</div>
                  <div className="text-[10px] font-bold tracking-wide" style={{ color: '#4a5768' }}>{t(lang, 'lb_clicks_stat')}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Таблица бонусов */}
      <BonusTable lang={lang} getRankOfflineMultiplier={getRankOfflineMultiplier} />
    </div>
  );
}

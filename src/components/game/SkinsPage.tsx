import { SKINS, RARITY_COLOR } from '@/data/skins';
import Icon from '@/components/ui/icon';
import { type Lang, t } from '@/i18n';

interface Props {
  lang: Lang;
  coins: number;
  currentSkinId: string;
  unlockedSkins: string[];
  onSelect: (id: string) => void;
  onBuy: (id: string, price: number) => boolean;   // returns true if success
  onAdUnlock: (id: string, onSuccess: () => void) => void;
}

export default function SkinsPage({ lang, coins, currentSkinId, unlockedSkins, onSelect, onBuy, onAdUnlock }: Props) {
  const isUnlocked = (id: string) => unlockedSkins.includes(id);

  const handleBuy = (id: string, price: number) => {
    onBuy(id, price);
  };

  return (
    <div className="px-4 py-3 space-y-3 pb-6">
      {/* Header */}
      <div className="rblx-panel flex items-center gap-3">
        <span className="text-2xl">👗</span>
        <div>
          <div className="font-game text-lg text-white leading-none">{t(lang, 'skins_title')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'skins_subtitle')}</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 font-game text-base"
          style={{ background: '#0F1923', border: '2px solid #2D3A50', borderRadius: 4 }}>
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: '#FFD700', color: '#111' }}>R$</div>
          <span style={{ color: '#FFD700' }}>{coins.toLocaleString('ru')}</span>
        </div>
      </div>

      {/* Skin grid */}
      <div className="grid grid-cols-3 gap-2">
        {SKINS.map(skin => {
          const unlocked = isUnlocked(skin.id);
          const active = currentSkinId === skin.id;
          const rarityColor = RARITY_COLOR[skin.rarity];
          const canAfford = skin.price > 0 && coins >= skin.price;

          return (
            <div
              key={skin.id}
              className="rblx-panel flex flex-col gap-1 relative overflow-hidden"
              style={{
                borderTopColor: active ? rarityColor : unlocked ? rarityColor + '88' : '#2D3A50',
                borderTopWidth: 3,
                boxShadow: active ? `0 0 14px ${skin.glowColor}` : 'none',
                padding: '8px',
              }}
            >
              {/* Rarity + multiplier */}
              <div className="flex items-center justify-between">
                <div className="text-[8px] font-black tracking-widest" style={{ color: rarityColor }}>
                  {t(lang, `rarity_${skin.rarity}` as Parameters<typeof t>[1])}
                </div>
                <span className="text-[9px] font-black px-1 py-0.5 rounded"
                  style={{ background: rarityColor + '22', color: rarityColor }}>
                  ×{skin.clickMultiplier}
                </span>
              </div>

              {/* Image */}
              <div className="w-full aspect-square rounded overflow-hidden relative"
                style={{
                  border: `2px solid ${rarityColor}44`,
                  background: '#0F1923',
                  filter: unlocked ? 'none' : 'grayscale(0.7) brightness(0.6)',
                }}>
                <img src={skin.img} alt={skin.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }}
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                />
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <Icon name="Lock" size={22} color="#fff" />
                  </div>
                )}
                {active && (
                  <div className="absolute top-1 right-1 z-10 text-[8px] font-black px-1 py-0.5"
                    style={{ background: rarityColor, color: skin.rarity === 'legendary' ? '#111' : '#fff', borderRadius: 2 }}>
                    ✓
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="font-game text-[11px] text-white leading-none truncate">{skin.name}</div>

              {/* Action button */}
              {unlocked ? (
                <button
                  className="rblx-btn w-full text-[10px] py-1"
                  style={{
                    background: active ? rarityColor : '#1C2333',
                    color: active ? (skin.rarity === 'legendary' ? '#111' : '#fff') : rarityColor,
                    border: `1px solid ${rarityColor}55`,
                    borderRadius: 3,
                  }}
                  onClick={() => !active && onSelect(skin.id)}
                >
                  {active ? '✓ Выбран' : t(lang, 'btn_select')}
                </button>
              ) : skin.price === -1 ? (
                <button className="rblx-btn rblx-btn-blue w-full text-[10px] py-1"
                  onClick={() => onAdUnlock(skin.id, () => onSelect(skin.id))}>
                  <Icon name="Play" size={11} /> Реклама
                </button>
              ) : (
                <button
                  className={`rblx-btn w-full text-[10px] py-1 ${canAfford ? 'rblx-btn-yellow' : 'rblx-btn-gray'}`}
                  onClick={() => canAfford && handleBuy(skin.id, skin.price)}
                >
                  {!canAfford && <Icon name="Lock" size={10} />}
                  🪙 {skin.price >= 1000 ? `${(skin.price/1000).toFixed(0)}к` : skin.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
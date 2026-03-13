import { SKINS, RARITY_LABEL, RARITY_COLOR } from '@/data/skins';
import Icon from '@/components/ui/icon';

interface Props {
  coins: number;
  currentSkinId: string;
  unlockedSkins: string[];
  onSelect: (id: string) => void;
  onBuy: (id: string, price: number) => boolean;   // returns true if success
  onAdUnlock: (id: string, onSuccess: () => void) => void;
}

export default function SkinsPage({ coins, currentSkinId, unlockedSkins, onSelect, onBuy, onAdUnlock }: Props) {
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
          <div className="font-game text-lg text-white leading-none">Скины</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>ВЫБЕРИ ПЕРСОНАЖА</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 font-game text-base"
          style={{ background: '#0F1923', border: '2px solid #2D3A50', borderRadius: 4 }}>
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: '#FFD700', color: '#111' }}>R$</div>
          <span style={{ color: '#FFD700' }}>{coins.toLocaleString('ru')}</span>
        </div>
      </div>

      {/* Skin grid */}
      <div className="grid grid-cols-2 gap-3">
        {SKINS.map(skin => {
          const unlocked = isUnlocked(skin.id);
          const active = currentSkinId === skin.id;
          const rarityColor = RARITY_COLOR[skin.rarity];
          const canAfford = skin.price > 0 && coins >= skin.price;

          return (
            <div
              key={skin.id}
              className="rblx-panel flex flex-col gap-2 relative overflow-hidden"
              style={{
                borderTopColor: active ? rarityColor : unlocked ? rarityColor + '88' : '#2D3A50',
                borderTopWidth: 3,
                boxShadow: active ? `0 0 18px ${skin.glowColor}` : 'none',
              }}
            >
              {/* Active badge */}
              {active && (
                <div className="absolute top-2 right-2 z-10 text-xs font-black px-2 py-0.5 tracking-widest"
                  style={{ background: rarityColor, color: active && skin.rarity === 'legendary' ? '#111' : '#fff', borderRadius: 3 }}>
                  НАДЕТ
                </div>
              )}

              {/* Rarity badge */}
              <div className="text-[9px] font-black tracking-widest" style={{ color: rarityColor }}>
                {RARITY_LABEL[skin.rarity]}
              </div>

              {/* Image */}
              <div className="w-full aspect-square rounded overflow-hidden relative"
                style={{
                  border: `2px solid ${rarityColor}44`,
                  background: '#0F1923',
                  filter: unlocked ? 'none' : 'grayscale(0.7) brightness(0.6)',
                }}>
                <img src={skin.img} alt={skin.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                />
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <Icon name="Lock" size={32} color="#fff" />
                  </div>
                )}
              </div>

              {/* Name & desc */}
              <div>
                <div className="font-game text-base text-white leading-none flex items-center justify-between">
                  <span>{skin.emoji} {skin.name}</span>
                  <span className="text-xs font-black px-1.5 py-0.5 rounded"
                    style={{ background: rarityColor + '22', color: rarityColor, border: `1px solid ${rarityColor}55` }}>
                    ×{skin.clickMultiplier}
                  </span>
                </div>
                <div className="text-[11px] font-semibold mt-0.5 leading-tight" style={{ color: '#4a5768' }}>
                  {skin.description}
                </div>
              </div>

              {/* Action button */}
              {unlocked ? (
                <button
                  className="rblx-btn w-full text-sm py-2"
                  style={{
                    background: active ? rarityColor : '#1C2333',
                    color: active ? (skin.rarity === 'legendary' ? '#111' : '#fff') : rarityColor,
                    border: `2px solid ${rarityColor}55`,
                    borderRadius: 4,
                    boxShadow: active ? `0 3px 0 ${skin.glowColor}` : 'none',
                  }}
                  onClick={() => !active && onSelect(skin.id)}
                >
                  {active ? '✓ НАДЕТ' : 'НАДЕТЬ'}
                </button>
              ) : skin.price === -1 ? (
                <button className="rblx-btn rblx-btn-blue w-full text-xs py-2"
                  onClick={() => onAdUnlock(skin.id, () => onSelect(skin.id))}>
                  <Icon name="Play" size={13} /> Реклама
                </button>
              ) : (
                <button
                  className={`rblx-btn w-full text-xs py-2 ${canAfford ? 'rblx-btn-yellow' : 'rblx-btn-gray'}`}
                  onClick={() => canAfford && handleBuy(skin.id, skin.price)}
                >
                  {canAfford ? '' : <Icon name="Lock" size={12} />}
                  🪙 {skin.price.toLocaleString('ru')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
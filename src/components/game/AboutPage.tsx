export default function AboutPage() {
  return (
    <div className="px-4 py-3 pb-6 space-y-3">
      {/* Header */}
      <div className="rblx-panel flex items-center gap-3">
        <span className="text-2xl">ℹ️</span>
        <div>
          <div className="font-game text-lg text-white leading-none">НубоКлик</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>О ИГРЕ</div>
        </div>
      </div>

      {/* How to play */}
      <div className="rblx-panel-blue">
        <div className="font-game text-base mb-3" style={{ color: '#1A6BFF' }}>🎮 КАК ИГРАТЬ?</div>
        <div className="space-y-2.5">
          {[
            { icon: '👆', text: 'Нажимай на нуба как можно быстрее' },
            { icon: '💰', text: 'Зарабатывай монеты за каждый клик' },
            { icon: '⚡', text: 'Покупай бустеры в магазине' },
            { icon: '📺', text: 'Смотри рекламу — получай бонус x10!' },
            { icon: '🏆', text: 'Выполняй достижения за награды' },
            { icon: '👑', text: 'Попади в топ лидеров!' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
              <span className="text-sm font-semibold" style={{ color: '#7a8faa' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Boosters */}
      <div className="rblx-panel-red">
        <div className="font-game text-base mb-3" style={{ color: '#E61919' }}>⚡ БУСТЕРЫ</div>
        <div className="space-y-2">
          {[
            { e: '⚡', n: 'Турбо-клик',     d: 'x3 монеты • 30с • 500 💰' },
            { e: '🚀', n: 'МЕГА-клик',       d: 'x5 монеты • 20с • 1200 💰' },
            { e: '🌈', n: 'Радуга',          d: 'x2 + авто-клик • 45с • 800 💰' },
            { e: '⭐', n: 'Звёздный бонус',  d: 'x10 монеты • 15с • за рекламу!' },
            { e: '🤖', n: 'Авто-робот',      d: 'Кликает сам • 60с • 2000 💰' },
          ].map(({ e, n, d }) => (
            <div key={n} className="flex gap-2 items-start">
              <span className="text-lg flex-shrink-0">{e}</span>
              <div>
                <span className="font-bold text-white text-sm">{n} — </span>
                <span className="text-sm font-semibold" style={{ color: '#4a5768' }}>{d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dev */}
      <div className="rblx-panel">
        <div className="font-game text-base mb-2" style={{ color: '#00B06F' }}>👾 РАЗРАБОТЧИК</div>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: '#4a5768' }}>
          НубоКлик создан для всех фанатов Roblox и кнопок! Впереди новые персонажи, бустеры и режимы.
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {['🟥 Roblox', '⚡ Клики', '🎮 Игры', '🚀 Топ'].map(tag => (
            <span key={tag} className="px-3 py-1 text-xs font-black tracking-wide"
              style={{ background: '#0F1923', border: '2px solid #2D3A50', borderRadius: 4, color: '#4a5768' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="text-center py-1">
        <p className="text-xs font-bold tracking-widest" style={{ color: '#1C2333' }}>НУБОКЛИК v1.0 • 2026</p>
      </div>
    </div>
  );
}
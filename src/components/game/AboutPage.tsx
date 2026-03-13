import { type Lang, t } from '@/i18n';

interface Props { lang: Lang; }

export default function AboutPage({ lang }: Props) {
  return (
    <div className="px-4 py-3 pb-6 space-y-3">
      <div className="rblx-panel flex items-center gap-3">
        <span className="text-2xl">ℹ️</span>
        <div>
          <div className="font-game text-lg text-white leading-none">{t(lang, 'about_title')}</div>
          <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#4a5768' }}>{t(lang, 'about_subtitle')}</div>
        </div>
      </div>

      <div className="rblx-panel-blue">
        <div className="font-game text-base mb-3" style={{ color: '#1A6BFF' }}>{t(lang, 'about_how_title')}</div>
        <div className="space-y-2.5">
          {[
            { icon: '👆', key: 'about_how_1' as const },
            { icon: '💰', key: 'about_how_2' as const },
            { icon: '⚡', key: 'about_how_3' as const },
            { icon: '📺', key: 'about_how_4' as const },
            { icon: '🏆', key: 'about_how_5' as const },
            { icon: '👑', key: 'about_how_6' as const },
          ].map(({ icon, key }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
              <span className="text-sm font-semibold" style={{ color: '#7a8faa' }}>{t(lang, key)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rblx-panel-red">
        <div className="font-game text-base mb-3" style={{ color: '#E61919' }}>{t(lang, 'about_boosts_title')}</div>
        <div className="space-y-2">
          {[
            { e: '⚡', nk: 'about_turbo' as const, dk: 'about_turbo_d' as const },
            { e: '🚀', nk: 'about_mega' as const,  dk: 'about_mega_d' as const  },
            { e: '🌈', nk: 'about_rainbow' as const, dk: 'about_rainbow_d' as const },
            { e: '⭐', nk: 'about_star' as const,   dk: 'about_star_d' as const   },
            { e: '🤖', nk: 'about_robot' as const,  dk: 'about_robot_d' as const  },
          ].map(({ e, nk, dk }) => (
            <div key={nk} className="flex gap-2 items-start">
              <span className="text-lg flex-shrink-0">{e}</span>
              <div>
                <span className="font-bold text-white text-sm">{t(lang, nk)} — </span>
                <span className="text-sm font-semibold" style={{ color: '#4a5768' }}>{t(lang, dk)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rblx-panel">
        <div className="font-game text-base mb-2" style={{ color: '#00B06F' }}>{t(lang, 'about_dev_title')}</div>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: '#4a5768' }}>
          {t(lang, 'about_dev_desc')}
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {(['about_tag1', 'about_tag2', 'about_tag3', 'about_tag4'] as const).map(key => (
            <span key={key} className="px-3 py-1 text-xs font-black tracking-wide"
              style={{ background: '#0F1923', border: '2px solid #2D3A50', borderRadius: 4, color: '#4a5768' }}>
              {t(lang, key)}
            </span>
          ))}
        </div>
      </div>

      <div className="text-center py-1">
        <p className="text-xs font-bold tracking-widest" style={{ color: '#1C2333' }}>{t(lang, 'about_footer')}</p>
      </div>
    </div>
  );
}

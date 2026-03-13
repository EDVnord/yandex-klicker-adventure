export type Lang = 'ru' | 'en';

export const translations = {
  ru: {
    // Nav
    nav_game: 'Игра',
    nav_skins: 'Скины',
    nav_shop: 'Магазин',
    nav_bonuses: 'Бонусы',
    nav_achievements: 'Ачивки',
    // Header
    game_title: 'НубоКлик',
    // Ad overlay
    ad_loading: 'Загрузка рекламы...',
    ad_hint: 'Досмотри до конца для получения бонуса!',
    // Clicker
    stat_coins: 'МОНЕТЫ',
    stat_clicks: 'КЛИКОВ',
    stat_cps: 'КЛ/СЕК',
    click_hint: '▼ НАЖИМАЙ НА ПЕРСОНАЖА ИЛИ КНОПКУ! ▼',
    multiplier_active: '🔥 МНОЖИТЕЛЬ x{m} АКТИВЕН!',
    auto_robot: '🤖 АВТО-РОБОТ КЛИКАЕТ!',
    // Shop
    shop_title: 'Магазин бустеров',
    shop_subtitle: 'УСИЛЬ СВОЕГО ПЕРСОНАЖА',
    boost_active: 'АКТИВЕН',
    boost_left: 'осталось',
    btn_watch_ad: 'Смотреть рекламу',
    btn_ad_busy: 'Реклама...',
    // Skins
    skins_title: 'Скины',
    skins_subtitle: 'ВЫБЕРИ ПЕРСОНАЖА',
    skin_selected: 'ВЫБРАН',
    btn_select: 'Выбрать',
    btn_buy: 'Купить',
    btn_unlock_ad: 'Разблокировать за рекламу',
    btn_not_enough: 'Не хватает монет',
    // Ad Offers
    offers_title: 'Бонусы за рекламу',
    offers_subtitle: 'СМОТРИ РЕКЛАМУ — ПОЛУЧАЙ ПРИЗЫ',
    spin_title: 'Удачный спин',
    spin_subtitle: 'Крути барабан — выигрывай монеты и бусты!',
    spin_next: 'Следующий спин через',
    spin_charging: '⏳ Заряжается...',
    spin_btn: 'Смотреть рекламу и крутить!',
    spin_spinning: 'Крутим...',
    spin_coins: '+{n} монет!',
    spin_boost: '{n} активирован!',
    offer_next: 'до следующего',
    // Achievements
    ach_title: 'Достижения',
    ach_unlocked: '{n}/{total} ОТКРЫТО',
    ach_reward: 'Награда: +{n} 💰',
    ach_toast_title: 'ДОСТИЖЕНИЕ!',
    // Rarity
    rarity_common: 'ОБЫЧНЫЙ',
    rarity_rare: 'РЕДКИЙ',
    rarity_epic: 'ЭПИЧЕСКИЙ',
    rarity_legendary: 'ЛЕГЕНДАРНЫЙ',
    rarity_mythic: 'МИФИЧЕСКИЙ',
    // Cooldown
    cd_minutes: '{m}м {s}с',
    cd_seconds: '{s}с',
  },
  en: {
    nav_game: 'Game',
    nav_skins: 'Skins',
    nav_shop: 'Shop',
    nav_bonuses: 'Bonuses',
    nav_achievements: 'Awards',
    game_title: 'NubClick',
    ad_loading: 'Loading ad...',
    ad_hint: 'Watch to the end to get your bonus!',
    stat_coins: 'COINS',
    stat_clicks: 'CLICKS',
    stat_cps: 'CL/SEC',
    click_hint: '▼ TAP THE CHARACTER OR THE BUTTON! ▼',
    multiplier_active: '🔥 MULTIPLIER x{m} ACTIVE!',
    auto_robot: '🤖 AUTO-ROBOT CLICKING!',
    shop_title: 'Boosters Shop',
    shop_subtitle: 'POWER UP YOUR CHARACTER',
    boost_active: 'ACTIVE',
    boost_left: 'left',
    btn_watch_ad: 'Watch ad',
    btn_ad_busy: 'Ad loading...',
    skins_title: 'Skins',
    skins_subtitle: 'CHOOSE A CHARACTER',
    skin_selected: 'SELECTED',
    btn_select: 'Select',
    btn_buy: 'Buy',
    btn_unlock_ad: 'Unlock for ad',
    btn_not_enough: 'Not enough coins',
    offers_title: 'Ad Bonuses',
    offers_subtitle: 'WATCH ADS — GET PRIZES',
    spin_title: 'Lucky Spin',
    spin_subtitle: 'Spin the wheel — win coins and boosts!',
    spin_next: 'Next spin in',
    spin_charging: '⏳ Charging...',
    spin_btn: 'Watch ad & spin!',
    spin_spinning: 'Spinning...',
    spin_coins: '+{n} coins!',
    spin_boost: '{n} activated!',
    offer_next: 'until next',
    ach_title: 'Achievements',
    ach_unlocked: '{n}/{total} UNLOCKED',
    ach_reward: 'Reward: +{n} 💰',
    ach_toast_title: 'ACHIEVEMENT!',
    rarity_common: 'COMMON',
    rarity_rare: 'RARE',
    rarity_epic: 'EPIC',
    rarity_legendary: 'LEGENDARY',
    rarity_mythic: 'MYTHIC',
    cd_minutes: '{m}m {s}s',
    cd_seconds: '{s}s',
  },
} as const;

export type TKey = keyof typeof translations.ru;

export function t(lang: Lang, key: TKey, vars?: Record<string, string | number>): string {
  let str: string = (translations[lang] as Record<string, string>)[key] ?? (translations.ru as Record<string, string>)[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export function detectLang(yaLang?: string): Lang {
  const lang = yaLang ?? navigator.language ?? 'ru';
  return lang.startsWith('ru') ? 'ru' : 'en';
}
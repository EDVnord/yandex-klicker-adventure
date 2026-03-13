export interface Skin {
  id: string;
  name: string;
  tag: string;
  emoji: string;
  description: string;
  price: number;       // 0 = free, -1 = ad unlock
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  clickMultiplier: number; // coins per click multiplier
  img: string;
  borderColor: string;
  glowColor: string;
}

export const SKINS: Skin[] = [
  // ── COMMON ──────────────────────────────────────────────────────────────────
  {
    id: 'noob',
    name: 'Нуб',
    tag: 'Noob_1337',
    emoji: '😅',
    description: 'Классический нуб. С него всё начинается!',
    price: 0,
    rarity: 'common',
    clickMultiplier: 1,
    img: './skins/noob.jpg',
    borderColor: '#4a5568',
    glowColor: 'rgba(74,85,104,0.4)',
  },
  {
    id: 'alien',
    name: 'Пришелец',
    tag: 'UFO_Invader',
    emoji: '👽',
    description: 'Прилетел из другой галактики кликать! (за рекламу)',
    price: -1,
    rarity: 'rare',
    clickMultiplier: 2,
    img: './skins/alien.jpg',
    borderColor: '#00B06F',
    glowColor: 'rgba(0,176,111,0.4)',
  },

  // ── RARE ────────────────────────────────────────────────────────────────────
  {
    id: 'ninja',
    name: 'Ниндзя',
    tag: 'ShadowKiller_X',
    emoji: '🥷',
    description: 'Быстрый и бесшумный. Кликает как ветер!',
    price: 3_000,
    rarity: 'rare',
    clickMultiplier: 2,
    img: './skins/ninja.jpg',
    borderColor: '#E61919',
    glowColor: 'rgba(230,25,25,0.4)',
  },
  {
    id: 'cowboy',
    name: 'Ковбой',
    tag: 'WildWest_Click',
    emoji: '🤠',
    description: 'На Диком Западе кликают быстрее пуль!',
    price: 6_000,
    rarity: 'rare',
    clickMultiplier: 3,
    img: './skins/cowboy.jpg',
    borderColor: '#D97706',
    glowColor: 'rgba(217,119,6,0.4)',
  },
  {
    id: 'pirate',
    name: 'Пират',
    tag: 'Capt_Clickbeard',
    emoji: '🏴‍☠️',
    description: 'Йо-хо-хо! Монеты или жизнь!',
    price: 10_000,
    rarity: 'rare',
    clickMultiplier: 3,
    img: './skins/pirate.jpg',
    borderColor: '#1e3a5f',
    glowColor: 'rgba(30,58,95,0.5)',
  },

  // ── EPIC ────────────────────────────────────────────────────────────────────
  {
    id: 'vip',
    name: 'VIP Богач',
    tag: 'MoneyMaker_Pro',
    emoji: '👑',
    description: 'Золотая броня! Монеты сами летят в руки.',
    price: 20_000,
    rarity: 'epic',
    clickMultiplier: 4,
    img: './skins/vip.jpg',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.5)',
  },
  {
    id: 'cyborg',
    name: 'Киборг',
    tag: 'CyberClick_3000',
    emoji: '🤖',
    description: 'Полуробот-получеловек. Кликает со скоростью процессора!',
    price: 35_000,
    rarity: 'epic',
    clickMultiplier: 5,
    img: './skins/cyborg.jpg',
    borderColor: '#00B4D8',
    glowColor: 'rgba(0,180,216,0.45)',
  },
  {
    id: 'witch',
    name: 'Ведьма',
    tag: 'DarkSpell_Click',
    emoji: '🧙‍♀️',
    description: 'Заколдованные клики — каждый вдвойне злее!',
    price: 55_000,
    rarity: 'epic',
    clickMultiplier: 6,
    img: './skins/witch.jpg',
    borderColor: '#a855f7',
    glowColor: 'rgba(168,85,247,0.45)',
  },
  {
    id: 'samurai',
    name: 'Самурай',
    tag: 'BushidoClicker',
    emoji: '⚔️',
    description: 'Честь и монеты. Кликает с достоинством.',
    price: 80_000,
    rarity: 'epic',
    clickMultiplier: 8,
    img: './skins/samurai.jpg',
    borderColor: '#dc2626',
    glowColor: 'rgba(220,38,38,0.45)',
  },

  // ── LEGENDARY ───────────────────────────────────────────────────────────────
  {
    id: 'hero',
    name: 'Супергерой',
    tag: 'ClickHero_9000',
    emoji: '🦸',
    description: 'Спасает мир одним кликом! Легендарный!',
    price: 150_000,
    rarity: 'legendary',
    clickMultiplier: 12,
    img: './skins/hero.jpg',
    borderColor: '#1A6BFF',
    glowColor: 'rgba(26,107,255,0.5)',
  },
  {
    id: 'dragon',
    name: 'Дракон',
    tag: 'DragonClick_FIRE',
    emoji: '🐉',
    description: 'Огнедышащий мастер кликов. Сжигает конкурентов!',
    price: 250_000,
    rarity: 'legendary',
    clickMultiplier: 18,
    img: './skins/dragon.jpg',
    borderColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.55)',
  },

  // ── MYTHIC ───────────────────────────────────────────────────────────────────
  {
    id: 'god',
    name: 'Бог Кликов',
    tag: 'ClickGod_OMEGA',
    emoji: '⚡',
    description: 'Превзошёл смертных. Каждый клик — гром небесный!',
    price: 500_000,
    rarity: 'mythic',
    clickMultiplier: 30,
    img: './skins/god.jpg',
    borderColor: '#f0abfc',
    glowColor: 'rgba(240,171,252,0.6)',
  },
];

export const RARITY_LABEL: Record<string, string> = {
  common:    'ОБЫЧНЫЙ',
  rare:      'РЕДКИЙ',
  epic:      'ЭПИЧЕСКИЙ',
  legendary: 'ЛЕГЕНДАРНЫЙ',
  mythic:    'МИФИЧЕСКИЙ',
};

export const RARITY_COLOR: Record<string, string> = {
  common:    '#4a5768',
  rare:      '#1A6BFF',
  epic:      '#a855f7',
  legendary: '#FFD700',
  mythic:    '#f0abfc',
};
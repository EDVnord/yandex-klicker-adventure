export interface Skin {
  id: string;
  name: string;
  tag: string;
  emoji: string;
  description: string;
  price: number;       // 0 = free, -1 = ad unlock
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  img: string;
  borderColor: string;
  glowColor: string;
}

const CDN = 'https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files';

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
    img: `${CDN}/c098cb11-81b3-4ccb-b9b5-92c1ae9caf1f.jpg`,
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
    img: `${CDN}/061eabb6-897b-4a73-8c54-00c822ed9e14.jpg`,
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
    price: 20_000,
    rarity: 'rare',
    img: `${CDN}/afc07325-9767-484f-a606-d5896bdf9017.jpg`,
    borderColor: '#E61919',
    glowColor: 'rgba(230,25,25,0.4)',
  },
  {
    id: 'cowboy',
    name: 'Ковбой',
    tag: 'WildWest_Click',
    emoji: '🤠',
    description: 'На Диком Западе кликают быстрее пуль!',
    price: 36_000,
    rarity: 'rare',
    img: `${CDN}/0b2485af-83a3-4f20-b0c8-89e5e830957f.jpg`,
    borderColor: '#D97706',
    glowColor: 'rgba(217,119,6,0.4)',
  },
  {
    id: 'pirate',
    name: 'Пират',
    tag: 'Capt_Clickbeard',
    emoji: '🏴‍☠️',
    description: 'Йо-хо-хо! Монеты или жизнь!',
    price: 50_000,
    rarity: 'rare',
    img: `${CDN}/f6eb7b0e-130b-475e-98e3-e836f8065b86.jpg`,
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
    price: 100_000,
    rarity: 'epic',
    img: `${CDN}/0f06273c-f4fc-474e-824d-dd320a8064f4.jpg`,
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.5)',
  },
  {
    id: 'cyborg',
    name: 'Киборг',
    tag: 'CyberClick_3000',
    emoji: '🤖',
    description: 'Полуробот-получеловек. Кликает со скоростью процессора!',
    price: 150_000,
    rarity: 'epic',
    img: `${CDN}/45b66460-dc97-498a-aae1-0ff5321b1268.jpg`,
    borderColor: '#00B4D8',
    glowColor: 'rgba(0,180,216,0.45)',
  },
  {
    id: 'witch',
    name: 'Ведьма',
    tag: 'DarkSpell_Click',
    emoji: '🧙‍♀️',
    description: 'Заколдованные клики — каждый вдвойне злее!',
    price: 200_000,
    rarity: 'epic',
    img: `${CDN}/cfca79d1-de2a-4ce3-b1a1-0b6ac4a25ea6.jpg`,
    borderColor: '#a855f7',
    glowColor: 'rgba(168,85,247,0.45)',
  },
  {
    id: 'samurai',
    name: 'Самурай',
    tag: 'BushidoClicker',
    emoji: '⚔️',
    description: 'Честь и монеты. Кликает с достоинством.',
    price: 260_000,
    rarity: 'epic',
    img: `${CDN}/110d91ae-571a-427b-b197-9e478e2b0df1.jpg`,
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
    price: 400_000,
    rarity: 'legendary',
    img: `${CDN}/e4f8c281-4ff4-485e-9db9-3f15fc306039.jpg`,
    borderColor: '#1A6BFF',
    glowColor: 'rgba(26,107,255,0.5)',
  },
  {
    id: 'dragon',
    name: 'Дракон',
    tag: 'DragonClick_FIRE',
    emoji: '🐉',
    description: 'Огнедышащий мастер кликов. Сжигает конкурентов!',
    price: 600_000,
    rarity: 'legendary',
    img: `${CDN}/f5ff136e-bf00-4883-8543-27338b1e9807.jpg`,
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
    price: 1_000_000,
    rarity: 'mythic',
    img: `${CDN}/e8fa85bb-5f6d-46a3-8d2c-c6dae130d65e.jpg`,
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
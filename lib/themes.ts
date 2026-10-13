import { InviteType, ThemeId, ParticleType } from './types';
import { EVENTS, EVENT_ORDER } from './events';

export interface ThemeTokens {
  bg: string;
  cardBg: string;
  ink: string;
  accent: string;
  accent2: string;
  accent3?: string;
  fontDisplay: string;
  fontBody: string;
  label: string;
  style: string;
  defaultParticles: ParticleType;
}

export const themes: Record<ThemeId, ThemeTokens> = {
  botanical: {
    bg: '#F2EEE3',
    cardBg: '#F8F5EC',
    ink: '#2B2B26',
    accent: '#6B7C4F',
    accent2: '#B08D57',
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Ботанический сад',
    style: 'Природа',
    defaultParticles: 'none',
  },
  navy: {
    bg: '#0F1B30',
    cardBg: '#16233F',
    ink: '#EDE6D6',
    accent: '#C9A25D',
    accent2: '#8FA7C7',
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Ночная классика',
    style: 'Классика',
    defaultParticles: 'stars',
  },
  blush: {
    bg: '#FBF1EC',
    cardBg: '#FFFFFF',
    ink: '#3A2A2A',
    accent: '#C97B84',
    accent2: '#D9B48F',
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Романтика',
    style: 'Романтика',
    defaultParticles: 'hearts',
  },
  mono: {
    bg: '#FFFFFF',
    cardBg: '#F5F5F5',
    ink: '#111111',
    accent: '#111111',
    accent2: '#9A9A9A',
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Минимализм',
    style: 'Минимализм',
    defaultParticles: 'none',
  },
  confetti: {
    bg: '#FFF6E9',
    cardBg: '#FFFFFF',
    ink: '#2E2A26',
    accent: '#E8564F',
    accent2: '#2FA39A',
    accent3: '#F4B740',
    fontDisplay: "'Baloo 2', cursive",
    fontBody: "'Nunito Sans', sans-serif",
    label: 'Праздничное конфетти',
    style: 'Праздничный',
    defaultParticles: 'confetti',
  },
  space: {
    bg: '#150C2E',
    cardBg: '#1B1035',
    ink: '#F4F1FB',
    accent: '#FF8FA3',
    accent2: '#7C83FD',
    accent3: '#FFD86E',
    fontDisplay: "'Baloo 2', cursive",
    fontBody: "'Nunito Sans', sans-serif",
    label: 'Космический праздник',
    style: 'Космос',
    defaultParticles: 'stars',
  },
  retro: {
    bg: '#FFF1E0',
    cardBg: '#FFFFFF',
    ink: '#22201D',
    accent: '#FF5F5F',
    accent2: '#2C7A7B',
    accent3: '#FFC145',
    fontDisplay: "'Baloo 2', cursive",
    fontBody: "'Nunito Sans', sans-serif",
    label: 'Ретро праздник',
    style: 'Ретро',
    defaultParticles: 'confetti',
  },
  balloons: {
    bg: '#F4F3FF',
    cardBg: '#FFFFFF',
    ink: '#332B4A',
    accent: '#B8A6E3',
    accent2: '#FFB5C2',
    accent3: '#AEE3D8',
    fontDisplay: "'Baloo 2', cursive",
    fontBody: "'Nunito Sans', sans-serif",
    label: 'Пастельные шары',
    style: 'Пастель',
    defaultParticles: 'balloons',
  },
  gold: {
    bg: '#14110B',
    cardBg: '#1D1810',
    ink: '#F3E9CF',
    accent: '#D4AF37',
    accent2: '#A8842C',
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Золотой юбилей',
    style: 'Роскошь',
    defaultParticles: 'stars',
  },
  champagne: {
    bg: '#FBF3EA',
    cardBg: '#FFFFFF',
    ink: '#3B2E2A',
    accent: '#B9856B',
    accent2: '#E0C3A8',
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Шампань',
    style: 'Нежность',
    defaultParticles: 'bubbles',
  },
  samarkand: {
    bg: '#F3EBDD',
    cardBg: '#FBF7EE',
    ink: '#1F2A33',
    accent: '#1F7A8C',
    accent2: '#C8963E',
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Бирюза Самарканда',
    style: 'Восток',
    defaultParticles: 'none',
  },
  saffron: {
    bg: '#FFF4DF',
    cardBg: '#FFFFFF',
    ink: '#3A2415',
    accent: '#C46A1A',
    accent2: '#7A8B3C',
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Золото шафрана',
    style: 'Дастархан',
    defaultParticles: 'none',
  },
  emerald: {
    bg: '#0E2A24',
    cardBg: '#143630',
    ink: '#F1E8D0',
    accent: '#D6B25E',
    accent2: '#5FA58E',
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Изумруд',
    style: 'Торжественный',
    defaultParticles: 'none',
  },
  pearl: {
    bg: '#F6F4EF',
    cardBg: '#FFFFFF',
    ink: '#2D3A36',
    accent: '#6E8F83',
    accent2: '#C9B58A',
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Jost', sans-serif",
    label: 'Жемчуг',
    style: 'Светлый',
    defaultParticles: 'none',
  },
};

// Какие оформления относятся к какому виду события — берём из реестра событий
export const themesByType = Object.fromEntries(
  EVENT_ORDER.map((t) => [t, EVENTS[t].themes])
) as Record<InviteType, ThemeId[]>;

export const particleOptions: { id: ParticleType; label: string }[] = [
  { id: 'none', label: 'Без анимации' },
  { id: 'hearts', label: 'Сердца' },
  { id: 'stars', label: 'Звёзды' },
  { id: 'confetti', label: 'Конфетти' },
  { id: 'balloons', label: 'Воздушные шары' },
  { id: 'bubbles', label: 'Пузыри' },
];

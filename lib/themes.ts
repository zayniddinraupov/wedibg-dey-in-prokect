import { InviteType, ThemeId } from './types';

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
  },
};

export const themesByType: Record<InviteType, ThemeId[]> = {
  wedding: ['botanical', 'navy', 'blush', 'mono'],
  birthday: ['confetti', 'space', 'retro', 'balloons'],
};

export type InviteType = 'wedding' | 'birthday' | 'jubilee' | 'nahor' | 'fotiha';

export type ThemeId =
  | 'botanical'
  | 'navy'
  | 'blush'
  | 'mono'
  | 'confetti'
  | 'space'
  | 'retro'
  | 'balloons'
  | 'gold'
  | 'champagne'
  | 'samarkand'
  | 'saffron'
  | 'emerald'
  | 'pearl';

export type CoverStyle = 'envelope' | 'curtains' | 'seal' | 'simple' | 'none';

export interface ProgramItem {
  time: string;
  title: string;
  text?: string;
}

export type ParticleType = 'none' | 'hearts' | 'stars' | 'confetti' | 'balloons' | 'bubbles';

export interface GiftsBlock {
  enabled: boolean;
  text: string;
}

export interface DressCodeBlock {
  enabled: boolean;
  text: string;
  palette?: string[]; // цвета «в тон», до 6 штук, формат #rrggbb
}

export interface ProgramBlock {
  enabled: boolean;
  items: ProgramItem[];
}

export interface CoverConfig {
  style: CoverStyle;
  hint?: string;
}

export interface RsvpBlock {
  enabled: boolean;
  whatsapp?: string;
  email?: string;
}

export interface BackgroundMedia {
  kind: 'image' | 'video';
  url: string;
  dim: number; // 0-90: насколько фон «приглушён» цветом темы, чтобы текст читался
}

export interface InviteConfig {
  slug?: string; // нужен, чтобы ответы гостей сохранялись в базе
  type: InviteType;
  theme: ThemeId;
  particles?: ParticleType;

  name1: string;
  name2?: string;
  intro?: string;

  eventDate?: string; // формат 'YYYY-MM-DD'
  eventTime?: string; // формат 'HH:MM'

  venueName?: string;
  venueAddress?: string;
  venuePhoto?: string;
  coverPhoto?: string;
  background?: BackgroundMedia; // фото или видео на заднем плане всей страницы
  musicSrc?: string;

  gifts?: GiftsBlock;
  dressCode?: DressCodeBlock;
  program?: ProgramBlock;
  cover?: CoverConfig;
  rsvp?: RsvpBlock;
  calendarEnabled?: boolean;
  publishedUrl?: string;
}

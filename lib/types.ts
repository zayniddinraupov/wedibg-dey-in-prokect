export type InviteType = 'wedding' | 'birthday';

export type ThemeId =
  | 'botanical'
  | 'navy'
  | 'blush'
  | 'mono'
  | 'confetti'
  | 'space'
  | 'retro'
  | 'balloons';

export interface GiftsBlock {
  enabled: boolean;
  text: string;
}

export interface DressCodeBlock {
  enabled: boolean;
  text: string;
}

export interface RsvpBlock {
  enabled: boolean;
  whatsapp?: string;
  email?: string;
}

export interface InviteConfig {
  type: InviteType;
  theme: ThemeId;

  name1: string;
  name2?: string;
  intro?: string;

  eventDate?: string; // формат 'YYYY-MM-DD'
  eventTime?: string; // формат 'HH:MM'

  venueName?: string;
  venueAddress?: string;
  venuePhoto?: string; // путь в /public, напр. '/venue.jpg'
  coverPhoto?: string; // путь в /public, напр. '/cover.jpg'
  musicSrc?: string; // путь в /public, напр. '/music.mp3'

  gifts?: GiftsBlock;
  dressCode?: DressCodeBlock;
  rsvp?: RsvpBlock;
  calendarEnabled?: boolean;
  publishedUrl?: string;
}

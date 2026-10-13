import { CoverStyle, InviteConfig, InviteType, ParticleType, ProgramItem, ThemeId } from './types';
import { themes, themesByType } from './themes';
import { EVENTS, isInviteType } from './events';
import { parsePaletteCsv, parseProgramJson } from './mapRowToConfig';
import type { InviteRow } from './mapRowToConfig';

export interface FormState {
  type: InviteType;
  theme: ThemeId;
  particles: ParticleType;
  name1: string;
  name2: string;
  intro: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venuePhotoUrl: string;
  coverPhotoUrl: string;
  musicUrl: string;
  bgKind: 'none' | 'image' | 'video';
  bgUrl: string;
  bgDim: number;
  coverStyle: CoverStyle;
  coverHint: string;
  programEnabled: boolean;
  program: ProgramItem[];
  dressPalette: string[];
  giftsEnabled: boolean;
  giftsText: string;
  dressEnabled: boolean;
  dressText: string;
  rsvpEnabled: boolean;
  rsvpWhatsapp: string;
  rsvpEmail: string;
  calendarEnabled: boolean;
}

export function buildInitialState(initialType?: InviteType, initialTheme?: ThemeId): FormState {
  const type = initialType || 'wedding';
  const theme = initialTheme || themesByType[type][0];
  return {
    type,
    theme,
    particles: themes[theme].defaultParticles,
    name1: '',
    name2: '',
    intro: EVENTS[type].defaultIntro,
    eventDate: '',
    eventTime: EVENTS[type].defaultTime,
    venueName: '',
    venueAddress: '',
    venuePhotoUrl: '',
    coverPhotoUrl: '',
    musicUrl: '',
    bgKind: 'none',
    bgUrl: '',
    bgDim: 55,
    coverStyle: 'envelope',
    coverHint: '',
    programEnabled: false,
    program: [],
    dressPalette: [],
    giftsEnabled: false,
    giftsText: '',
    dressEnabled: false,
    dressText: '',
    rsvpEnabled: true,
    rsvpWhatsapp: '',
    rsvpEmail: '',
    calendarEnabled: true,
  };
}

/** Данные формы -> конфиг для показа (используется для предпросмотра). */
export function formToConfig(f: FormState): InviteConfig {
  return {
    type: f.type,
    theme: f.theme,
    particles: f.particles,
    name1: f.name1 || 'Имя',
    name2: f.name2 || undefined,
    intro: f.intro || undefined,
    eventDate: f.eventDate || undefined,
    eventTime: f.eventTime || undefined,
    venueName: f.venueName || undefined,
    venueAddress: f.venueAddress || undefined,
    venuePhoto: f.venuePhotoUrl || undefined,
    coverPhoto: f.coverPhotoUrl || undefined,
    musicSrc: f.musicUrl || undefined,
    background:
      f.bgKind !== 'none' && f.bgUrl ? { kind: f.bgKind, url: f.bgUrl, dim: f.bgDim } : undefined,
    gifts: { enabled: f.giftsEnabled, text: f.giftsText },
    dressCode: { enabled: f.dressEnabled, text: f.dressText, palette: f.dressPalette },
    program: { enabled: f.programEnabled, items: f.program.filter((i) => i.title.trim()) },
    cover: { style: f.coverStyle, hint: f.coverHint || undefined },
    rsvp: {
      enabled: f.rsvpEnabled,
      whatsapp: f.rsvpWhatsapp || undefined,
      email: f.rsvpEmail || undefined,
    },
    calendarEnabled: f.calendarEnabled,
  };
}

/** Строка из базы -> данные формы (для режима редактирования). */
export function rowToForm(row: InviteRow): FormState {
  const type: InviteType = isInviteType(row.type) ? row.type : 'wedding';
  const theme = (row.theme as ThemeId) in themes ? (row.theme as ThemeId) : themesByType[type][0];
  return {
    type,
    theme,
    particles: (row.particles as ParticleType) || 'none',
    name1: row.name1,
    name2: row.name2 || '',
    intro: row.intro || '',
    eventDate: row.event_date || '',
    eventTime: row.event_time || '',
    venueName: row.venue_name || '',
    venueAddress: row.venue_address || '',
    venuePhotoUrl: row.venue_photo_url || '',
    coverPhotoUrl: row.cover_photo_url || '',
    musicUrl: row.music_url || '',
    bgKind: row.bg_url && (row.bg_kind === 'image' || row.bg_kind === 'video') ? row.bg_kind : 'none',
    bgUrl: row.bg_url || '',
    bgDim: row.bg_dim ?? 55,
    coverStyle: (['envelope', 'curtains', 'seal', 'simple', 'none'] as CoverStyle[]).includes(
      row.cover_style as CoverStyle
    )
      ? (row.cover_style as CoverStyle)
      : 'simple',
    coverHint: row.cover_hint || '',
    programEnabled: Boolean(row.program_enabled),
    program: parseProgramJson(row.program),
    dressPalette: parsePaletteCsv(row.dress_palette),
    giftsEnabled: Boolean(row.gifts_enabled),
    giftsText: row.gifts_text || '',
    dressEnabled: Boolean(row.dress_enabled),
    dressText: row.dress_text || '',
    rsvpEnabled: Boolean(row.rsvp_enabled),
    rsvpWhatsapp: row.rsvp_whatsapp || '',
    rsvpEmail: row.rsvp_email || '',
    calendarEnabled: Boolean(row.calendar_enabled),
  };
}

import { InviteConfig, InviteType, ThemeId, ParticleType, CoverStyle, ProgramItem } from './types';
import { isInviteType } from './events';

export interface InviteRow {
  slug: string;
  edit_token?: string | null;
  hidden?: boolean | null;
  type: string;
  theme: string;
  particles: string | null;
  name1: string;
  name2: string | null;
  intro: string | null;
  event_date: string | null;
  event_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_photo_url: string | null;
  cover_photo_url: string | null;
  music_url: string | null;
  bg_kind?: string | null;
  bg_url?: string | null;
  bg_dim?: number | null;
  cover_style?: string | null;
  cover_hint?: string | null;
  program_enabled?: boolean | null;
  program?: string | null;
  dress_palette?: string | null;
  gifts_enabled: boolean;
  gifts_text: string | null;
  dress_enabled: boolean;
  dress_text: string | null;
  rsvp_enabled: boolean;
  rsvp_whatsapp: string | null;
  rsvp_email: string | null;
  calendar_enabled: boolean;
}

export function parseProgramJson(raw: string | null | undefined): ProgramItem[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as ProgramItem[]) : [];
  } catch {
    return [];
  }
}

export function parsePaletteCsv(raw: string | null | undefined): string[] {
  return raw ? raw.split(',').filter((c) => /^#[0-9a-f]{6}$/i.test(c)) : [];
}

const COVERS: CoverStyle[] = ['envelope', 'curtains', 'seal', 'simple', 'none'];

export function mapRowToConfig(row: InviteRow): InviteConfig {
  return {
    slug: row.slug,
    type: isInviteType(row.type) ? (row.type as InviteType) : 'wedding',
    theme: (row.theme as ThemeId) || 'botanical',
    particles: (row.particles as ParticleType) || 'none',
    name1: row.name1,
    name2: row.name2 || undefined,
    intro: row.intro || undefined,
    eventDate: row.event_date || undefined,
    eventTime: row.event_time || undefined,
    venueName: row.venue_name || undefined,
    venueAddress: row.venue_address || undefined,
    venuePhoto: row.venue_photo_url || undefined,
    coverPhoto: row.cover_photo_url || undefined,
    musicSrc: row.music_url || undefined,
    background:
      row.bg_url && (row.bg_kind === 'image' || row.bg_kind === 'video')
        ? { kind: row.bg_kind, url: row.bg_url, dim: row.bg_dim ?? 55 }
        : undefined,
    gifts: { enabled: Boolean(row.gifts_enabled), text: row.gifts_text || '' },
    dressCode: {
      enabled: Boolean(row.dress_enabled),
      text: row.dress_text || '',
      palette: parsePaletteCsv(row.dress_palette),
    },
    program: { enabled: Boolean(row.program_enabled), items: parseProgramJson(row.program) },
    cover: {
      style: COVERS.includes(row.cover_style as CoverStyle) ? (row.cover_style as CoverStyle) : 'simple',
      hint: row.cover_hint || undefined,
    },
    rsvp: {
      enabled: Boolean(row.rsvp_enabled),
      whatsapp: row.rsvp_whatsapp || undefined,
      email: row.rsvp_email || undefined,
    },
    calendarEnabled: Boolean(row.calendar_enabled),
  };
}

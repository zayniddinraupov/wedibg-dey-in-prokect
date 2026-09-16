import { InviteConfig, InviteType, ThemeId } from './types';

export interface InviteRow {
  slug: string;
  type: string;
  theme: string;
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
  gifts_enabled: boolean;
  gifts_text: string | null;
  dress_enabled: boolean;
  dress_text: string | null;
  rsvp_enabled: boolean;
  rsvp_whatsapp: string | null;
  rsvp_email: string | null;
  calendar_enabled: boolean;
}

export function mapRowToConfig(row: InviteRow): InviteConfig {
  return {
    type: (row.type as InviteType) || 'wedding',
    theme: (row.theme as ThemeId) || 'botanical',
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
    gifts: { enabled: Boolean(row.gifts_enabled), text: row.gifts_text || '' },
    dressCode: { enabled: Boolean(row.dress_enabled), text: row.dress_text || '' },
    rsvp: {
      enabled: Boolean(row.rsvp_enabled),
      whatsapp: row.rsvp_whatsapp || undefined,
      email: row.rsvp_email || undefined,
    },
    calendarEnabled: Boolean(row.calendar_enabled),
  };
}

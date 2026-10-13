import { themesByType } from './themes';
import { EVENTS, isInviteType } from './events';
import { CoverStyle, InviteType, ProgramItem } from './types';

const THEME_IDS: string[] = Object.values(themesByType).flat();
const PARTICLE_IDS = ['none', 'hearts', 'stars', 'confetti', 'balloons', 'bubbles'];
const COVER_STYLES: CoverStyle[] = ['envelope', 'curtains', 'seal', 'simple', 'none'];
const MAX_PROGRAM_ITEMS = 12;
const MAX_PALETTE = 6;

export interface InviteInput {
  type: InviteType;
  theme: string;
  particles: string;
  name1: string;
  name2: string | null;
  intro: string | null;
  eventDate: string | null;
  eventTime: string | null;
  venueName: string | null;
  venueAddress: string | null;
  venuePhotoUrl: string | null;
  coverPhotoUrl: string | null;
  musicUrl: string | null;
  bgKind: 'none' | 'image' | 'video';
  bgUrl: string | null;
  bgDim: number;
  coverStyle: CoverStyle;
  coverHint: string | null;
  programEnabled: boolean;
  program: ProgramItem[];
  dressPalette: string[];
  giftsEnabled: boolean;
  giftsText: string | null;
  dressEnabled: boolean;
  dressText: string | null;
  rsvpEnabled: boolean;
  rsvpWhatsapp: string | null;
  rsvpEmail: string | null;
  calendarEnabled: boolean;
}

export type ParseResult = { ok: true; data: InviteInput } | { ok: false; error: string };

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

// Многострочный текст: убираем управляющие символы, но оставляем переводы строк
function orNull(v: unknown, max: number): string | null {
  const s = str(v, max).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return s ? s : null;
}

// Однострочное поле: переводов строк и управляющих символов быть не должно
function line(v: unknown, max: number): string | null {
  const s = str(v, max).replace(/[\u0000-\u001F\u007F]+/g, ' ').trim();
  return s ? s : null;
}

function emailOrNull(v: unknown): string | null {
  const s = str(v, 120);
  return /^[^\s@<>"'?&=,;]+@[^\s@<>"'?&=,;]+\.[^\s@<>"'?&=,;]+$/.test(s) ? s : null;
}

function phoneOrNull(v: unknown): string | null {
  const digits = str(v, 30).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 ? digits : null;
}

// Принимаем только https-ссылки без кавычек и скобок — их мы подставляем в src и в CSS url().
function safeUrl(v: unknown): string | null {
  const s = str(v, 500);
  return /^https:\/\/[^\s'"()<>\\]+$/.test(s) ? s : null;
}

function parseProgram(v: unknown): ProgramItem[] {
  if (!Array.isArray(v)) return [];
  const out: ProgramItem[] = [];
  for (const raw of v.slice(0, MAX_PROGRAM_ITEMS)) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const title = line(r.title, 80);
    if (!title) continue;
    const item: ProgramItem = { time: line(r.time, 12) || '', title };
    const text = line(r.text, 200);
    if (text) item.text = text;
    out.push(item);
  }
  return out;
}

function parsePalette(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const c of v) {
    if (typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c) && out.length < MAX_PALETTE) {
      out.push(c.toLowerCase());
    }
  }
  return out;
}

// Настоящая календарная дата, а не просто строка похожего вида (отсекает 2026-13-99)
function isRealDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function parseInviteBody(body: unknown): ParseResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Некорректные данные' };
  }
  const b = body as Record<string, unknown>;

  const name1 = line(b.name1, 80) || '';
  if (!name1) {
    return { ok: false, error: 'Укажите имя' };
  }

  const bgKindRaw = b.bgKind === 'image' || b.bgKind === 'video' ? b.bgKind : 'none';
  const bgUrl = bgKindRaw === 'none' ? null : safeUrl(b.bgUrl);
  const dimRaw = Math.round(Number(b.bgDim));
  const bgDim = Number.isFinite(dimRaw) ? Math.min(90, Math.max(0, dimRaw)) : 55;

  const type: InviteType = isInviteType(b.type) ? b.type : 'wedding';
  const themeRaw = String(b.theme);
  // Оформление должно подходить виду события, иначе берём первое из подходящих
  const theme = EVENTS[type].themes.includes(themeRaw as never) ? themeRaw : EVENTS[type].themes[0];
  const coverStyle = COVER_STYLES.includes(b.coverStyle as CoverStyle)
    ? (b.coverStyle as CoverStyle)
    : 'envelope';
  const program = parseProgram(b.program);

  const eventDate = str(b.eventDate, 10);
  const eventTime = str(b.eventTime, 5);

  return {
    ok: true,
    data: {
      type,
      theme: THEME_IDS.includes(theme) ? theme : EVENTS[type].themes[0],
      particles: PARTICLE_IDS.includes(String(b.particles)) ? String(b.particles) : 'none',
      name1,
      name2: line(b.name2, 80),
      intro: orNull(b.intro, 1000),
      eventDate: isRealDate(eventDate) ? eventDate : null,
      eventTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(eventTime) ? eventTime : null,
      venueName: line(b.venueName, 120),
      venueAddress: line(b.venueAddress, 200),
      venuePhotoUrl: safeUrl(b.venuePhotoUrl),
      coverPhotoUrl: safeUrl(b.coverPhotoUrl),
      musicUrl: safeUrl(b.musicUrl),
      bgKind: bgUrl ? bgKindRaw : 'none',
      bgUrl,
      bgDim,
      coverStyle,
      coverHint: line(b.coverHint, 80),
      programEnabled: Boolean(b.programEnabled) && program.length > 0,
      program,
      dressPalette: parsePalette(b.dressPalette),
      giftsEnabled: Boolean(b.giftsEnabled),
      giftsText: orNull(b.giftsText, 1000),
      dressEnabled: Boolean(b.dressEnabled),
      dressText: orNull(b.dressText, 1000),
      rsvpEnabled: b.rsvpEnabled !== false,
      rsvpWhatsapp: phoneOrNull(b.rsvpWhatsapp),
      rsvpEmail: emailOrNull(b.rsvpEmail),
      calendarEnabled: b.calendarEnabled !== false,
    },
  };
}

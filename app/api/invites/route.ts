import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { slugify, randomSuffix } from '@/lib/slug';
import { parseInviteBody } from '@/lib/validate';
import { rateLimit } from '@/lib/rateLimit';
import { hasValidSession } from '@/lib/session';

const MAX_INVITES_PER_DAY = Number(process.env.MAX_INVITES_PER_DAY) || 2000;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. не больше 10 приглашений в час и 30 в сутки с одного адреса
  const blocked = await rateLimit(req, 'create', [
    { limit: 10, windowSec: 3600 },
    { limit: 30, windowSec: 86400 },
  ]);
  if (blocked) return blocked;

  // 2. нужна пройденная проверка «я не робот» (если она включена)
  if (!hasValidSession(req)) {
    return NextResponse.json(
      { error: 'Подтвердите, что вы не робот', code: 'captcha' },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = parseInviteBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const d = parsed.data;

  // 3. общий предохранитель: если за сутки создано подозрительно много приглашений — стоп
  try {
    const { rows } = await sql<{ n: number }>`
      SELECT COUNT(*)::int AS n FROM invites WHERE created_at > NOW() - INTERVAL '1 day'
    `;
    if (rows[0].n >= MAX_INVITES_PER_DAY) {
      return NextResponse.json(
        { error: 'Сервис сейчас перегружен. Попробуйте позже.' },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error(err);
  }

  const base = slugify(d.name1 + (d.name2 ? '-' + d.name2 : '')) || 'invite';
  // Секретный токен: по нему организатор видит ответы гостей и правит приглашение
  const editToken = randomBytes(16).toString('hex');

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = `${base}-${randomSuffix(5)}`;
    try {
      await sql`
        INSERT INTO invites (
          slug, edit_token, type, theme, particles, name1, name2, intro,
          event_date, event_time,
          venue_name, venue_address, venue_photo_url, cover_photo_url, music_url,
          bg_kind, bg_url, bg_dim,
          cover_style, cover_hint, program_enabled, program, dress_palette,
          gifts_enabled, gifts_text, dress_enabled, dress_text,
          rsvp_enabled, rsvp_whatsapp, rsvp_email, calendar_enabled
        ) VALUES (
          ${slug}, ${editToken}, ${d.type}, ${d.theme}, ${d.particles}, ${d.name1}, ${d.name2}, ${d.intro},
          ${d.eventDate}, ${d.eventTime},
          ${d.venueName}, ${d.venueAddress}, ${d.venuePhotoUrl}, ${d.coverPhotoUrl}, ${d.musicUrl},
          ${d.bgKind}, ${d.bgUrl}, ${d.bgDim},
          ${d.coverStyle}, ${d.coverHint}, ${d.programEnabled}, ${JSON.stringify(d.program)}, ${d.dressPalette.join(',') || null},
          ${d.giftsEnabled}, ${d.giftsText}, ${d.dressEnabled}, ${d.dressText},
          ${d.rsvpEnabled}, ${d.rsvpWhatsapp}, ${d.rsvpEmail}, ${d.calendarEnabled}
        )
      `;
      return NextResponse.json({ slug, editToken });
    } catch (err) {
      // 23505 — такой slug уже есть, пробуем другой суффикс
      if ((err as { code?: string }).code === '23505') continue;
      console.error(err);
      break;
    }
  }
  return NextResponse.json({ error: 'Не удалось сохранить приглашение' }, { status: 500 });
}

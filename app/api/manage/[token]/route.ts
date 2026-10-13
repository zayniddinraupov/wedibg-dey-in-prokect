import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { parseInviteBody } from '@/lib/validate';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const TOKEN_RE = /^[a-f0-9]{32}$/;

// Изменить приглашение по секретному токену
export async function PUT(req: NextRequest, { params }: { params: { token: string } }) {
  const blocked = await rateLimit(req, 'manage', [{ limit: 60, windowSec: 3600 }]);
  if (blocked) return blocked;
  if (!TOKEN_RE.test(params.token)) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const parsed = parseInviteBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const res = await sql`
      UPDATE invites SET
        type = ${d.type}, theme = ${d.theme}, particles = ${d.particles},
        name1 = ${d.name1}, name2 = ${d.name2}, intro = ${d.intro},
        event_date = ${d.eventDate}, event_time = ${d.eventTime},
        venue_name = ${d.venueName}, venue_address = ${d.venueAddress},
        venue_photo_url = ${d.venuePhotoUrl}, cover_photo_url = ${d.coverPhotoUrl},
        music_url = ${d.musicUrl},
        bg_kind = ${d.bgKind}, bg_url = ${d.bgUrl}, bg_dim = ${d.bgDim},
        cover_style = ${d.coverStyle}, cover_hint = ${d.coverHint},
        program_enabled = ${d.programEnabled}, program = ${JSON.stringify(d.program)},
        dress_palette = ${d.dressPalette.join(',') || null},
        gifts_enabled = ${d.giftsEnabled}, gifts_text = ${d.giftsText},
        dress_enabled = ${d.dressEnabled}, dress_text = ${d.dressText},
        rsvp_enabled = ${d.rsvpEnabled}, rsvp_whatsapp = ${d.rsvpWhatsapp},
        rsvp_email = ${d.rsvpEmail}, calendar_enabled = ${d.calendarEnabled}
      WHERE edit_token = ${params.token}
      RETURNING slug
    `;
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
    }
    return NextResponse.json({ slug: res.rows[0].slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Не удалось сохранить изменения' }, { status: 500 });
  }
}

// Удалить приглашение вместе со всеми ответами гостей
export async function DELETE(req: NextRequest, { params }: { params: { token: string } }) {
  const blocked = await rateLimit(req, 'manage', [{ limit: 60, windowSec: 3600 }]);
  if (blocked) return blocked;
  if (!TOKEN_RE.test(params.token)) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }
  try {
    const res = await sql`DELETE FROM invites WHERE edit_token = ${params.token} RETURNING slug`;
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Не удалось удалить' }, { status: 500 });
  }
}

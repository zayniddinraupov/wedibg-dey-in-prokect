import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { slugify, randomSuffix } from '@/lib/slug';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name1 = String(body.name1 || '').trim();
    if (!name1) {
      return NextResponse.json({ error: 'Укажите имя' }, { status: 400 });
    }

    const baseSlugSource = name1 + (body.name2 ? '-' + body.name2 : '');
    const base = slugify(baseSlugSource) || 'invite';
    const slug = `${base}-${randomSuffix(5)}`;

    await sql`
      INSERT INTO invites (
        slug, type, theme, name1, name2, intro,
        event_date, event_time,
        venue_name, venue_address, venue_photo_url, cover_photo_url, music_url,
        gifts_enabled, gifts_text, dress_enabled, dress_text,
        rsvp_enabled, rsvp_whatsapp, rsvp_email, calendar_enabled
      ) VALUES (
        ${slug},
        ${body.type || 'wedding'},
        ${body.theme || 'botanical'},
        ${name1},
        ${body.name2 || null},
        ${body.intro || null},
        ${body.eventDate || null},
        ${body.eventTime || null},
        ${body.venueName || null},
        ${body.venueAddress || null},
        ${body.venuePhotoUrl || null},
        ${body.coverPhotoUrl || null},
        ${body.musicUrl || null},
        ${Boolean(body.giftsEnabled)},
        ${body.giftsText || null},
        ${Boolean(body.dressEnabled)},
        ${body.dressText || null},
        ${body.rsvpEnabled !== false},
        ${body.rsvpWhatsapp || null},
        ${body.rsvpEmail || null},
        ${body.calendarEnabled !== false}
      )
    `;

    return NextResponse.json({ slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Не удалось сохранить приглашение' }, { status: 500 });
  }
}

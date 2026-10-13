import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const STATUSES = ['Приду', 'Приду с гостем', 'Не смогу прийти'];
const MAX_RESPONSES_PER_INVITE = 500;

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  // На одной Wi-Fi сети ресторана могут сидеть десятки гостей, поэтому лимиты щедрые
  const blocked =
    (await rateLimit(req, 'rsvp', [{ limit: 120, windowSec: 3600 }])) ||
    (await rateLimit(req, 'rsvp-invite', [{ limit: 40, windowSec: 3600 }], params.slug));
  if (blocked) return blocked;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const status = typeof body.status === 'string' ? body.status : '';
  const guests = Math.round(Number(body.guests));
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 500) : '';

  if (!name || !STATUSES.includes(status) || !(guests >= 1 && guests <= 20)) {
    return NextResponse.json({ error: 'Проверьте заполнение формы' }, { status: 400 });
  }

  try {
    const exists = await sql`SELECT 1 FROM invites WHERE slug = ${params.slug} AND hidden = FALSE LIMIT 1`;
    if (exists.rows.length === 0) {
      return NextResponse.json({ error: 'Приглашение не найдено' }, { status: 404 });
    }

    // Защита от засорения базы
    const count = await sql<{ n: number }>`
      SELECT COUNT(*)::int AS n FROM rsvp_responses WHERE slug = ${params.slug}
    `;
    if (count.rows[0].n >= MAX_RESPONSES_PER_INVITE) {
      return NextResponse.json({ error: 'Достигнут лимит ответов' }, { status: 429 });
    }

    await sql`
      INSERT INTO rsvp_responses (slug, name, status, guests, comment)
      VALUES (${params.slug}, ${name}, ${status}, ${guests}, ${comment || null})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Не удалось сохранить ответ' }, { status: 500 });
  }
}

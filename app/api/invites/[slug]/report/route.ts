import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { rateLimit, clientKey } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const REASONS = [
  'Оскорбительное содержимое',
  'Мошенничество или обман',
  'Нарушение авторских прав',
  'Другое',
];
// Сколько разных людей должно пожаловаться, чтобы приглашение скрылось автоматически
const REPORTS_TO_HIDE = 5;

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const blocked = await rateLimit(req, 'report', [{ limit: 10, windowSec: 3600 }]);
  if (blocked) return blocked;

  const body = (await req.json().catch(() => null)) as { reason?: unknown } | null;
  const reason = typeof body?.reason === 'string' && REASONS.includes(body.reason) ? body.reason : '';
  if (!reason) {
    return NextResponse.json({ error: 'Выберите причину' }, { status: 400 });
  }

  try {
    const reporter = clientKey(req);
    const exists = await sql`SELECT 1 FROM invites WHERE slug = ${params.slug} LIMIT 1`;
    if (exists.rows.length === 0) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
    }

    // Один человек (адрес) может пожаловаться на приглашение только один раз
    await sql`
      INSERT INTO reports (slug, reporter, reason)
      VALUES (${params.slug}, ${reporter}, ${reason})
      ON CONFLICT (slug, reporter) DO NOTHING
    `;

    const { rows } = await sql<{ n: number }>`
      SELECT COUNT(DISTINCT reporter)::int AS n FROM reports WHERE slug = ${params.slug}
    `;
    if (rows[0].n >= REPORTS_TO_HIDE) {
      await sql`UPDATE invites SET hidden = TRUE WHERE slug = ${params.slug}`;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Не удалось отправить жалобу' }, { status: 500 });
  }
}

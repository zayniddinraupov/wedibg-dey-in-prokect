import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { list, del } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GRACE_MS = 24 * 60 * 60 * 1000; // свежие файлы не трогаем: человек мог ещё заполнять форму
const MAX_DELETE_PER_RUN = 1000;

// Запускается Vercel раз в сутки (см. vercel.json). Нужна переменная CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  // 1. Чистим старый журнал ограничений
  await sql`DELETE FROM rate_events WHERE created_at < NOW() - INTERVAL '2 days'`;

  // 2. Удаляем файлы, на которые не ссылается ни одно приглашение
  //    (брошенные загрузки, фото от удалённых или изменённых приглашений)
  const { rows } = await sql<{ u: string | null }>`
    SELECT venue_photo_url AS u FROM invites
    UNION SELECT cover_photo_url FROM invites
    UNION SELECT music_url FROM invites
    UNION SELECT bg_url FROM invites
  `;
  const used = new Set(rows.map((r) => r.u).filter((u): u is string => Boolean(u)));

  const now = Date.now();
  const toDelete: string[] = [];
  let cursor: string | undefined;
  let pages = 0;
  do {
    const page = await list({ prefix: 'invites/', cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const old = now - new Date(blob.uploadedAt).getTime() > GRACE_MS;
      if (old && !used.has(blob.url)) toDelete.push(blob.url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
    pages++;
  } while (cursor && pages < 20 && toDelete.length < MAX_DELETE_PER_RUN);

  const batch = toDelete.slice(0, MAX_DELETE_PER_RUN);
  for (let i = 0; i < batch.length; i += 100) {
    await del(batch.slice(i, i + 100));
  }

  return NextResponse.json({ deletedFiles: batch.length });
}

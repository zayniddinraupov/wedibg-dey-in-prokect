import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

// Доступ закрыт паролем в middleware.ts

// Скрыть или вернуть приглашение
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const body = (await req.json().catch(() => null)) as { hidden?: unknown } | null;
  if (typeof body?.hidden !== 'boolean') {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }
  const res = await sql`UPDATE invites SET hidden = ${body.hidden} WHERE slug = ${params.slug} RETURNING slug`;
  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

// Удалить приглашение (ответы гостей и жалобы удаляются вместе с ним)
export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const res = await sql`DELETE FROM invites WHERE slug = ${params.slug} RETURNING slug`;
  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

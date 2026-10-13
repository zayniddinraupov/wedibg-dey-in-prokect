import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

// Доступ закрыт паролем в middleware.ts

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = (await req.json().catch(() => null)) as { status?: unknown } | null;
  if (!Number.isInteger(id) || (body?.status !== 'new' && body?.status !== 'done')) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }
  const res = await sql`UPDATE support_tickets SET status = ${body.status} WHERE id = ${id} RETURNING id`;
  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }
  await sql`DELETE FROM support_tickets WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

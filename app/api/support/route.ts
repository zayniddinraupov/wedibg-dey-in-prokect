import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { rateLimit } from '@/lib/rateLimit';
import { hasValidSession } from '@/lib/session';
import { SUPPORT_TOPICS } from '@/lib/support';
import { notifyTelegram } from '@/lib/notify';

export const dynamic = 'force-dynamic';

function oneLine(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]+/g, ' ').trim().slice(0, max) : '';
}

export async function POST(req: NextRequest) {
  const blocked = await rateLimit(req, 'support', [
    { limit: 5, windowSec: 3600 },
    { limit: 15, windowSec: 86400 },
  ]);
  if (blocked) return blocked;

  if (!hasValidSession(req)) {
    return NextResponse.json(
      { error: 'Подтвердите, что вы не робот', code: 'captcha' },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  const name = oneLine(body.name, 80);
  const contact = oneLine(body.contact, 120);
  const topic = typeof body.topic === 'string' && SUPPORT_TOPICS.includes(body.topic) ? body.topic : 'Другое';
  const inviteLink = oneLine(body.inviteLink, 300) || null;
  const message =
    typeof body.message === 'string'
      ? body.message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 2000)
      : '';

  if (!name || !contact || message.length < 10) {
    return NextResponse.json(
      { error: 'Укажите имя, как с вами связаться, и опишите проблему (хотя бы пару предложений)' },
      { status: 400 }
    );
  }

  try {
    await sql`
      INSERT INTO support_tickets (name, contact, topic, message, invite_link)
      VALUES (${name}, ${contact}, ${topic}, ${message}, ${inviteLink})
    `;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Не удалось отправить обращение' }, { status: 500 });
  }

  await notifyTelegram(
    `🆘 Новое обращение в поддержку\nТема: ${topic}\nОт: ${name}\nКонтакт: ${contact}${
      inviteLink ? `\nСсылка: ${inviteLink}` : ''
    }\n\n${message}`
  );

  return NextResponse.json({ ok: true });
}

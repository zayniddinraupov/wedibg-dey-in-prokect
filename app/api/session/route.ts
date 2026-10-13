import { NextResponse } from 'next/server';
import { rateLimit, getIp } from '@/lib/rateLimit';
import { captchaRequired, makeSession, COOKIE_NAME, SESSION_TTL_SEC } from '@/lib/session';
import { verifyTurnstile } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const blocked = await rateLimit(req, 'session', [{ limit: 30, windowSec: 3600 }]);
  if (blocked) return blocked;

  if (!captchaRequired()) {
    return NextResponse.json({ ok: true });
  }

  const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === 'string' ? body.token : '';
  if (!token || !(await verifyTurnstile(token, getIp(req)))) {
    return NextResponse.json({ error: 'Проверка не пройдена' }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, makeSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  });
  return res;
}

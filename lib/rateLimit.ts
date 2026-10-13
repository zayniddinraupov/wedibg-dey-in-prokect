import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export interface RateRule {
  limit: number; // сколько действий разрешено
  windowSec: number; // за какой период, в секундах
}

/** IP посетителя. На Vercel заголовки x-real-ip / x-forwarded-for выставляет сама платформа. */
export function getIp(req: Request): string {
  const h = req.headers;
  return h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

/** Сам IP не храним: только его хэш с секретной «солью». */
export function clientKey(req: Request): string {
  const salt = process.env.RATE_LIMIT_SALT || process.env.POSTGRES_URL || 'dev-salt';
  return createHash('sha256').update(`${salt}|${getIp(req)}`).digest('hex').slice(0, 32);
}

/**
 * Ограничение частоты действий с одного адреса. Счётчики лежат в базе (таблица rate_events),
 * поэтому работают корректно, даже когда Vercel запускает много копий сервера одновременно.
 * Возвращает готовый ответ 429, если лимит превышен, иначе null.
 */
export async function rateLimit(
  req: Request,
  action: string,
  rules: RateRule[],
  scope = ''
): Promise<NextResponse | null> {
  const base = clientKey(req);
  const key = scope ? `${base}:${scope}` : base;
  try {
    for (const rule of rules) {
      const { rows } = await sql<{ n: number }>`
        SELECT COUNT(*)::int AS n FROM rate_events
        WHERE key = ${key} AND action = ${action}
          AND created_at > NOW() - make_interval(secs => ${rule.windowSec}::int)
      `;
      if (rows[0].n >= rule.limit) {
        return NextResponse.json(
          { error: 'Слишком много попыток. Попробуйте позже.' },
          { status: 429, headers: { 'Retry-After': String(rule.windowSec) } }
        );
      }
    }
    await sql`INSERT INTO rate_events (key, action) VALUES (${key}, ${action})`;
  } catch (err) {
    // Если таблицы ещё нет или база недоступна — сайт не должен ложиться из-за счётчика
    console.error('rateLimit: проверка пропущена из-за ошибки', err);
  }
  return null;
}

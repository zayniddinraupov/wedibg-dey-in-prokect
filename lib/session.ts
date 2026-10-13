import { createHmac, timingSafeEqual } from 'crypto';

// «Метка человека»: после прохождения проверки «я не робот» браузер получает
// подписанную куку, и дальше проверку заново проходить не нужно.
export const COOKIE_NAME = 'human';
export const SESSION_TTL_SEC = 6 * 60 * 60;

/** Проверка «я не робот» включена, только если задан секретный ключ Turnstile. */
export function captchaRequired(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

function secret(): string {
  return process.env.SESSION_SECRET || process.env.TURNSTILE_SECRET_KEY || '';
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

export function makeSession(): string {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SEC);
  return `${exp}.${sign(exp)}`;
}

function verifySession(value: string | undefined): boolean {
  if (!value) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(exp);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export function hasValidSession(req: Request): boolean {
  if (!captchaRequired()) return true;
  const cookie = (req.headers.get('cookie') || '')
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE_NAME}=`));
  return verifySession(cookie?.slice(COOKIE_NAME.length + 1));
}

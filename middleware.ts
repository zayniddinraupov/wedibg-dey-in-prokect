import { NextRequest, NextResponse } from 'next/server';

// Закрывает админку паролем (Basic-авторизация: браузер сам покажет окно входа).
// Пароль задаётся переменной ADMIN_PASSWORD. Пока она не задана, админка отключена.
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse('Админка выключена: задайте ADMIN_PASSWORD в настройках Vercel.', {
      status: 503,
    });
  }
  const user = process.env.ADMIN_USER || 'admin';

  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const sep = decoded.indexOf(':');
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (u === user && p === password) {
        const res = NextResponse.next();
        res.headers.set('Cache-Control', 'no-store');
        return res;
      }
    } catch {
      // некорректный заголовок — ниже вернём 401
    }
  }

  return new NextResponse('Нужна авторизация', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="admin", charset="UTF-8"' },
  });
}

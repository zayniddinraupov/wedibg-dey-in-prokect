const securityHeaders = [
  // Браузер не должен «угадывать» тип файла
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Страницу нельзя встроить на чужой сайт (кроме собственного предпросмотра)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // На чужие сайты уходит только домен, без секретных адресов вида /manage/...
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

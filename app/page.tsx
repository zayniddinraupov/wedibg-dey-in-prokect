import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import TemplateCard from '@/components/TemplateCard';
import { EVENTS, EVENT_ORDER } from '@/lib/events';

export default function HomePage() {
  // По одному оформлению каждого вида события
  const preview = EVENT_ORDER.map((type) => ({ type, themeId: EVENTS[type].themes[0] }));

  return (
    <>
      <SiteNav />
      <div className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="mb-4 text-4xl font-semibold text-gray-900">Создайте своё приглашение</h1>
        <p className="mx-auto mb-3 max-w-xl text-gray-500">
          Выберите вид события и оформление, добавьте свои данные и получите готовую ссылку для
          гостей за пару минут.
        </p>
        <p className="mx-auto mb-10 max-w-xl text-sm text-gray-400">
          {EVENT_ORDER.map((t) => EVENTS[t].label).join(' · ')}
        </p>

        <div className="mb-16 flex justify-center gap-3">
          <Link href="/templates" className="rounded-lg bg-gray-900 px-6 py-3 text-sm text-white">
            Смотреть все шаблоны
          </Link>
          <Link
            href="/create"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm text-gray-700"
          >
            Начать с чистого листа
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 text-left sm:grid-cols-3 lg:grid-cols-5">
          {preview.map((p) => (
            <TemplateCard key={`${p.type}-${p.themeId}`} themeId={p.themeId} type={p.type} />
          ))}
        </div>
      </div>
    </>
  );
}

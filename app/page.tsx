import Link from 'next/link';
import TemplateCard from '@/components/TemplateCard';
import { themesByType } from '@/lib/themes';

const preview = [
  { themeId: themesByType.wedding[0], type: 'wedding' as const },
  { themeId: themesByType.wedding[1], type: 'wedding' as const },
  { themeId: themesByType.birthday[0], type: 'birthday' as const },
  { themeId: themesByType.birthday[1], type: 'birthday' as const },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 text-center">
      <h1 className="mb-4 text-4xl font-semibold text-gray-900">Создайте своё приглашение</h1>
      <p className="mx-auto mb-10 max-w-xl text-gray-500">
        Свадьба или день рождения — выберите оформление, добавьте свои данные и получите
        готовую ссылку для гостей за пару минут.
      </p>

      <div className="mb-16 flex justify-center gap-3">
        <Link href="/templates" className="rounded-lg bg-gray-900 px-6 py-3 text-sm text-white">
          Смотреть все шаблоны
        </Link>
        <Link href="/create" className="rounded-lg border border-gray-300 px-6 py-3 text-sm text-gray-700">
          Начать с чистого листа
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 text-left sm:grid-cols-4">
        {preview.map((p) => (
          <TemplateCard key={`${p.type}-${p.themeId}`} themeId={p.themeId} type={p.type} />
        ))}
      </div>
    </div>
  );
}

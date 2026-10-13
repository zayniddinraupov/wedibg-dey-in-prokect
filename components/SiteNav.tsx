import Link from 'next/link';

export default function SiteNav() {
  return (
    <header className="border-b border-gray-100">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-sm">
        <Link href="/" className="font-semibold text-gray-900">
          Приглашения
        </Link>
        <div className="flex items-center gap-5 text-gray-600">
          <Link href="/templates" className="hover:text-gray-900">
            Шаблоны
          </Link>
          <Link href="/create" className="hover:text-gray-900">
            Создать
          </Link>
          <Link href="/support" className="hover:text-gray-900">
            Поддержка
          </Link>
        </div>
      </nav>
    </header>
  );
}

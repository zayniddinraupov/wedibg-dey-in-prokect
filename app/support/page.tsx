import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SupportForm from '@/components/SupportForm';
import { FAQ } from '@/lib/support';

export const metadata: Metadata = {
  title: 'Поддержка',
  description: 'Ответы на частые вопросы и форма обращения в поддержку.',
};

// Прямые контакты показываются, только если заданы переменные окружения
const TELEGRAM = process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM?.replace('@', '');
const WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, '');
const EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export default function SupportPage() {
  const hasDirect = Boolean(TELEGRAM || WHATSAPP || EMAIL);

  return (
    <>
      <SiteNav />
      <div className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">Поддержка</h1>
        <p className="mb-8 text-gray-500">
          Что-то не получается? Посмотрите ответы ниже или напишите нам — поможем.
        </p>

        {hasDirect && (
          <div className="mb-8 flex flex-wrap gap-2">
            {TELEGRAM && (
              <a
                href={`https://t.me/${TELEGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
              >
                Telegram
              </a>
            )}
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
              >
                WhatsApp
              </a>
            )}
            {EMAIL && (
              <a
                href={`mailto:${EMAIL}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
              >
                {EMAIL}
              </a>
            )}
          </div>
        )}

        <h2 className="mb-3 text-lg font-semibold text-gray-900">Частые вопросы</h2>
        <div className="mb-12 divide-y divide-gray-100 rounded-xl border border-gray-200">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-gray-900 marker:hidden">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>

        <SupportForm />
      </div>
    </>
  );
}

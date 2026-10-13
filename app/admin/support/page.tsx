import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from '@vercel/postgres';
import TicketActions from '@/components/TicketActions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Обращения в поддержку',
  robots: { index: false, follow: false },
};

interface Ticket {
  id: number;
  name: string;
  contact: string;
  topic: string;
  message: string;
  invite_link: string | null;
  status: string;
  created_at: Date;
}

export default async function AdminSupportPage() {
  // Сначала новые, затем закрытые; внутри — свежие выше
  const { rows } = await sql<Ticket>`
    SELECT id, name, contact, topic, message, invite_link, status, created_at
    FROM support_tickets
    ORDER BY (status = 'done'), created_at DESC
    LIMIT 200
  `;
  const open = rows.filter((r) => r.status !== 'done').length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-1 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Обращения в поддержку</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">
          К модерации
        </Link>
      </div>
      <p className="mb-8 text-sm text-gray-500">Новых: {open}. Всего показано: {rows.length}.</p>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          Обращений пока нет.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border p-5 ${
                t.status === 'done' ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-gray-200'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{t.topic}</div>
                  <div className="text-xs text-gray-500">
                    {t.name} · {t.contact} ·{' '}
                    {new Date(t.created_at).toLocaleString('ru-RU', {
                      timeZone: 'Asia/Tashkent',
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <TicketActions id={t.id} status={t.status} />
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{t.message}</p>
              {t.invite_link && (
                <p className="mt-2 break-all text-xs text-gray-500">Приглашение: {t.invite_link}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

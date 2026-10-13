import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import Link from 'next/link';
import AdminActions from '@/components/AdminActions';
import { joinNames, isInviteType } from '@/lib/events';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Модерация',
  robots: { index: false, follow: false },
};

interface Row {
  slug: string;
  type: string;
  name1: string;
  name2: string | null;
  hidden: boolean;
  created_at: Date;
  reports: number;
  last_reason: string | null;
}

export default async function AdminPage() {
  // Сначала приглашения с жалобами, затем самые свежие
  const { rows } = await sql<Row>`
    SELECT i.slug, i.type, i.name1, i.name2, i.hidden, i.created_at,
      (SELECT COUNT(*)::int FROM reports r WHERE r.slug = i.slug) AS reports,
      (SELECT r.reason FROM reports r WHERE r.slug = i.slug ORDER BY r.created_at DESC LIMIT 1) AS last_reason
    FROM invites i
    ORDER BY reports DESC, i.created_at DESC
    LIMIT 100
  `;
  const { rows: total } = await sql<{ n: number }>`SELECT COUNT(*)::int AS n FROM invites`;
  let newTickets = 0;
  try {
    const t = await sql<{ n: number }>`SELECT COUNT(*)::int AS n FROM support_tickets WHERE status = 'new'`;
    newTickets = t.rows[0].n;
  } catch {
    // таблицы обращений ещё нет — выполните scripts/schema.sql
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-1 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Модерация</h1>
        <Link href="/admin/support" className="text-sm text-blue-600 underline">
          Обращения в поддержку{newTickets > 0 ? ` (${newTickets})` : ''}
        </Link>
      </div>
      <p className="mb-8 text-sm text-gray-500">
        Всего приглашений: {total[0].n}. Ниже — первые 100: сначала с жалобами, затем новые.
        Приглашение скрывается автоматически, когда на него пожаловались 5 разных людей.
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Приглашение</th>
              <th className="px-4 py-3 font-medium">Жалобы</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Создано</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-t border-gray-100 align-top">
                <td className="px-4 py-3">
                  <a href={`/i/${r.slug}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {joinNames(isInviteType(r.type) ? r.type : 'wedding', r.name1, r.name2)}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {r.reports > 0 ? `${r.reports} (${r.last_reason})` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-700">{r.hidden ? 'Скрыто' : 'Опубликовано'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-4 py-3">
                  <AdminActions slug={r.slug} hidden={r.hidden} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

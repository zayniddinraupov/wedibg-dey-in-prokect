import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { InviteRow } from '@/lib/mapRowToConfig';
import ManageActions from '@/components/ManageActions';
import SiteNav from '@/components/SiteNav';
import { joinNames, isInviteType } from '@/lib/events';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Управление приглашением',
  robots: { index: false, follow: false },
};

const TOKEN_RE = /^[a-f0-9]{32}$/;
const TIME_ZONE = 'Asia/Tashkent'; // в каком часовом поясе показывать время ответов

interface RsvpRow {
  name: string;
  status: string;
  guests: number;
  comment: string | null;
  created_at: Date;
}

export default async function ManagePage({ params }: { params: { token: string } }) {
  if (!TOKEN_RE.test(params.token)) notFound();

  const { rows } = await sql<InviteRow>`
    SELECT * FROM invites WHERE edit_token = ${params.token} LIMIT 1
  `;
  const invite = rows[0];
  if (!invite) notFound();

  const { rows: responses } = await sql<RsvpRow>`
    SELECT name, status, guests, comment, created_at
    FROM rsvp_responses WHERE slug = ${invite.slug}
    ORDER BY created_at DESC
  `;

  const declined = responses.filter((r) => r.status === 'Не смогу прийти');
  const coming = responses.filter((r) => r.status !== 'Не смогу прийти');
  const peopleComing = coming.reduce((sum, r) => sum + r.guests, 0);
  const names = joinNames(isInviteType(invite.type) ? invite.type : 'wedding', invite.name1, invite.name2);

  return (
    <>
    <SiteNav />
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">{names}</h1>
      <p className="mb-8 text-sm text-gray-500">Управление приглашением</p>

      <ManageActions slug={invite.slug} token={params.token} />

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Ответы гостей</h2>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="text-2xl font-semibold text-gray-900">{peopleComing}</div>
          <div className="text-xs text-gray-500">человек придёт</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="text-2xl font-semibold text-gray-900">{responses.length}</div>
          <div className="text-xs text-gray-500">ответов всего</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="text-2xl font-semibold text-gray-900">{declined.length}</div>
          <div className="text-xs text-gray-500">не смогут</div>
        </div>
      </div>

      {responses.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          Пока никто не ответил. Отправьте гостям ссылку на приглашение — ответы появятся здесь.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Ответ</th>
                <th className="px-4 py-3 font-medium">Гостей</th>
                <th className="px-4 py-3 font-medium">Комментарий</th>
                <th className="px-4 py-3 font-medium">Когда</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr key={i} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.status}</td>
                  <td className="px-4 py-3 text-gray-700">{r.guests}</td>
                  <td className="px-4 py-3 text-gray-500">{r.comment || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                    {new Date(r.created_at).toLocaleString('ru-RU', {
                      timeZone: TIME_ZONE,
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}

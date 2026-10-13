import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { mapRowToConfig, InviteRow } from '@/lib/mapRowToConfig';
import InviteExperience from '@/components/InviteExperience';
import { joinNames, isInviteType } from '@/lib/events';

export const dynamic = 'force-dynamic';

async function getInvite(slug: string): Promise<InviteRow | null> {
  const { rows } = await sql<InviteRow>`SELECT * FROM invites WHERE slug = ${slug} LIMIT 1`;
  return rows[0] || null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const row = await getInvite(params.slug);
  if (!row) {
    return { title: 'Приглашение не найдено' };
  }
  if (row.hidden) {
    return { title: 'Приглашение скрыто', robots: { index: false, follow: false } };
  }
  const names = joinNames(isInviteType(row.type) ? row.type : 'wedding', row.name1, row.name2);
  return {
    title: `${names} — приглашение`,
    description: row.intro || undefined,
  };
}

export default async function InvitePage({ params }: { params: { slug: string } }) {
  const row = await getInvite(params.slug);
  if (!row) {
    notFound();
  }
  if (row.hidden) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="mb-3 text-xl font-semibold text-gray-900">Приглашение временно скрыто</h1>
        <p className="text-sm text-gray-500">
          На это приглашение поступили жалобы, и сейчас оно проверяется модератором.
        </p>
      </div>
    );
  }
  const config = mapRowToConfig(row);
  return <InviteExperience config={config} />;
}

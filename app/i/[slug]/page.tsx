import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { mapRowToConfig, InviteRow } from '@/lib/mapRowToConfig';
import InviteExperience from '@/components/InviteExperience';

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
  const names = row.name1 + (row.name2 ? ' & ' + row.name2 : '');
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
  const config = mapRowToConfig(row);
  return <InviteExperience config={config} />;
}

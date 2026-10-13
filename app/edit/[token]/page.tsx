import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { InviteRow } from '@/lib/mapRowToConfig';
import { rowToForm } from '@/lib/form';
import ConstructorForm from '@/components/ConstructorForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Редактирование приглашения',
  robots: { index: false, follow: false },
};

const TOKEN_RE = /^[a-f0-9]{32}$/;

export default async function EditPage({ params }: { params: { token: string } }) {
  if (!TOKEN_RE.test(params.token)) notFound();

  const { rows } = await sql<InviteRow>`
    SELECT * FROM invites WHERE edit_token = ${params.token} LIMIT 1
  `;
  const invite = rows[0];
  if (!invite) notFound();

  return <ConstructorForm editToken={params.token} initialForm={rowToForm(invite)} />;
}

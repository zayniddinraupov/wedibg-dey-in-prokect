'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CopyButton from './CopyButton';

export default function ManageActions({ slug, token }: { slug: string; token: string }) {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const guestUrl = `${origin}/i/${slug}`;
  const manageUrl = `${origin}/manage/${token}`;

  const handleDelete = async () => {
    if (!window.confirm('Удалить приглашение и все ответы гостей? Это нельзя отменить.')) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/manage/${token}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.push('/');
    } catch {
      setError('Не удалось удалить. Попробуйте ещё раз.');
      setDeleting(false);
    }
  };

  return (
    <div className="mb-10 rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <div className="mb-1 text-xs text-gray-500">Ссылка для гостей</div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`/i/${slug}`} className="break-all text-sm text-blue-600 underline">
            {guestUrl}
          </a>
          <CopyButton text={guestUrl} />
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-1 text-xs text-gray-500">Ваша секретная ссылка (эта страница)</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="break-all text-sm text-gray-700">{manageUrl}</span>
          <CopyButton text={manageUrl} />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Не показывайте её гостям: по ней можно менять и удалять приглашение.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/edit/${token}`}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
        >
          Редактировать
        </Link>
        <a
          href={`/i/${slug}`}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
        >
          Открыть приглашение
        </a>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
        >
          {deleting ? 'Удаляем…' : 'Удалить'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

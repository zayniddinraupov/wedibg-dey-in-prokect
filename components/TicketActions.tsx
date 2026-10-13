'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TicketActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = async (init: RequestInit) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/support/${id}`, init);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          run({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status === 'done' ? 'new' : 'done' }),
          })
        }
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 disabled:opacity-50"
      >
        {status === 'done' ? 'Вернуть' : 'Готово'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (window.confirm('Удалить это обращение?')) run({ method: 'DELETE' });
        }}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 disabled:opacity-50"
      >
        Удалить
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';

const REASONS = [
  'Оскорбительное содержимое',
  'Мошенничество или обман',
  'Нарушение авторских прав',
  'Другое',
];

export default function ReportLink({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const send = async () => {
    setStatus('sending');
    try {
      const res = await fetch(`/api/invites/${slug}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="report">
      {status === 'done' ? (
        <span>Спасибо, мы проверим это приглашение.</span>
      ) : !open ? (
        <button type="button" onClick={() => setOpen(true)}>
          Пожаловаться на приглашение
        </button>
      ) : (
        <div>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>{' '}
          <button type="button" onClick={send} disabled={status === 'sending'}>
            Отправить
          </button>
          {status === 'error' && <div>Не удалось отправить. Попробуйте позже.</div>}
        </div>
      )}
    </div>
  );
}

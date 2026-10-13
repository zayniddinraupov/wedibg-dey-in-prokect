'use client';

import { FormEvent, useState } from 'react';
import { SUPPORT_TOPICS } from '@/lib/support';
import Turnstile from './Turnstile';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

export default function SupportForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [topic, setTopic] = useState(SUPPORT_TOPICS[0]);
  const [inviteLink, setInviteLink] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [human, setHuman] = useState(!TURNSTILE_SITE_KEY);
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleCaptcha = async (token: string) => {
    if (!token) {
      setHuman(false);
      return;
    }
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setHuman(true);
        setError('');
      } else {
        setError('Проверка не пройдена. Попробуйте ещё раз.');
        setCaptchaKey((k) => k + 1);
      }
    } catch {
      setError('Не удалось выполнить проверку. Проверьте соединение.');
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!human) {
      setError('Пройдите проверку «я не робот».');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, topic, inviteLink, message }),
      });
      const data = await res.json();
      if (res.status === 401 && data.code === 'captcha') {
        setHuman(false);
        setCaptchaKey((k) => k + 1);
      }
      if (!res.ok) throw new Error(data.error || 'Не удалось отправить обращение');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mb-1 text-lg font-semibold text-gray-900">Обращение отправлено</div>
        <p className="text-sm text-gray-600">
          Мы ответим по указанному контакту. Обычно это занимает не больше суток.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-200 p-6">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">Написать в поддержку</h2>
      <p className="mb-5 text-sm text-gray-500">Опишите, что случилось, — поможем разобраться.</p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Ваше имя</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Как с вами связаться</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Телефон, Telegram или email"
            value={contact}
            maxLength={120}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs text-gray-500">Тема</label>
        <select
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          {SUPPORT_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs text-gray-500">Ссылка на приглашение (если есть)</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={inviteLink}
          maxLength={300}
          onChange={(e) => setInviteLink(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs text-gray-500">Что случилось</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={5}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      {TURNSTILE_SITE_KEY && !human && (
        <div className="mb-4">
          <Turnstile key={captchaKey} siteKey={TURNSTILE_SITE_KEY} onToken={handleCaptcha} />
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-gray-900 py-3 text-sm text-white disabled:opacity-50"
      >
        {sending ? 'Отправляем…' : 'Отправить'}
      </button>
    </form>
  );
}

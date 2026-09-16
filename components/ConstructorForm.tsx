'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { InviteType, ThemeId } from '@/lib/types';
import { themes, themesByType } from '@/lib/themes';

interface FormState {
  type: InviteType;
  theme: ThemeId;
  name1: string;
  name2: string;
  intro: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venuePhotoUrl: string;
  coverPhotoUrl: string;
  musicUrl: string;
  giftsEnabled: boolean;
  giftsText: string;
  dressEnabled: boolean;
  dressText: string;
  rsvpEnabled: boolean;
  rsvpWhatsapp: string;
  rsvpEmail: string;
  calendarEnabled: boolean;
}

function buildInitialState(initialType?: InviteType, initialTheme?: ThemeId): FormState {
  const type = initialType || 'wedding';
  const theme = initialTheme || themesByType[type][0];
  return {
    type,
    theme,
    name1: '',
    name2: '',
    intro: '',
    eventDate: '',
    eventTime: '16:00',
    venueName: '',
    venueAddress: '',
    venuePhotoUrl: '',
    coverPhotoUrl: '',
    musicUrl: '',
    giftsEnabled: false,
    giftsText: '',
    dressEnabled: false,
    dressText: '',
    rsvpEnabled: true,
    rsvpWhatsapp: '',
    rsvpEmail: '',
    calendarEnabled: true,
  };
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Не удалось загрузить файл');
  const data = await res.json();
  return data.url as string;
}

type UploadKey = 'venuePhotoUrl' | 'coverPhotoUrl' | 'musicUrl';

export default function ConstructorForm({
  initialType,
  initialTheme,
}: {
  initialType?: InviteType;
  initialTheme?: ThemeId;
}) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(initialType, initialTheme));
  const [uploading, setUploading] = useState<Partial<Record<UploadKey, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (type: InviteType) => {
    update('type', type);
    update('theme', themesByType[type][0]);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, key: UploadKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [key]: true }));
    setError('');
    try {
      const url = await uploadFile(file);
      update(key, url);
    } catch {
      setError('Не удалось загрузить файл. Попробуйте ещё раз.');
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name1.trim()) {
      setError('Укажите имя');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось создать приглашение');
      }
      setResultUrl(`/i/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setSubmitting(false);
    }
  };

  if (resultUrl) {
    const fullUrl = typeof window !== 'undefined' ? window.location.origin + resultUrl : resultUrl;
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Приглашение готово!</h2>
        <p className="mb-6 text-gray-500">Вот ссылка, которой можно поделиться с гостями:</p>
        <a href={resultUrl} className="mb-6 block break-all text-blue-600 underline">
          {fullUrl}
        </a>
        <div className="flex justify-center gap-3">
          <a href={resultUrl} className="rounded-lg bg-gray-900 px-5 py-3 text-sm text-white">
            Открыть приглашение
          </a>
          <button
            type="button"
            onClick={() => {
              setResultUrl('');
              setForm(buildInitialState(initialType, initialTheme));
            }}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm text-gray-700"
          >
            Создать ещё одно
          </button>
        </div>
      </div>
    );
  }

  const availableThemes = themesByType[form.type];

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-semibold text-gray-900">Создать приглашение</h1>
      <p className="mb-8 text-gray-500">
        Заполните форму — получите свою ссылку на готовую страницу приглашения.
      </p>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-gray-500">Тип события</label>
        <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => handleTypeChange('wedding')}
            className={`flex-1 rounded-md py-2 text-sm ${
              form.type === 'wedding' ? 'bg-gray-900 text-white' : 'text-gray-600'
            }`}
          >
            Свадьба
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('birthday')}
            className={`flex-1 rounded-md py-2 text-sm ${
              form.type === 'birthday' ? 'bg-gray-900 text-white' : 'text-gray-600'
            }`}
          >
            День рождения
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-gray-500">Оформление</label>
        <div className="grid grid-cols-2 gap-2">
          {availableThemes.map((id) => {
            const t = themes[id];
            return (
              <button
                type="button"
                key={id}
                onClick={() => update('theme', id)}
                className={`rounded-lg border-2 p-3 text-left ${
                  form.theme === id ? 'border-gray-900' : 'border-transparent bg-gray-50'
                }`}
              >
                <div className="mb-2 flex gap-1">
                  <span className="h-3 w-3 rounded-full" style={{ background: t.accent }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: t.accent2 }} />
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ background: t.bg }}
                  />
                </div>
                <div className="text-xs font-medium">{t.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm text-gray-500">Имя 1</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={form.name1}
            onChange={(e) => update('name1', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-500">Имя 2 / подзаголовок</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={form.name2}
            onChange={(e) => update('name2', e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-gray-500">Приветственный текст</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={3}
          value={form.intro}
          onChange={(e) => update('intro', e.target.value)}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm text-gray-500">Дата события</label>
          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={form.eventDate}
            onChange={(e) => update('eventDate', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-500">Время</label>
          <input
            type="time"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={form.eventTime}
            onChange={(e) => update('eventTime', e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-gray-500">Место проведения</label>
        <input
          className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Название"
          value={form.venueName}
          onChange={(e) => update('venueName', e.target.value)}
        />
        <input
          className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Адрес"
          value={form.venueAddress}
          onChange={(e) => update('venueAddress', e.target.value)}
        />
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'venuePhotoUrl')} />
        {uploading.venuePhotoUrl && <span className="ml-2 text-xs text-gray-400">загрузка…</span>}
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-gray-500">Фоновое фото обложки</label>
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'coverPhotoUrl')} />
        {uploading.coverPhotoUrl && <span className="ml-2 text-xs text-gray-400">загрузка…</span>}
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-gray-500">Музыка</label>
        <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'musicUrl')} />
        {uploading.musicUrl && <span className="ml-2 text-xs text-gray-400">загрузка…</span>}
      </div>

      <div className="mb-6">
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.giftsEnabled}
            onChange={(e) => update('giftsEnabled', e.target.checked)}
          />
          Показать блок «Подарки»
        </label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={2}
          value={form.giftsText}
          onChange={(e) => update('giftsText', e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.dressEnabled}
            onChange={(e) => update('dressEnabled', e.target.checked)}
          />
          Показать блок «Дресс-код»
        </label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={2}
          value={form.dressText}
          onChange={(e) => update('dressText', e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.rsvpEnabled}
            onChange={(e) => update('rsvpEnabled', e.target.checked)}
          />
          Форма RSVP
        </label>
        <input
          className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="WhatsApp организатора"
          value={form.rsvpWhatsapp}
          onChange={(e) => update('rsvpWhatsapp', e.target.value)}
        />
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Email организатора"
          value={form.rsvpEmail}
          onChange={(e) => update('rsvpEmail', e.target.value)}
        />
      </div>

      <div className="mb-8">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.calendarEnabled}
            onChange={(e) => update('calendarEnabled', e.target.checked)}
          />
          Кнопка «Добавить в календарь»
        </label>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-gray-900 py-3 text-sm text-white disabled:opacity-50"
      >
        {submitting ? 'Создаём…' : 'Создать приглашение'}
      </button>
    </form>
  );
}

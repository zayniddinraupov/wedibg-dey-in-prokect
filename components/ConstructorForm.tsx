'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { CoverStyle, InviteType, ThemeId, ParticleType } from '@/lib/types';
import { themes, particleOptions } from '@/lib/themes';
import { EVENTS, EVENT_ORDER } from '@/lib/events';
import { FormState, buildInitialState, formToConfig } from '@/lib/form';
import { uploadFile } from '@/lib/upload';
import { UPLOAD_RULES, UploadKind } from '@/lib/uploadLimits';
import CopyButton from './CopyButton';
import Turnstile from './Turnstile';

// Если ключ Turnstile не задан, проверка «я не робот» выключена
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

type UploadKey = 'venuePhotoUrl' | 'coverPhotoUrl' | 'musicUrl' | 'bgUrl';

interface Result {
  slug: string;
  token: string;
  mode: 'created' | 'saved';
}

const COVER_OPTIONS: { id: CoverStyle; label: string; hint: string }[] = [
  { id: 'envelope', label: 'Конверт с печатью', hint: 'Конверт с вашими инициалами на печати: откроется по нажатию' },
  { id: 'curtains', label: 'Шторы', hint: 'Занавес раздвигается, открывая приглашение' },
  { id: 'seal', label: 'Восковая печать', hint: 'Большая печать с инициалами, которая «ломается» при нажатии' },
  { id: 'simple', label: 'Простая кнопка', hint: 'Минималистичная обложка с кнопкой «Открыть приглашение»' },
  { id: 'none', label: 'Без обложки', hint: 'Гость сразу видит само приглашение' },
];

const PALETTES: { label: string; colors: string[] }[] = [
  { label: 'Пастель', colors: ['#f4d6d6', '#d9e4d3', '#f5ead0', '#d6dfef'] },
  { label: 'Чёрный и белый', colors: ['#111111', '#ffffff', '#9a9a9a'] },
  { label: 'Земляные тона', colors: ['#8b6b4a', '#c9a97a', '#6b7c4f', '#e8dcc6'] },
  { label: 'Изумруд и золото', colors: ['#0e5a4a', '#d4af37', '#f4ecd8'] },
  { label: 'Синий и серебро', colors: ['#1b2f5b', '#c0c8d4', '#ffffff'] },
];

const MAX_PROGRAM = 12;
const MAX_PALETTE = 6;

function particleLabel(id: ParticleType): string {
  const found = particleOptions.find((o) => o.id === id);
  return found ? found.label.toLowerCase() : '';
}

function FileField({
  label,
  accept,
  kind,
  url,
  uploading,
  onPick,
  onClear,
}: {
  label: string;
  accept: string;
  kind: UploadKind;
  url: string;
  uploading: boolean;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm text-gray-500">{label}</label>
      {url ? (
        <div className="flex items-center gap-3">
          {kind === 'image' && <img src={url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
          {kind === 'video' && (
            <video src={url} muted playsInline className="h-14 w-24 rounded-lg bg-black object-cover" />
          )}
          {kind === 'audio' && <span className="text-sm text-gray-700">Музыка загружена</span>}
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600"
          >
            Убрать
          </button>
        </div>
      ) : (
        <input type="file" accept={accept} onChange={onPick} />
      )}
      {!url && <p className="mt-1 text-xs text-gray-400">до {UPLOAD_RULES[kind].maxMB} МБ</p>}
      {uploading && <span className="ml-2 text-xs text-gray-400">загрузка…</span>}
    </div>
  );
}

export default function ConstructorForm({
  initialType,
  initialTheme,
  initialForm,
  editToken,
}: {
  initialType?: InviteType;
  initialTheme?: ThemeId;
  initialForm?: FormState; // для режима редактирования
  editToken?: string; // если задан — форма редактирует существующее приглашение
}) {
  const isEdit = Boolean(editToken);
  const [form, setForm] = useState<FormState>(
    () => initialForm || buildInitialState(initialType, initialTheme)
  );
  const [uploading, setUploading] = useState<Partial<Record<UploadKey, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [origin, setOrigin] = useState('');
  const [human, setHuman] = useState(!TURNSTILE_SITE_KEY);
  const [captchaKey, setCaptchaKey] = useState(0);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [readyTick, setReadyTick] = useState(0);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const ev = EVENTS[form.type];

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Рамка предпросмотра сообщает, что загрузилась
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data && e.data.type === 'invite-preview-ready') setReadyTick((t) => t + 1);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const postToPreview = (message: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  };

  // При любом изменении формы отправляем свежие данные в предпросмотр
  useEffect(() => {
    if (readyTick === 0) return;
    postToPreview({ type: 'invite-preview', config: formToConfig(form) });
  }, [form, readyTick]);

  // Обложку показываем при загрузке предпросмотра и при смене её стиля
  useEffect(() => {
    if (readyTick === 0) return;
    postToPreview({ type: 'invite-preview-cover' });
  }, [form.coverStyle, readyTick]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (type: InviteType) => {
    if (type === form.type) return;
    setForm((prev) => {
      const was = EVENTS[prev.type];
      const now = EVENTS[type];
      const theme = now.themes[0];
      // Тексты, которые автор не менял, подменяем на подходящие новому виду события
      const introIsDefault = !prev.intro.trim() || prev.intro === was.defaultIntro;
      const timeIsDefault = !prev.eventTime || prev.eventTime === was.defaultTime;
      const programIsDefault = JSON.stringify(prev.program) === JSON.stringify(was.program);
      return {
        ...prev,
        type,
        theme,
        particles: themes[theme].defaultParticles,
        intro: introIsDefault ? now.defaultIntro : prev.intro,
        eventTime: timeIsDefault ? now.defaultTime : prev.eventTime,
        program: programIsDefault ? now.program.map((i) => ({ ...i })) : prev.program,
      };
    });
  };

  const handleThemeChange = (theme: ThemeId) => {
    setForm((prev) => ({ ...prev, theme, particles: themes[theme].defaultParticles }));
  };

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

  const handleBgKindChange = (bgKind: FormState['bgKind']) => {
    // файл от другого типа фона не подходит, поэтому сбрасываем
    setForm((prev) => ({ ...prev, bgKind, bgUrl: '' }));
  };

  // ----- план мероприятия -----
  const toggleProgram = (enabled: boolean) => {
    setForm((prev) => ({
      ...prev,
      programEnabled: enabled,
      program:
        enabled && prev.program.length === 0
          ? EVENTS[prev.type].program.map((i) => ({ ...i }))
          : prev.program,
    }));
  };
  const updateProgramItem = (index: number, patch: Partial<FormState['program'][number]>) => {
    setForm((prev) => ({
      ...prev,
      program: prev.program.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  };
  const addProgramItem = () => {
    setForm((prev) =>
      prev.program.length >= MAX_PROGRAM
        ? prev
        : { ...prev, program: [...prev.program, { time: '', title: '' }] }
    );
  };
  const removeProgramItem = (index: number) => {
    setForm((prev) => ({ ...prev, program: prev.program.filter((_, i) => i !== index) }));
  };

  // ----- палитра дресс-кода -----
  const setPalette = (colors: string[]) => update('dressPalette', colors.slice(0, MAX_PALETTE));
  const addColor = () => {
    if (form.dressPalette.length < MAX_PALETTE) setPalette([...form.dressPalette, '#c9a97a']);
  };
  const changeColor = (index: number, value: string) => {
    setPalette(form.dressPalette.map((c, i) => (i === index ? value : c)));
  };
  const removeColor = (index: number) => {
    setPalette(form.dressPalette.filter((_, i) => i !== index));
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    key: UploadKey,
    kind: UploadKind
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!human) {
      setError('Сначала пройдите проверку «я не робот» вверху формы.');
      e.target.value = '';
      return;
    }
    setUploading((prev) => ({ ...prev, [key]: true }));
    setError('');
    try {
      const url = await uploadFile(file, kind);
      update(key, url);
    } catch (err) {
      setError(
        err instanceof Error && err.message.startsWith('Файл слишком большой')
          ? err.message
          : 'Не удалось загрузить файл. Проверьте формат и размер. Если страница открыта давно — обновите её.'
      );
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
    if (!isEdit && !human) {
      setError('Пройдите проверку «я не робот» вверху формы.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/manage/${editToken}` : '/api/invites', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 401 && data.code === 'captcha') {
        // метка «человек» истекла — просим пройти проверку заново
        setHuman(false);
        setCaptchaKey((k) => k + 1);
      }
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось сохранить приглашение');
      }
      setResult({
        slug: data.slug,
        token: isEdit ? (editToken as string) : data.editToken,
        mode: isEdit ? 'saved' : 'created',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const guestUrl = `${origin}/i/${result.slug}`;
    const manageUrl = `${origin}/manage/${result.token}`;
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          {result.mode === 'created' ? 'Приглашение готово!' : 'Изменения сохранены'}
        </h2>

        <div className="mb-4 rounded-xl border border-gray-200 p-5">
          <div className="mb-1 text-xs text-gray-500">Ссылка для гостей — отправляйте её</div>
          <div className="mb-2 break-all text-sm text-blue-600">{guestUrl}</div>
          <CopyButton text={guestUrl} />
        </div>

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-1 text-sm font-medium text-gray-900">Сохраните секретную ссылку</div>
          <p className="mb-3 text-xs text-gray-600">
            По ней вы увидите ответы гостей, сможете изменить или удалить приглашение. Гостям её не
            отправляйте. Если потерять — восстановить нельзя.
          </p>
          <div className="mb-2 break-all text-sm text-gray-700">{manageUrl}</div>
          <CopyButton text={manageUrl} />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href={`/i/${result.slug}`} className="rounded-lg bg-gray-900 px-5 py-3 text-sm text-white">
            Открыть приглашение
          </a>
          <a
            href={`/manage/${result.token}`}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm text-gray-700"
          >
            Управление и ответы
          </a>
        </div>
      </div>
    );
  }

  const coverHasHint = form.coverStyle === 'envelope' || form.coverStyle === 'seal';

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,560px)_1fr]">
      <form onSubmit={handleSubmit}>
        <div className="mb-2 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold text-gray-900">
            {isEdit ? 'Редактировать приглашение' : 'Создать приглашение'}
          </h1>
          <a
            href="/support"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600"
          >
            Нужна помощь?
          </a>
        </div>
        <p className="mb-8 text-gray-500">
          {isEdit
            ? 'Измените данные — ссылка для гостей останется прежней.'
            : 'Заполните форму — справа сразу видно, как будет выглядеть приглашение.'}
        </p>

        {TURNSTILE_SITE_KEY && !human && (
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <p className="mb-3 text-sm text-gray-600">
              Подтвердите, что вы не робот. Это нужно, чтобы загружать файлы и создавать приглашения.
            </p>
            <Turnstile key={captchaKey} siteKey={TURNSTILE_SITE_KEY} onToken={handleCaptcha} />
          </div>
        )}

        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-500">Вид приглашения</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EVENT_ORDER.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`rounded-lg border-2 px-3 py-2.5 text-sm ${
                  form.type === t
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-transparent bg-gray-100 text-gray-600'
                }`}
              >
                {EVENTS[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-500">Оформление</label>
          <div className="grid grid-cols-2 gap-2">
            {ev.themes.map((id) => {
              const t = themes[id];
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => handleThemeChange(id)}
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

        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-500">Как откроется приглашение</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {COVER_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => update('coverStyle', opt.id)}
                className={`rounded-lg border-2 px-2 py-2.5 text-xs ${
                  form.coverStyle === opt.id
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-transparent bg-gray-50 text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {COVER_OPTIONS.find((o) => o.id === form.coverStyle)?.hint}. На печати — инициалы из имён.
          </p>
          {coverHasHint && (
            <input
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder={
                form.coverStyle === 'seal'
                  ? 'Нажмите на печать, чтобы открыть'
                  : 'Нажмите на конверт, чтобы открыть'
              }
              maxLength={80}
              value={form.coverHint}
              onChange={(e) => update('coverHint', e.target.value)}
            />
          )}
          {form.coverStyle !== 'none' && (
            <button
              type="button"
              onClick={() => {
                postToPreview({ type: 'invite-preview-cover' });
                setShowMobilePreview(true);
              }}
              className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600"
            >
              Показать обложку в предпросмотре
            </button>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-500">Плавающая анимация</label>
          <div className="grid grid-cols-3 gap-2">
            {particleOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => update('particles', opt.id)}
                className={`rounded-lg border-2 px-2 py-2.5 text-xs ${
                  form.particles === opt.id
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-transparent bg-gray-50 text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {form.particles !== 'none' && (
            <p className="mt-2 text-xs text-gray-400">
              {particleLabel(form.particles)} будут плавно парить по всей странице.
            </p>
          )}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm text-gray-500">{ev.name1Label}</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder={ev.name1Placeholder}
              value={form.name1}
              maxLength={80}
              onChange={(e) => update('name1', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-500">{ev.name2Label}</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder={ev.name2Placeholder}
              value={form.name2}
              maxLength={80}
              onChange={(e) => update('name2', e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-500">Приветственный текст</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={3}
            maxLength={1000}
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
            maxLength={120}
            value={form.venueName}
            onChange={(e) => update('venueName', e.target.value)}
          />
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Адрес"
            maxLength={200}
            value={form.venueAddress}
            onChange={(e) => update('venueAddress', e.target.value)}
          />
        </div>

        <FileField
          label="Фото места проведения"
          accept="image/*"
          kind="image"
          url={form.venuePhotoUrl}
          uploading={Boolean(uploading.venuePhotoUrl)}
          onPick={(e) => handleFileChange(e, 'venuePhotoUrl', 'image')}
          onClear={() => update('venuePhotoUrl', '')}
        />
        <FileField
          label="Фото в шапке (только верх страницы)"
          accept="image/*"
          kind="image"
          url={form.coverPhotoUrl}
          uploading={Boolean(uploading.coverPhotoUrl)}
          onPick={(e) => handleFileChange(e, 'coverPhotoUrl', 'image')}
          onClear={() => update('coverPhotoUrl', '')}
        />
        <FileField
          label="Музыка"
          accept="audio/*"
          kind="audio"
          url={form.musicUrl}
          uploading={Boolean(uploading.musicUrl)}
          onPick={(e) => handleFileChange(e, 'musicUrl', 'audio')}
          onClear={() => update('musicUrl', '')}
        />

        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-500">Фон всей страницы</label>
          <div className="mb-3 flex gap-2 rounded-lg bg-gray-100 p-1">
            {(
              [
                ['none', 'Без фона'],
                ['image', 'Фото'],
                ['video', 'Видео'],
              ] as const
            ).map(([id, label]) => (
              <button
                type="button"
                key={id}
                onClick={() => handleBgKindChange(id)}
                className={`flex-1 rounded-md py-2 text-sm ${
                  form.bgKind === id ? 'bg-gray-900 text-white' : 'text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {form.bgKind !== 'none' && (
            <>
              <FileField
                label={form.bgKind === 'video' ? 'Видео для фона' : 'Фото для фона'}
                accept={form.bgKind === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                kind={form.bgKind === 'video' ? 'video' : 'image'}
                url={form.bgUrl}
                uploading={Boolean(uploading.bgUrl)}
                onPick={(e) =>
                  handleFileChange(e, 'bgUrl', form.bgKind === 'video' ? 'video' : 'image')
                }
                onClear={() => update('bgUrl', '')}
              />
              {form.bgKind === 'video' && (
                <p className="-mt-3 mb-4 text-xs text-gray-400">
                  Лучше короткий ролик на 5–15 секунд в формате MP4 (H.264). Он будет зациклен и без
                  звука; музыку добавьте отдельно. Если на телефоне гостя включён режим экономии,
                  видео может не запуститься — тогда виден цвет темы.
                </p>
              )}

              <label className="mb-1 flex justify-between text-sm text-gray-500">
                <span>Затемнение под текстом</span>
                <span>{form.bgDim}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={form.bgDim}
                onChange={(e) => update('bgDim', Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-400">
                Чем больше, тем спокойнее фон и лучше читается текст.
              </p>
            </>
          )}
        </div>

        {/* План мероприятия */}
        <div className="mb-6">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.programEnabled}
              onChange={(e) => toggleProgram(e.target.checked)}
            />
            Показать блок «{ev.programTitle}»
          </label>
          {form.programEnabled && (
            <div className="rounded-xl border border-gray-200 p-3">
              {form.program.map((item, i) => (
                <div key={i} className="mb-3 grid grid-cols-[84px_1fr_32px] items-start gap-2">
                  <input
                    className="rounded-lg border px-2 py-2 text-sm"
                    placeholder="15:30"
                    maxLength={12}
                    value={item.time}
                    onChange={(e) => updateProgramItem(i, { time: e.target.value })}
                  />
                  <div>
                    <input
                      className="mb-1 w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="Что происходит"
                      maxLength={80}
                      value={item.title}
                      onChange={(e) => updateProgramItem(i, { title: e.target.value })}
                    />
                    <input
                      className="w-full rounded-lg border px-3 py-1.5 text-xs"
                      placeholder="Пояснение (по желанию)"
                      maxLength={200}
                      value={item.text || ''}
                      onChange={(e) => updateProgramItem(i, { text: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProgramItem(i)}
                    aria-label="Удалить пункт"
                    className="h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addProgramItem}
                  disabled={form.program.length >= MAX_PROGRAM}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 disabled:opacity-40"
                >
                  + Добавить пункт
                </button>
                <button
                  type="button"
                  onClick={() => update('program', ev.program.map((i) => ({ ...i })))}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500"
                >
                  Подставить пример
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.giftsEnabled}
              onChange={(e) => update('giftsEnabled', e.target.checked)}
            />
            Показать блок «{ev.giftsTitle}»
          </label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={2}
            maxLength={1000}
            value={form.giftsText}
            onChange={(e) => update('giftsText', e.target.value)}
          />
        </div>

        {/* Дресс-код */}
        <div className="mb-6">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.dressEnabled}
              onChange={(e) => update('dressEnabled', e.target.checked)}
            />
            Показать блок «{ev.dressTitle}»
          </label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={2}
            maxLength={1000}
            placeholder="Например: вечерние наряды в пастельных тонах"
            value={form.dressText}
            onChange={(e) => update('dressText', e.target.value)}
          />
          {form.dressEnabled && (
            <div className="mt-3 rounded-xl border border-gray-200 p-3">
              <div className="mb-2 text-xs text-gray-500">Цвета, которые лучше выбрать гостям</div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {form.dressPalette.map((c, i) => (
                  <span key={i} className="relative">
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => changeColor(i, e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-full border border-gray-200 p-0"
                      aria-label="Цвет"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(i)}
                      aria-label="Убрать цвет"
                      className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-gray-700 text-[10px] leading-4 text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {form.dressPalette.length < MAX_PALETTE && (
                  <button
                    type="button"
                    onClick={addColor}
                    className="h-10 w-10 rounded-full border border-dashed border-gray-300 text-gray-400"
                    aria-label="Добавить цвет"
                  >
                    +
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {PALETTES.map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => setPalette(p.colors)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600"
                  >
                    <span className="flex">
                      {p.colors.map((c) => (
                        <span
                          key={c}
                          className="-ml-1 h-3.5 w-3.5 rounded-full border border-white first:ml-0"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.rsvpEnabled}
              onChange={(e) => update('rsvpEnabled', e.target.checked)}
            />
            Форма ответа гостей (RSVP)
          </label>
          <p className="mb-2 text-xs text-gray-400">
            Ответы сохраняются и видны вам на странице управления. WhatsApp и почта — запасной
            вариант на случай сбоя.
          </p>
          <input
            className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="WhatsApp организатора (по желанию)"
            maxLength={30}
            value={form.rsvpWhatsapp}
            onChange={(e) => update('rsvpWhatsapp', e.target.value)}
          />
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Email организатора (по желанию)"
            maxLength={120}
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

        {error && (
          <p className="mb-4 text-sm text-red-600">
            {error}{' '}
            <a href="/support" target="_blank" rel="noopener noreferrer" className="underline">
              Написать в поддержку
            </a>
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gray-900 py-3 text-sm text-white disabled:opacity-50"
        >
          {submitting
            ? isEdit
              ? 'Сохраняем…'
              : 'Создаём…'
            : isEdit
            ? 'Сохранить изменения'
            : 'Создать приглашение'}
        </button>
      </form>

      {/* Предпросмотр: справа на широких экранах, на телефоне — по кнопке */}
      <div
        className={`${
          showMobilePreview
            ? 'fixed inset-0 z-40 flex flex-col items-center overflow-auto bg-gray-100 p-4'
            : 'hidden'
        } lg:sticky lg:top-6 lg:z-auto lg:flex lg:flex-col lg:items-center lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0`}
      >
        <button
          type="button"
          onClick={() => setShowMobilePreview(false)}
          className="mb-3 self-end rounded-lg bg-gray-900 px-4 py-2 text-sm text-white lg:hidden"
        >
          Закрыть
        </button>
        <div className="mb-3 text-xs text-gray-400">Предпросмотр</div>
        <div className="rounded-[40px] bg-[#151515] p-3 shadow-2xl" style={{ width: 340, height: 680 }}>
          <iframe
            ref={frameRef}
            src="/preview"
            title="Предпросмотр приглашения"
            className="h-full w-full rounded-[30px] border-0 bg-white"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowMobilePreview(true)}
        className="fixed bottom-4 right-4 z-30 rounded-full bg-gray-900 px-5 py-3 text-sm text-white shadow-lg lg:hidden"
      >
        Предпросмотр
      </button>
    </div>
  );
}

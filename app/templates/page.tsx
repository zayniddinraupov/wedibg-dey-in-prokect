'use client';

import { useMemo, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import TemplateCard from '@/components/TemplateCard';
import { EVENTS, EVENT_ORDER } from '@/lib/events';
import { InviteType, ThemeId } from '@/lib/types';

type TypeFilter = InviteType | 'all';

interface Entry {
  themeId: ThemeId;
  type: InviteType;
}

export default function TemplatesPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const allEntries = useMemo<Entry[]>(() => {
    const list: Entry[] = [];
    EVENT_ORDER.forEach((type) => {
      EVENTS[type].themes.forEach((themeId) => list.push({ themeId, type }));
    });
    return list;
  }, []);

  const filters: { id: TypeFilter; label: string }[] = [
    { id: 'all', label: 'Все' },
    ...EVENT_ORDER.map((t) => ({ id: t as TypeFilter, label: EVENTS[t].label })),
  ];

  const filtered = allEntries.filter((e) => typeFilter === 'all' || e.type === typeFilter);

  return (
    <>
      <SiteNav />
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">Шаблоны приглашений</h1>
        <p className="mb-8 max-w-xl text-gray-500">
          Выберите оформление — дальше добавите свои имена, даты, фото и музыку. Шаблон можно сменить
          в любой момент прямо в конструкторе.
        </p>

        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                typeFilter === f.id
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((e) => (
            <TemplateCard key={`${e.type}-${e.themeId}`} themeId={e.themeId} type={e.type} />
          ))}
        </div>
      </div>
    </>
  );
}

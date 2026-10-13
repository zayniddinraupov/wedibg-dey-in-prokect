'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'Копировать' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        });
      }}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700"
    >
      {done ? 'Скопировано' : label}
    </button>
  );
}

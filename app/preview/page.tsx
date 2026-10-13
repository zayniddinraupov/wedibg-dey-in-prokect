'use client';

import { useEffect, useState } from 'react';
import InviteExperience from '@/components/InviteExperience';
import { InviteConfig } from '@/lib/types';

// Эта страница открывается внутри рамки телефона в конструкторе.
// Конструктор присылает сюда актуальные данные формы через postMessage.
export default function PreviewPage() {
  const [config, setConfig] = useState<InviteConfig | null>(null);
  const [coverRun, setCoverRun] = useState(0); // каждый новый запуск = показать обложку заново

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data) return;
      if (e.data.type === 'invite-preview') {
        setConfig(e.data.config as InviteConfig);
      } else if (e.data.type === 'invite-preview-cover') {
        setCoverRun((n) => n + 1);
      }
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'invite-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!config) return null;
  return (
    <InviteExperience
      key={coverRun}
      config={config}
      preview
      showCoverInPreview={coverRun > 0}
    />
  );
}

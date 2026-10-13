'use client';

import { useEffect, useRef, useState } from 'react';
import { BackgroundMedia as BackgroundConfig } from '@/lib/types';

// Фото или видео на заднем плане всей страницы. Поверх — «вуаль» цвета темы,
// чтобы текст всегда читался (насколько она плотная — задаёт автор).
export default function BackgroundMedia({ background }: { background: BackgroundConfig }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // React не всегда выставляет muted до автозапуска — делаем это вручную
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      // режим экономии заряда может запретить автозапуск — тогда виден цвет темы
    });
  }, [background.url, reduceMotion]);

  return (
    <div className="bg-media" aria-hidden="true">
      {background.kind === 'image' && (
        <div className="bg-media-img" style={{ backgroundImage: `url('${background.url}')` }} />
      )}
      {background.kind === 'video' && !reduceMotion && (
        <video
          ref={videoRef}
          src={background.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
      <div className="bg-media-scrim" style={{ opacity: background.dim / 100 }} />
    </div>
  );
}

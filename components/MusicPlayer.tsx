'use client';

import { useEffect, useRef, useState } from 'react';

export default function MusicPlayer({
  src,
  playTrigger,
}: {
  src: string;
  playTrigger: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // Музыка стартует по нажатию гостя на обложку (иначе браузер её заблокирует)
  useEffect(() => {
    if (playTrigger > 0) {
      audioRef.current?.play().catch(() => {
        // если браузер всё же запретил — гость включит музыку кнопкой
      });
    }
  }, [playTrigger]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        className="mute-btn"
        onClick={toggle}
        aria-label={playing ? 'Выключить музыку' : 'Включить музыку'}
      >
        {playing ? '🔊' : '🔇'}
      </button>
    </>
  );
}

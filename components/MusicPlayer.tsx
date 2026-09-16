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
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (playTrigger > 0 && audioRef.current) {
      audioRef.current.play().catch(() => {
        // автовоспроизведение может быть заблокировано — это нормально,
        // гость всегда может нажать на кнопку звука вручную
      });
    }
  }, [playTrigger]);

  return (
    <>
      <audio ref={audioRef} src={src} loop />
      <button
        className="mute-btn"
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            setMuted(audioRef.current.muted);
          }
        }}
        aria-label="Включить или выключить музыку"
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  );
}

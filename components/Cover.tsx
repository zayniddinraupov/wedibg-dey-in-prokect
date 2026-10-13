'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { InviteConfig } from '@/lib/types';
import { initialsOf, joinNames } from '@/lib/events';

// Сколько ждём после нажатия, пока доиграет анимация открытия, и только потом показываем приглашение
const OPEN_DELAY: Record<string, number> = {
  envelope: 1700,
  curtains: 1600,
  seal: 1000,
  simple: 0,
};

export default function Cover({
  config,
  onStart,
  onOpen,
}: {
  config: InviteConfig;
  onStart: () => void; // сразу при нажатии: нужно для запуска музыки (браузер разрешает звук только по клику)
  onOpen: () => void; // когда анимация закончилась
}) {
  const style = config.cover?.style || 'simple';
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const names = joinNames(config.type, config.name1, config.name2);
  const initials = initialsOf(config.type, config.name1, config.name2);

  const start = () => {
    if (opening) return;
    setOpening(true);
    onStart();
    timer.current = setTimeout(onOpen, OPEN_DELAY[style] ?? 0);
  };

  const hintDefault =
    style === 'seal' ? 'Нажмите на печать, чтобы открыть' : 'Нажмите на конверт, чтобы открыть';
  const hint = config.cover?.hint || hintDefault;

  return (
    <motion.div
      className={`cover cover-${style}${opening ? ' is-opening' : ''}`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {style === 'envelope' && (
        <div className="cv-inner">
          <div className="cv-names">{names}</div>
          <button type="button" className="envelope" onClick={start} aria-label="Открыть приглашение">
            <div className="env-back" />
            <div className="env-letter" />
            <svg className="env-pocket" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="env-paper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fdf6e6" />
                  <stop offset="1" stopColor="#f1e1c2" />
                </linearGradient>
              </defs>
              <polygon points="0,0 150,112 0,200" fill="url(#env-paper)" stroke="var(--accent-2)" strokeWidth="0.8" />
              <polygon points="300,0 150,112 300,200" fill="url(#env-paper)" stroke="var(--accent-2)" strokeWidth="0.8" />
              <polygon points="0,200 150,100 300,200" fill="url(#env-paper)" stroke="var(--accent-2)" strokeWidth="0.8" />
            </svg>
            <div className="env-flap" />
            <div className="env-seal">{initials}</div>
          </button>
          <div className="cv-hint">{hint}</div>
        </div>
      )}

      {style === 'curtains' && (
        <>
          <div className="curtain curtain-l" />
          <div className="curtain curtain-r" />
          <div className="cur-rod" />
          <div className="cv-inner">
            <div className="cv-names">{names}</div>
            <button type="button" className="cur-btn" onClick={start}>
              Открыть занавес
            </button>
          </div>
        </>
      )}

      {style === 'seal' && (
        <div className="cv-inner">
          <div className="cv-names">{names}</div>
          <button type="button" className="big-seal" onClick={start} aria-label="Открыть приглашение">
            {initials}
          </button>
          <div className="cv-hint">{hint}</div>
        </div>
      )}

      {style === 'simple' && (
        <motion.div
          className="cv-inner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="cv-label">Вам пришло приглашение</div>
          <motion.div
            className="cv-simple-icon"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="14" width="56" height="38" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M6 16 L32 38 L58 16" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </motion.div>
          <button type="button" className="open-btn" onClick={start}>
            Открыть приглашение
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

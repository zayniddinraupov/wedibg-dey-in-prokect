'use client';

import { motion } from 'framer-motion';
import { ThemeId } from '@/lib/types';

function svgWrap(inner: string) {
  return `<svg viewBox="0 0 400 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

function zigzag(y: number, amp: number, teeth: number, width: number) {
  const step = width / teeth;
  let d = `M0 ${y} `;
  for (let i = 0; i <= teeth; i++) {
    d += `L${(i * step).toFixed(1)} ${(i % 2 === 0 ? y : y + amp).toFixed(1)} `;
  }
  return d;
}

function balloon(x: number, y: number, color: string) {
  return `<g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="0" rx="15" ry="19" fill="${color}"/>
    <polygon points="-4,18 4,18 0,25" fill="${color}"/>
    <path d="M0 25 Q5 40 0 55 Q-5 68 2 80" stroke="${color}" stroke-width="1.2" fill="none" opacity="0.6"/>
  </g>`;
}

const decoMap: Record<ThemeId, string> = {
  botanical: svgWrap(
    `<g stroke="var(--accent)" stroke-width="2" fill="none" opacity="0.75"><path d="M28 40 C 50 60, 40 90, 60 110 M28 40 C 20 65, 30 85, 15 100 M28 40 C 45 35, 55 55, 70 55"/><path d="M372 560 C 350 540, 360 510, 340 490 M372 560 C 380 535, 370 515, 385 500 M372 560 C 355 565, 345 545, 330 545"/></g>`
  ),
  navy: svgWrap(
    `<g stroke="var(--accent)" stroke-width="1.4" fill="none" opacity="0.8"><path d="M30 30 h34 M30 30 v34 M30 30 q0 -6 6 -6 q6 0 6 6"/><path d="M370 30 h-34 M370 30 v34 M370 30 q0 -6 -6 -6 q-6 0 -6 6"/><path d="M30 570 h34 M30 570 v-34 M30 570 q0 6 6 6 q6 0 6 -6"/><path d="M370 570 h-34 M370 570 v-34 M370 570 q0 6 -6 6 q-6 0 -6 -6"/></g>`
  ),
  blush: svgWrap(
    `<g fill="var(--accent-2)" opacity="0.7"><circle cx="40" cy="45" r="3"/><circle cx="60" cy="30" r="2"/><circle cx="85" cy="55" r="2.4"/><circle cx="360" cy="555" r="3"/><circle cx="340" cy="570" r="2"/><circle cx="315" cy="548" r="2.4"/></g><path d="M18 68 Q60 38 102 64" stroke="var(--accent)" stroke-width="1.2" fill="none" opacity="0.6"/><path d="M382 532 Q340 562 298 536" stroke="var(--accent)" stroke-width="1.2" fill="none" opacity="0.6"/>`
  ),
  mono: svgWrap(
    `<g stroke="var(--accent)" stroke-width="1" opacity="0.9"><line x1="24" y1="24" x2="24" y2="46"/><line x1="24" y1="24" x2="46" y2="24"/><line x1="376" y1="24" x2="376" y2="46"/><line x1="376" y1="24" x2="354" y2="24"/><line x1="24" y1="576" x2="24" y2="554"/><line x1="24" y1="576" x2="46" y2="576"/><line x1="376" y1="576" x2="376" y2="554"/><line x1="376" y1="576" x2="354" y2="576"/></g>`
  ),
  confetti: svgWrap(
    `<g><circle cx="46" cy="52" r="7" fill="var(--accent)"/><circle cx="80" cy="30" r="4" fill="var(--accent-3)"/><rect x="330" y="40" width="12" height="12" fill="var(--accent-2)" transform="rotate(20 336 46)"/><circle cx="360" cy="80" r="6" fill="var(--accent)"/><rect x="40" y="530" width="12" height="12" fill="var(--accent-3)" transform="rotate(-15 46 536)"/><circle cx="80" cy="565" r="5" fill="var(--accent-2)"/><circle cx="345" cy="540" r="7" fill="var(--accent-3)"/><rect x="310" y="565" width="10" height="10" fill="var(--accent)" transform="rotate(10 315 570)"/></g>`
  ),
  space: svgWrap(
    `<g fill="var(--accent-3)"><circle cx="50" cy="60" r="2"/><circle cx="90" cy="100" r="1.6"/><circle cx="340" cy="70" r="2"/><circle cx="365" cy="120" r="1.6"/><circle cx="60" cy="520" r="1.8"/><circle cx="340" cy="540" r="2"/></g><path d="M330 45 a20 20 0 1 0 8 30 a26 26 0 1 1 -8 -30 z" fill="var(--accent-2)" opacity="0.85"/><g transform="translate(46 500) rotate(-18)"><path d="M0 40 L10 0 L20 40 Z" fill="var(--accent-2)"/><circle cx="10" cy="18" r="4" fill="var(--bg)"/><path d="M2 36 L-6 50 L6 44 Z" fill="var(--accent)"/><path d="M18 36 L26 50 L14 44 Z" fill="var(--accent)"/></g>`
  ),
  retro: svgWrap(
    `<path d="${zigzag(26, 10, 14, 400)}" stroke="var(--accent)" stroke-width="3" fill="none"/><path d="${zigzag(
      574,
      -10,
      14,
      400
    )}" stroke="var(--accent-2)" stroke-width="3" fill="none"/><circle cx="34" cy="60" r="5" fill="var(--accent-3)"/><circle cx="366" cy="540" r="5" fill="var(--accent-3)"/>`
  ),
  balloons: svgWrap(
    `${balloon(48, 55, 'var(--accent)')}${balloon(80, 35, 'var(--accent-2)')}${balloon(
      352,
      50,
      'var(--accent-3)'
    )}`
  ),
};

export default function Decorations({ theme }: { theme: ThemeId }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 1 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      dangerouslySetInnerHTML={{ __html: decoMap[theme] }}
    />
  );
}

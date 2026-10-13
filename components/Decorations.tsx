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

// Восьмиконечная звезда (две квадратные «рамки», повёрнутые друг к другу) — основа восточного орнамента
function star8(cx: number, cy: number, r: number, color: string, sw = 1.2, fill = 'none') {
  return `<g transform="translate(${cx} ${cy})" fill="${fill}" stroke="${color}" stroke-width="${sw}"><rect x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}"/><rect x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" transform="rotate(45)"/></g>`;
}

function diamondRow(y: number, from: number, to: number, step: number) {
  let out = '';
  let i = 0;
  for (let x = from; x <= to; x += step, i++) {
    const c = i % 2 === 0 ? 'var(--accent)' : 'var(--accent-2)';
    out += `<path d="M${x - 8} ${y} L${x} ${y - 8} L${x + 8} ${y} L${x} ${y + 8} Z" fill="${c}" fill-opacity="0.18" stroke="${c}" stroke-width="1.1"/>`;
  }
  return out;
}

function starRow(y: number, xs: number[], r: number) {
  return xs.map((x) => star8(x, y, r, 'var(--accent-2)', 1)).join('');
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
  gold: svgWrap(
    `<rect x="18" y="18" width="364" height="564" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.7"/><rect x="26" y="26" width="348" height="548" fill="none" stroke="var(--accent)" stroke-width="0.8" opacity="0.35"/><g fill="var(--accent)"><path d="M18 12 L24 18 L18 24 L12 18Z"/><path d="M382 12 L388 18 L382 24 L376 18Z"/><path d="M18 576 L24 582 L18 588 L12 582Z"/><path d="M382 576 L388 582 L382 588 L376 582Z"/><path d="M200 12 L207 19 L200 26 L193 19Z"/><path d="M200 574 L207 581 L200 588 L193 581Z"/></g>`
  ),
  champagne: svgWrap(
    `<g fill="none" stroke-width="1.3" opacity="0.75"><circle cx="40" cy="62" r="10" stroke="var(--accent-2)"/><circle cx="70" cy="40" r="5" stroke="var(--accent)"/><circle cx="54" cy="96" r="4" stroke="var(--accent)"/><circle cx="96" cy="70" r="3" stroke="var(--accent-2)"/><circle cx="360" cy="538" r="10" stroke="var(--accent-2)"/><circle cx="330" cy="560" r="5" stroke="var(--accent)"/><circle cx="346" cy="504" r="4" stroke="var(--accent)"/><circle cx="304" cy="530" r="3" stroke="var(--accent-2)"/></g>`
  ),
  samarkand: svgWrap(
    `${star8(200, 34, 15, 'var(--accent)', 1.5)}<circle cx="200" cy="34" r="2.6" fill="var(--accent-2)"/>${starRow(34, [60, 100, 140, 260, 300, 340], 5)}${star8(200, 566, 15, 'var(--accent)', 1.5)}<circle cx="200" cy="566" r="2.6" fill="var(--accent-2)"/>${starRow(566, [60, 100, 140, 260, 300, 340], 5)}`
  ),
  saffron: svgWrap(`${diamondRow(24, 22, 378, 32)}${diamondRow(576, 22, 378, 32)}`),
  emerald: svgWrap(
    `<g fill="none" stroke="var(--accent)" stroke-width="1.2" opacity="0.75"><path d="M22 86 A64 64 0 0 1 86 22"/><path d="M378 86 A64 64 0 0 0 314 22"/><path d="M22 514 A64 64 0 0 0 86 578"/><path d="M378 514 A64 64 0 0 1 314 578"/></g>${star8(30, 30, 6, 'var(--accent-2)', 1)}${star8(370, 30, 6, 'var(--accent-2)', 1)}${star8(30, 570, 6, 'var(--accent-2)', 1)}${star8(370, 570, 6, 'var(--accent-2)', 1)}`
  ),
  pearl: svgWrap(
    `${star8(200, 30, 10, 'var(--accent)', 1.3)}<g stroke="var(--accent-2)" stroke-width="1" opacity="0.8"><line x1="60" y1="30" x2="176" y2="30"/><line x1="224" y1="30" x2="340" y2="30"/><line x1="60" y1="570" x2="176" y2="570"/><line x1="224" y1="570" x2="340" y2="570"/></g>${star8(200, 570, 10, 'var(--accent)', 1.3)}`
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

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParticleType } from '@/lib/types';

interface Particle {
  id: number;
  left: number; // процент от ширины экрана
  size: number; // px
  duration: number; // секунды на один проход снизу вверх
  delay: number; // секунды задержки старта
  drift: number; // px, амплитуда покачивания в стороны
  colorVar: string; // css-переменная темы
  rotateStart: number;
}

function buildParticles(count: number, colorVars: string[]): Particle[] {
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: i,
      left: Math.round(Math.random() * 100),
      size: 14 + Math.round(Math.random() * 16),
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 10,
      drift: 20 + Math.random() * 40,
      colorVar: colorVars[i % colorVars.length],
      rotateStart: Math.round(Math.random() * 40 - 20),
    });
  }
  return list;
}

function HeartShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 28 C 6 21, 1 15, 1 9.5 C 1 4.8, 4.8 1, 9.5 1 C 12.6 1, 15 2.8, 16 5.2 C 17 2.8, 19.4 1, 22.5 1 C 27.2 1, 31 4.8, 31 9.5 C 31 15, 26 21, 16 28 Z"
        fill={color}
        opacity="0.6"
      />
    </svg>
  );
}

function StarShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 1 L19.5 12 L31 12 L21.8 18.8 L25.3 30 L16 23.2 L6.7 30 L10.2 18.8 L1 12 L12.5 12 Z"
        fill={color}
        opacity="0.6"
      />
    </svg>
  );
}

function ConfettiShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <rect x="2" y="2" width="16" height="16" rx="3" fill={color} opacity="0.6" />
    </svg>
  );
}

function BalloonShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 24 34" fill="none">
      <ellipse cx="12" cy="13" rx="11" ry="13" fill={color} opacity="0.6" />
      <polygon points="9,25 15,25 12,31" fill={color} opacity="0.6" />
    </svg>
  );
}

function BubbleShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.6" opacity="0.55" />
      <circle cx="8.5" cy="8.5" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}

function renderShape(type: ParticleType, size: number, color: string) {
  switch (type) {
    case 'hearts':
      return <HeartShape size={size} color={color} />;
    case 'stars':
      return <StarShape size={size} color={color} />;
    case 'confetti':
      return <ConfettiShape size={size} color={color} />;
    case 'balloons':
      return <BalloonShape size={size} color={color} />;
    case 'bubbles':
      return <BubbleShape size={size} color={color} />;
    default:
      return null;
  }
}

export default function FloatingParticles({ type }: { type: ParticleType }) {
  const particles = useMemo(() => {
    if (type === 'none') return [];
    return buildParticles(14, ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)']);
  }, [type]);

  if (type === 'none' || particles.length === 0) return null;

  return (
    <div className="particles-layer" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            bottom: -40,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -720],
            x: [0, p.drift, -p.drift, 0],
            opacity: [0, 1, 1, 0],
            rotate: [p.rotateStart, p.rotateStart + 25, p.rotateStart - 25, p.rotateStart],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {renderShape(type, p.size, p.colorVar)}
        </motion.div>
      ))}
    </div>
  );
}

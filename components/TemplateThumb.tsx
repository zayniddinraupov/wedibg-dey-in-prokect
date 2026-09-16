import { CSSProperties } from 'react';
import { ThemeId } from '@/lib/types';
import { themes } from '@/lib/themes';
import Decorations from './Decorations';

export default function TemplateThumb({ themeId }: { themeId: ThemeId }) {
  const t = themes[themeId];

  const style: CSSProperties = {
    ['--bg' as string]: t.bg,
    ['--card-bg' as string]: t.cardBg,
    ['--ink' as string]: t.ink,
    ['--accent' as string]: t.accent,
    ['--accent-2' as string]: t.accent2,
    ['--accent-3' as string]: t.accent3 || t.accent2,
    background: t.bg,
    color: t.ink,
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-black/5"
      style={{ ...style, aspectRatio: '2 / 3' }}
    >
      <Decorations theme={themeId} />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.accent, letterSpacing: 0.2 }}>
          Пример оформления
        </div>
        <div
          style={{
            fontFamily: t.fontDisplay,
            fontSize: 24,
            fontWeight: 600,
            marginTop: 10,
            lineHeight: 1.15,
          }}
        >
          Анна &amp; Дмитрий
        </div>
        <div
          style={{
            width: 26,
            height: 1,
            background: t.accent,
            margin: '12px 0',
            opacity: 0.6,
          }}
        />
        <div style={{ fontFamily: t.fontBody, fontSize: 11, opacity: 0.7 }}>14 июня 2026</div>
      </div>
    </div>
  );
}

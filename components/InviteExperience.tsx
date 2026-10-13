'use client';

import { CSSProperties, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { InviteConfig } from '@/lib/types';
import { themes } from '@/lib/themes';
import { EVENTS } from '@/lib/events';
import Cover from './Cover';
import Hero from './Hero';
import Countdown from './Countdown';
import Venue from './Venue';
import Program from './Program';
import NoteSection from './NoteSection';
import DressCode from './DressCode';
import Rsvp from './Rsvp';
import CalendarButton from './CalendarButton';
import ShareSection from './ShareSection';
import Closing from './Closing';
import MusicPlayer from './MusicPlayer';
import FloatingParticles from './FloatingParticles';
import BackgroundMedia from './BackgroundMedia';
import ReportLink from './ReportLink';

export default function InviteExperience({
  config,
  preview = false,
  showCoverInPreview = false,
}: {
  config: InviteConfig;
  preview?: boolean; // режим предпросмотра в конструкторе: без музыки и без отправки данных
  showCoverInPreview?: boolean; // в предпросмотре показать обложку (чтобы автор увидел «конверт»)
}) {
  const coverStyle = config.cover?.style || 'simple';
  const hasCover = coverStyle !== 'none';
  const [opened, setOpened] = useState(preview ? !showCoverInPreview || !hasCover : !hasCover);
  const [playTrigger, setPlayTrigger] = useState(0);
  const theme = themes[config.theme] || themes.botanical;
  const ev = EVENTS[config.type] || EVENTS.wedding;

  const themeStyle: CSSProperties = {
    ['--bg' as string]: theme.bg,
    ['--card-bg' as string]: theme.cardBg,
    ['--ink' as string]: theme.ink,
    ['--accent' as string]: theme.accent,
    ['--accent-2' as string]: theme.accent2,
    ['--accent-3' as string]: theme.accent3 || theme.accent2,
    ['--font-display' as string]: theme.fontDisplay,
    ['--font-body' as string]: theme.fontBody,
    background: theme.bg,
    color: theme.ink,
    fontFamily: theme.fontBody,
    minHeight: '100vh',
  };

  const programItems = config.program?.items || [];
  const showProgram = Boolean(config.program?.enabled) && programItems.length > 0;
  const dress = config.dressCode;
  const showDress = Boolean(dress?.enabled) && Boolean(dress?.text || dress?.palette?.length);

  return (
    <div style={themeStyle} className={config.background ? 'has-bg' : undefined}>
      {config.background && <BackgroundMedia background={config.background} />}

      <AnimatePresence>
        {!opened && (
          <Cover
            config={config}
            onStart={() => setPlayTrigger(Date.now())}
            onOpen={() => setOpened(true)}
          />
        )}
      </AnimatePresence>

      {opened && <FloatingParticles type={config.particles || 'none'} />}

      {opened && (
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Hero config={config} theme={config.theme} />

          {config.eventDate && <Countdown date={config.eventDate} time={config.eventTime} />}

          <Venue config={config} />

          {showProgram && <Program title={ev.programTitle} items={programItems} />}

          {config.calendarEnabled && <CalendarButton config={config} />}

          {config.rsvp?.enabled && <Rsvp config={config} />}

          {config.gifts?.enabled && config.gifts.text && (
            <NoteSection title={ev.giftsTitle} text={config.gifts.text} />
          )}

          {showDress && dress && (
            <DressCode
              title={ev.dressTitle}
              text={dress.text}
              palette={dress.palette || []}
              alt
            />
          )}

          {config.publishedUrl && <ShareSection url={config.publishedUrl} />}

          <Closing config={config} />

          {!preview && config.slug && <ReportLink slug={config.slug} />}
        </main>
      )}

      {!preview && config.musicSrc && <MusicPlayer src={config.musicSrc} playTrigger={playTrigger} />}
    </div>
  );
}

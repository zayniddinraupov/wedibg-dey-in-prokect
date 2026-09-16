'use client';

import { CSSProperties, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { InviteConfig } from '@/lib/types';
import { themes } from '@/lib/themes';
import Cover from './Cover';
import Hero from './Hero';
import Countdown from './Countdown';
import Venue from './Venue';
import NoteSection from './NoteSection';
import Rsvp from './Rsvp';
import CalendarButton from './CalendarButton';
import ShareSection from './ShareSection';
import Closing from './Closing';
import MusicPlayer from './MusicPlayer';

export default function InviteExperience({ config }: { config: InviteConfig }) {
  const [opened, setOpened] = useState(false);
  const [playTrigger, setPlayTrigger] = useState(0);
  const theme = themes[config.theme];

  const themeStyle: CSSProperties = {
    ['--bg' as string]: theme.bg,
    ['--card-bg' as string]: theme.cardBg,
    ['--ink' as string]: theme.ink,
    ['--accent' as string]: theme.accent,
    ['--accent-2' as string]: theme.accent2,
    ['--accent-3' as string]: theme.accent3 || theme.accent2,
    ['--font-display' as string]: theme.fontDisplay,
    ['--font-body' as string]: theme.fontBody,
  };

  const handleOpen = () => {
    setOpened(true);
    setPlayTrigger(Date.now());
  };

  return (
    <div style={themeStyle}>
      <AnimatePresence>{!opened && <Cover onOpen={handleOpen} />}</AnimatePresence>

      {opened && (
        <main>
          <Hero config={config} theme={config.theme} />

          {config.eventDate && <Countdown date={config.eventDate} time={config.eventTime} />}

          <Venue config={config} />

          {config.calendarEnabled && <CalendarButton config={config} />}

          {config.rsvp?.enabled && <Rsvp config={config} />}

          {config.gifts?.enabled && config.gifts.text && (
            <NoteSection
              title={config.type === 'wedding' ? 'Подарки' : 'Подарки и пожелания'}
              text={config.gifts.text}
            />
          )}

          {config.dressCode?.enabled && config.dressCode.text && (
            <NoteSection
              title={config.type === 'wedding' ? 'Дресс-код' : 'На заметку'}
              text={config.dressCode.text}
              alt
            />
          )}

          {config.publishedUrl && <ShareSection url={config.publishedUrl} />}

          <Closing config={config} />
        </main>
      )}

      {config.musicSrc && <MusicPlayer src={config.musicSrc} playTrigger={playTrigger} />}
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { InviteConfig, ThemeId } from '@/lib/types';
import Decorations from './Decorations';

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function formatMonthYear(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Hero({
  config,
  theme,
}: {
  config: InviteConfig;
  theme: ThemeId;
}) {
  const names = config.name1 + (config.name2 ? ' & ' + config.name2 : '');
  const kicker =
    config.type === 'wedding' ? 'Приглашаем на свадьбу' : 'Праздник по случаю дня рождения';
  const hasPhoto = Boolean(config.coverPhoto);

  return (
    <section
      className={`hero${hasPhoto ? ' has-photo' : ''}`}
      style={hasPhoto ? { backgroundImage: `url('${config.coverPhoto}')` } : undefined}
    >
      <Decorations theme={theme} />
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15 }}
      >
        <div className="kicker">{kicker}</div>
        <h1 className="names">{names}</h1>
        {config.intro && <p className="intro">{config.intro}</p>}
        {config.eventDate && <div className="month">{formatMonthYear(config.eventDate)}</div>}
      </motion.div>
    </section>
  );
}

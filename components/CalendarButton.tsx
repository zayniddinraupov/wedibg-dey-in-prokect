'use client';

import { InviteConfig } from '@/lib/types';

function pad2(n: number) {
  return n < 10 ? '0' + n : String(n);
}

function toICSDate(d: Date) {
  return (
    d.getUTCFullYear() +
    pad2(d.getUTCMonth() + 1) +
    pad2(d.getUTCDate()) +
    'T' +
    pad2(d.getUTCHours()) +
    pad2(d.getUTCMinutes()) +
    pad2(d.getUTCSeconds()) +
    'Z'
  );
}

export default function CalendarButton({ config }: { config: InviteConfig }) {
  if (!config.eventDate) return null;

  const handleClick = () => {
    const start = new Date(`${config.eventDate}T${config.eventTime || '00:00'}:00`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const names = config.name1 + (config.name2 ? ' & ' + config.name2 : '');
    const summary =
      (config.type === 'wedding' ? 'Свадьба' : 'День рождения') + (names ? ' ' + names : '');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${summary}`,
      `LOCATION:${config.venueName || ''}`,
      `DESCRIPTION:${config.intro || ''}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([lines], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section">
      <button className="cal-btn" onClick={handleClick}>
        Добавить в календарь
      </button>
    </section>
  );
}

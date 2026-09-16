'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Countdown({ date, time }: { date: string; time?: string }) {
  const target = new Date(`${date}T${time || '00:00'}:00`).getTime();
  const [remaining, setRemaining] = useState(() => Math.max(target - Date.now(), 0));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(target - Date.now(), 0));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const items = [
    { label: 'дней', value: days },
    { label: 'часов', value: hours },
    { label: 'минут', value: minutes },
    { label: 'секунд', value: seconds },
  ];

  return (
    <section className="section alt">
      <div className="section-title">До события осталось</div>
      <div className="countdown-grid">
        {items.map((item) => (
          <div className="cd-item" key={item.label}>
            <motion.span
              className="cd-num"
              key={item.value}
              initial={{ opacity: 0.4, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {pad(item.value)}
            </motion.span>
            <span className="cd-label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

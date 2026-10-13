'use client';

import { motion } from 'framer-motion';
import { ProgramItem } from '@/lib/types';

export default function Program({
  title,
  items,
  alt,
}: {
  title: string;
  items: ProgramItem[];
  alt?: boolean;
}) {
  return (
    <section className={`section${alt ? ' alt' : ''}`}>
      <div className="section-title">{title}</div>
      <div className="program">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="pg-item"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.06 }}
          >
            <div className="pg-time">{item.time}</div>
            <div className="pg-rail">
              <span className="pg-dot" />
            </div>
            <div className="pg-body">
              <div className="pg-title">{item.title}</div>
              {item.text && <div className="pg-text">{item.text}</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

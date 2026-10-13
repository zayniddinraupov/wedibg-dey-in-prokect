'use client';

import { motion } from 'framer-motion';

export default function DressCode({
  title,
  text,
  palette,
  alt,
}: {
  title: string;
  text: string;
  palette: string[];
  alt?: boolean;
}) {
  return (
    <motion.section
      className={`section${alt ? ' alt' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
    >
      <div className="section-title">{title}</div>
      {text && <p className="note-text">{text}</p>}
      {palette.length > 0 && (
        <div className="palette" aria-label="Рекомендуемые цвета">
          {palette.map((c) => (
            <span key={c} className="palette-dot" style={{ background: c }} title={c} />
          ))}
        </div>
      )}
    </motion.section>
  );
}

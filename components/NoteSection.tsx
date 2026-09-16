'use client';

import { motion } from 'framer-motion';

export default function NoteSection({
  title,
  text,
  alt,
}: {
  title: string;
  text: string;
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
      <p className="note-text">{text}</p>
    </motion.section>
  );
}

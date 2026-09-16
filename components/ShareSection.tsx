'use client';

import { motion } from 'framer-motion';

export default function ShareSection({ url }: { url: string }) {
  return (
    <motion.section
      className="section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
    >
      <div className="section-title">Поделиться приглашением</div>
      <img
        className="share-qr"
        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
          url
        )}`}
        alt="QR-код приглашения"
      />
      <div className="share-link">{url}</div>
    </motion.section>
  );
}

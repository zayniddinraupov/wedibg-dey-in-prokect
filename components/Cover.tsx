'use client';

import { motion } from 'framer-motion';

export default function Cover({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      className="cover"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', padding: 20 }}
      >
        <div className="cover-label">Вам пришло приглашение</div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 52, height: 52, margin: '0 auto 24px', color: 'var(--accent)' }}
        >
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="14" width="56" height="38" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M6 16 L32 38 L58 16" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>
        <button className="open-btn" onClick={onOpen}>
          Открыть приглашение
        </button>
      </motion.div>
    </motion.div>
  );
}

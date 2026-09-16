'use client';

import { motion } from 'framer-motion';
import { InviteConfig } from '@/lib/types';

export default function Closing({ config }: { config: InviteConfig }) {
  const names = config.name1 + (config.name2 ? ' & ' + config.name2 : '');
  const label = config.type === 'wedding' ? 'С любовью' : 'Ждём вас';

  return (
    <motion.section
      className="section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9 }}
    >
      <p className="closing-label">{label}</p>
      <h2 className="closing-names">{names}</h2>
    </motion.section>
  );
}

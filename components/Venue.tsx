'use client';

import { motion } from 'framer-motion';
import { InviteConfig } from '@/lib/types';

export default function Venue({ config }: { config: InviteConfig }) {
  if (!config.venueName) return null;

  const mapLink = config.venueAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.venueAddress)}`
    : '';

  return (
    <motion.section
      className="section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
    >
      <div className="section-title">Место проведения</div>
      {config.venuePhoto && (
        <img className="venue-photo" src={config.venuePhoto} alt={config.venueName} />
      )}
      <div className="venue-name">{config.venueName}</div>
      {config.venueAddress && <div className="venue-address">{config.venueAddress}</div>}
      {mapLink && (
        <a className="map-btn" href={mapLink} target="_blank" rel="noopener noreferrer">
          Посмотреть на карте
        </a>
      )}
    </motion.section>
  );
}

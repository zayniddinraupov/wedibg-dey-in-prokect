'use client';

import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InviteConfig } from '@/lib/types';

export default function Rsvp({ config }: { config: InviteConfig }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Приду');
  const [guests, setGuests] = useState(1);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);

  const messageText = `RSVP от ${name}. Статус: ${status}. Гостей: ${guests}${
    comment ? '. Комментарий: ' + comment : ''
  }.`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const whatsapp = config.rsvp?.whatsapp;
    const email = config.rsvp?.email;

    if (whatsapp) {
      const waUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        messageText
      )}`;
      window.open(waUrl, '_blank');
      setResultText('Открываем WhatsApp для отправки ответа…');
    } else if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        'RSVP'
      )}&body=${encodeURIComponent(messageText)}`;
      setResultText('Открываем почтовый клиент…');
    } else {
      setResultText('Спасибо! Скопируйте ответ и отправьте организатору любым удобным способом.');
    }
    setSent(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText).then(() => setCopied(true));
  };

  const noContact = !config.rsvp?.whatsapp && !config.rsvp?.email;

  return (
    <motion.section
      className="section alt"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
    >
      <div className="section-title">Подтвердите участие</div>
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.form
            key="form"
            className="rsvp-form"
            onSubmit={handleSubmit}
            exit={{ opacity: 0 }}
          >
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Приду">Приду</option>
              <option value="Приду с гостем">Приду с гостем</option>
              <option value="Не смогу прийти">Не смогу прийти</option>
            </select>
            <input
              type="number"
              min={1}
              max={10}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              placeholder="Количество гостей"
            />
            <textarea
              rows={2}
              placeholder="Комментарий (по желанию)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="rsvp-submit">
              Отправить ответ
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="result"
            className="rsvp-result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>{resultText}</div>
            {noContact && (
              <button onClick={handleCopy}>{copied ? 'Скопировано!' : 'Скопировать ответ'}</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

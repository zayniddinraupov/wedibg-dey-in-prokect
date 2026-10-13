'use client';

import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InviteConfig } from '@/lib/types';

export default function Rsvp({ config }: { config: InviteConfig }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Приду');
  const [guests, setGuests] = useState(1);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const whatsapp = config.rsvp?.whatsapp?.replace(/[^0-9]/g, '');
  const email = config.rsvp?.email;

  const messageText = `RSVP от ${name}. Статус: ${status}. Гостей: ${guests}${
    comment ? '. Комментарий: ' + comment : ''
  }.`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);

    let ok = false;
    // Если приглашение сохранено в базе — отправляем ответ организатору туда
    if (config.slug) {
      try {
        const res = await fetch(`/api/invites/${config.slug}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, status, guests, comment }),
        });
        ok = res.ok;
      } catch {
        ok = false;
      }
    }

    setSaved(ok);
    setSending(false);
    setSent(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText).then(() => setCopied(true));
  };

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
              maxLength={100}
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
              max={20}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              placeholder="Количество гостей"
            />
            <textarea
              rows={2}
              maxLength={500}
              placeholder="Комментарий (по желанию)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="rsvp-submit" disabled={sending}>
              {sending ? 'Отправляем…' : 'Отправить ответ'}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="result"
            className="rsvp-result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {saved ? (
              <div>Спасибо! Ваш ответ получен организатором.</div>
            ) : (
              <>
                <div>Отправьте ответ организатору любым удобным способом:</div>
                <div>
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(messageText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(
                        'RSVP'
                      )}&body=${encodeURIComponent(messageText)}`}
                    >
                      Почта
                    </a>
                  )}
                  <button type="button" onClick={handleCopy}>
                    {copied ? 'Скопировано!' : 'Скопировать ответ'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

-- Выполните этот запрос один раз в панели Vercel Postgres
-- (Storage → ваша база → Query), чтобы создать таблицу приглашений.

CREATE TABLE IF NOT EXISTS invites (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'wedding',
  theme TEXT NOT NULL DEFAULT 'botanical',
  name1 TEXT NOT NULL,
  name2 TEXT,
  intro TEXT,
  event_date TEXT,
  event_time TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_photo_url TEXT,
  cover_photo_url TEXT,
  music_url TEXT,
  gifts_enabled BOOLEAN DEFAULT FALSE,
  gifts_text TEXT,
  dress_enabled BOOLEAN DEFAULT FALSE,
  dress_text TEXT,
  rsvp_enabled BOOLEAN DEFAULT TRUE,
  rsvp_whatsapp TEXT,
  rsvp_email TEXT,
  calendar_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_slug ON invites (slug);

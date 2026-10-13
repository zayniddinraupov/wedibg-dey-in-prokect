-- Этот файл можно выполнять в Neon (Storage → ваша база → Query) сколько угодно раз:
-- все команды безопасны для повторного запуска и ничего не удаляют.
-- Он создаёт таблицы с нуля или дополняет уже существующие.

CREATE TABLE IF NOT EXISTS invites (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'wedding',
  theme TEXT NOT NULL DEFAULT 'botanical',
  particles TEXT NOT NULL DEFAULT 'none',
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

-- Для баз, созданных по старой версии схемы:
ALTER TABLE invites ADD COLUMN IF NOT EXISTS particles TEXT NOT NULL DEFAULT 'none';
ALTER TABLE invites ADD COLUMN IF NOT EXISTS edit_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_edit_token ON invites (edit_token);
ALTER TABLE invites ADD COLUMN IF NOT EXISTS bg_kind TEXT NOT NULL DEFAULT 'none';
ALTER TABLE invites ADD COLUMN IF NOT EXISTS bg_url TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS bg_dim INTEGER NOT NULL DEFAULT 55;

-- Ответы гостей (RSVP). Удаляются вместе с приглашением.
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES invites(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsvp_slug ON rsvp_responses (slug);

-- ===== Защита от злоупотреблений =====

-- Скрытое приглашение (после жалоб или решением модератора) не показывается гостям
ALTER TABLE invites ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE;

-- Журнал действий для ограничения частоты (хранится только хэш адреса, раз в сутки чистится)
CREATE TABLE IF NOT EXISTS rate_events (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_events_lookup ON rate_events (key, action, created_at);

-- Жалобы на приглашения
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES invites(slug) ON DELETE CASCADE,
  reporter TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_unique ON reports (slug, reporter);

-- ===== Обложки, план мероприятия, палитра дресс-кода =====
ALTER TABLE invites ADD COLUMN IF NOT EXISTS cover_style TEXT NOT NULL DEFAULT 'simple';
ALTER TABLE invites ADD COLUMN IF NOT EXISTS cover_hint TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS program_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS program TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS dress_palette TEXT;

-- ===== Обращения в поддержку =====
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  invite_link TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets (status, created_at);

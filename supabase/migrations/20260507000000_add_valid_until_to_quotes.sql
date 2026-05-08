-- 20260507000000_add_valid_until_to_quotes.sql
-- Agrega columna valid_until a la tabla quotes y columna location a sessions

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS location TEXT;

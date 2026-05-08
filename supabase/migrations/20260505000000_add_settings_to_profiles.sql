-- 20260505000000_add_settings_to_profiles.sql
-- Agrega columna de settings a la tabla de profiles para persistir la configuración

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "emailNotifications": true,
  "sessionReminders": true,
  "contractAlerts": true,
  "darkMode": true,
  "language": "es",
  "currency": "MXN",
  "twoFactorAuth": false,
  "autoBackup": true
}'::jsonb;

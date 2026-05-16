-- 20260516000000_storage_media_bucket.sql
-- Configuración del bucket "media" para subir imágenes desde el CMS

-- 1. Insertar el bucket en la tabla de almacenamiento de Supabase si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  20971520, -- 20MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/heic']::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/heic']::text[];

-- 2. Habilitar RLS en storage.objects
-- Nota: La tabla storage.objects ya tiene RLS habilitado por defecto, pero lo forzamos por seguridad.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para el bucket 'media'

-- ELIMINAR políticas existentes si se vuelve a correr el script para evitar conflictos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- POLÍTICA DE LECTURA (Pública): Cualquier persona puede descargar/ver imágenes del bucket 'media'
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- POLÍTICA DE INSERCIÓN (Admin): Solo usuarios autenticados pueden subir imágenes
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- POLÍTICA DE ACTUALIZACIÓN (Admin): Solo usuarios autenticados pueden modificar imágenes
CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- POLÍTICA DE BORRADO (Admin): Solo usuarios autenticados pueden eliminar imágenes
CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- 20260424000000_core_modules_schema.sql
-- Creación de esquemas para Sesiones, Cotizaciones y Contratos con RLS estricto

-- Habilitar extensión para UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: SESSIONS
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los fotógrafos pueden leer todas las sesiones"
    ON public.sessions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Los fotógrafos pueden crear sesiones"
    ON public.sessions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Los fotógrafos pueden editar sesiones"
    ON public.sessions FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Los fotógrafos pueden borrar sesiones"
    ON public.sessions FOR DELETE
    USING (auth.role() = 'authenticated');

-- 2. TABLA: QUOTES
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura autenticada para cotizaciones"
    ON public.quotes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Escritura autenticada para cotizaciones"
    ON public.quotes FOR ALL
    USING (auth.role() = 'authenticated');

-- 3. TABLA: CONTRACTS
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    signed_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    hash_signature VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Seguridad Extrema para Contratos (Protección de Integridad)
CREATE POLICY "Lectura de contratos por autenticados"
    ON public.contracts FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Inserción de contratos"
    ON public.contracts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Actualización de contratos"
    ON public.contracts FOR UPDATE
    USING (auth.role() = 'authenticated');

-- NOTA: Podríamos agregar un TRIGGER que impida la actualización de 'content' o 'hash_signature'
-- si el status ya es 'signed', pero para este MVP lo controlaremos desde el dominio de la aplicación.

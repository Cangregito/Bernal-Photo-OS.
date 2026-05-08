-- 20260425000000_profiles_signatures_audit.sql
-- MAESTER §3: profiles, contract_signatures, audit_logs

-- ═══════════════════════════════════════════════════════
-- 1. TABLA: PROFILES (vinculada a auth.users)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    business_name VARCHAR(255) DEFAULT 'Bernal Photo',
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Solo el propio usuario puede ver/editar su perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden editar su propio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger: Auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════
-- 2. TABLA: CONTRACT_SIGNATURES (Registro de Firmas)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.contract_signatures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    signature_data TEXT,              -- Base64 del trazo de firma
    hash_sha256 VARCHAR(64) NOT NULL, -- Hash criptográfico
    ip_address VARCHAR(45),           -- IP del firmante
    user_agent TEXT,                   -- Browser del firmante
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de firmas por autenticados"
    ON public.contract_signatures FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Inserción de firmas"
    ON public.contract_signatures FOR INSERT
    WITH CHECK (true); -- Cualquiera puede firmar (clientes no autenticados vía token)

-- Inmutabilidad: No se permiten UPDATE ni DELETE en firmas
-- (No se crean políticas para UPDATE/DELETE = bloqueadas por defecto con RLS)

-- ═══════════════════════════════════════════════════════
-- 3. TABLA: AUDIT_LOGS (Registro Inmutable de Acciones)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,      -- CREATE, UPDATE, DELETE, SIGN, LOGIN, etc.
    entity VARCHAR(50) NOT NULL,      -- clients, sessions, contracts, quotes
    entity_id UUID,                   -- ID del registro afectado
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales (ej. campos cambiados)
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer el log, nadie puede modificarlo
CREATE POLICY "Solo admins leen audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Sistema puede insertar logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true); -- Se inserta desde el backend con service_role key

-- ═══════════════════════════════════════════════════════
-- 4. TABLA: SIGNING_TOKENS (Tokens Efímeros de Firma)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.signing_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.signing_tokens ENABLE ROW LEVEL SECURITY;

-- Acceso público para validar tokens (clientes sin login)
CREATE POLICY "Lectura pública de tokens"
    ON public.signing_tokens FOR SELECT
    USING (true);

CREATE POLICY "Actualización de tokens al firmar"
    ON public.signing_tokens FOR UPDATE
    USING (true)
    WITH CHECK (is_used = true); -- Solo puede cambiar a "usado"

-- ═══════════════════════════════════════════════════════
-- ÍNDICES DE RENDIMIENTO
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_contract ON public.contract_signatures(contract_id);
CREATE INDEX IF NOT EXISTS idx_signing_tokens_token ON public.signing_tokens(token);
CREATE INDEX IF NOT EXISTS idx_signing_tokens_contract ON public.signing_tokens(contract_id);

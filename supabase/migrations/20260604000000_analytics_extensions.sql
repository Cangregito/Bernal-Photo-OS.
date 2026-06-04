-- 20260604000000_analytics_extensions.sql
-- Extensiones de base de datos para el módulo analítico de Bernal Photo OS (Gastos, Métricas de Tiempo y Presupuestos)

-- 1. TABLA DE GASTOS (EXPENSES)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    category VARCHAR(50) NOT NULL CHECK (category IN ('equipo', 'software', 'transporte', 'marketing', 'asistentes', 'operaciones', 'otros')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para gastos
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los fotógrafos pueden leer todos los gastos"
    ON public.expenses FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Los fotógrafos pueden registrar gastos"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Los fotógrafos pueden actualizar gastos"
    ON public.expenses FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Los fotógrafos pueden borrar gastos"
    ON public.expenses FOR DELETE
    USING (auth.role() = 'authenticated');


-- 2. TABLA DE METRICAS OPERATIVAS POR SESION (SESSION_METRICS)
CREATE TABLE IF NOT EXISTS public.session_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE UNIQUE,
    hours_shooting DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (hours_shooting >= 0),
    hours_editing DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (hours_editing >= 0),
    delivery_days INTEGER CHECK (delivery_days >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para métricas de sesión
ALTER TABLE public.session_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los fotógrafos pueden leer métricas de sesión"
    ON public.session_metrics FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Los fotógrafos pueden escribir métricas de sesión"
    ON public.session_metrics FOR ALL
    USING (auth.role() = 'authenticated');


-- 3. AGREGAR CAMPO DE PRESUPUESTO ESTIMADO A LA TABLA DE CLIENTES (Para medición de presupuestos)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS budget_target DECIMAL(12,2) DEFAULT 0.00 CHECK (budget_target >= 0);

-- Agregar índices para optimizar búsquedas analíticas
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_session_metrics_session_id ON public.session_metrics(session_id);

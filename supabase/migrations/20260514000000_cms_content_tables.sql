-- 20260514000000_cms_content_tables.sql
-- Tablas para gestión de contenido del sitio público desde el admin panel

-- ═══════════════════════════════════════════════════════
-- 1. TABLA: TESTIMONIALS
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote TEXT NOT NULL,
    couple_name VARCHAR(255) NOT NULL,
    session_type VARCHAR(100),
    location VARCHAR(255),
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público puede ver testimonios activos"
    ON public.testimonials FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admin puede gestionar testimonios"
    ON public.testimonials FOR ALL
    USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════
-- 2. TABLA: BLOG_POSTS
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(100),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    testimonial_quote TEXT,
    testimonial_author VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público puede ver posts publicados"
    ON public.blog_posts FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admin puede gestionar posts"
    ON public.blog_posts FOR ALL
    USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);

-- ═══════════════════════════════════════════════════════
-- 3. TABLA: PACKAGES (Paquetes de Precios)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MXN',
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_highlighted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público puede ver paquetes activos"
    ON public.packages FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admin puede gestionar paquetes"
    ON public.packages FOR ALL
    USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════
-- 4. TABLA: HERO_SLIDES
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    title VARCHAR(500),
    subtitle VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público puede ver slides activos"
    ON public.hero_slides FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admin puede gestionar slides"
    ON public.hero_slides FOR ALL
    USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════
-- 5. POLÍTICAS FALTANTES: PORTFOLIO_IMAGES (admin write)
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Admin puede gestionar portfolio"
    ON public.portfolio_images FOR ALL
    USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════
-- ÍNDICES DE RENDIMIENTO
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.packages(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON public.hero_slides(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_active ON public.portfolio_images(is_active, display_order);

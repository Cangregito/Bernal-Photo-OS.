-- Create portfolio_images table
CREATE TABLE public.portfolio_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for public viewing
CREATE POLICY "Public can view active portfolio images"
  ON portfolio_images FOR SELECT
  USING ( is_active = true );

-- Insert initial dummy data for the gallery
INSERT INTO public.portfolio_images (image_url, alt_text, display_order) VALUES
  ('/gallery_1.png', 'Bride', 1),
  ('/hero_wedding.png', 'Couple in forest', 2),
  ('/gallery_1.png', 'Wedding details', 3),
  ('/hero_wedding.png', 'Ceremony', 4),
  ('/gallery_1.png', 'Reception', 5);

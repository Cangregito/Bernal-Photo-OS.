import Link from 'next/link';
import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';
import { HeroSection } from '@/presentation/components/public/HeroSection';
import { AboutPhotographerSection } from '@/presentation/components/public/AboutPhotographerSection';
import { TestimonialsSection } from '@/presentation/components/public/TestimonialsSection';
import { supabase } from '@/infrastructure/supabase/client';

// Fallback data en caso de que la DB no esté conectada aún
/* const fallbackImages = [
  { id: 1, image_url: '/gallery_1.png', alt_text: 'Bride' },
  { id: 2, image_url: '/hero_wedding.png', alt_text: 'Couple in forest' },
  { id: 3, image_url: '/gallery_1.png', alt_text: 'Wedding details' },
  { id: 4, image_url: '/hero_wedding.png', alt_text: 'Ceremony' },
  { id: 5, image_url: '/gallery_1.png', alt_text: 'Reception' },
]; */

export default async function PublicPortfolioPage() {
  // let images = fallbackImages; // Unused for now
  
  try {
    const { data } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
      
    if (data && data.length > 0) {
      // images = data; // Keep for future use or remove if not needed
    }
  } catch (error) {
    console.error('Error fetching from Supabase, using fallback images', error);
  }

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar />
      <HeroSection />
      
      <AboutPhotographerSection />

      <TestimonialsSection />

      {/* Portfolio Call to Action */}
      <section className="py-24 bg-background flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-8">
          Colección de Memorias
        </h2>
        <p className="text-foreground/70 text-lg md:text-xl font-light mb-12 max-w-2xl">
          Explora nuestras historias editoriales y descubre cómo capturamos la esencia de cada momento con elegancia y atemporalidad.
        </p>
        <Link 
          href="/portfolio"
          className="group relative px-10 py-4 overflow-hidden border border-foreground/20 rounded-sm hover:border-foreground transition-colors"
        >
          <span className="relative z-10 text-sm font-medium tracking-[0.2em] uppercase text-foreground group-hover:text-background transition-colors duration-500">
            Ver Portafolio
          </span>
          <div className="absolute inset-0 h-full w-full bg-foreground -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
        </Link>
      </section>
    </main>
  );
}

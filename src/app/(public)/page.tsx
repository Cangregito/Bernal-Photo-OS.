import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';
import { HeroSection } from '@/presentation/components/public/HeroSection';
import { MasonryGallery } from '@/presentation/components/public/MasonryGallery';

import { supabase } from '@/infrastructure/supabase/client';

// Fallback data en caso de que la DB no esté conectada aún
const fallbackImages = [
  { id: 1, image_url: '/gallery_1.png', alt_text: 'Bride' },
  { id: 2, image_url: '/hero_wedding.png', alt_text: 'Couple in forest' },
  { id: 3, image_url: '/gallery_1.png', alt_text: 'Wedding details' },
  { id: 4, image_url: '/hero_wedding.png', alt_text: 'Ceremony' },
  { id: 5, image_url: '/gallery_1.png', alt_text: 'Reception' },
];

export default async function PublicPortfolioPage() {
  let images = fallbackImages;
  
  try {
    const { data } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
      
    if (data && data.length > 0) {
      images = data;
    }
  } catch (error) {
    console.error('Error fetching from Supabase, using fallback images', error);
  }

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar />
      <HeroSection />
      
      {/* Intro Quote Section */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-serif text-foreground leading-tight mb-8">
          Capturando la magia de tu boda, <br />
          <span className="italic">un momento a la vez</span>
        </h2>
        <p className="text-foreground/70 text-lg md:text-xl font-light">
          Capturando el amor, la alegría y la magia de su gran día, preservando
          recuerdos eternos para atesorar por siempre
        </p>
      </section>

      <MasonryGallery images={images} />
      
      {/* Call to action footer */}
      <section className="py-32 bg-primary flex flex-col items-center justify-center text-center px-4" id="pricing">
        <h2 className="text-4xl md:text-5xl font-serif text-primary-foreground mb-8">
          ¿Listos para contar su historia?
        </h2>
        <button className="bg-primary-foreground text-primary px-10 py-4 rounded-full text-lg font-medium hover:scale-105 transition-transform shadow-xl">
          Reservar Ahora
        </button>
      </section>
    </main>
  );
}

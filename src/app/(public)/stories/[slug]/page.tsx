import Image from 'next/image';
import Link from 'next/link';
import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';

// Fallback mock data for when DB is not available
const fallbackPosts: Record<string, {
  title: string; published_at: string; category: string; excerpt: string;
  content: string; cover_image: string; testimonial_quote?: string; testimonial_author?: string;
}> = {
  'post-1': { title: 'Cómo elegir al fotógrafo de tu boda', published_at: '2026-01-31', category: 'Guías', excerpt: 'Elegir al fotógrafo adecuado para tu boda es una de las decisiones más importantes.', content: 'Elegir al fotógrafo adecuado para tu boda es una de las decisiones más importantes que tomarás durante la planificación de tu evento.\n\nLo primero que debes considerar es el estilo fotográfico. ¿Prefieres un enfoque documental o editorial?', cover_image: '/gallery_1.png' },
  'post-2': { title: 'Sesión Casual de Arady & Vidal', published_at: '2024-12-04', category: 'Sesiones', excerpt: 'Una sesión llena de naturalidad y risas genuinas.', content: 'Arady y Vidal querían algo diferente. Nada de poses forzadas.\n\nLa magia de las sesiones casuales está en esos momentos robados.', cover_image: '/hero_wedding.png', testimonial_quote: 'Jassiel nos hizo sentir tan cómodos que olvidamos la cámara.', testimonial_author: 'Arady & Vidal' },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  // Try DB first
  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('title, excerpt')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (data) {
      return { title: `${data.title} | Bernal Photo`, description: (data.excerpt || '').substring(0, 160) };
    }
  } catch { /* fallback */ }
  
  const post = fallbackPosts[slug];
  if (!post) return { title: 'Historia no encontrada | Bernal Photo' };
  return { title: `${post.title} | Bernal Photo`, description: post.excerpt.substring(0, 160) };
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Try DB first
  let post: {
    title: string; published_at: string; category: string;
    content: string; cover_image: string;
    testimonial_quote?: string; testimonial_author?: string;
  } | null = null;

  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (data) {
      post = {
        title: data.title, published_at: data.published_at || data.created_at,
        category: data.category || '', content: data.content || data.excerpt || '',
        cover_image: data.cover_image || '/gallery_1.png',
        testimonial_quote: data.testimonial_quote || undefined,
        testimonial_author: data.testimonial_author || undefined,
      };
    }
  } catch { /* fallback */ }

  // Fallback to mock
  if (!post && fallbackPosts[slug]) {
    post = fallbackPosts[slug];
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background pt-32 flex flex-col items-center justify-center">
        <PublicNavbar />
        <h1 className="text-3xl font-serif text-foreground mb-4">Historia no encontrada</h1>
        <Link href="/stories" className="text-sm text-foreground/50 hover:text-foreground underline">← Volver a Historias</Link>
      </main>
    );
  }

  const formattedDate = new Date(post.published_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="min-h-screen bg-background pt-32 transition-colors duration-300">
      <PublicNavbar />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/stories" className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 stroke-1" /> Volver a Historias
        </Link>

        <header className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-foreground/40 mb-4">{formattedDate} — {post.category}</p>
          <h1 className="text-3xl md:text-5xl font-serif font-light text-foreground leading-tight">{post.title}</h1>
        </header>

        <div className="relative w-full aspect-[16/9] mb-16 overflow-hidden bg-muted">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" priority />
        </div>

        <div className="mb-16">
          {post.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-base md:text-lg text-foreground/70 font-light leading-relaxed mb-6">{paragraph}</p>
          ))}
        </div>

        {post.testimonial_quote && (
          <blockquote className="border-l-2 border-foreground/20 pl-8 py-4 my-16">
            <p className="text-xl md:text-2xl font-serif font-light text-foreground/70 italic leading-relaxed mb-4">
              &ldquo;{post.testimonial_quote}&rdquo;
            </p>
            {post.testimonial_author && (
              <cite className="text-sm text-foreground/50 not-italic">— {post.testimonial_author}</cite>
            )}
          </blockquote>
        )}

        <div className="text-center py-16 border-t border-border mt-8 mb-16">
          <p className="text-foreground/50 text-sm font-light mb-6">¿Quieres que capturemos tu historia?</p>
          <Link href="/contact" className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] font-medium uppercase hover:opacity-80 transition-all">
            Contáctanos
          </Link>
        </div>
      </article>
    </main>
  );
}

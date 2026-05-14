'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/infrastructure/supabase/client';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  cover_image: string;
  category: string;
  published_at: string;
}

const fallbackPosts = [
  { id: 'post-1', slug: 'post-1', cover_image: '/gallery_1.png', title: 'Cómo elegir al fotógrafo de tu boda.', published_at: '2026-01-31', category: 'Guías' },
  { id: 'post-2', slug: 'post-2', cover_image: '/hero_wedding.png', title: 'Sesión Casual de Arady & Vidal', published_at: '2024-12-04', category: 'Sesiones' },
  { id: 'post-3', slug: 'post-3', cover_image: '/portrait_photographer.png', title: 'El arte detrás de la fotografía blanco y negro.', published_at: '2024-03-15', category: 'Editorial' },
  { id: 'post-4', slug: 'post-4', cover_image: '/camera_gear.png', title: 'Alan & Ernesto', published_at: '2024-04-10', category: 'Bodas' },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('id, slug, title, cover_image, category, published_at')
          .eq('is_published', true)
          .order('published_at', { ascending: false });
        if (data && data.length > 0) {
          setPosts(data as BlogPost[]);
        }
      } catch { /* use fallback */ }
    }
    fetchPosts();
  }, []);

  return (
    <section className="w-full bg-background text-foreground py-24 px-4 flex flex-col items-center transition-colors duration-300" id="stories">
      <div className="max-w-[1400px] w-full">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-foreground/80">
            Historias
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {posts.map((post) => (
            <Link href={`/stories/${post.slug}`} key={post.id} className="flex flex-col items-center group cursor-pointer">
              <div className="relative w-full aspect-[4/3] mb-8 overflow-hidden bg-muted">
                <Image
                  src={post.cover_image || '/gallery_1.png'}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <h3 className="text-2xl md:text-3xl font-serif font-light text-foreground/80 mb-4 transition-colors group-hover:text-foreground">
                  {post.title}
                </h3>
                <p className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-foreground/50 mb-6">
                  {formatDate(post.published_at)} — {post.category}
                </p>
                <span className="text-foreground/40 group-hover:text-foreground/80 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

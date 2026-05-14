'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';

interface Testimonial {
  id: string;
  quote: string;
  couple_name: string;
  session_type: string;
  location: string;
}

const fallbackTestimonials: Testimonial[] = [
  { id: '1', quote: 'Jassiel capturó momentos que ni siquiera sabíamos que estaban ocurriendo. Cada foto cuenta una parte de nuestra historia de amor. ¡Las imágenes nos hicieron llorar de emoción!', couple_name: 'Ana & Carlos', session_type: 'Boda', location: 'Ciudad Juárez, Chih.' },
  { id: '2', quote: 'Desde el primer momento nos sentimos increíblemente cómodos. Su estilo editorial nos hizo sentir como modelos de revista, pero sin perder la autenticidad de nuestro día especial.', couple_name: 'María & Diego', session_type: 'Boda Civil', location: 'Chihuahua, Chih.' },
  { id: '3', quote: 'No solo es un fotógrafo, es un artista. Entendió nuestra visión desde la primera llamada y la superó por completo. Las fotos de nuestro engagement session son de otro mundo.', couple_name: 'Sofía & Alejandro', session_type: 'Compromiso', location: 'Creel, Chih.' },
  { id: '4', quote: 'Profesionalismo, creatividad y una sensibilidad única. Bernal Photo hizo que nuestro álbum de bodas sea la posesión más preciada que tenemos. Lo recomendamos con los ojos cerrados.', couple_name: 'Laura & Roberto', session_type: 'Boda Destino', location: 'Cancún, Q.R.' },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (data && data.length > 0) {
          setTestimonials(data as Testimonial[]);
        }
      } catch { /* use fallback */ }
    }
    fetchTestimonials();
  }, []);

  const next = () => setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

  const t = testimonials[current];
  if (!t) return null;

  return (
    <section className="w-full bg-background py-28 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-foreground/40 mb-8">Testimonios</p>
        <Quote className="w-8 h-8 text-foreground/15 mb-10 rotate-180" />
        <blockquote key={t.id} className="text-xl md:text-2xl lg:text-3xl font-serif font-light text-foreground/80 leading-relaxed max-w-3xl mb-12 transition-opacity duration-500">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <div className="mb-10">
          <p className="text-base font-medium text-foreground tracking-wide">{t.couple_name}</p>
          <p className="text-xs text-foreground/50 mt-1 tracking-wider uppercase">
            {t.session_type} · {t.location}
          </p>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={prev} className="text-foreground/30 hover:text-foreground transition-colors" aria-label="Anterior">
            <ChevronLeft className="w-5 h-5 stroke-1" />
          </button>
          <div className="flex items-center gap-3">
            {testimonials.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'bg-foreground w-6' : 'bg-foreground/20 w-1.5 hover:bg-foreground/40'}`}
                aria-label={`Testimonio ${idx + 1}`} />
            ))}
          </div>
          <button onClick={next} className="text-foreground/30 hover:text-foreground transition-colors" aria-label="Siguiente">
            <ChevronRight className="w-5 h-5 stroke-1" />
          </button>
        </div>
      </div>
    </section>
  );
}

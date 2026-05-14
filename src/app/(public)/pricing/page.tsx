'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';
import { TestimonialsSection } from '@/presentation/components/public/TestimonialsSection';
import { Camera, Heart, Star, Clock, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';

const iconMap: Record<string, typeof Clock> = { Clock, ImageIcon, Camera, Star, Sparkles, Heart };

interface DbPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  is_highlighted: boolean;
  display_order: number;
}

const fallbackPackages: DbPackage[] = [
  { id: '1', name: 'Esencial', price: 12000, currency: 'MXN', description: 'Perfecto para bodas íntimas y civiles.', features: ['4 horas de cobertura', '150+ fotografías editadas', 'Galería digital privada', 'Edición profesional de color'], is_highlighted: false, display_order: 0 },
  { id: '2', name: 'Signature', price: 22000, currency: 'MXN', description: 'Nuestra experiencia más solicitada. Cobertura completa de tu gran día.', features: ['8 horas de cobertura', '400+ fotografías editadas', 'Sesión de compromiso incluida', 'Galería digital privada', 'Edición editorial premium', 'Álbum de 30 páginas'], is_highlighted: true, display_order: 1 },
  { id: '3', name: 'Grand', price: 35000, currency: 'MXN', description: 'La experiencia editorial definitiva, sin límites.', features: ['Cobertura ilimitada', '600+ fotografías editadas', 'Sesión pre-boda + engagement', 'Segundo fotógrafo', 'Edición fine art', 'Álbum luxury 50 páginas'], is_highlighted: false, display_order: 2 },
];

export default function PricingPage() {
  const [packages, setPackages] = useState<DbPackage[]>(fallbackPackages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const { data } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (data && data.length > 0) {
          setPackages(data as DbPackage[]);
        }
      } catch { /* use fallback */ }
      setLoading(false);
    }
    fetchPackages();
  }, []);

  return (
    <main className="min-h-screen bg-background pt-32 transition-colors duration-300">
      <PublicNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-6">Inversión</h1>
          <p className="text-foreground/60 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Cada historia de amor es única. Nuestros paquetes están diseñados para adaptarse a tu visión, con la posibilidad de personalizar cada detalle.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-foreground/30" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-24">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`relative flex flex-col p-8 lg:p-10 border transition-all duration-300 ${
                pkg.is_highlighted ? 'border-foreground bg-foreground/[0.02] scale-[1.02] shadow-lg' : 'border-border hover:border-foreground/30'
              }`}>
                {pkg.is_highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-1 text-[10px] tracking-[0.2em] uppercase font-medium">
                    Más Popular
                  </div>
                )}
                <h3 className="text-xs tracking-[0.25em] uppercase font-medium text-foreground/50 mb-4">{pkg.name}</h3>
                <div className="mb-6">
                  <span className="text-sm text-foreground/50">Desde </span>
                  <span className="text-3xl md:text-4xl font-serif font-light text-foreground">${Number(pkg.price).toLocaleString()}</span>
                  <span className="text-sm text-foreground/50"> {pkg.currency}</span>
                </div>
                <p className="text-sm text-foreground/60 font-light leading-relaxed mb-8">{pkg.description}</p>
                <ul className="space-y-4 mb-10 flex-1">
                  {(pkg.features as string[]).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-foreground/70">
                      <Sparkles className="w-4 h-4 stroke-1 text-foreground/40 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={`/contact?package=${pkg.name.toLowerCase()}`}
                  className={`block text-center py-3.5 text-xs tracking-[0.2em] uppercase font-medium transition-all ${
                    pkg.is_highlighted ? 'bg-foreground text-background hover:opacity-80' : 'border border-foreground/20 text-foreground hover:bg-foreground hover:text-background'
                  }`}>
                  Consultar
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mb-24 max-w-2xl mx-auto">
          <div className="border-t border-border pt-12">
            <p className="text-foreground/50 text-sm font-light leading-relaxed mb-6">
              ¿Necesitas algo diferente? Cada boda es única y estamos encantados de crear un paquete personalizado que se ajuste exactamente a tu visión y presupuesto.
            </p>
            <Link href="/contact" className="text-sm text-foreground/70 hover:text-foreground underline underline-offset-4 transition-colors tracking-wide">
              Solicitar cotización personalizada →
            </Link>
          </div>
        </div>
      </div>

      <TestimonialsSection />
    </main>
  );
}

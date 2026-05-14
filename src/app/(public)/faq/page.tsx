'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: '¿Cuánto tiempo antes debo reservar mi sesión de fotos?',
    answer: 'Para bodas, recomendamos reservar con al menos 6 a 12 meses de anticipación, ya que las fechas populares se llenan rápido. Para sesiones casuales o de compromiso, con 2 a 4 semanas es suficiente.',
  },
  {
    question: '¿Cuánto tiempo tarda la entrega de las fotos?',
    answer: 'El tiempo de entrega estándar es de 4 a 6 semanas para bodas y de 2 a 3 semanas para sesiones más cortas. Recibirás un adelanto (sneak peek) de 10-15 fotos dentro de las primeras 48 horas después de tu evento.',
  },
  {
    question: '¿Qué incluye la edición profesional?',
    answer: 'Cada fotografía pasa por un proceso de edición individual que incluye corrección de color, balance de luz, retoque de piel (sin alterar tu apariencia natural), y ajustes de composición. No usamos filtros genéricos; cada imagen recibe atención personalizada para mantener un estilo editorial coherente.',
  },
  {
    question: '¿Viajan para bodas destino?',
    answer: '¡Absolutamente! Nos encanta capturar bodas en destinos únicos. Los costos de viaje (transporte, hospedaje) se cotizan por separado dependiendo de la ubicación. Hemos cubierto eventos en Cancún, Los Cabos, CDMX y más.',
  },
  {
    question: '¿Qué debo vestir para mi sesión?',
    answer: 'Una vez que confirmes tu sesión, te enviaremos una guía completa de estilismo con recomendaciones personalizadas según el tipo de sesión, la ubicación y la hora del día. En general, recomendamos colores sólidos y neutros, evitar patrones muy llamativos y llevar al menos 2 cambios de outfit.',
  },
  {
    question: '¿Qué pasa si llueve el día de mi sesión?',
    answer: 'Para sesiones al aire libre, reprogramamos sin costo adicional si las condiciones climáticas no son favorables. Para bodas, siempre tenemos un plan B creativo: ¡algunas de nuestras mejores fotos han sido bajo la lluvia!',
  },
  {
    question: '¿Ofrecen video además de fotografía?',
    answer: 'Actualmente nos especializamos exclusivamente en fotografía para garantizar la máxima calidad en cada imagen. Sin embargo, trabajamos con videógrafos de confianza que comparten nuestro estilo editorial y podemos recomendarte opciones.',
  },
  {
    question: '¿Cuál es la política de cancelación?',
    answer: 'Entendemos que los planes pueden cambiar. Las cancelaciones con más de 60 días de anticipación reciben un reembolso del 75% del anticipo. Entre 30 y 60 días, el 50%. Con menos de 30 días, el anticipo no es reembolsable pero sí transferible a otra fecha disponible.',
  },
  {
    question: '¿Cómo recibo mis fotografías?',
    answer: 'Recibirás un enlace a tu galería digital privada donde podrás ver, descargar y compartir todas tus fotos en alta resolución. La galería permanece activa por 6 meses. Si elegiste un paquete con álbum impreso, este se entrega por separado en un tiempo adicional de 4-6 semanas.',
  },
];

function FaqAccordion({ item, isOpen, toggle }: { item: FaqItem; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-border">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-base md:text-lg font-light text-foreground/80 group-hover:text-foreground transition-colors pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 stroke-1 text-foreground/40 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-foreground/60 font-light leading-relaxed max-w-3xl">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-background pt-32 transition-colors duration-300">
      <PublicNavbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-6">
            Preguntas Frecuentes
          </h1>
          <p className="text-foreground/60 text-lg font-light max-w-xl mx-auto">
            Todo lo que necesitas saber antes de tu sesión.
          </p>
        </div>

        {/* FAQ List */}
        <div className="border-t border-border mb-24">
          {faqs.map((faq, index) => (
            <FaqAccordion
              key={index}
              item={faq}
              isOpen={openIndex === index}
              toggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pb-24">
          <p className="text-foreground/50 text-sm font-light mb-6">
            ¿Tienes más preguntas? Estamos encantados de ayudarte.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] font-medium uppercase hover:opacity-80 transition-all"
          >
            Contáctanos
          </Link>
        </div>

      </div>
    </main>
  );
}

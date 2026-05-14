import Image from 'next/image';
import Link from 'next/link';

interface EditorialStory {
  id: string | number;
  image_url: string;
  title: string;
  subtitle: string;
  aspect_ratio: 'portrait' | 'landscape' | 'square';
}

export function EditorialGrid({ stories }: { stories: EditorialStory[] }) {
  return (
    <section className="w-full bg-background min-h-screen text-foreground pt-32 pb-24 transition-colors duration-300">
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8">

        {/* Editorial Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16 px-4">
          <h1 className="text-4xl md:text-5xl font-serif tracking-normal text-foreground mb-4">
            Portafolio
          </h1>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-foreground/50 max-w-lg">
            Colección de momentos auténticos
          </p>
        </div>

        {/* The Justified-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {stories.map((story, index) => {
            let colSpanClass = 'col-span-12';
            let heightClass = 'h-[350px] md:h-[450px]';

            // Row 1 (4 items)
            if (index >= 0 && index <= 3) {
              colSpanClass = 'md:col-span-3';
              heightClass = 'h-[350px] md:h-[400px]';
            }
            // Row 2 (2 items, uneven width)
            else if (index === 4) {
              colSpanClass = 'md:col-span-5';
              heightClass = 'h-[350px] md:h-[500px]';
            }
            else if (index === 5) {
              colSpanClass = 'md:col-span-7';
              heightClass = 'h-[350px] md:h-[500px]';
            }
            // Row 3 (3 items)
            else if (index >= 6 && index <= 8) {
              colSpanClass = 'md:col-span-4';
              heightClass = 'h-[350px] md:h-[450px]';
            }

            return (
              <Link
                href={`/stories/${story.id}`}
                key={story.id}
                className={`relative block w-full overflow-hidden group cursor-pointer bg-muted ${colSpanClass} ${heightClass}`}
              >
                <Image
                  src={story.image_url}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Hover Overlay with Title */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                  <h3 className="text-white text-xl md:text-2xl font-serif font-light tracking-wide mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {story.title}
                  </h3>
                  <p className="text-white/70 text-xs tracking-[0.2em] uppercase translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    {story.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA after portfolio */}
        <div className="flex flex-col items-center text-center mt-24 pt-16 border-t border-border">
          <h3 className="text-2xl md:text-3xl font-serif font-light text-foreground/80 mb-4">
            ¿Te gustó lo que ves?
          </h3>
          <p className="text-sm text-foreground/50 font-light mb-8 max-w-lg">
            Cada sesión es una historia única. Platiquemos sobre la tuya.
          </p>
          <Link
            href="/contact"
            className="group relative px-10 py-4 overflow-hidden border border-foreground/20 rounded-sm hover:border-foreground transition-colors"
          >
            <span className="relative z-10 text-sm font-medium tracking-[0.2em] uppercase text-foreground group-hover:text-background transition-colors duration-500">
              Reservar Sesión
            </span>
            <div className="absolute inset-0 h-full w-full bg-foreground -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
          </Link>
        </div>

      </div>
    </section>
  );
}

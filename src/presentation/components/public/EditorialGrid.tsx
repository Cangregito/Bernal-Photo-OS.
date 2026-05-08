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
            // Row 2 (2 items, uneven width to match screenshot)
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
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

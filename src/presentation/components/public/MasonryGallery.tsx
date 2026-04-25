import Image from 'next/image';

interface GalleryImage {
  id: number | string;
  image_url: string;
  alt_text?: string;
}

export function MasonryGallery({ images }: { images: GalleryImage[] }) {
  // Generar clases CSS dinámicas para el layout masonry
  const getMasonryClass = (index: number) => {
    const layoutPattern = ['aspect-[3/4] mt-8', 'aspect-[4/5]', 'aspect-square mt-12', 'aspect-[4/3] mt-4', 'aspect-[3/4]'];
    return layoutPattern[index % layoutPattern.length];
  };

  return (
    <section className="w-full py-24 bg-background" id="gallery">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-center space-x-6 mb-20">
          <div className="h-[1px] w-24 bg-foreground/20"></div>
          <h2 className="text-4xl font-serif tracking-widest text-foreground uppercase">
            Galería Fotográfica
          </h2>
          <div className="h-[1px] w-24 bg-foreground/20"></div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {images.map((img, i) => (
            <div key={img.id || i} className={`relative w-full overflow-hidden rounded-sm group ${getMasonryClass(i)}`}>
              <Image 
                src={img.image_url} 
                alt={img.alt_text || 'Portfolio image'} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}

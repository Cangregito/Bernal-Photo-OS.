import Image from 'next/image';
import Link from 'next/link';

const mockPosts = [
  {
    id: 'post-1',
    image_url: '/gallery_1.png',
    title: 'Cómo elegir al fotógrafo de tu boda.',
    date: 'JANUARY 31, 2026',
    category: 'GUIAS, JOURNAL'
  },
  {
    id: 'post-2',
    image_url: '/hero_wedding.png',
    title: 'Sesión Casual de Arady & Vidal',
    date: 'DECEMBER 4, 2024',
    category: 'SESIONES'
  },
  {
    id: 'post-3',
    image_url: '/portrait_photographer.png',
    title: 'El arte detrás de la fotografía blanco y negro.',
    date: 'MARCH 15, 2024',
    category: 'EDITORIAL'
  },
  {
    id: 'post-4',
    image_url: '/camera_gear.png',
    title: 'Alan & Ernesto',
    date: 'APRIL 10, 2024',
    category: 'BODAS'
  }
];

export function BlogSection() {
  return (
    <section className="w-full bg-background text-foreground py-24 px-4 flex flex-col items-center transition-colors duration-300" id="stories">
      <div className="max-w-[1400px] w-full">
        
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-foreground/80">
            My Blog
          </h2>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {mockPosts.map((post) => (
            <Link href={`/stories/${post.id}`} key={post.id} className="flex flex-col items-center group cursor-pointer">
              
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] mb-8 overflow-hidden bg-muted">
                <Image 
                  src={post.image_url} 
                  alt={post.title} 
                  fill
                  className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col items-center text-center px-4">
                <h3 className="text-2xl md:text-3xl font-serif font-light text-foreground/80 mb-4 transition-colors group-hover:text-foreground">
                  {post.title}
                </h3>
                
                <p className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-foreground/50 mb-6">
                  {post.date} — {post.category}
                </p>

                <span className="text-foreground/40 group-hover:text-foreground/80 transition-colors">
                  →
                </span>
              </div>
              
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

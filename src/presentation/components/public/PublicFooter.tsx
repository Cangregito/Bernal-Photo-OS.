'use client';

import Image from 'next/image';
import Link from 'next/link';

const mockInstagramFeed = [
  '/gallery_1.png',
  '/hero_wedding.png',
  '/portrait_photographer.png',
  '/camera_gear.png',
  '/gallery_1.png',
  '/hero_wedding.png',
];

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function PublicFooter() {
  return (
    <footer className="w-full flex flex-col mt-auto bg-background transition-colors duration-300">
      
      {/* Instagram Feed Section */}
      <div className="w-full py-20 flex flex-col items-center border-t border-border">
        <h3 className="text-3xl md:text-4xl font-serif font-light text-foreground/80 mb-12">
          Follow me on Instagram
        </h3>
        
        {/* Feed Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
          {mockInstagramFeed.map((img, idx) => (
            <div key={idx} className="relative w-full aspect-square bg-muted group cursor-pointer overflow-hidden">
              <Image 
                src={img} 
                alt={`Instagram feed ${idx + 1}`} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-500" />
            </div>
          ))}
        </div>

        {/* Instagram Handle */}
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-12 flex flex-col items-center group"
        >
          <InstagramIcon className="w-6 h-6 stroke-1 text-foreground mb-4 group-hover:scale-110 transition-transform duration-500" />
          <span className="text-xs font-light tracking-widest text-foreground/60 group-hover:text-foreground transition-colors">
            @bernalphoto
          </span>
        </a>
      </div>

      {/* Dark Footer Bottom */}
      <div className="w-full bg-[#2A2A2A] text-[#E0E0E0] py-20 px-8 md:px-24">
        <div className="max-w-screen-2xl mx-auto flex flex-row items-start justify-between">
          
          {/* Navigation Columns */}
          <div className="flex space-x-16 md:space-x-32">
            
            {/* Col 1 */}
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-[9px] font-medium tracking-[0.3em] uppercase hover:text-white transition-colors">
                HOME
              </Link>
              <Link href="/portfolio" className="text-[9px] font-medium tracking-[0.3em] uppercase hover:text-white transition-colors">
                PORTFOLIO
              </Link>
              <Link href="/stories" className="text-[9px] font-medium tracking-[0.3em] uppercase hover:text-white transition-colors">
                STORIES
              </Link>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col space-y-4">
              <Link href="/pricing" className="text-[9px] font-medium tracking-[0.3em] uppercase hover:text-white transition-colors">
                INVERSIÓN
              </Link>
              <Link href="/faq" className="text-[9px] font-medium tracking-[0.3em] uppercase hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/contact" className="text-[9px] font-medium tracking-[0.3em] uppercase hover:text-white transition-colors">
                CONTACT
              </Link>
            </div>
            
          </div>

          {/* Back to top */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white/50 hover:text-white transition-colors self-end md:self-auto"
            aria-label="Back to top"
          >
            ↑
          </button>
          
        </div>
      </div>
      
    </footer>
  );
}

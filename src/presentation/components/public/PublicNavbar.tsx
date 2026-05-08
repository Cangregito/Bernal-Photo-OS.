import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/presentation/components/ui/ThemeToggle';

export function PublicNavbar() {
  const textColorClass = 'text-foreground/90 hover:text-foreground';

  return (
    <nav className="absolute top-0 w-full z-50 px-12 py-8 flex items-center justify-between">
      {/* Left Links */}
      <div className="hidden md:flex flex-1 justify-start space-x-12 items-center">
        <Link href="/" className={`${textColorClass} transition-colors text-xs font-medium tracking-[0.2em] uppercase`}>
          Inicio
        </Link>
        <Link href="/portfolio" className={`${textColorClass} transition-colors text-xs font-medium tracking-[0.2em] uppercase`}>
          Portafolio
        </Link>
      </div>

      {/* Center Logo */}
      <div className="flex-1 flex justify-center">
        <Link href="/" className="inline-block">
          <Image 
            src="/logo.png" 
            alt="Bernal Photo Logo" 
            width={160} 
            height={60}
            className="dark:invert dark:brightness-200 object-contain transition-all" 
            priority
          />
        </Link>
      </div>
      
      {/* Right Links & Theme Toggle */}
      <div className="hidden md:flex flex-1 justify-end space-x-12 items-center">
        <Link href="/stories" className={`${textColorClass} transition-colors text-xs font-medium tracking-[0.2em] uppercase`}>
          Historias
        </Link>
        <Link href="/contact" className={`${textColorClass} transition-colors text-xs font-medium tracking-[0.2em] uppercase`}>
          Contacto
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}

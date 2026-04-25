import Link from 'next/link';

import Image from 'next/image';

export function PublicNavbar() {
  return (
    <nav className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between">
      <div className="flex-1">
        <Link href="/" className="inline-block">
          <Image 
            src="/logo.png" 
            alt="Bernal Photo Logo" 
            width={160} 
            height={60}
            className="invert brightness-200" 
            priority
          />
        </Link>
      </div>
      
      <div className="hidden md:flex flex-1 justify-center space-x-12">
        <Link href="#home" className="text-white/80 hover:text-white transition-colors text-sm font-medium tracking-widest uppercase">Inicio</Link>
        <Link href="#gallery" className="text-white/80 hover:text-white transition-colors text-sm font-medium tracking-widest uppercase">Galería</Link>
        <Link href="#pricing" className="text-white/80 hover:text-white transition-colors text-sm font-medium tracking-widest uppercase">Precios</Link>
      </div>

      <div className="flex-1 flex justify-end">
        <Link 
          href="/dashboard" 
          className="bg-primary/90 hover:bg-primary text-white px-8 py-3 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Reservar Ahora
        </Link>
      </div>
    </nav>
  );
}

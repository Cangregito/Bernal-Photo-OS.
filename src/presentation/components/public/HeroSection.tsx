export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[800px] w-full flex flex-col items-center justify-center overflow-hidden bg-black" id="home">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url(/hero_wedding.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Layered Typography effect like Olivia Wedding */}
        <h1 className="text-7xl md:text-9xl font-serif text-white/90 tracking-widest drop-shadow-2xl">
          BO<span className="text-white">DAS</span>
        </h1>
        
        <p className="mt-8 max-w-lg text-lg md:text-xl text-white/80 font-light leading-relaxed">
          Capturamos tus momentos más hermosos y los convertimos en recuerdos eternos que atesorarás para siempre.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-70">
        <div className="w-[1px] h-16 bg-gradient-to-b from-white/0 via-white to-white/0" />
      </div>
    </section>
  );
}

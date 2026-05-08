import Image from "next/image";

export function AboutPhotographerSection() {
  return (
    <section className="py-24 px-4 bg-background w-full flex flex-col items-center justify-center">
      {/* Top Header Area */}
      <div className="text-center max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl md:text-5xl font-serif text-foreground font-light mb-2">
          Fotógrafo de Bodas en México
        </h2>
        <h3 className="text-3xl md:text-5xl font-serif text-foreground font-light mb-8">
          ¡Hola, Bienvenidos!
        </h3>
        
        <p className="text-foreground/80 text-xl md:text-3xl font-light mb-16 leading-relaxed">
          Me siento afortunado de capturar recuerdos vibrantes y conmovedores para parejas románticas
        </p>

        <p className="text-xs font-medium tracking-[0.3em] uppercase text-foreground/50">
          Capturando historias de amor auténticas
        </p>
      </div>

      {/* Three Column Layout */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-center mt-12">
        
        {/* Left Column */}
        <div className="text-center md:text-right">
          <p className="text-2xl md:text-4xl font-serif text-foreground font-light leading-snug">
            Hola, mi nombre es<br />
            <span className="italic">Jassiel Bernal</span>
          </p>
        </div>

        {/* Center Column - Image Stack */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-[280px] h-[350px] md:w-[320px] md:h-[400px]">
            <Image 
              src="/portrait_photographer.png" 
              alt="Jassiel Bernal - Photographer" 
              fill
              className="object-cover rounded-sm grayscale"
            />
          </div>
          <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px]">
            <Image 
              src="/camera_gear.png" 
              alt="Camera Gear" 
              fill
              className="object-cover rounded-sm grayscale"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="text-center md:text-left">
          <p className="text-2xl md:text-4xl font-serif text-foreground font-light leading-snug">
            Lifestyle<br />
            <span className="italic">storyteller</span>
          </p>
        </div>

      </div>
    </section>
  );
}

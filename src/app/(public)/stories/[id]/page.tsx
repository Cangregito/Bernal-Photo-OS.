import Image from 'next/image';
import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';

export default function StoryPage({ params: _params }: { params: { id: string } }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // En un entorno real, usaríamos params.id para buscar la historia en Supabase.
  // Por ahora, mostraremos el contenido solicitado con la estética deseada.
  
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      {/* Hero Image (Full Bleed) */}
      <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden mt-24">
        <Image 
          src="/hero_wedding.png" 
          alt="Boda en la playa" 
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* Article Header (Centered Metadata) */}
      <header className="w-full flex flex-col items-center justify-center text-center pt-16 pb-12 px-4">
        <p className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-foreground/50 mb-6">
          JANUARY 31, 2026
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-foreground/90 mb-6 max-w-4xl leading-tight">
          Cómo elegir al fotógrafo de tu boda.
        </h1>
        <p className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-foreground/50">
          GUIAS, JOURNAL
        </p>
      </header>

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-6 pb-32">
        <div className="flex flex-col space-y-6 text-lg font-light text-foreground/80 leading-relaxed mx-auto">
          
          <h2 className="text-3xl md:text-4xl mt-12 font-serif font-light text-foreground/90">Si el estilo te importa más que el precio.</h2>
          
          <p>Elegir al fotógrafo de tu boda no es contratar a alguien que “tome fotos”.</p>
          <p><strong className="font-medium">Es decidir cómo va a existir ese día en el futuro.</strong></p>
          <p>
            Dentro de 10, 20 o 30 años, cuando ya no recuerdes el playlist, el centro de mesa o el sabor exacto del pastel, 
            <strong className="font-medium"> las fotografías van a ser el único testigo real</strong> de lo que ocurrió. Por eso esta decisión merece algo más que comparar paquetes.
          </p>
          <p>Aquí algunas claves para elegir bien y evitar arrepentimientos silenciosos.</p>

          <h3 className="text-2xl md:text-3xl mt-12 font-serif font-light text-foreground/90">1. No empieces por el precio (aunque todos lo hacen)</h3>
          <p>El precio importa, claro.</p>
          <p>Pero empezar por ahí es como elegir un tatuaje por promoción.</p>
          <p>Cada fotógrafo trabaja distinto:</p>
          <p>Algunos documentan, otros dirigen, otros hacen poses y otros cuentan historias.</p>
          <p>Si empiezas por el costo, corres el riesgo de terminar con fotos correctas… pero sin alma.</p>
          <p><strong className="font-medium">Pregúntate qué tipo de imágenes quieres ver el resto de tu vida.</strong></p>

          <h3 className="text-2xl md:text-3xl mt-12 font-serif font-light text-foreground/90">2. Mira galerías completas, no solo Instagram</h3>
          <p>Instagram es un tráiler.</p>
          <p>La boda es la película completa.</p>
          <p>En mi opinión, un buen fotógrafo:</p>
          <ul className="list-disc pl-8 space-y-3 my-4">
            <li>Mantiene coherencia en <strong className="font-medium">toda</strong> la boda.</li>
            <li>Resuelve bien momentos difíciles (luz mala, espacios pequeños, emociones reales).</li>
            <li>No depende solo de 5 fotos espectaculares.</li>
          </ul>
          <p>Pide ver bodas completas: Desde la sesión casual y el Getting ready, hasta el final de la fiesta. Si todo se ve sólido, consistente y honesto, vas por buen camino.</p>

          <h3 className="text-2xl md:text-3xl mt-12 font-serif font-light text-foreground/90">3. Identifica si su estilo es realmente un estilo</h3>
          <p>Hay una diferencia enorme entre: “me adapto a todo” y “tengo una forma clara de ver”.</p>
          <p>Un fotógrafo con estilo:</p>
          <ul className="list-disc pl-8 space-y-3 my-4">
            <li>No imita modas cada temporada.</li>
            <li>Sus fotos se reconocen aunque no tengan firma.</li>
            <li>No dispara por disparar: decide.</li>
          </ul>
          <p>Esto es clave porque: Un estilo definido atrae a los clientes correctos y aleja a los equivocados. (Y eso es bueno para ambos).</p>

          <h3 className="text-2xl md:text-3xl mt-12 font-serif font-light text-foreground/90">4. Pregunta cómo trabaja… no solo qué entrega</h3>
          <p>Más allá del número de fotos o el tiempo de cobertura, pregunta cosas como:</p>
          <ul className="list-disc pl-8 space-y-3 my-4">
            <li>¿Interviene mucho o solo observa?</li>
            <li>¿Dirige momentos o espera a que sucedan?</li>
            <li>¿Qué tan importante es la luz para él/ella?</li>
            <li>¿Cómo maneja los momentos incómodos o caóticos?</li>
          </ul>
          <p>La experiencia durante la boda importa tanto como el resultado final. Este es un punto clave para platicar con Tu fotógrafo: Sabe cuándo acercarse, cuándo desaparecer y cuándo no estorbar un momento real.</p>

          <h3 className="text-2xl md:text-3xl mt-12 font-serif font-light text-foreground/90">5. Confía en tu intuición (pero con criterio)</h3>
          <p>Si al ver su trabajo sientes algo —aunque no sepas explicarlo—, ahí hay una señal.</p>
          <p>Las fotos de boda no solo deben verse “bonitas”. Deben sentirse honestas, atemporales y tuyas. Si todo se ve demasiado perfecto, demasiado posado o demasiado parecido a otras bodas… pregúntate si eso es lo que quieres recordar.</p>

          <h3 className="text-2xl md:text-3xl mt-12 font-serif font-light text-foreground/90">6. El fotógrafo no es un proveedor más</h3>
          <p>Es la persona que va a estar cerca en los momentos más íntimos del día, cuando estás nerviosa, cuando alguien llora, cuando algo no sale como esperabas. Así que si además sienten que hay click entre ustedes y tu fotógrafo. ¡Ya es ganancia!</p>
          <p>Elegir bien es elegir a alguien en quien puedas confiar, no solo alguien que “entregue”.</p>

          <hr className="my-16 border-border" />

          <h3 className="text-3xl md:text-4xl mt-4 font-serif font-light text-foreground/90 text-center">En resumen</h3>
          <p className="text-center text-xl">Elegir al fotógrafo de tu boda es elegir una mirada, una sensibilidad, una forma de contar tu historia.</p>
          <p className="text-center text-xl italic font-serif">Las fotos se quedan para siempre.</p>

          <div className="bg-muted/50 p-12 mt-16 border border-border flex flex-col items-center text-center">
            <p className="mb-8 text-foreground/70">
              📩 Si estás buscando un fotógrafo en Ciudad Juárez y te importa el estilo, la narrativa y las imágenes que envejecen bien, puedes conocer más de mi trabajo aquí:
            </p>
            <a href="/portfolio" className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-80 transition-colors">
              Fotógrafo de bodas en Ciudad Juárez
            </a>
          </div>

        </div>
      </article>
      
    </main>
  );
}

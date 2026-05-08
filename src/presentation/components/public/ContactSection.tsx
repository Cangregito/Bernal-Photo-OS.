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

const FacebookIcon = ({ className }: { className?: string }) => (
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
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export function ContactSection() {
  return (
    <section className="w-full bg-background text-foreground py-32 px-4 flex flex-col items-center transition-colors duration-300" id="contact">
      <div className="max-w-4xl w-full">
        
        {/* Header Text */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
            Comencemos su Viaje
          </h2>
          <p className="text-sm font-medium mb-2">
            ¡Conéctate con nosotros para capturar cada momento especial!
          </p>
          <p className="text-sm font-light text-foreground/70 leading-relaxed max-w-3xl">
            ¿Listos para inmortalizar los momentos más preciosos de su gran día? ¡Estamos aquí para ustedes! 
            Ya sea que deseen reservar su sesión de fotos, tengan preguntas o simplemente quieran platicar 
            sobre sus ideas, ¡no duden en contactarnos! Nos emociona escuchar sobre su historia de amor 
            y trabajar juntos para crear recuerdos que duren toda la vida.
          </p>
        </div>

        {/* Form Container */}
        <div className="border border-border p-8 md:p-16">
          <form className="flex flex-col space-y-10">
            
            {/* Name */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="name" className="font-serif italic text-lg text-foreground/80">
                Tu nombre *
              </label>
              <input 
                type="text" 
                id="name" 
                required
                className="border border-border p-3 bg-background focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="email" className="font-serif italic text-lg text-foreground/80">
                Dirección de correo *
              </label>
              <input 
                type="email" 
                id="email" 
                required
                className="border border-border p-3 bg-background focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>

            {/* Session Type (Radios) */}
            <div className="flex flex-col space-y-4">
              <label className="font-serif italic text-lg text-foreground/80">
                ¿Qué tipo de sesión buscas?
              </label>
              <div className="flex flex-col space-y-3">
                {['Boda', 'Compromiso', 'Editorial / Moda', 'Casual'].map((type) => (
                  <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded-full border border-border flex items-center justify-center group-hover:border-foreground transition-colors">
                      <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-foreground/20 transition-colors"></div>
                    </div>
                    <input type="radio" name="session_type" value={type} className="hidden" />
                    <span className="text-sm font-light">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* How did you hear about me? (Select) */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="source" className="font-serif italic text-lg text-foreground/80">
                ¿Cómo te enteraste de nosotros?
              </label>
              <div className="relative">
                <select 
                  id="source" 
                  className="w-full border border-border p-3 bg-background appearance-none focus:outline-none focus:border-foreground/30 transition-colors text-sm font-light"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="friend">Recomendación</option>
                  <option value="google">Google</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="message" className="font-serif italic text-lg text-foreground/80">
                Mensaje *
              </label>
              <textarea 
                id="message" 
                rows={6}
                required
                className="border border-border p-3 bg-background focus:outline-none focus:border-foreground/30 transition-colors resize-none"
              ></textarea>
            </div>

            {/* Submit & Socials */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 gap-8">
              <button 
                type="submit"
                className="bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] font-medium uppercase hover:opacity-80 transition-colors self-start"
              >
                ENVIAR MENSAJE
              </button>

              <div className="flex items-center space-x-6">
                <span className="text-xs uppercase tracking-widest font-medium text-foreground/50">Síguenos</span>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-foreground transition-colors">
                  <InstagramIcon className="w-5 h-5 stroke-1" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-foreground transition-colors">
                  <FacebookIcon className="w-5 h-5 stroke-1" />
                </a>
              </div>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}

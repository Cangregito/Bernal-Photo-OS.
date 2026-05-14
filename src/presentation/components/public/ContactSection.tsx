'use client';

import { useState, FormEvent } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export function ContactSection() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    sessionType: '',
    source: '',
    message: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Error enviando mensaje');
      setStatus('success');
      setForm({ name: '', email: '', phone: '', eventDate: '', sessionType: '', source: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className="w-full bg-background text-foreground py-32 px-4 flex flex-col items-center transition-colors duration-300" id="contact">
        <div className="max-w-lg text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-8" />
          <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">¡Mensaje Recibido!</h2>
          <p className="text-foreground/70 text-lg font-light mb-8">
            Gracias por tu interés. Te responderemos en las próximas 24 horas.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="text-sm tracking-[0.2em] uppercase text-foreground/50 hover:text-foreground transition-colors underline underline-offset-4"
          >
            Enviar otro mensaje
          </button>
        </div>
      </section>
    );
  }

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
            ¿Listos para inmortalizar los momentos más preciosos de su gran día? Estamos aquí para ustedes.
            Ya sea que deseen reservar su sesión de fotos, tengan preguntas o simplemente quieran platicar
            sobre sus ideas, ¡no duden en contactarnos!
          </p>
        </div>

        {/* Direct Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <a href="mailto:admin@bernalphoto.com" className="flex items-center gap-3 text-sm text-foreground/70 hover:text-foreground transition-colors group">
            <Send className="w-4 h-4 stroke-1 group-hover:translate-x-0.5 transition-transform" />
            admin@bernalphoto.com
          </a>
          <a href="tel:+526561234567" className="flex items-center gap-3 text-sm text-foreground/70 hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
            +52 656 123 4567
          </a>
          <a href="https://wa.me/526561234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground/70 hover:text-foreground transition-colors">
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
          </a>
        </div>

        {/* Form Container */}
        <div className="border border-border p-8 md:p-16">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-10">

            {/* Row: Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-2">
                <label htmlFor="contact-name" className="font-serif italic text-lg text-foreground/80">
                  Tu nombre *
                </label>
                <input
                  type="text"
                  id="contact-name"
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="border border-border p-3 bg-background focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="contact-email" className="font-serif italic text-lg text-foreground/80">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  id="contact-email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="border border-border p-3 bg-background focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
            </div>

            {/* Row: Phone + Event Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-2">
                <label htmlFor="contact-phone" className="font-serif italic text-lg text-foreground/80">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="contact-phone"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="border border-border p-3 bg-background focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="contact-date" className="font-serif italic text-lg text-foreground/80">
                  Fecha tentativa del evento
                </label>
                <input
                  type="date"
                  id="contact-date"
                  value={form.eventDate}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  className="border border-border p-3 bg-background focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
            </div>

            {/* Session Type (Radios) */}
            <div className="flex flex-col space-y-4">
              <label className="font-serif italic text-lg text-foreground/80">
                ¿Qué tipo de sesión buscas?
              </label>
              <div className="flex flex-wrap gap-4">
                {['Boda', 'Compromiso', 'Editorial / Moda', 'Casual', 'Corporativo'].map((type) => (
                  <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      form.sessionType === type ? 'border-foreground' : 'border-border group-hover:border-foreground'
                    }`}>
                      <div className={`w-2 h-2 rounded-full transition-colors ${
                        form.sessionType === type ? 'bg-foreground' : 'bg-transparent group-hover:bg-foreground/20'
                      }`} />
                    </div>
                    <input
                      type="radio"
                      name="session_type"
                      value={type}
                      checked={form.sessionType === type}
                      onChange={() => handleChange('sessionType', type)}
                      className="hidden"
                    />
                    <span className="text-sm font-light">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* How did you hear about me? */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="contact-source" className="font-serif italic text-lg text-foreground/80">
                ¿Cómo te enteraste de nosotros?
              </label>
              <div className="relative">
                <select
                  id="contact-source"
                  value={form.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className="w-full border border-border p-3 bg-background appearance-none focus:outline-none focus:border-foreground/30 transition-colors text-sm font-light"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="friend">Recomendación</option>
                  <option value="google">Google</option>
                  <option value="other">Otro</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="contact-message" className="font-serif italic text-lg text-foreground/80">
                Cuéntanos sobre tu evento *
              </label>
              <textarea
                id="contact-message"
                rows={6}
                required
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Platícanos sobre tu historia, el lugar, la fecha y cualquier detalle que nos ayude a conocer tu visión..."
                className="border border-border p-3 bg-background focus:outline-none focus:border-foreground/30 transition-colors resize-none placeholder:text-foreground/30"
              />
            </div>

            {/* Error message */}
            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 rounded-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">Hubo un error al enviar tu mensaje. Intenta de nuevo o contáctanos por WhatsApp.</p>
              </div>
            )}

            {/* Submit & Socials */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 gap-8">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] font-medium uppercase hover:opacity-80 transition-all self-start disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'ENVIAR MENSAJE'
                )}
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

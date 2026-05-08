import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';
import { ContactSection } from '@/presentation/components/public/ContactSection';

export const metadata = {
  title: 'Contacto | Bernal Photo',
  description: 'Ponte en contacto con nosotros para capturar tus momentos más especiales.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pt-32">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContactSection />
      </div>
    </main>
  );
}

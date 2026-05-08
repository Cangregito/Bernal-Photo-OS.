import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';
import { BlogSection } from '@/presentation/components/public/BlogSection';

export const metadata = {
  title: 'Historias | Bernal Photo',
  description: 'Explora nuestras historias editoriales y descubre cómo capturamos la esencia de cada momento.',
};

export default function StoriesPage() {
  return (
    <main className="min-h-screen bg-background pt-32">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlogSection />
      </div>
    </main>
  );
}

import { PublicNavbar } from '@/presentation/components/public/PublicNavbar';
import { EditorialGrid } from '@/presentation/components/public/EditorialGrid';

interface Story {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  aspect_ratio: 'portrait' | 'square' | 'landscape';
}

const mockStories: Story[] = [
  { id: '1', image_url: '/gallery_1.png', title: 'Hacienda', subtitle: 'Boda', aspect_ratio: 'portrait' },
  { id: '2', image_url: '/hero_wedding.png', title: 'Playa', subtitle: 'Boda', aspect_ratio: 'portrait' },
  { id: '3', image_url: '/portrait_photographer.png', title: 'Civil', subtitle: 'Intima', aspect_ratio: 'portrait' },
  { id: '4', image_url: '/gallery_1.png', title: 'Fiesta', subtitle: 'Recepción', aspect_ratio: 'square' },
  { id: '5', image_url: '/hero_wedding.png', title: 'Amalfi', subtitle: 'Elopement', aspect_ratio: 'landscape' },
  { id: '6', image_url: '/gallery_1.png', title: 'Vogue', subtitle: 'Editorial', aspect_ratio: 'landscape' },
  { id: '7', image_url: '/hero_wedding.png', title: 'Detalles', subtitle: 'Preparativos', aspect_ratio: 'landscape' },
  { id: '8', image_url: '/portrait_photographer.png', title: 'Retrato', subtitle: 'Novia', aspect_ratio: 'portrait' },
  { id: '9', image_url: '/camera_gear.png', title: 'Anillos', subtitle: 'Detalles', aspect_ratio: 'landscape' },
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <PublicNavbar />
      <EditorialGrid stories={mockStories} />
    </main>
  );
}

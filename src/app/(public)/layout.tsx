import { PublicFooter } from '@/presentation/components/public/PublicFooter';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Bernal Photo',
  description: 'Fotografía profesional de bodas, retratos y eventos en Ciudad Juárez, Chihuahua.',
  url: 'https://bernalphoto.com',
  telephone: '+526561234567',
  email: 'admin@bernalphoto.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ciudad Juárez',
    addressRegion: 'Chihuahua',
    addressCountry: 'MX',
  },
  priceRange: '$$$',
  image: 'https://bernalphoto.com/logo.png',
  sameAs: [
    'https://instagram.com/bernalphoto',
    'https://facebook.com/bernalphoto',
  ],
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex-grow">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}

import { PublicFooter } from '@/presentation/components/public/PublicFooter';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex-grow">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}

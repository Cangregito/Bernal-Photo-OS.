import { Sidebar } from "@/presentation/components/layout/Sidebar";
import { Header } from "@/presentation/components/layout/Header";
import { redirect } from 'next/navigation';
import { getServerAuthContext } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerAuthContext();

  if (auth.isConfigured) {
    if (!auth.userId) {
      redirect('/login?redirect=/dashboard');
    }

    if (auth.role !== 'admin') {
      redirect('/unauthorized');
    }

    if (auth.twoFactorAuthEnabled && auth.currentAal !== 'aal2') {
      redirect('/mfa?next=/dashboard');
    }
  }

  return (
    <div className="dark h-full flex overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

import { Sidebar } from "@/presentation/components/layout/Sidebar";
import { Header } from "@/presentation/components/layout/Header";
import { redirect } from 'next/navigation';
import { getServerAuthContext, logServerSecurityEvent } from '@/lib/auth';

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
      await logServerSecurityEvent({
        userId: auth.userId,
        action: 'admin_access_denied',
        metadata: {
          reason: 'role_not_admin',
          target: '/dashboard',
          role: auth.role,
        },
      });
      redirect('/unauthorized');
    }

    if (auth.currentAal !== 'aal2') {
      await logServerSecurityEvent({
        userId: auth.userId,
        action: 'mfa_required',
        metadata: {
          reason: 'aal2_required',
          target: '/dashboard',
          currentAal: auth.currentAal,
          nextAal: auth.nextAal,
        },
      });
      redirect('/mfa?next=/dashboard');
    }
  }

  return (
    <div className="dark h-full flex overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

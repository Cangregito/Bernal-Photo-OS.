'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Camera, FileText, Settings, LogOut } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users },
  { name: 'Sesiones', href: '/dashboard/sessions', icon: Camera },
  { name: 'Cotizaciones', href: '/dashboard/quotes', icon: FileText },
  { name: 'Contratos', href: '/dashboard/contracts', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://dummy.supabase.co') {
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r border-border flex flex-col hidden md:flex">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-lg font-semibold tracking-wider text-foreground">
          BERNAL<span className="text-muted-foreground ml-1">OS</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                active
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 transition-colors ${
                active ? 'text-emerald-400' : 'text-muted-foreground group-hover:text-foreground'
              }`} />
              {item.name}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/dashboard/settings"
          className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
            isActive('/dashboard/settings')
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <Settings className={`w-5 h-5 mr-3 transition-colors ${
            isActive('/dashboard/settings') ? 'text-emerald-400' : 'text-muted-foreground group-hover:text-foreground'
          }`} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors group cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3 text-red-400/50 group-hover:text-red-400 transition-colors" />
          Logout
        </button>
      </div>
    </aside>
  );
}

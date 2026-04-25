import Link from 'next/link';
import { LayoutDashboard, Users, Camera, FileText, Settings, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users },
  { name: 'Sesiones', href: '/dashboard/sessions', icon: Camera },
  { name: 'Cotizaciones', href: '/dashboard/quotes', icon: FileText },
  { name: 'Contratos', href: '/dashboard/contracts', icon: FileText },
];

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r border-white/5 flex flex-col hidden md:flex">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <h1 className="text-lg font-semibold tracking-wider text-white">
          BERNAL<span className="text-white/50 ml-1">OS</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors group"
            >
              <Icon className="w-5 h-5 mr-3 text-white/50 group-hover:text-white transition-colors" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors group">
          <Settings className="w-5 h-5 mr-3 text-white/50 group-hover:text-white transition-colors" />
          Settings
        </button>
        <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors group">
          <LogOut className="w-5 h-5 mr-3 text-red-400/50 group-hover:text-red-400 transition-colors" />
          Logout
        </button>
      </div>
    </aside>
  );
}

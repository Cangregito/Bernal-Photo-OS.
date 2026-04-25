import { Bell, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 glass-panel z-10 sticky top-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Buscar clientes, sesiones o contratos..." 
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6">
        <button className="relative text-white/60 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>
        
        {/* User Profile Placeholder */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center border border-white/10">
            <span className="text-xs font-medium text-white">BP</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white/90">Bernal Photo</p>
            <p className="text-xs text-white/50">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

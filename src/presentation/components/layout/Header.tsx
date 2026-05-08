'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, Settings, User, ChevronDown, Camera, FileSignature, Calendar, X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface Notification {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

export function Header() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://dummy.supabase.co';

  const fetchNotifications = async () => {
    if (!hasSupabase) return;
    setLoadingNotifs(true);
    try {
      const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const mapped: Notification[] = (data || []).map(log => {
        let title = 'Actividad';
        let description = 'Nueva actividad en el sistema';
        let Icon = Bell;
        let iconColor = 'text-zinc-400 bg-zinc-400/10';

        if (log.action === 'signed' && log.entity === 'contract') {
          title = 'Contrato Firmado';
          description = `Se firmó el contrato ${log.metadata?.clientName || ''}`;
          Icon = FileSignature;
          iconColor = 'text-emerald-400 bg-emerald-400/10';
        } else if (log.action === 'created' && log.entity === 'quote') {
          title = 'Cotización Creada';
          description = `Nueva cotización para ${log.metadata?.clientName || ''}`;
          Icon = Search;
          iconColor = 'text-blue-400 bg-blue-400/10';
        } else if (log.action === 'created' && log.entity === 'session') {
          title = 'Nueva Sesión';
          description = `Sesión programada: ${log.metadata?.type || 'Evento'}`;
          Icon = Calendar;
          iconColor = 'text-amber-400 bg-amber-400/10';
        }

        // Relative time helper
        const date = new Date(log.created_at);
        const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let time = 'Reciente';
        if (diff < 60) time = 'Hace unos segundos';
        else if (diff < 3600) time = `Hace ${Math.floor(diff / 60)} min`;
        else if (diff < 86400) time = `Hace ${Math.floor(diff / 3600)} horas`;
        else time = date.toLocaleDateString();

        return {
          id: log.id,
          icon: Icon,
          iconColor,
          title,
          description,
          time,
          unread: true, // For now, we can implement unread status in DB later
        };
      });

      setNotifications(mapped);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (hasSupabase) {
      const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  const navigateTo = (path: string) => {
    setShowProfile(false);
    router.push(path);
  };

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 glass-panel z-30 sticky top-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar clientes, sesiones o contratos..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-zinc-900 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-zinc-100">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
                    Marcar todas como leídas
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                    No hay notificaciones.
                  </div>
                ) : (
                  notifications.map(notif => {
                    const Icon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors group ${notif.unread ? 'bg-white/[0.02]' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-200">{notif.title}</p>
                            {notif.unread && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 truncate">{notif.description}</p>
                          <p className="text-xs text-zinc-500 mt-1">{notif.time}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-300 rounded transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center border border-white/10">
              <span className="text-xs font-medium text-white">BP</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white/90">Bernal Photo</p>
              <p className="text-xs text-white/50">Admin</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/40 hidden md:block transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* Profile Info */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-medium text-zinc-100">Bernal Photo</p>
                <p className="text-xs text-zinc-400">admin@bernalphoto.com</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button onClick={() => navigateTo('/dashboard/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                  <User className="w-4 h-4 text-zinc-500" />
                  Mi Perfil
                </button>
                <button onClick={() => navigateTo('/dashboard/settings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                  <Settings className="w-4 h-4 text-zinc-500" />
                  Configuración
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-white/5 py-1">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

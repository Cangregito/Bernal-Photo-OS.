'use client';

import { useState, useEffect } from 'react';
import { Bell, Shield, Palette, Globe, Save, Loader2, CheckCircle, Moon, Sun, AlertCircle, Download } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useTheme } from 'next-themes';

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  label: string;
  description: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${enabled ? 'bg-emerald-600' : 'bg-zinc-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    contractAlerts: true,
    language: 'es',
    currency: 'MXN',
    twoFactorAuth: false,
    autoBackup: true,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://dummy.supabase.co';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadSettings() {
      if (!hasSupabase) {
        setLoadingData(false);
        return;
      }
      try {
        const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await supabase.from('profiles').select('settings').eq('id', user.id).single();
          if (data?.settings) setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    loadSettings();
  }, [hasSupabase, supabaseUrl, supabaseAnonKey]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (hasSupabase && userId) {
        const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
        const { error: err } = await supabase.from('profiles').update({ settings, updated_at: new Date().toISOString() }).eq('id', userId);
        if (err) throw err;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleManualBackup = async () => {
    setExporting(true);
    try {
      const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
      
      // Fetch all core data for backup
      const [clients, contracts, sessions, quotes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('contracts').select('*'),
        supabase.from('sessions').select('*'),
        supabase.from('quotes').select('*'),
      ]);

      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          clients: clients.data || [],
          contracts: contracts.data || [],
          sessions: sessions.data || [],
          quotes: quotes.data || [],
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bernal_photo_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('✅ Backup generado y descargado correctamente.');
    } catch (err) {
      console.error(err);
      alert('Error al generar backup');
    } finally {
      setExporting(false);
    }
  };

  if (!mounted || loadingData) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-white">Configuración</h2>
        <p className="text-sm text-zinc-400">Administra tus preferencias y seguridad.</p>
      </div>

      <div className="space-y-6">
        {/* Notificaciones */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
            <Bell className="w-4 h-4" /> Notificaciones por Correo
          </h3>
          
          <div className="space-y-4">
            <Toggle enabled={settings.emailNotifications} onChange={() => toggleSetting('emailNotifications')} label="Resumen Diario" description="Reporte de actividad del día." />
            <Toggle enabled={settings.sessionReminders} onChange={() => toggleSetting('sessionReminders')} label="Recordatorios" description="Avisos de próximas sesiones." />
            <Toggle enabled={settings.contractAlerts} onChange={() => toggleSetting('contractAlerts')} label="Alertas de Firma" description="Aviso cuando un cliente firma." />
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
            <Palette className="w-4 h-4" /> Apariencia
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-200">Tema actual: <span className="capitalize">{resolvedTheme}</span></p>
            <div className="flex bg-zinc-800 rounded p-1">
              <button onClick={() => setTheme('dark')} className={`p-2 rounded ${resolvedTheme === 'dark' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}><Moon className="w-4 h-4" /></button>
              <button onClick={() => setTheme('light')} className={`p-2 rounded ${resolvedTheme === 'light' ? 'bg-white text-zinc-900' : 'text-zinc-500'}`}><Sun className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Regional */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
            <Globe className="w-4 h-4" /> Regional
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <select value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))} className="bg-zinc-800 text-white rounded p-2 text-sm">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
            <select value={settings.currency} onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))} className="bg-zinc-800 text-white rounded p-2 text-sm">
              <option value="MXN">Pesos (MXN)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
            <Shield className="w-4 h-4" /> Seguridad y Respaldo
          </h3>
          <Toggle enabled={settings.twoFactorAuth} onChange={() => toggleSetting('twoFactorAuth')} label="MFA / 2FA" description="Doble factor (Configurar en Supabase Auth)." />
          
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-3 italic">Nota: El respaldo automático se ejecuta diariamente. Puedes descargar uno manual ahora:</p>
            <button 
              onClick={handleManualBackup} 
              disabled={exporting}
              className="flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded transition-colors"
            >
              {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Descargar Respaldo JSON Completo
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4 mt-8">
        {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</span>}
        {saved && <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Cambios guardados</span>}
        <button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-medium flex items-center gap-2 disabled:bg-zinc-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
}

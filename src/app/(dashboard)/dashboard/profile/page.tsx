'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Save, Loader2, CheckCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function ProfilePage() {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: 'Bernal Photo',
    email: 'admin@bernalphoto.com',
    phone: '+52 55 1234 5678',
    businessName: 'Bernal Photo Studio',
    specialty: 'Bodas y Eventos',
    bio: 'Fotografía profesional con más de 10 años de experiencia capturando momentos únicos. Especialista en bodas, retratos y eventos corporativos.',
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://dummy.supabase.co';

  useEffect(() => {
    async function loadProfile() {
      if (!hasSupabase) {
        setLoadingData(false);
        return;
      }

      const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setForm(prev => ({
            ...prev,
            fullName: data.full_name || prev.fullName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            businessName: data.business_name || prev.businessName,
            // Las siguientes podrían estar en settings o en la tabla si decidimos agregarlas
            // Por ahora simulamos que están allí o se mantienen en fallback
          }));
        }
      }
      setLoadingData(false);
    }
    loadProfile();
  }, [hasSupabase, supabaseUrl, supabaseAnonKey]);

  const handleSave = async () => {
    setSaving(true);
    
    if (hasSupabase && userId) {
      const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
      await supabase
        .from('profiles')
        .update({
          full_name: form.fullName,
          business_name: form.businessName,
          email: form.email,
          phone: form.phone
        })
        .eq('id', userId);
    } else {
      // Simulación: en dev sin supabase
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Mi Perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">Administra tu información personal y profesional.</p>
      </div>

      {/* Avatar + Nombre */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center border-2 border-border">
              <span className="text-2xl font-bold text-foreground">BP</span>
            </div>
            <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{form.fullName}</h3>
            <p className="text-sm text-muted-foreground">{form.email}</p>
            <span className="inline-block mt-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Admin</span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="glass-card rounded-xl p-6 border border-border space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" /> Información Personal
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre completo</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              className="w-full bg-popover border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre del negocio</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => updateField('businessName', e.target.value)}
              className="w-full bg-popover border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3" /> Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full bg-popover border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3" /> Teléfono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full bg-popover border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Especialidad</label>
          <input
            type="text"
            value={form.specialty}
            onChange={(e) => updateField('specialty', e.target.value)}
            className="w-full bg-popover border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Biografía profesional</label>
          <textarea
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            rows={3}
            className="w-full bg-popover border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-400 animate-in fade-in duration-300">
              <CheckCircle className="w-4 h-4" /> Guardado
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted text-foreground px-5 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

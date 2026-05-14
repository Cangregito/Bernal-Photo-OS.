'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Loader2, Eye, EyeOff, SlidersHorizontal } from 'lucide-react';

interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  is_active: boolean;
  display_order: number;
}

const emptyForm = { image_url: '', title: '', subtitle: '', is_active: true, display_order: 0 };

export default function HeroPage() {
  const [items, setItems] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/hero');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const body = editId ? { ...form, id: editId } : form;
      await fetch('/api/cms/hero', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setShowForm(false); setEditId(null); setForm(emptyForm);
      await fetchItems();
    } catch { /* skip */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este slide?')) return;
    await fetch(`/api/cms/hero?id=${id}`, { method: 'DELETE' });
    await fetchItems();
  };

  const handleEdit = (item: HeroSlide) => {
    setEditId(item.id);
    setForm({ image_url: item.image_url, title: item.title || '', subtitle: item.subtitle || '', is_active: item.is_active, display_order: item.display_order });
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Hero / Slider</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las imágenes del slider principal de tu página de inicio.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Slide
        </button>
      </div>

      {showForm && (
        <div className="mb-8 border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-foreground">{editId ? 'Editar Slide' : 'Nuevo Slide'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">URL de la imagen *</label>
              <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="https://...supabase.co/storage/v1/.../hero.jpg" />
            </div>
            {form.image_url && (
              <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-lg font-serif">{form.title || 'Título aquí'}</p>
                    <p className="text-xs tracking-widest uppercase mt-1">{form.subtitle || 'Subtítulo'}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Título (opcional)</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Fotógrafo en Ciudad Juárez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Subtítulo (opcional)</label>
                <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Fotografía de Bodas" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-border" />
                <span className="text-sm text-muted-foreground">Activo</span>
              </label>
              <div>
                <label className="text-sm text-muted-foreground mr-2">Orden:</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  className="w-16 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.image_url}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-3" /> Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <SlidersHorizontal className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No hay slides todavía. Se usarán las imágenes por defecto.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-4 border rounded-xl overflow-hidden transition-colors ${
              item.is_active ? 'border-border bg-card' : 'border-border/50 bg-card/50 opacity-50'
            }`}>
              <div className="w-48 h-28 flex-shrink-0 bg-muted">
                <img src={item.image_url} alt={item.title || `Slide ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 py-3">
                <p className="text-sm font-medium text-foreground">{item.title || '(Sin título)'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle || '(Sin subtítulo)'}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">Orden: {item.display_order}</p>
              </div>
              <div className="flex items-center gap-1 pr-4">
                {item.is_active ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                <button onClick={() => handleEdit(item)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-red-400 rounded-lg hover:bg-red-400/10"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

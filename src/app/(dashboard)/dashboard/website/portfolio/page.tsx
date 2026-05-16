'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit3, Save, X, Loader2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { ImageUploader } from '@/presentation/components/ui/ImageUploader';

interface PortfolioImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm = { image_url: '', alt_text: '', display_order: 0, is_active: true };

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/cms/portfolio', { signal: controller.signal });
        const data = await res.json();
        if (Array.isArray(data)) setItems(data);
      } catch { /* skip */ }
      setLoading(false);
    })();
    return () => controller.abort();
  }, [refreshKey]);

  const refetch = () => { setLoading(true); setRefreshKey((k) => k + 1); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const body = editId ? { ...form, id: editId } : form;
      await fetch('/api/cms/portfolio', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      refetch();
    } catch { /* skip */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    await fetch(`/api/cms/portfolio?id=${id}`, { method: 'DELETE' });
    refetch();
  };

  const handleEdit = (item: PortfolioImage) => {
    setEditId(item.id);
    setForm({ image_url: item.image_url, alt_text: item.alt_text || '', display_order: item.display_order, is_active: item.is_active });
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Portafolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las imágenes que aparecen en tu galería del portafolio.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva Imagen
        </button>
      </div>

      {showForm && (
        <div className="mb-8 border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-foreground">{editId ? 'Editar Imagen' : 'Nueva Imagen'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Fotografía *</label>
              <ImageUploader 
                defaultValue={form.image_url} 
                onUpload={(url) => setForm({ ...form, image_url: url })} 
                folder="portfolio" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Texto alternativo (SEO)</label>
                <input type="text" value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Boda en hacienda al atardecer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Orden</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-border" />
                  <span className="text-sm text-muted-foreground">Visible</span>
                </label>
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
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No hay imágenes en el portafolio todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className={`relative group rounded-xl overflow-hidden border transition-all ${
              item.is_active ? 'border-border' : 'border-border/50 opacity-50'
            }`}>
              <div className="aspect-square bg-muted relative">
                <Image src={item.image_url} alt={item.alt_text} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => handleEdit(item)} className="p-2.5 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-500/30 hover:bg-red-500/60 rounded-lg text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 right-2">
                {item.is_active ? <Eye className="w-4 h-4 text-emerald-400 drop-shadow-md" /> : <EyeOff className="w-4 h-4 text-white/50 drop-shadow-md" />}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{item.alt_text || 'Sin descripción'}</p>
                <p className="text-[10px] text-white/50">Orden: {item.display_order}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

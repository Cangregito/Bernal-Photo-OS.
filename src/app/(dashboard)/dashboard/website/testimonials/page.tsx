'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Loader2, GripVertical, Eye, EyeOff, Star } from 'lucide-react';
import { ImageUploader } from '@/presentation/components/ui/ImageUploader';

interface Testimonial {
  id: string;
  quote: string;
  couple_name: string;
  session_type: string;
  location: string;
  photo_url?: string;
  is_active: boolean;
  display_order: number;
}

const emptyForm = { quote: '', couple_name: '', session_type: '', location: '', photo_url: '', is_active: true, display_order: 0 };

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
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
        const res = await fetch('/api/cms/testimonials', { signal: controller.signal });
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
      await fetch('/api/cms/testimonials', {
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
    if (!confirm('¿Eliminar este testimonio?')) return;
    await fetch(`/api/cms/testimonials?id=${id}`, { method: 'DELETE' });
    refetch();
  };

  const handleEdit = (item: Testimonial) => {
    setEditId(item.id);
    setForm({
      quote: item.quote,
      couple_name: item.couple_name,
      session_type: item.session_type || '',
      location: item.location || '',
      photo_url: item.photo_url || '',
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Testimonios</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los testimonios que aparecen en tu sitio web.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Testimonio
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="mb-8 border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-foreground">
              {editId ? 'Editar Testimonio' : 'Nuevo Testimonio'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Foto de la Pareja</label>
                <ImageUploader 
                  defaultValue={form.photo_url} 
                  onUpload={(url) => setForm({ ...form, photo_url: url })} 
                  folder="testimonials" 
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Testimonio *</label>
              <textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                placeholder="Las fotografías superaron todas nuestras expectativas..."
              />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nombre de la pareja *</label>
                <input
                  type="text"
                  value={form.couple_name}
                  onChange={(e) => setForm({ ...form, couple_name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Ana & Carlos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Tipo de sesión</label>
                <input
                  type="text"
                  value={form.session_type}
                  onChange={(e) => setForm({ ...form, session_type: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Boda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Ubicación</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Ciudad Juárez, Chih."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Orden</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-muted-foreground">Visible en la página</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.quote || !form.couple_name}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No hay testimonios todavía.</p>
          <p className="text-muted-foreground/50 text-xs mt-1">Haz clic en &quot;Nuevo Testimonio&quot; para agregar uno.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-5 border rounded-xl transition-colors ${
                item.is_active ? 'border-border bg-card' : 'border-border/50 bg-card/50 opacity-60'
              }`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-1 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed mb-2 line-clamp-2">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium">{item.couple_name}</span>
                  {item.session_type && <><span>·</span><span>{item.session_type}</span></>}
                  {item.location && <><span>·</span><span>{item.location}</span></>}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {item.is_active ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

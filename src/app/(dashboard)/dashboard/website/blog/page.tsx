'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Loader2, Eye, EyeOff, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  is_published: boolean;
  published_at: string;
  testimonial_quote: string;
  testimonial_author: string;
}

const emptyForm = {
  slug: '', title: '', excerpt: '', content: '', cover_image: '',
  category: '', is_published: false, testimonial_quote: '', testimonial_author: '',
};

export default function BlogPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/blog');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const body = editId
        ? { ...form, id: editId, published_at: form.is_published ? new Date().toISOString() : null }
        : { ...form, published_at: form.is_published ? new Date().toISOString() : null };
      await fetch('/api/cms/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setShowForm(false); setEditId(null); setForm(emptyForm);
      await fetchItems();
    } catch { /* skip */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este post?')) return;
    await fetch(`/api/cms/blog?id=${id}`, { method: 'DELETE' });
    await fetchItems();
  };

  const handleEdit = (item: BlogPost) => {
    setEditId(item.id);
    setForm({
      slug: item.slug, title: item.title, excerpt: item.excerpt || '', content: item.content || '',
      cover_image: item.cover_image || '', category: item.category || '', is_published: item.is_published,
      testimonial_quote: item.testimonial_quote || '', testimonial_author: item.testimonial_author || '',
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blog / Historias</h1>
          <p className="text-sm text-muted-foreground mt-1">Crea y edita las historias que aparecen en tu sección de blog.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nueva Historia
        </button>
      </div>

      {showForm && (
        <div className="mb-8 border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-foreground">{editId ? 'Editar Historia' : 'Nueva Historia'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Título *</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: editId ? form.slug : generateSlug(e.target.value) })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="La boda de Ana & Carlos" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Slug (URL)</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="la-boda-de-ana-carlos" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Categoría</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                  <option value="">Seleccionar</option>
                  <option value="Bodas">Bodas</option>
                  <option value="Sesiones">Sesiones</option>
                  <option value="Editorial">Editorial</option>
                  <option value="Guías">Guías</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Imagen de portada (URL)</label>
                <input type="text" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="https://..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Extracto (vista previa)</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                placeholder="Breve descripción del post..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Contenido completo</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y"
                placeholder="Escribe la historia completa aquí. Usa doble salto de línea para separar párrafos..." />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Testimonio del cliente (opcional)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input type="text" value={form.testimonial_quote} onChange={(e) => setForm({ ...form, testimonial_quote: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Las fotos capturaron exactamente quiénes somos..." />
                </div>
                <div>
                  <input type="text" value={form.testimonial_author} onChange={(e) => setForm({ ...form, testimonial_author: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Ana & Carlos" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded border-border" />
                <span className="text-sm text-muted-foreground">Publicar</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.slug}
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
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No hay historias todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`flex items-center gap-4 border rounded-xl overflow-hidden transition-colors ${
              item.is_published ? 'border-border bg-card' : 'border-border/50 bg-card/50'
            }`}>
              {item.cover_image && (
                <div className="w-32 h-20 flex-shrink-0 bg-muted">
                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 py-3 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  {!item.is_published && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Borrador</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.category} · /{item.slug}</p>
              </div>
              <div className="flex items-center gap-1 pr-4">
                {item.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
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

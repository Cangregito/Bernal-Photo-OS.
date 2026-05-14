'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Loader2, Eye, EyeOff, DollarSign, GripVertical, Star } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  is_highlighted: boolean;
  is_active: boolean;
  display_order: number;
}

const emptyForm = {
  name: '', price: 0, currency: 'MXN', description: '',
  features: [''], is_highlighted: false, is_active: true, display_order: 0,
};

export default function PackagesPage() {
  const [items, setItems] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/packages');
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
      const body = editId ? { ...form, id: editId, features: form.features.filter(f => f.trim()) } : { ...form, features: form.features.filter(f => f.trim()) };
      await fetch('/api/cms/packages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      await fetchItems();
    } catch { /* skip */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este paquete?')) return;
    await fetch(`/api/cms/packages?id=${id}`, { method: 'DELETE' });
    await fetchItems();
  };

  const handleEdit = (item: Package) => {
    setEditId(item.id);
    setForm({
      name: item.name, price: item.price, currency: item.currency || 'MXN',
      description: item.description || '', features: (item.features && item.features.length > 0) ? item.features : [''],
      is_highlighted: item.is_highlighted, is_active: item.is_active, display_order: item.display_order,
    });
    setShowForm(true);
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] });
  const updateFeature = (idx: number, val: string) => {
    const updated = [...form.features];
    updated[idx] = val;
    setForm({ ...form, features: updated });
  };
  const removeFeature = (idx: number) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== idx) });
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Paquetes de Precios</h1>
          <p className="text-sm text-muted-foreground mt-1">Define los paquetes que ven tus clientes en la página de inversión.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Paquete
        </button>
      </div>

      {showForm && (
        <div className="mb-8 border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-foreground">
              {editId ? 'Editar Paquete' : 'Nuevo Paquete'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nombre *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Signature" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Precio *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="22000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Moneda</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                placeholder="Nuestra experiencia más solicitada..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Características incluidas</label>
              <div className="space-y-2">
                {form.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="text" value={f} onChange={(e) => updateFeature(idx, e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="8 horas de cobertura" />
                    {form.features.length > 1 && (
                      <button onClick={() => removeFeature(idx)} className="text-muted-foreground hover:text-red-400 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addFeature} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">
                  + Agregar característica
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_highlighted} onChange={(e) => setForm({ ...form, is_highlighted: e.target.checked })} className="rounded border-border" />
                <span className="text-sm text-muted-foreground">Destacar como &quot;Más Popular&quot;</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-border" />
                <span className="text-sm text-muted-foreground">Visible</span>
              </label>
              <div>
                <label className="text-sm text-muted-foreground mr-2">Orden:</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  className="w-16 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.price}
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
          <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No hay paquetes todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className={`relative border rounded-xl p-5 transition-colors ${
              item.is_highlighted ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-card'
            } ${!item.is_active ? 'opacity-50' : ''}`}>
              {item.is_highlighted && (
                <div className="absolute -top-2.5 left-4 bg-emerald-600 text-white px-3 py-0.5 text-[10px] tracking-wider uppercase rounded-full font-medium">
                  Popular
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xs tracking-widest uppercase text-muted-foreground font-medium">{item.name}</h3>
                <div className="flex gap-1">
                  {item.is_active ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  <button onClick={() => handleEdit(item)} className="text-muted-foreground hover:text-foreground"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground mb-2">${Number(item.price).toLocaleString()} <span className="text-xs text-muted-foreground">{item.currency}</span></p>
              {item.features && item.features.length > 0 && (
                <ul className="space-y-1 mt-3">
                  {(item.features as string[]).map((f: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

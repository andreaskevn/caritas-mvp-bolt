import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, ImagePlus, X } from 'lucide-react';
import { dbMenu, dbCategories, fmtCurrency } from '../lib/db';
import type { MenuItem } from '../lib/db';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { FullLoader } from '../components/Spinner';

const EMPTY: Omit<MenuItem, 'id'> = {
  name: '',
  description: '',
  price: 0,
  categoryId: '',
  image: '',
  stock: 0,
  available: true,
  cost: 0,
  sku: '',
};

export function MenuPage() {
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<Omit<MenuItem, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const items = useMemo(() => {
    let list = dbMenu.all();
    if (catFilter !== 'all') list = list.filter((m) => m.categoryId === catFilter);
    if (search) list = list.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [version, search, catFilter]);

  const categories = useMemo(() => dbCategories.all(), [version]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, categoryId: categories[0]?.id || '' });
    setModalOpen(true);
  };

  const openEdit = (m: MenuItem) => {
    setEditing(m);
    const { id, ...rest } = m;
    void id;
    setForm(rest);
    setModalOpen(true);
  };

  const onImageUpload = (file: File) => {
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Image too large (max 1.5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.name.trim() || form.price <= 0) {
      toast.error('Name and price are required');
      return;
    }
    if (!form.categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (editing) {
      dbMenu.update(editing.id, form);
      toast.success('Menu item updated');
    } else {
      dbMenu.add(form);
      toast.success('Menu item added');
    }
    setModalOpen(false);
    reload();
  };

  const toggleAvailable = (m: MenuItem) => {
    dbMenu.update(m.id, { available: !m.available });
    reload();
  };

  if (loading) return <FullLoader label="Loading menu..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu..." className="input pl-10" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input sm:w-48">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* grid */}
      {items.length === 0 ? (
        <div className="card py-20 text-center text-slate-400">
          <Package className="mx-auto h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">No menu items</p>
          <button onClick={openCreate} className="btn-primary mt-4">Add your first item</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((m) => {
            const cat = categories.find((c) => c.id === m.categoryId);
            return (
              <div key={m.id} className="card overflow-hidden group">
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img src={m.image || 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400'} alt={m.name} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-x-0 top-0 flex justify-between p-2">
                    <span className="chip text-white" style={{ background: cat?.color || '#666' }}>{cat?.name}</span>
                    {!m.available && <span className="chip bg-slate-900 text-white">Hidden</span>}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-2 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-slate-900/70 to-transparent">
                    <button onClick={() => openEdit(m)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-slate-700 hover:bg-white">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(m.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-rose-500 hover:bg-white">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{m.name}</p>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{m.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-extrabold text-accent">{fmtCurrency(m.price)}</span>
                    <span className={`text-xs font-semibold ${m.stock <= 10 ? 'text-amber-500' : 'text-slate-400'}`}>Stock: {m.stock}</span>
                  </div>
                  <button
                    onClick={() => toggleAvailable(m)}
                    className={`mt-2 w-full rounded-lg py-1.5 text-xs font-semibold transition ${m.available ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}
                  >
                    {m.available ? 'Available' : 'Hidden'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Menu Item' : 'Add Menu Item'}
        subtitle={editing ? editing.name : 'Create a new product'}
        size="lg"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Item'}</button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* image upload */}
          <div className="sm:col-span-2">
            <label className="label">Product image</label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                {form.image ? (
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full grid place-items-center text-slate-300"><ImagePlus className="h-8 w-8" /></div>
                )}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])} className="hidden" id="img-upload" />
                <label htmlFor="img-upload" className="btn-ghost cursor-pointer border border-slate-200 dark:border-slate-700">
                  <ImagePlus className="h-4 w-4" /> Upload image
                </label>
                {form.image && (
                  <button onClick={() => setForm((f) => ({ ...f, image: '' }))} className="btn-ghost text-rose-500 ml-2">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <p className="text-xs text-slate-400 mt-1">Or paste image URL below</p>
                <input value={form.image.startsWith('data:') ? '' : form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://..." className="input mt-1" />
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" placeholder="Cappuccino" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input min-h-[72px] resize-none" placeholder="Short product description" />
          </div>
          <div>
            <label className="label">Price (Rp) *</label>
            <input type="number" value={form.price || ''} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="input" placeholder="28000" />
          </div>
          <div>
            <label className="label">Cost (Rp)</label>
            <input type="number" value={form.cost || ''} onChange={(e) => setForm((f) => ({ ...f, cost: Number(e.target.value) }))} className="input" placeholder="12000" />
          </div>
          <div>
            <label className="label">Category *</label>
            <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="input">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" value={form.stock || ''} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} className="input" placeholder="50" />
          </div>
          <div>
            <label className="label">SKU</label>
            <input value={form.sku || ''} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="input" placeholder="CFE-CAP" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} className="h-4 w-4 rounded accent-[#FF6B35]" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Available for sale</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { dbMenu.remove(deleteId); toast.success('Item deleted'); reload(); } }}
        title="Delete menu item"
        message="This will permanently remove the item from your menu. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Tags, Package } from 'lucide-react';
import { dbCategories, dbMenu } from '../lib/db';
import type { Category } from '../lib/db';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { FullLoader } from '../components/Spinner';

const COLORS = ['#C97B4A', '#5B9BD5', '#E8A05C', '#D96A6A', '#22C55E', '#A855F7', '#F59E0B', '#06B6D4'];
const EMPTY: Omit<Category, 'id'> = { name: '', icon: 'Coffee', color: COLORS[0], active: true };

export function CategoriesPage() {
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t); }, []);

  const categories = useMemo(() => dbCategories.all(), [version]);
  const menuCounts = useMemo(() => {
    const map: Record<string, number> = {};
    dbMenu.all().forEach((m) => { map[m.categoryId] = (map[m.categoryId] || 0) + 1; });
    return map;
  }, [version]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); const { id, ...rest } = c; void id; setForm(rest); setModalOpen(true); };

  const save = () => {
    if (!form.name.trim()) { toast.error('Category name required'); return; }
    if (editing) { dbCategories.update(editing.id, form); toast.success('Category updated'); }
    else { dbCategories.add(form); toast.success('Category added'); }
    setModalOpen(false); reload();
  };

  if (loading) return <FullLoader label="Loading categories..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Product Categories</h2>
          <p className="text-sm text-slate-400">Organize your menu into categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="card p-5 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl text-white shadow-sm" style={{ background: c.color }}>
                  <Tags className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-400">{menuCounts[c.id] || 0} items</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openEdit(c)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent dark:hover:bg-slate-800"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => setDeleteId(c.id)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className={`chip ${c.active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-1">
                {COLORS.map((col) => <span key={col} className="h-3 w-3 rounded-full" style={{ background: col, opacity: c.color === col ? 1 : 0.3 }} />)}
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full card py-16 text-center text-slate-400">
            <Package className="mx-auto h-12 w-12 mb-3 opacity-40" />
            <p>No categories yet</p>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm"
        footer={<><button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? 'Save' : 'Add'}</button></>}>
        <div className="space-y-4">
          <div>
            <label className="label">Category name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" placeholder="Coffee" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((col) => (
                <button key={col} onClick={() => setForm((f) => ({ ...f, color: col }))}
                  className={`h-9 w-9 rounded-lg transition ${form.color === col ? 'ring-2 ring-offset-2 ring-accent dark:ring-offset-slate-900' : ''}`} style={{ background: col }} />
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 rounded accent-[#FF6B35]" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Active</span>
          </label>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { dbCategories.remove(deleteId); toast.success('Category deleted'); reload(); } }}
        title="Delete category"
        message="All menu items in this category will also be removed. This cannot be undone."
        confirmLabel="Delete" />
    </div>
  );
}

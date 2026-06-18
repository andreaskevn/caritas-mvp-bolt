import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ShieldCheck, UserCog, User as UserIcon, Mail, Phone } from 'lucide-react';
import { dbUsers } from '../lib/db';
import type { User, Role } from '../lib/db';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { FullLoader } from '../components/Spinner';

const ROLES: { id: Role; label: string; icon: typeof ShieldCheck; color: string }[] = [
  { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' },
  { id: 'manager', label: 'Manager', icon: UserCog, color: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300' },
  { id: 'cashier', label: 'Cashier', icon: UserIcon, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' },
];

const EMPTY: Omit<User, 'id' | 'createdAt'> = {
  name: '', email: '', password: '', role: 'cashier', active: true, phone: '',
};

export function UsersPage() {
  const { user: current } = useApp();
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, 'id' | 'createdAt'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t); }, []);

  const users = useMemo(() => {
    let list = dbUsers.all();
    if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter);
    if (search) list = list.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [version, search, roleFilter]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (u: User) => { setEditing(u); const { id, createdAt, ...rest } = u; void id; void createdAt; setForm(rest); setModalOpen(true); };

  const save = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) { toast.error('Name, email and password are required'); return; }
    const dup = dbUsers.all().find((u) => u.email === form.email && u.id !== editing?.id);
    if (dup) { toast.error('Email already in use'); return; }
    if (editing) { dbUsers.update(editing.id, form); toast.success('User updated'); }
    else { dbUsers.add(form); toast.success('User added'); }
    setModalOpen(false); reload();
  };

  if (loading) return <FullLoader label="Loading users..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Team Members</h2>
          <p className="text-sm text-slate-400">Manage staff accounts and access levels</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> Add User</button>
      </div>

      {/* role cards */}
      <div className="grid grid-cols-3 gap-3">
        {ROLES.map((r) => {
          const count = dbUsers.all().filter((u) => u.role === r.id).length;
          return (
            <button key={r.id} onClick={() => setRoleFilter(roleFilter === r.id ? 'all' : r.id)}
              className={`card p-4 text-left transition ${roleFilter === r.id ? 'ring-2 ring-accent' : 'hover:shadow-md'}`}>
              <div className="flex items-center gap-2">
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${r.color}`}><r.icon className="h-4 w-4" /></span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{r.label}</p>
                  <p className="text-xs text-slate-400">{count} user{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input pl-10" />
      </div>

      {/* table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const role = ROLES.find((r) => r.id === u.role)!;
                return (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-bold text-white">{u.name.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{u.name} {current?.id === u.id && <span className="text-xs text-accent">(You)</span>}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                      {u.phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{u.phone}</span> : '-'}
                    </td>
                    <td className="px-4 py-3"><span className={`chip ${role.color}`}><role.icon className="h-3 w-3" />{role.label}</span></td>
                    <td className="px-4 py-3">
                      <span className={`chip ${u.active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent dark:hover:bg-slate-800"><Edit2 className="h-4 w-4" /></button>
                        {current?.id !== u.id && (
                          <button onClick={() => setDeleteId(u.id)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'} size="md"
        footer={<><button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? 'Save' : 'Add User'}</button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Full name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" placeholder="Maya Senja" />
          </div>
          <div>
            <label className="label">Email *</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input pl-10" placeholder="maya@brewco.id" />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={form.phone || ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input" placeholder="0812xxxx" />
          </div>
          <div>
            <label className="label">Password *</label>
            <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input" placeholder="••••••" />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))} className="input">
              {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 rounded accent-[#FF6B35]" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Account active</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { dbUsers.remove(deleteId); toast.success('User deleted'); reload(); } }}
        title="Delete user" message="The user account will be permanently removed." confirmLabel="Delete" />
    </div>
  );
}

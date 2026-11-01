import { useEffect, useState } from 'react';

export default function UserManagement({ request, onClose }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadUsers = async () => {
    try { const payload = await request('/users'); setUsers(payload.data || []); }
    catch (loadError) { setError(loadError.message); }
  };
  useEffect(() => { loadUsers(); }, []);

  const createUser = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await request('/users', { method: 'POST', body: JSON.stringify(form) }); setForm({ name: '', email: '', password: '', role: 'staff' }); await loadUsers(); }
    catch (saveError) { setError(saveError.message); }
    finally { setBusy(false); }
  };

  const updateUser = async (user, updates) => {
    setError('');
    try { await request('/users/' + user.id, { method: 'PATCH', body: JSON.stringify(updates) }); await loadUsers(); }
    catch (saveError) { setError(saveError.message); }
  };

  const deleteUser = async (user) => {
    if (!window.confirm('Delete the account for ' + user.name + '?')) return;
    try { await request('/users/' + user.id, { method: 'DELETE' }); await loadUsers(); }
    catch (deleteError) { setError(deleteError.message); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">User access</h2><p className="text-sm text-slate-500">Admins manage accounts and roles. Managers can edit inventory. Staff have read access.</p></div><button onClick={onClose} className="rounded-lg border px-3 py-2 text-sm">Close</button></div>
        {error ? <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        <form onSubmit={createUser} className="mb-6 grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
          <input required placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
          <input required minLength="10" type="password" placeholder="Temporary password (10+ chars)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
          <div className="flex gap-2"><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"><option value="staff">Staff</option><option value="manager">Manager</option><option value="admin">Admin</option></select><button disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add user</button></div>
        </form>
        <div className="space-y-2">{users.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><div className="font-medium">{user.name}</div><div className="text-sm text-slate-500">{user.email}</div></div><div className="flex items-center gap-2"><select value={user.role} onChange={(event) => updateUser(user, { role: event.target.value })} className="rounded-lg border bg-white px-3 py-2 text-sm"><option value="staff">Staff</option><option value="manager">Manager</option><option value="admin">Admin</option></select><button onClick={() => deleteUser(user)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700">Delete</button></div></div>)}</div>
      </section>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function UsersPage() {
  /** Users list fetched from DB-backed endpoint GET /db/users with search and create/edit modals. */
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await apiClient.get('/db/users');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return items.filter(u =>
      (u.name || '').toLowerCase().includes(needle) ||
      (u.email || '').toLowerCase().includes(needle) ||
      String(u.id).includes(needle)
    );
  }, [items, q]);

  const validate = (payload) => {
    if (!payload.name || !payload.name.trim()) return 'Name is required';
    if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) return 'Valid email is required';
    return '';
  };

  const onOpenCreate = () => {
    setEditId(null);
    setForm({ name: '', email: '' });
    setShowCreate(true);
  };

  const onOpenEdit = (u) => {
    setEditId(u.id);
    setForm({ name: u.name || '', email: u.email || '' });
    setShowCreate(true);
  };

  const onSave = async () => {
    setErr('');
    const message = validate(form);
    if (message) { setErr(message); return; }
    setPending(true);
    try {
      if (editId) {
        // optimistic update
        const snapshot = [...items];
        setItems(prev => prev.map(u => u.id === editId ? { ...u, ...form } : u));
        await apiClient.put(`/db/users/${editId}`, form);
        await load();
      } else {
        await apiClient.post('/db/users', form);
        await load();
      }
      setShowCreate(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="card">
      <div className="row mb-16">
        <h2 className="grow">Users</h2>
        <button className="btn secondary" onClick={onOpenCreate}>Add User</button>
      </div>
      <div className="row mb-16">
        <input className="input grow" placeholder="Search users..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading && <div className="text-muted">Loading users...</div>}
      {err && <div style={{ color: 'var(--error)' }}>{err}</div>}

      {!loading && filtered.length === 0 && (
        <EmptyState onReload={load} onCreate={onOpenCreate} />
      )}

      {filtered.length > 0 && (
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name || '-'}</td>
                <td className="text-muted">{u.email || '-'}</td>
                <td className="row">
                  <Link to={`/users/${u.id}`} className="btn ghost">View</Link>
                  <button className="btn ghost" onClick={() => onOpenEdit(u)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <div className="card" style={{ position: 'fixed', right: 20, bottom: 20, maxWidth: 420, zIndex: 50 }}>
          <h3>{editId ? 'Edit User' : 'Add User'}</h3>
          <div className="mb-16">
            <label>Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="mb-16">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="row">
            <button className="btn" onClick={onSave} disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>
            <button className="btn ghost" onClick={() => setShowCreate(false)} disabled={pending}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onReload, onCreate }) {
  return (
    <div className="card" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>
      <div className="mb-16">
        No users found.
      </div>
      <div className="text-muted">
        If your database is not seeded yet, this list will be empty. Once the backend seeds the simple users table,
        this page will display results from GET /db/users.
      </div>
      <div className="mt-16 row">
        <button className="btn ghost" onClick={onReload}>Reload</button>
        <button className="btn secondary" onClick={onCreate}>Add User</button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function UserDetailPage() {
  /** User detail fetched from DB-backed endpoint GET /db/users/{id}. */
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await apiClient.get(`/db/users/${userId}`);
      setUser(data || null);
    } catch (e) {
      setErr(e.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const startEdit = () => {
    setForm({ name: user?.name || '', email: user?.email || '' });
    setEditing(true);
  };

  const onSave = async () => {
    if (!form.name.trim()) { setErr('Name is required'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email || '')) { setErr('Valid email is required'); return; }
    setSaving(true);
    setErr('');
    try {
      await apiClient.put(`/db/users/${userId}`, form);
      setEditing(false);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="row mb-16">
        <h2 className="grow">User Detail</h2>
        <div className="row">
          {user && <button className="btn secondary" onClick={startEdit}>Edit</button>}
          <Link to="/users" className="btn ghost">Back</Link>
        </div>
      </div>

      {loading && <div className="text-muted">Loading...</div>}
      {err && <div style={{ color: 'var(--error)' }}>{err}</div>}

      {!loading && !user && (
        <div className="text-muted">
          User not found or catalog not seeded yet.
        </div>
      )}

      {user && (
        <table className="table">
          <tbody>
            <tr><th style={{ width: 160 }}>ID</th><td>{user.id}</td></tr>
            <tr><th>Name</th><td>{user.name || '-'}</td></tr>
            <tr><th>Email</th><td>{user.email || '-'}</td></tr>
          </tbody>
        </table>
      )}

      {editing && (
        <div className="card" style={{ position: 'fixed', right: 20, bottom: 20, maxWidth: 420, zIndex: 50 }}>
          <h3>Edit User</h3>
          <div className="mb-16">
            <label>Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="mb-16">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="row">
            <button className="btn" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="btn ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

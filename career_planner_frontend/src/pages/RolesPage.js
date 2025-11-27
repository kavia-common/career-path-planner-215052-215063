import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function RolesPage() {
  /**
   * Role Navigator with create/edit dialogs. Primary read GET /roles; fallback GET /db/roles.
   * Create via POST /db/roles; update via PUT /db/roles/{id}.
   */
  const [roles, setRoles] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // role or null
  const [form, setForm] = useState({ code: '', name: '', summary: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      // Try primary endpoint
      let data = await apiClient.get('/roles');
      if (!Array.isArray(data) || data.length === 0) {
        // Fallback to DB-backed endpoint if REST catalog is empty/not seeded
        data = await apiClient.get('/db/roles').catch(() => data);
      }
      setRoles(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || 'Failed to load roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return roles.filter(r =>
      (r.name || '').toLowerCase().includes(needle) ||
      (r.code || '').toLowerCase().includes(needle)
    );
  }, [roles, q]);

  const openCreate = () => {
    setEditing({ id: null });
    setForm({ code: '', name: '', summary: '' });
  };
  const openEdit = (r) => {
    setEditing({ id: r.id });
    setForm({ code: r.code || '', name: r.name || '', summary: r.summary || '' });
  };
  const validate = () => {
    if (!form.code.trim()) return 'Code is required';
    if (!form.name.trim()) return 'Name is required';
    return '';
  };
  const onSave = async () => {
    const v = validate();
    if (v) { setErr(v); return; }
    setSaving(true);
    setErr('');
    try {
      if (editing?.id) {
        await apiClient.put(`/db/roles/${editing.id}`, form);
      } else {
        await apiClient.post('/db/roles', form);
      }
      setEditing(null);
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
        <h2 className="grow">Role Navigator</h2>
        <button className="btn secondary" onClick={openCreate}>Add Role</button>
      </div>
      <div className="row mb-16">
        <input className="input grow" placeholder="Search roles..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {loading && <div className="text-muted">Loading roles...</div>}
      {err && <div style={{ color: 'var(--error)' }}>{err}</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-muted">
          No roles found. If the catalog has not been seeded yet, you will see an empty list.
          Use Admin ingestion to seed from spreadsheets, then return here. You may also try the DB view at /db/roles if enabled.
        </div>
      )}

      {filtered.length > 0 && (
        <table className="table">
          <thead>
            <tr><th>Code</th><th>Name</th><th>Summary</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td className="text-muted">{r.code || '-'}</td>
                <td>{r.name}</td>
                <td className="text-muted">{r.summary || r.family || '-'}</td>
                <td className="row">
                  <Link to={`/roles/${r.id}`} className="btn ghost">View</Link>
                  <button className="btn ghost" onClick={() => openEdit(r)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!!editing && (
        <div className="card" style={{ position: 'fixed', right: 20, bottom: 20, maxWidth: 460, zIndex: 50 }}>
          <h3>{editing.id ? 'Edit Role' : 'Add Role'}</h3>
          <div className="mb-16">
            <label>Code</label>
            <input className="input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          </div>
          <div className="mb-16">
            <label>Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="mb-16">
            <label>Summary</label>
            <input className="input" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
          </div>
          <div className="row">
            <button className="btn" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="btn ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

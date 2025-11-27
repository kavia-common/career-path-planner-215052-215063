import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { useSupabase } from '../auth/SupabaseProvider';

// PUBLIC_INTERFACE
export default function CompetenciesPage() {
  /**
   * Competency Explorer + Self-Assessment:
   * - User self list GET /competencies and inline update PUT /competencies/:id { self_level }.
   * - Admins: quick-add/edit catalog via /db/competencies POST/PUT.
   */
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const { profile } = useSupabase();

  const [editing, setEditing] = useState(null); // competency or null
  const [form, setForm] = useState({ code: '', name: '', category: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await apiClient.get('/competencies');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const options = useMemo(() => ([
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' },
  ]), []);

  const onChange = async (id, value) => {
    setSavingId(id);
    setErr('');
    try {
      await apiClient.put(`/competencies/${id}`, { self_level: value });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const openCreate = () => {
    setEditing({ id: null });
    setForm({ code: '', name: '', category: '' });
  };
  const openEdit = (c) => {
    setEditing({ id: c.id });
    setForm({ code: c.code || '', name: c.name || '', category: c.category || '' });
  };
  const validate = () => {
    if (!form.code.trim()) return 'Code is required';
    if (!form.name.trim()) return 'Name is required';
    return '';
  };
  const saveCatalog = async () => {
    const v = validate();
    if (v) { setErr(v); return; }
    setSaving(true);
    setErr('');
    try {
      if (editing?.id) {
        await apiClient.put(`/db/competencies/${editing.id}`, form);
      } else {
        await apiClient.post('/db/competencies', form);
      }
      setEditing(null);
      // Optional: reload user view not necessary; catalog separate, but harmless
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = !!profile?.is_admin;

  return (
    <div className="card">
      <div className="row mb-16">
        <h2 className="grow">Competency Explorer</h2>
        {isAdmin && <button className="btn secondary" onClick={openCreate}>Add Competency</button>}
      </div>
      <div className="text-muted mb-16">
        Adjust your self-assessed levels below. Role requirements are visible inside each Role. Admins can also manage catalog items here.
      </div>
      {loading && <div className="text-muted">Loading competencies...</div>}
      {err && <div style={{ color: 'var(--error)' }}>{err}</div>}

      {!loading && items.length === 0 && (
        <div className="text-muted">
          No competencies found for your profile yet. If the catalog was not seeded, this list may be empty until you select a role
          or the backend seeds defaults.
        </div>
      )}

      {items.length > 0 && (
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Your Level</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{normalize(c.self_level) || '-'}</td>
                <td className="row">
                  <select
                    className="select"
                    disabled={savingId === c.id}
                    value={normalize(c.self_level)}
                    onChange={e => onChange(c.id, e.target.value)}
                  >
                    <option value="">Select level...</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {isAdmin && <button className="btn ghost" onClick={() => openEdit(c)}>Edit</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!!editing && (
        <div className="card" style={{ position: 'fixed', right: 20, bottom: 20, maxWidth: 460, zIndex: 50 }}>
          <h3>{editing.id ? 'Edit Competency' : 'Add Competency'}</h3>
          <div className="mb-16">
            <label>Code</label>
            <input className="input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          </div>
          <div className="mb-16">
            <label>Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="mb-16">
            <label>Category</label>
            <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
          <div className="row">
            <button className="btn" onClick={saveCatalog} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="btn ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function normalize(lvl) {
  if (!lvl) return '';
  if (typeof lvl === 'string') return capitalize(lvl);
  const map = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
  return map[lvl] || '';
}
function capitalize(s) { return (s || '').charAt(0).toUpperCase() + (s || '').slice(1); }

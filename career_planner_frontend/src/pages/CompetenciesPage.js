import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function CompetenciesPage() {
  /**
   * Competency Explorer + Self-Assessment:
   * - Catalog guidance (if admin wants to view seed catalog use /competencies/catalog on Admin).
   * - Self-assessment list GET /competencies and inline update PUT /competencies/:id { self_level }.
   */
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

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

  return (
    <div className="card">
      <h2>Competency Explorer</h2>
      <div className="text-muted mb-16">
        Adjust your self-assessed levels below. Role requirements are visible inside each Role. Admins can view the full catalog in Admin.
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
                <td>
                  <select
                    className="select"
                    disabled={savingId === c.id}
                    value={normalize(c.self_level)}
                    onChange={e => onChange(c.id, e.target.value)}
                  >
                    <option value="">Select level...</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

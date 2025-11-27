import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function CompetenciesPage() {
  /**
   * Displays user's competencies and allows self-assessment update (Beginner/Intermediate/Advanced).
   * GET /competencies (user's list) and PUT /competencies/:id with { self_level }.
   */
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    apiClient.get('/competencies').then(setItems).catch(e => setErr(e.message));
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
      // Refresh gaps on backend implicitly; reload list so Dashboard will reflect next visit
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="card">
      <h2>Competencies</h2>
      {err && <div style={{ color: 'var(--error)' }}>{err}</div>}
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Your Level</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.self_level || '-'}</td>
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

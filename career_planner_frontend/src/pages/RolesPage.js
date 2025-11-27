import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function RolesPage() {
  /**
   * Role Navigator: search/filter over roles catalog. Uses GET /roles (REST) falling back to /db/roles if needed.
   * Shows empty guidance if catalogs are not seeded.
   */
  const [roles, setRoles] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

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
      setErr(e.message);
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

  return (
    <div className="card">
      <div className="row mb-16">
        <h2 className="grow">Role Navigator</h2>
        <input className="input" placeholder="Search roles..." value={q} onChange={e => setQ(e.target.value)} />
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
                <td><Link to={`/roles/${r.id}`} className="btn ghost">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

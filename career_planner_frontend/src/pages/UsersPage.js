import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function UsersPage() {
  /** Users list fetched from DB-backed endpoint GET /db/users with basic search and empty guidance. */
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

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

  return (
    <div className="card">
      <div className="row mb-16">
        <h2 className="grow">Users</h2>
        <input className="input" placeholder="Search users..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading && <div className="text-muted">Loading users...</div>}
      {err && <div style={{ color: 'var(--error)' }}>{err}</div>}

      {!loading && filtered.length === 0 && (
        <EmptyState onReload={load} />
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
                <td><Link to={`/users/${u.id}`} className="btn ghost">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function EmptyState({ onReload }) {
  return (
    <div className="card" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>
      <div className="mb-16">
        No users found.
      </div>
      <div className="text-muted">
        If your database is not seeded yet, this list will be empty. Once the backend seeds the simple users table,
        this page will display results from GET /db/users.
      </div>
      <div className="mt-16">
        <button className="btn ghost" onClick={onReload}>Reload</button>
      </div>
    </div>
  );
}

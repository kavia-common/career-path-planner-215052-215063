import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function RolesPage() {
  /** Lists roles from backend GET /roles and links to detail page. */
  const [roles, setRoles] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    apiClient.get('/roles')
      .then(setRoles)
      .catch(e => setErr(e.message));
  }, []);

  const filtered = roles.filter(r => r.name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="card">
      <div className="row mb-16">
        <h2 className="grow">Roles</h2>
        <input className="input" placeholder="Search roles..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {err && <div style={{ color: 'var(--error)' }}>{err}</div>}
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Family</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td className="text-muted">{r.family || '-'}</td>
              <td><Link to={`/roles/${r.id}`} className="btn ghost">View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

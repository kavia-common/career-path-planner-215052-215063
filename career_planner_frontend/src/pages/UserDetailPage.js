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

  return (
    <div className="card">
      <div className="row mb-16">
        <h2 className="grow">User Detail</h2>
        <Link to="/users" className="btn ghost">Back</Link>
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
    </div>
  );
}

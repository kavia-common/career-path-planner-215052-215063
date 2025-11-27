import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

// PUBLIC_INTERFACE
export default function AdminPage() {
  /**
   * Admin functions: trigger ingestion, show latest ingestion run, and view catalog lists.
   * Requires RBAC: only visible to admin users via AuthGate(adminOnly).
   */
  const [roles, setRoles] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [latestRun, setLatestRun] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setErr('');
    try {
      const [r, c] = await Promise.all([
        apiClient.get('/roles').catch(() => apiClient.get('/db/roles')),
        apiClient.get('/competencies/catalog').catch(() => []),
      ]);
      setRoles(r || []);
      setCompetencies(c || []);
      const latest = await apiClient.get('/admin/ingest/latest').catch(() => null);
      setLatestRun(latest);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const triggerIngestion = async () => {
    setMsg('');
    setErr('');
    try {
      await apiClient.post('/admin/ingest', {});
      setMsg('Ingestion triggered.');
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="row">
      <div className="card grow">
        <h2>Ingestion</h2>
        <div className="row mb-16">
          <button className="btn secondary" onClick={triggerIngestion}>Trigger Ingestion</button>
          {msg && <div className="text-muted">{msg}</div>}
          {err && <div style={{ color: 'var(--error)' }}>{err}</div>}
        </div>
        {latestRun ? (
          <table className="table">
            <thead><tr><th>Run ID</th><th>Status</th><th>Started</th></tr></thead>
            <tbody>
              <tr><td>{latestRun.id || '-'}</td><td>{latestRun.status || '-'}</td><td>{latestRun.started_at || '-'}</td></tr>
            </tbody>
          </table>
        ) : (
          <div className="text-muted">No ingestion runs yet.</div>
        )}
      </div>

      <div className="card grow">
        <h2>Catalog — Roles</h2>
        <table className="table">
          <thead><tr><th>Code</th><th>Name</th></tr></thead>
          <tbody>
            {(roles || []).map(r => <tr key={r.id}><td className="text-muted">{r.code || '-'}</td><td>{r.name}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="card grow">
        <h2>Catalog — Competencies</h2>
        <table className="table">
          <thead><tr><th>Code</th><th>Name</th></tr></thead>
          <tbody>
            {(competencies || []).map(c => <tr key={c.id}><td className="text-muted">{c.code || '-'}</td><td>{c.name}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

// PUBLIC_INTERFACE
export default function AdminPage() {
  /**
   * Admin functions: trigger ingestion, show latest ingestion runs, and view catalog lists.
   * Requires RBAC: only visible to admin users via AuthGate(adminOnly).
   */
  const [roles, setRoles] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [runs, setRuns] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setErr('');
    try {
      const [r, c, ir] = await Promise.all([
        apiClient.get('/roles'),
        apiClient.get('/competencies/catalog'),
        apiClient.get('/admin/ingestion/runs').catch(() => []),
      ]);
      setRoles(r || []);
      setCompetencies(c || []);
      setRuns(ir || []);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const triggerIngestion = async () => {
    setMsg('');
    setErr('');
    try {
      await apiClient.post('/admin/ingestion/trigger', {});
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
        <table className="table">
          <thead><tr><th>Run ID</th><th>Status</th><th>Started</th></tr></thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id}><td>{r.id}</td><td>{r.status}</td><td>{r.started_at}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card grow">
        <h2>Catalog — Roles</h2>
        <table className="table">
          <thead><tr><th>Name</th><th>Family</th></tr></thead>
          <tbody>
            {roles.map(r => <tr key={r.id}><td>{r.name}</td><td className="text-muted">{r.family || '-'}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="card grow">
        <h2>Catalog — Competencies</h2>
        <table className="table">
          <thead><tr><th>Name</th><th>Domain</th></tr></thead>
          <tbody>
            {competencies.map(c => <tr key={c.id}><td>{c.name}</td><td className="text-muted">{c.domain || '-'}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

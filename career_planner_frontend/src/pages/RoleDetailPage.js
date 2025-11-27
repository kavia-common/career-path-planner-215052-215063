import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function RoleDetailPage() {
  /** Shows a single role and its competency requirements. */
  const { roleId } = useParams();
  const [role, setRole] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    apiClient.get(`/roles/${roleId}`).then(setRole).catch(e => setErr(e.message));
    apiClient.get(`/roles/${roleId}/competencies`).then(setRequirements).catch(e => setErr(e.message));
  }, [roleId]);

  return (
    <div className="card">
      {err && <div style={{ color: 'var(--error)' }}>{err}</div>}
      <h2>{role?.name || 'Role'}</h2>
      <div className="text-muted mb-16">{role?.description}</div>
      <table className="table">
        <thead>
          <tr><th>Competency</th><th>Required Level</th></tr>
        </thead>
        <tbody>
          {requirements.map((c) => (
            <tr key={c.competency_id || c.id}>
              <td>{c.competency_name || c.name}</td>
              <td>{prettyLevel(c.required_level)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function prettyLevel(l) {
  if (typeof l === 'string') return capitalize(l);
  const map = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
  return map[l] || '-';
}
function capitalize(s) { return (s || '').charAt(0).toUpperCase() + (s || '').slice(1); }

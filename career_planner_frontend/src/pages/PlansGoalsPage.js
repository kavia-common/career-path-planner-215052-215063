import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function PlansGoalsPage() {
  /** Lists user's plans and goals. Allows quick add of a goal to the default/current plan. */
  const [plans, setPlans] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [p, g] = await Promise.all([
        apiClient.get('/plans'),
        apiClient.get('/goals'),
      ]);
      setPlans(p || []);
      setGoals(g || []);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const addGoal = async () => {
    setErr('');
    try {
      const planId = plans[0]?.id;
      if (!planId) throw new Error('No plan found. Create a plan first in backend or Admin.');
      await apiClient.post('/goals', { plan_id: planId, title: newGoal });
      setNewGoal('');
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="row">
      <div className="card grow">
        <h2>Your Plans</h2>
        {err && <div style={{ color: 'var(--error)' }}>{err}</div>}
        <ul>
          {plans.map(p => <li key={p.id}><strong>{p.name}</strong> — {p.description}</li>)}
        </ul>
      </div>
      <div className="card grow">
        <h2>Goals</h2>
        <div className="row mb-16">
          <input className="input grow" placeholder="New goal..." value={newGoal} onChange={e => setNewGoal(e.target.value)} />
          <button className="btn" onClick={addGoal} disabled={!newGoal.trim()}>Add</button>
        </div>
        <table className="table">
          <thead><tr><th>Title</th><th>Status</th></tr></thead>
          <tbody>
            {goals.map(g => <tr key={g.id}><td>{g.title}</td><td className="text-muted">{g.status || 'open'}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

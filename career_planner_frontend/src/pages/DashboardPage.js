import React, { useEffect, useMemo, useRef, useState } from 'react';
import { select, scaleBand, scaleLinear, axisLeft, axisBottom } from 'd3';
import { apiClient } from '../services/apiClient';
import { useSupabase } from '../auth/SupabaseProvider';

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /**
   * Dashboard shows a quick health check and a simple chart using existing endpoints.
   * We use GET /roles (or fallback /db/roles) to visualize a sample,
   * and show backend health via GET / (root).
   */
  const [roles, setRoles] = useState([]);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const { profile } = useSupabase();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Health
        const h = await apiClient.get('/');
        if (mounted) setHealth(h);

        // Data
        let data = await apiClient.get('/roles').catch(() => []);
        if (!Array.isArray(data) || data.length === 0) {
          data = await apiClient.get('/db/roles').catch(() => []);
        }
        if (mounted) setRoles(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch (e) {
        if (mounted) {
          setError(e.message || 'Failed to load');
          setRoles([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const data = useMemo(() => roles.map((r, idx) => ({
    name: r.name || r.code || `Role ${idx+1}`,
    required: Math.min(3, (r.name?.length || 6) % 3 + 1),
    self: Math.min(3, (r.code?.length || 4) % 3 + 1)
  })), [roles]);

  useEffect(() => {
    renderChart(chartRef.current, data);
  }, [data]);

  return (
    <div className="row">
      <div className="card grow">
        <h2>Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}</h2>
        <div className="text-muted">Overview and connectivity status.</div>
        {loading && <div className="mt-16">Loading...</div>}
        {health && <div className="mt-8 text-muted">Backend: {JSON.stringify(health)}</div>}
        {error && <div className="mt-16" style={{ color: 'var(--error)' }}>{error}</div>}
      </div>
      <div className="card grow">
        <h2>Sample Chart</h2>
        <div ref={chartRef} className="chart-container" />
        <div className="text-muted mt-16">Levels: 1 (Beginner) to 3 (Advanced)</div>
      </div>
    </div>
  );
}

function renderChart(container, data) {
  if (!container) return;
  container.innerHTML = '';
  const width = container.clientWidth || 600;
  const height = Math.max(220, (data.length || 5) * 26 + 80);
  const margin = { top: 10, right: 20, bottom: 40, left: 140 };

  const svg = select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const x = scaleLinear().domain([0, 3]).range([margin.left, width - margin.right]);
  const y = scaleBand().domain(data.map(d => d.name)).range([margin.top, height - margin.bottom]).padding(0.2);

  // Required bars
  svg.selectAll('.bar-req')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar-req')
    .attr('x', x(0))
    .attr('y', d => y(d.name))
    .attr('height', y.bandwidth())
    .attr('width', d => x(d.required) - x(0))
    .attr('fill', 'rgba(30,58,138,0.6)');

  // Self bars overlay
  svg.selectAll('.bar-self')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar-self')
    .attr('x', x(0))
    .attr('y', d => (y(d.name) ?? 0) + 4)
    .attr('height', Math.max(2, y.bandwidth() - 8))
    .attr('width', d => x(d.self) - x(0))
    .attr('fill', 'rgba(245,158,11,0.8)');

  const yAxis = axisLeft(y);
  const xAxis = axisBottom(x).ticks(3).tickFormat(d => ['0','Beginner','Intermediate','Advanced'][d]);

  svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(xAxis);
  svg.append('g').attr('transform', `translate(${margin.left},0)`).call(yAxis);
}

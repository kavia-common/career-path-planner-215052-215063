import React, { useEffect, useMemo, useRef, useState } from 'react';
import { select, scaleBand, scaleLinear, axisLeft, axisBottom } from 'd3';
import { apiClient } from '../services/apiClient';
import { useSupabase } from '../auth/SupabaseProvider';

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /**
   * Dashboard shows high-level summary and a D3-based gap chart comparing required vs self levels.
   * Expects backend to provide GET /gaps (array of { competency, required_level, self_level }).
   */
  const [gaps, setGaps] = useState([]);
  const [error, setError] = useState('');
  const chartRef = useRef(null);
  const { profile } = useSupabase();

  useEffect(() => {
    apiClient.get('/gaps')
      .then(setGaps)
      .catch(e => setError(e.message));
  }, []);

  const data = useMemo(() => gaps.map(g => ({
    name: g.competency || g.name,
    required: levelToScore(g.required_level),
    self: levelToScore(g.self_level)
  })), [gaps]);

  useEffect(() => {
    renderChart(chartRef.current, data);
  }, [data]);

  return (
    <div className="row">
      <div className="card grow">
        <h2>Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}</h2>
        <div className="text-muted">Overview of your role readiness and skill gaps.</div>
        {error && <div className="mt-16" style={{ color: 'var(--error)' }}>{error}</div>}
      </div>
      <div className="card grow">
        <h2>Gap Analysis</h2>
        <div ref={chartRef} className="chart-container" />
        <div className="text-muted mt-16">Levels: Beginner=1, Intermediate=2, Advanced=3</div>
      </div>
    </div>
  );
}

function levelToScore(level) {
  if (level == null) return 0;
  if (typeof level === 'number') return level;
  const map = { beginner: 1, intermediate: 2, advanced: 3, Beginner:1, Intermediate:2, Advanced:3 };
  return map[level] ?? 0;
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

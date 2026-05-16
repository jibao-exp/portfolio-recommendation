'use client';

import type { AssetMetrics } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeightRecommendationProps {
  assets: AssetMetrics[];
}

export default function WeightRecommendation({ assets }: WeightRecommendationProps) {
  const data = assets.map(a => ({
    name: a.name.length > 12 ? a.name.slice(0, 12) + '...' : a.name,
    current: a.current_weight * 100,
    recommended: a.recommended_weight * 100,
  }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Weight Recommendation</h3>
        <div style={styles.legend}>
          <span style={styles.legendItem}>
            <span style={{ ...styles.dot, background: '#6366f1' }}></span>
            Current
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.dot, background: '#f97316' }}></span>
            Recommended
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
          />
          <Bar dataKey="current" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
          <Bar dataKey="recommended" fill="#f97316" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  container: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #1e293b',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: 0,
  },
  legend: {
    display: 'flex',
    gap: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    display: 'inline-block',
  },
};
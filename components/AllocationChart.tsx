'use client';

import type { AssetMetrics } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface AllocationChartProps {
  assets: AssetMetrics[];
  weightKey?: 'current_weight' | 'recommended_weight';
  title: string;
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

export default function AllocationChart({ assets, weightKey = 'recommended_weight', title }: AllocationChartProps) {
  const data = assets
    .filter(a => a[weightKey] > 0)
    .map(a => ({
      name: a.name,
      value: a[weightKey],
      isin: a.isin,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
  },
};
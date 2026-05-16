'use client';

import type { AssetMetrics } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceChartProps {
  assets: AssetMetrics[];
  benchmark: { date: string; level: number }[];
}

export default function PerformanceChart({ assets, benchmark }: PerformanceChartProps) {
  const mergedData = mergePerformanceData(assets, benchmark);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Price Performance (Normalized)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getFullYear()}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend />
          {assets.slice(0, 5).map((asset, index) => (
            <Line
              key={asset.isin}
              type="monotone"
              dataKey={`asset_${asset.isin}`}
              name={asset.name}
              stroke={COLORS[index % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
          <Line
            type="monotone"
            dataKey="benchmark"
            name="Benchmark"
            stroke="#1e293b"
            dot={false}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

function mergePerformanceData(assets: AssetMetrics[], benchmark: { date: string; level: number }[]) {
  const dates = new Set<string>();
  assets.forEach(a => a.price_history.forEach(p => dates.add(p.date)));
  benchmark.forEach(b => dates.add(b.date));

  const sortedDates = Array.from(dates).sort();

  const benchmarkMap = new Map(benchmark.map(b => [b.date, b.level]));
  const benchmarkStart = benchmarkMap.get(sortedDates[0]) || 1;

  const assetPriceMaps = new Map<string, Map<string, number>>();
  assets.forEach(asset => {
    const map = new Map(asset.price_history.map(p => [p.date, p.price]));
    assetPriceMaps.set(asset.isin, map);
  });

  return sortedDates.map(date => {
    const entry: Record<string, string | number> = { date };

    const benchLevel = benchmarkMap.get(date);
    entry['benchmark'] = benchLevel ? benchLevel / benchmarkStart : 0;

    assets.forEach(asset => {
      const priceMap = assetPriceMaps.get(asset.isin);
      const price = priceMap?.get(date);
      if (price) {
        entry[`asset_${asset.isin}`] = price / asset.price_history[0].price;
      }
    });

    return entry;
  }).filter(d => d['benchmark'] !== null || Object.keys(d).length > 1);
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
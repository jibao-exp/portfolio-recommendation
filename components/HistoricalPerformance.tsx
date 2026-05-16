'use client';

import { useState } from 'react';
import type { AssetMetrics } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface HistoricalPerformanceProps {
  assets: AssetMetrics[];
  benchmark: { date: string; level: number }[];
}

export default function HistoricalPerformance({ assets, benchmark }: HistoricalPerformanceProps) {
  const [visibleAssets, setVisibleAssets] = useState<Set<string>>(
    () => new Set(assets.slice(0, 4).map(a => a.isin))
  );
  const [showBenchmark, setShowBenchmark] = useState(true);

  const chartData = buildChartData(assets, benchmark);

  const toggleAsset = (isin: string) => {
    setVisibleAssets(prev => {
      const next = new Set(prev);
      if (next.has(isin)) {
        next.delete(isin);
      } else {
        next.add(isin);
      }
      return next;
    });
  };

  const toggleBenchmark = () => {
    setShowBenchmark(prev => !prev);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Historical Performance</h3>
        <div style={styles.legend}>
          {assets.slice(0, 4).map((asset, i) => {
            const isVisible = visibleAssets.has(asset.isin);
            return (
              <span
                key={asset.isin}
                style={{
                  ...styles.legendItem,
                  opacity: isVisible ? 1 : 0.4,
                  cursor: 'pointer',
                }}
                onClick={() => toggleAsset(asset.isin)}
              >
                <span style={{ ...styles.dot, background: COLORS[i % COLORS.length], opacity: isVisible ? 1 : 0.3 }}></span>
                {asset.name}
              </span>
            );
          })}
          <span
            style={{
              ...styles.legendItem,
              opacity: showBenchmark ? 1 : 0.4,
              cursor: 'pointer',
            }}
            onClick={toggleBenchmark}
          >
            <span style={{ ...styles.dot, background: '#64748b', opacity: showBenchmark ? 1 : 0.3 }}></span>
            Benchmark
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#475569' }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#475569' }}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0' }}
            formatter={(value: number, name: string) => {
              if (name === 'benchmark') return [`${(value * 100).toFixed(2)}%`, 'Benchmark'];
              const asset = assets.find(a => a.isin === name);
              return [`${(value * 100).toFixed(2)}%`, asset?.name || name];
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          {assets.slice(0, 4).map((asset, i) => (
            <Line
              key={asset.isin}
              type="monotone"
              dataKey={asset.isin}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={1.5}
              hide={!visibleAssets.has(asset.isin)}
            />
          ))}
          <Line
            type="monotone"
            dataKey="benchmark"
            stroke="#64748b"
            dot={false}
            strokeWidth={1}
            strokeDasharray="4 4"
            hide={!showBenchmark}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ['#f97316', '#6366f1', '#22c55e', '#eab308'];

function buildChartData(assets: AssetMetrics[], benchmark: { date: string; level: number }[]) {
  const dates = new Set<string>();
  assets.forEach(a => a.price_history.forEach(p => dates.add(p.date)));
  benchmark.forEach(b => dates.add(b.date));
  const sortedDates = Array.from(dates).sort();

  const benchmarkMap = new Map(benchmark.map(b => [b.date, b.level]));
  const benchmarkStart = benchmarkMap.get(sortedDates[0]) || 1;

  const assetMaps = new Map<string, Map<string, number>>();
  assets.forEach(asset => {
    const map = new Map(asset.price_history.map(p => [p.date, p.price]));
    assetMaps.set(asset.isin, map);
  });

  return sortedDates.map(date => {
    const entry: Record<string, string | number> = { date };
    const benchLevel = benchmarkMap.get(date);
    entry['benchmark'] = benchLevel ? benchLevel / benchmarkStart : 0;

    assets.slice(0, 4).forEach(asset => {
      const priceMap = assetMaps.get(asset.isin);
      const price = priceMap?.get(date);
      if (price) {
        entry[asset.isin] = price / asset.price_history[0].price;
      }
    });

    return entry;
  }).filter(d => d['benchmark'] !== null);
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
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#64748b',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block',
  },
};
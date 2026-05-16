'use client';

import type { AssetMetrics } from '@/lib/types';

interface HoldingsDetailProps {
  assets: AssetMetrics[];
}

export default function HoldingsDetail({ assets }: HoldingsDetailProps) {
  const sortedAssets = [...assets].sort((a, b) => b.recommended_weight - a.recommended_weight);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Holdings Detail</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Asset</th>
              <th style={styles.th}>ISIN</th>
              <th style={styles.th}>Class</th>
              <th style={styles.th}>Currency</th>
              <th style={styles.th}>Current Wt</th>
              <th style={styles.th}>Recommended</th>
              <th style={styles.th}>Δ Weight</th>
              <th style={styles.th}>Ann. Return</th>
              <th style={styles.th}>Ann. Vol</th>
              <th style={styles.th}>Sharpe</th>
              <th style={styles.th}>Max DD</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map(asset => {
              const change = asset.recommended_weight - asset.current_weight;
              const changeColor = change > 0.001 ? '#22c55e' : change < -0.001 ? '#ef4444' : '#64748b';
              return (
                <tr key={asset.isin} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{asset.name}</td>
                  <td style={{ ...styles.td, color: '#64748b', fontFamily: 'monospace', fontSize: '11px' }}>{asset.isin}</td>
                  <td style={styles.td}>
                    <span style={getClassBadgeStyle(asset.asset_class)}>{asset.asset_class}</span>
                  </td>
                  <td style={{ ...styles.td, color: '#64748b' }}>{asset.currency}</td>
                  <td style={styles.td}>{(asset.current_weight * 100).toFixed(1)}%</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#f97316' }}>
                    {(asset.recommended_weight * 100).toFixed(1)}%
                  </td>
                  <td style={{ ...styles.td, color: changeColor, fontWeight: 500 }}>
                    {change > 0.001 ? '+' : ''}{(change * 100).toFixed(1)}pp
                  </td>
                  <td style={{ ...styles.td, color: asset.annualized_return > 0 ? '#22c55e' : '#ef4444' }}>
                    {(asset.annualized_return * 100).toFixed(2)}%
                  </td>
                  <td style={styles.td}>{(asset.annualized_volatility * 100).toFixed(2)}%</td>
                  <td style={styles.td}>{asset.sharpe_ratio.toFixed(2)}</td>
                  <td style={{ ...styles.td, color: '#ef4444' }}>{(asset.max_drawdown * 100).toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getClassBadgeStyle(assetClass: string) {
  const colors: Record<string, { bg: string; color: string }> = {
    'Equity': { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    'Fixed Income': { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
    'Alternatives': { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  };
  const c = colors[assetClass] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    background: c.bg,
    color: c.color,
  };
}

const styles = {
  container: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #1e293b',
    overflow: 'hidden',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: '16px',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '12px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    borderBottom: '1px solid #1e293b',
    fontWeight: 600,
    color: '#475569',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap' as const,
  },
  tr: {
    borderBottom: '1px solid #1e293b',
  },
  td: {
    padding: '10px 12px',
    color: '#cbd5e1',
    whiteSpace: 'nowrap' as const,
  },
};
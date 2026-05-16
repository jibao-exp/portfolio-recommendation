'use client';

import type { AssetMetrics } from '@/lib/types';

interface RecommendationTableProps {
  assets: AssetMetrics[];
}

export default function RecommendationTable({ assets }: RecommendationTableProps) {
  const sortedAssets = [...assets].sort((a, b) => b.recommended_weight - a.recommended_weight);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Portfolio Recommendation</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Asset</th>
              <th style={styles.th}>Class</th>
              <th style={styles.th}>Current</th>
              <th style={styles.th}>Recommended</th>
              <th style={styles.th}>Change</th>
              <th style={styles.th}>Ann. Return</th>
              <th style={styles.th}>Volatility</th>
              <th style={styles.th}>Sharpe</th>
              <th style={styles.th}>Max DD</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map(asset => {
              const change = asset.recommended_weight - asset.current_weight;
              return (
                <tr key={asset.isin} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.assetName}>{asset.name}</div>
                    <div style={styles.isin}>{asset.isin}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={getClassBadgeStyle(asset.asset_class)}>{asset.asset_class}</span>
                  </td>
                  <td style={styles.td}>{(asset.current_weight * 100).toFixed(1)}%</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>
                    {(asset.recommended_weight * 100).toFixed(1)}%
                  </td>
                  <td style={{ ...styles.td, color: change > 0 ? '#22c55e' : change < 0 ? '#ef4444' : '#64748b' }}>
                    {change > 0 ? '+' : ''}{(change * 100).toFixed(1)}pp
                  </td>
                  <td style={styles.td}>{(asset.annualized_return * 100).toFixed(2)}%</td>
                  <td style={styles.td}>{(asset.annualized_volatility * 100).toFixed(2)}%</td>
                  <td style={styles.td}>{asset.sharpe_ratio.toFixed(3)}</td>
                  <td style={styles.td}>{(asset.max_drawdown * 100).toFixed(2)}%</td>
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
    'Equity': { bg: '#dbeafe', color: '#1d4ed8' },
    'Fixed Income': { bg: '#dcfce7', color: '#15803d' },
    'Alternatives': { bg: '#fef3c7', color: '#b45309' },
  };
  const c = colors[assetClass] || { bg: '#f1f5f9', color: '#475569' };
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    background: c.bg,
    color: c.color,
  };
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px 16px',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: 600,
    color: '#64748b',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap' as const,
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 16px',
    color: '#1e293b',
    whiteSpace: 'nowrap' as const,
  },
  assetName: {
    fontWeight: 500,
    color: '#1e293b',
  },
  isin: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '2px',
  },
};
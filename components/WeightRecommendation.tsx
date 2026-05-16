'use client';

import type { AssetMetrics } from '@/lib/types';

interface WeightRecommendationProps {
  assets: AssetMetrics[];
}

export default function WeightRecommendation({ assets }: WeightRecommendationProps) {
  const maxWeight = Math.max(...assets.map(a => Math.max(a.current_weight, a.recommended_weight)));
  const maxPercent = Math.ceil(maxWeight * 100 / 5) * 5;

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

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div style={{ ...styles.col, ...styles.colAsset }}>Asset</div>
          <div style={{ ...styles.col, ...styles.colBar }}>Weight Allocation</div>
          <div style={{ ...styles.col, ...styles.colNum }}>Current</div>
          <div style={{ ...styles.col, ...styles.colNum }}>Recommended</div>
          <div style={{ ...styles.col, ...styles.colNum }}>Change</div>
        </div>

        {assets.map((asset) => {
          const currentPct = asset.current_weight * 100;
          const recommendedPct = asset.recommended_weight * 100;
          const change = recommendedPct - currentPct;
          const isIncrease = change > 0;
          const isDecrease = change < 0;

          return (
            <div key={asset.isin} style={styles.row}>
              <div style={{ ...styles.col, ...styles.colAsset }}>
                <div style={styles.assetName}>{asset.name}</div>
                <div style={styles.assetClass}>{asset.asset_class}</div>
              </div>
              <div style={{ ...styles.col, ...styles.colBar }}>
                <div style={styles.barContainer}>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        ...styles.barCurrent,
                        width: `${(currentPct / maxPercent) * 100}%`,
                      }}
                    />
                    <div
                      style={{
                        ...styles.barFill,
                        ...styles.barRecommended,
                        width: `${(recommendedPct / maxPercent) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ ...styles.col, ...styles.colNum, ...styles.numCurrent }}>
                {currentPct.toFixed(1)}%
              </div>
              <div style={{ ...styles.col, ...styles.colNum, ...styles.numRecommended }}>
                {recommendedPct.toFixed(1)}%
              </div>
              <div
                style={{
                  ...styles.col,
                  ...styles.colNum,
                  color: isIncrease ? '#22c55e' : isDecrease ? '#ef4444' : '#64748b',
                }}
              >
                {change === 0 ? '—' : `${isIncrease ? '+' : ''}${change.toFixed(1)}pp`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
    fontSize: '11px',
    color: '#94a3b8',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    display: 'inline-block',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 70px 85px 70px',
    gap: '12px',
    alignItems: 'center',
    paddingBottom: '10px',
    borderBottom: '1px solid #1e293b',
    marginBottom: '8px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 70px 85px 70px',
    gap: '12px',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #1e293b22',
  },
  col: {},
  colAsset: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  colBar: {
    display: 'flex',
    alignItems: 'center',
  },
  colNum: {
    fontSize: '12px',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
  },
  assetName: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#e2e8f0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  assetClass: {
    fontSize: '10px',
    color: '#475569',
  },
  barContainer: {
    width: '100%',
  },
  barTrack: {
    position: 'relative',
    height: '16px',
    background: '#1e293b',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  barCurrent: {
    background: '#6366f1',
    opacity: 0.5,
    zIndex: 1,
  },
  barRecommended: {
    background: '#f97316',
    opacity: 0.85,
    zIndex: 2,
  },
  numCurrent: {
    color: '#818cf8',
  },
  numRecommended: {
    color: '#fb923c',
  },
};

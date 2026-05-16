'use client';

import type { AssetMetrics, Constraints } from '@/lib/types';

interface ConstraintChecksProps {
  assets: AssetMetrics[];
  constraints: Constraints;
}

export default function ConstraintChecks({ assets, constraints }: ConstraintChecksProps) {
  const checks = getConstraintChecks(assets, constraints);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Constraint Checks</h3>
      <div style={styles.list}>
        {checks.map((check, i) => (
          <div key={i} style={styles.row}>
            <div style={styles.labelRow}>
              <span style={styles.label}>{check.label}</span>
              <span style={styles.value}>{check.value}</span>
            </div>
            <div style={styles.barBg}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${Math.min(check.percent, 100)}%`,
                  background: check.passed ? '#22c55e' : '#ef4444',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getConstraintChecks(assets: AssetMetrics[], constraints: Constraints) {
  const checks: { label: string; value: string; percent: number; passed: boolean }[] = [];

  const maxWeight = Math.max(...assets.map(a => a.recommended_weight));
  checks.push({
    label: 'Max weight — no asset',
    value: `${(maxWeight * 100).toFixed(1)}% / ${(constraints.max_weight * 100).toFixed(0)}%`,
    percent: (maxWeight / constraints.max_weight) * 100,
    passed: maxWeight <= constraints.max_weight,
  });

  const minWeight = Math.min(...assets.filter(a => a.recommended_weight > 0).map(a => a.recommended_weight));
  checks.push({
    label: 'Min weight — no asset',
    value: `${(minWeight * 100).toFixed(1)}% / ${(constraints.min_weight * 100).toFixed(0)}%`,
    percent: (minWeight / constraints.min_weight) * 100,
    passed: minWeight >= constraints.min_weight,
  });

  const activeAssets = assets.filter(a => a.recommended_weight > 0).length;
  checks.push({
    label: 'Max active assets',
    value: `${activeAssets} / ${constraints.max_assets}`,
    percent: (activeAssets / constraints.max_assets) * 100,
    passed: activeAssets <= constraints.max_assets,
  });

  const classCaps = constraints.per_asset_class_caps || {};
  Object.entries(classCaps).forEach(([assetClass, cap]) => {
    const classTotal = assets
      .filter(a => a.asset_class === assetClass)
      .reduce((sum, a) => sum + a.recommended_weight, 0);
    checks.push({
      label: `${assetClass} cap`,
      value: `${(classTotal * 100).toFixed(1)}% / ${(cap * 100).toFixed(0)}%`,
      percent: (classTotal / cap) * 100,
      passed: classTotal <= cap,
    });
  });

  return checks;
}

const styles = {
  container: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #1e293b',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: '16px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  row: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  value: {
    fontSize: '12px',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  barBg: {
    height: '4px',
    background: '#1e293b',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
};
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  it('renders label, value, and sublabel', () => {
    render(<MetricCard label="PORTFOLIO RETURN" value="9.2%" sublabel="annualised" />);

    expect(screen.getByText('PORTFOLIO RETURN')).toBeInTheDocument();
    expect(screen.getByText('9.2%')).toBeInTheDocument();
    expect(screen.getByText('annualised')).toBeInTheDocument();
  });

  it('renders with default variant (white text)', () => {
    const { container } = render(
      <MetricCard label="VOLATILITY" value="16.0%" sublabel="annualised" variant="default" />
    );

    const valueEl = container.querySelector('[style*="color: rgb(226, 232, 240)"]');
    expect(valueEl).toBeInTheDocument();
  });

  it('renders with positive variant (green text)', () => {
    const { container } = render(
      <MetricCard label="RETURN" value="9.2%" sublabel="annualised" variant="positive" />
    );

    const valueEl = container.querySelector('[style*="color: rgb(34, 197, 94)"]');
    expect(valueEl).toBeInTheDocument();
  });

  it('renders with negative variant (red text)', () => {
    const { container } = render(
      <MetricCard label="DRAWDOWN" value="-5.1%" sublabel="peak-to-trough" variant="negative" />
    );

    const valueEl = container.querySelector('[style*="color: rgb(239, 68, 68)"]');
    expect(valueEl).toBeInTheDocument();
  });

  it('uses default variant when not specified', () => {
    const { container } = render(
      <MetricCard label="ASSETS" value="2" sublabel="of 5 total" />
    );

    const valueEl = container.querySelector('[style*="color: rgb(226, 232, 240)"]');
    expect(valueEl).toBeInTheDocument();
  });
});

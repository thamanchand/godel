import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Zone from '../Zone';
import styles from '../Zone.module.scss';

describe('Zone', () => {
  it('renders zone with valid zoneId', () => {
    render(<Zone zoneId="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('applies correct zone class based on zoneId', () => {
    const { container } = render(<Zone zoneId="B" />);
    const zoneElement = container.querySelector(`.${styles.zoneB}`);
    expect(zoneElement).toBeInTheDocument();
  });

  it('returns null when no zoneId provided', () => {
    const { container } = render(<Zone />);
    expect(container.firstChild).toBeNull();
  });

  it('renders zones A through D with correct styles', () => {
    const zones = ['A', 'B', 'C', 'D'];

    zones.forEach((zone) => {
      const { container } = render(<Zone zoneId={zone} />);
      const zoneElement = container.querySelector(`.${styles[`zone${zone}`]}`);
      expect(zoneElement).toBeInTheDocument();
      expect(screen.getByText(zone)).toBeInTheDocument();
    });
  });
});

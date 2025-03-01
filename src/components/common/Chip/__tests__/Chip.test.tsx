import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Chip from '../Chip';
import styles from '../Chip.module.scss';

describe('Chip', () => {
  it('renders with label', () => {
    render(<Chip label="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('applies custom color', () => {
    const { container } = render(<Chip label="Test" color="#ff0000" />);
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('applies custom className', () => {
    const { container } = render(<Chip label="Test" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders without optional props', () => {
    render(<Chip label="Test" />);
    const chip = screen.getByText('Test');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass(styles.chip);
  });
});

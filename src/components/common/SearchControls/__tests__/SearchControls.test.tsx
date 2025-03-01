import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import SearchControls from '../SearchControls';

describe('SearchControls', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    onKeyPress: vi.fn(),
    distanceFilter: 0,
    onDistanceFilterChange: vi.fn(),
    sortOrder: 'asc' as const,
    onSortOrderChange: vi.fn(),
  };

  it('renders all controls', () => {
    render(<SearchControls {...defaultProps} />);

    expect(screen.getByPlaceholderText(/enter stop name/i)).toBeInTheDocument();
    expect(screen.getByText(/distance/i)).toBeInTheDocument();
    expect(screen.getByText(/sort/i)).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    render(<SearchControls {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter stop name/i);
    fireEvent.change(input, { target: { value: 'test' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalled();
  });

  it('handles distance filter changes', () => {
    render(<SearchControls {...defaultProps} />);

    const select = screen.getByDisplayValue('All');
    fireEvent.change(select, { target: { value: '100' } });

    expect(defaultProps.onDistanceFilterChange).toHaveBeenCalledWith(100);
  });

  it('handles sort order changes', () => {
    render(<SearchControls {...defaultProps} />);

    const select = screen.getByDisplayValue('Nearest first');
    fireEvent.change(select, { target: { value: 'desc' } });

    expect(defaultProps.onSortOrderChange).toHaveBeenCalledWith('desc');
  });
});

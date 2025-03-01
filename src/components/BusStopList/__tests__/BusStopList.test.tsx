import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import BusStopList from '..';
import { useReverseGeocode } from '../../../hooks/useReverseGeocode';

vi.mock('../../../hooks/useReverseGeocode');

describe('BusStopList', () => {
  const mockStops = [
    {
      gtfsId: 'HSL:1234567',
      name: 'Test Stop 1',
      code: '1234',
      platformCode: 'A',
      lat: 60.1699,
      lon: 24.9384,
      zoneId: 'A',
      distance: 100,
    },
  ];

  beforeEach(() => {
    vi.mocked(useReverseGeocode).mockReturnValue({
      address: 'Test Address',
      isLoading: false,
    });
  });

  it('renders loading state', () => {
    render(<BusStopList stops={[]} loading={true} position={[60.1699, 24.9384]} />);
  });

  it('renders stops list', () => {
    vi.mocked(useReverseGeocode).mockReturnValue({
      address: 'Test Address',
      isLoading: false,
    });

    render(<BusStopList stops={mockStops} loading={false} position={[60.1699, 24.9384]} />);
    expect(screen.getByText(new RegExp(mockStops[0].name))).toBeInTheDocument();
    expect(screen.getByText('Stops nearby:')).toBeInTheDocument();
    expect(screen.getByText('Test Address')).toBeInTheDocument();
  });
});

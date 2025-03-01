import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import BusStopCard from '../BusStopCard';

describe('BusStopCard', () => {
  const mockStop = {
    gtfsId: 'HSL:1234567',
    name: 'Test Stop',
    code: '1234',
    platformCode: 'A',
    lat: 60.1699,
    lon: 24.9384,
    zoneId: 'A',
    distance: 100,
  };

  it('renders stop information correctly', () => {
    render(<BusStopCard stop={mockStop} />);

    // Use regex to match partial text since name and code are combined
    expect(screen.getByText(new RegExp(mockStop.name))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockStop.code))).toBeInTheDocument();
    expect(screen.getByText('Zone')).toBeInTheDocument();
    expect(screen.getByText(/100m away/i)).toBeInTheDocument();
    expect(screen.getByText(mockStop.zoneId)).toBeInTheDocument();
  });
});

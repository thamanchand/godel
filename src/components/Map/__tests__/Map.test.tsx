import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Map from '../Map';

// Mock leaflet and react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(() => null),
  TileLayer: vi.fn(() => null),
  Marker: vi.fn(() => null),
  useMapEvents: vi.fn(),
}));

describe('Map', () => {
  const defaultProps = {
    position: [60.1699, 24.9384] as [number, number],
    onPositionChange: vi.fn(),
    stops: [],
  };

  it('renders without crashing', () => {
    const { container } = render(<Map {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it('renders with stops', () => {
    const stops = [
      {
        gtfsId: 'HSL:1234567',
        name: 'Test Stop',
        code: '1234',
        platformCode: 'A',
        lat: 60.1699,
        lon: 24.9384,
        zoneId: 'A',
        distance: 100,
      },
    ];

    const { container } = render(<Map {...defaultProps} stops={stops} />);
    expect(container).toBeInTheDocument();
  });
});

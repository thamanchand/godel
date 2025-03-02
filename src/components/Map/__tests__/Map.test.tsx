import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Map from '../Map';

// Mock leaflet and react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(() => null),
  TileLayer: vi.fn(() => null),
  Marker: vi.fn(() => null),
  Polyline: vi.fn(() => null),
  Popup: vi.fn(() => null),
  useMapEvents: vi.fn(),
  useMap: vi.fn(() => ({
    getCenter: vi.fn(() => ({ lat: 60.1699, lng: 24.9384 })),
  })),
  ZoomControl: vi.fn(() => null),
}));

describe('Map', () => {
  const defaultProps = {
    position: [60.1699, 24.9384] as [number, number],
    onPositionChange: vi.fn(),
    route: null,
    isCalculating: false,
  };

  it('renders without crashing', () => {
    const { container } = render(<Map {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it('renders with route data', () => {
    const route = {
      points: [
        { name: 'Start Point', lat: 60.1699, lon: 24.9384 },
        { name: 'End Point', lat: 60.18, lon: 24.95 },
      ],
      segments: [
        {
          from: { name: 'Start Point', lat: 60.1699, lon: 24.9384 },
          to: { name: 'End Point', lat: 60.18, lon: 24.95 },
          path: [[60.1699, 24.9384] as [number, number], [60.18, 24.95] as [number, number]],
          distance: 1.5,
          duration: 10,
        },
      ],
      distance: 1.5,
      duration: 10,
      path: [[60.1699, 24.9384] as [number, number], [60.18, 24.95] as [number, number]],
    };

    const { container } = render(<Map {...defaultProps} route={route} />);
    expect(container).toBeInTheDocument();
  });
});

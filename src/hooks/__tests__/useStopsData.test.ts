import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { getNearbyStops } from '../../services/api/busStops';
import { useStopsData } from '../useStopsData';

// Mock the API call
vi.mock('../../services/api/busStops', () => ({
  getNearbyStops: vi.fn(),
}));

describe('useStopsData', () => {
  const mockPosition: [number, number] = [60.1699, 24.9384];
  const mockStops = [
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch stops successfully', async () => {
    // Mock successful API response
    (getNearbyStops as Mock).mockResolvedValueOnce(mockStops);

    const { result } = renderHook(() => useStopsData());

    // Initial state
    expect(result.current.stops).toEqual([]);
    expect(result.current.isDataFetching).toBe(true);
    expect(result.current.error).toBeNull();

    // Fetch stops
    await act(async () => {
      await result.current.fetchStops(mockPosition);
    });

    // Check final state
    expect(result.current.stops).toEqual(mockStops);
    expect(result.current.isDataFetching).toBe(false);
    expect(result.current.error).toBeNull();
    expect(getNearbyStops).toHaveBeenCalledWith({
      latitude: mockPosition[0],
      longitude: mockPosition[1],
    });
  });

  it('should handle errors', async () => {
    // Mock API error
    const error = new Error('Failed to fetch');
    (getNearbyStops as Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useStopsData());

    await act(async () => {
      await result.current.fetchStops(mockPosition);
    });

    expect(result.current.stops).toEqual([]);
    expect(result.current.isDataFetching).toBe(false);
    expect(result.current.error).toBe(error.message);
  });

  it('should not fetch if position is null', async () => {
    const { result } = renderHook(() => useStopsData());

    await act(async () => {
      await result.current.fetchStops(null as any);
    });

    expect(getNearbyStops).not.toHaveBeenCalled();
    expect(result.current.isDataFetching).toBe(true);
  });
});

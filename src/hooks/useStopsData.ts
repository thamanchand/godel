import { useState, useCallback } from 'react';

import { getNearbyStops } from '../services/api/busStops';
import { Stop } from '../types/busStop';

export const useStopsData = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [isDataFetching, setIsDataFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStops = useCallback(async (position: [number, number]) => {
    if (!position) return;

    setIsDataFetching(true);
    setError(null);

    try {
      const data = await getNearbyStops({
        latitude: position[0],
        longitude: position[1],
      });
      setStops(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsDataFetching(false);
    }
  }, []);

  return { stops, isDataFetching, error, fetchStops };
};

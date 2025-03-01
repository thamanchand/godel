import { useState, useCallback } from 'react';

import { calculateShortestPath, Route } from '../services/api/routeService';

export const useRouteData = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(
    async (source: string, intermediatePoints: string[], destination: string) => {
      if (!source || !destination) return;

      setIsCalculating(true);
      setError(null);

      try {
        const routeData = await calculateShortestPath(source, intermediatePoints, destination);
        setRoute(routeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setRoute(null);
      } finally {
        setIsCalculating(false);
      }
    },
    []
  );

  return { route, isCalculating, error, calculateRoute };
};

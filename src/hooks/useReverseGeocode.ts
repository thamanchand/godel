import { useState, useEffect } from 'react';

import { GEOCODING_API_URL } from '../constants';

const API_KEY = '754a004ba87c4fdd8506532327e212c0';

export const useReverseGeocode = (position: [number, number]) => {
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${GEOCODING_API_URL}?point.lat=${position[0]}&point.lon=${position[1]}&size=1&digitransit-subscription-key=${API_KEY}`
        );
        const data = await response.json();
        if (data.features?.[0]?.properties?.label) {
          setAddress(data.features[0].properties.label);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddress();
  }, [position]);

  return { address, isLoading };
};

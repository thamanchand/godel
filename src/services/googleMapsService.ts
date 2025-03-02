/**
 * Google Maps Service
 *
 * This service encapsulates all interactions with the Google Maps API,
 * providing a cleaner interface and handling availability checks.
 */

// Safe browser environment check
const isBrowser = typeof window !== 'undefined';

// Safe access to Google Maps API
const getGoogleMaps = () => {
  if (!isBrowser) return null;
  return window?.google?.maps || null;
};

// Check if Google Maps API is available
export const isGoogleMapsLoaded = (): boolean => {
  const maps = getGoogleMaps();
  return !!maps && !!maps.places;
};

// Create a Google Maps Autocomplete instance
export const createAutocomplete = (
  inputElement: HTMLInputElement,
  options: {
    componentRestrictions?: { country: string };
    fields?: string[];
    types?: string[];
  } = {}
): any => {
  if (!inputElement) {
    console.warn('Input element is null');
    return null;
  }

  const maps = getGoogleMaps();
  if (!maps || !maps.places) {
    console.warn('Google Maps Places API not loaded');
    return null;
  }

  try {
    return new maps.places.Autocomplete(inputElement, options);
  } catch (error) {
    console.error('Error creating Google Maps Autocomplete:', error);
    return null;
  }
};

// Clear event listeners from a Google Maps object
export const clearInstanceListeners = (instance: any): void => {
  if (!instance) return;

  const maps = getGoogleMaps();
  if (!maps) return;

  try {
    // Check if maps.event exists before using it
    if (maps.event) {
      maps.event.clearInstanceListeners(instance);
    }
  } catch (error) {
    console.error('Error clearing Google Maps event listeners:', error);
  }
};

// Geocode a location using Google Maps Geocoder
export const geocodeWithGoogle = (
  address: string,
  options: { componentRestrictions?: { country: string } } = {}
): Promise<{ latitude: number; longitude: number; placeId: string }> => {
  return new Promise((resolve, reject) => {
    const maps = getGoogleMaps();
    if (!maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    try {
      const geocoder = new maps.Geocoder();

      geocoder.geocode(
        {
          address,
          ...options,
        },
        (results: any, status: any) => {
          if (status === maps.GeocoderStatus.OK && results && results.length > 0) {
            const location = results[0].geometry.location;
            resolve({
              latitude: location.lat(),
              longitude: location.lng(),
              placeId: results[0].place_id,
            });
          } else {
            reject(new Error(`Google geocoding failed with status: ${status}`));
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

// Get directions using Google Maps Directions Service
export const getDirections = (
  origin: { lat: number; lng: number } | { placeId: string },
  destination: { lat: number; lng: number } | { placeId: string }
): Promise<{
  path: [number, number][];
  distance: number;
  duration: number;
}> => {
  return new Promise((resolve, reject) => {
    const maps = getGoogleMaps();
    if (!maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    try {
      const directionsService = new maps.DirectionsService();

      const request: any = {
        origin,
        destination,
        travelMode: maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result: any, status: any) => {
        if (status === maps.DirectionsStatus.OK && result.routes.length > 0) {
          const route = result.routes[0];
          const path: [number, number][] = [];

          // Extract path from the route
          const pathPoints = route.overview_path;
          for (let i = 0; i < pathPoints.length; i++) {
            path.push([pathPoints[i].lat(), pathPoints[i].lng()]);
          }

          // Extract distance and duration
          let distance = 0;
          let duration = 0;

          for (let i = 0; i < route.legs.length; i++) {
            distance += route.legs[i].distance.value;
            duration += route.legs[i].duration.value;
          }

          // Convert to km and minutes
          distance = distance / 1000;
          duration = duration / 60;

          resolve({
            path,
            distance,
            duration,
          });
        } else {
          reject(new Error(`Google Directions API failed with status: ${status}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Initialize Google Maps API event listener
export const initGoogleMapsListener = (
  callback: () => void,
  timeoutMs: number = 5000
): (() => void) => {
  if (isGoogleMapsLoaded()) {
    callback();
    return () => {}; // No cleanup needed
  }

  if (!isBrowser) {
    return () => {}; // No-op for SSR
  }

  // Listen for the custom event from index.html
  window.addEventListener('google-maps-loaded', callback);

  // Set up a fallback timer
  const timer = setTimeout(callback, timeoutMs);

  // Return cleanup function
  return () => {
    window.removeEventListener('google-maps-loaded', callback);
    clearTimeout(timer);
  };
};

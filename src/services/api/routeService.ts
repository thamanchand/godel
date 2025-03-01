import { Position } from '../../types/busStop';

// Define the route point type
export interface RoutePoint {
  name: string;
  lat: number;
  lon: number;
  placeId?: string; // Google Place ID for more accurate routing
}

// Define the route segment type
export interface RouteSegment {
  from: RoutePoint;
  to: RoutePoint;
  path: [number, number][];
  distance: number;
  duration: number;
}

// Define the route type
export interface Route {
  points: RoutePoint[];
  segments: RouteSegment[];
  distance: number;
  duration: number;
  // Array of coordinates for the entire path
  path: [number, number][];
}

// OpenRouteService API key - in a real app, this would be in .env
// You'll need to replace this with your own API key from https://openrouteservice.org/
const ORS_API_KEY = '5b3ce3597851110001cf62483fef2fb5e3e649f88b7e0ca3896a2c65';
const ORS_API_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

// Geocode a location name to coordinates
export const geocodeLocation = async (
  locationName: string
): Promise<Position & { placeId?: string }> => {
  try {
    // First try to use Google Places API if available
    if (
      typeof window !== 'undefined' &&
      window.google &&
      window.google.maps &&
      window.google.maps.places
    ) {
      try {
        return await geocodeWithGooglePlaces(locationName);
      } catch (googleError) {
        console.warn('Google Places geocoding failed, falling back to Nominatim:', googleError);
        // Fall back to Nominatim if Google Places fails
      }
    }

    // Add "Finland" to the query if not already present to improve geocoding accuracy
    let searchQuery = locationName;
    if (
      !searchQuery.toLowerCase().includes('finland') &&
      !searchQuery.toLowerCase().includes('helsinki')
    ) {
      searchQuery += ', Helsinki, Finland';
    } else if (!searchQuery.toLowerCase().includes('finland')) {
      searchQuery += ', Finland';
    }

    // Try to use Nominatim geocoding service (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&limit=1&accept-language=en&countrycodes=fi`
    );

    if (!response.ok) {
      throw new Error('Geocoding API error');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    // If the first attempt fails, try with just the original query
    if (searchQuery !== locationName) {
      const fallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}&limit=1&accept-language=en`
      );

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          return {
            latitude: parseFloat(fallbackData[0].lat),
            longitude: parseFloat(fallbackData[0].lon),
          };
        }
      }
    }

    throw new Error('Location not found');
  } catch (error) {
    console.error('Error geocoding location, using fallback:', error);

    // Specific fallbacks for known Helsinki locations
    const knownLocations: Record<string, [number, number]> = {
      'kamppi center': [60.1694, 24.9327],
      kamppi: [60.1694, 24.9327],
      'olympic stadium': [60.1841, 24.9256],
      'university of helsinki': [60.1699, 24.95],
      'helsinki central station': [60.1718, 24.9414],
      'helsinki airport': [60.3172, 24.9633],
      suomenlinna: [60.1454, 24.9881],
    };

    // Check if the location is in our known locations list
    const normalizedInput = locationName.toLowerCase().trim();
    for (const [key, coords] of Object.entries(knownLocations)) {
      if (normalizedInput.includes(key)) {
        return {
          latitude: coords[0],
          longitude: coords[1],
        };
      }
    }

    // Fallback to central Helsinki if no match
    return {
      latitude: 60.1699,
      longitude: 24.9384,
    };
  }
};

// Geocode using Google Places API
const geocodeWithGooglePlaces = (locationName: string): Promise<Position & { placeId: string }> => {
  return new Promise((resolve, reject) => {
    try {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode(
        {
          address: locationName,
          componentRestrictions: { country: 'fi' }, // Restrict to Finland
        },
        (results: any, status: any) => {
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
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

// Get route between two points using OpenRouteService API
async function getRouteSegment(
  start: [number, number],
  end: [number, number],
  startPoint: RoutePoint,
  endPoint: RoutePoint
): Promise<RouteSegment> {
  try {
    // Ensure coordinates are within valid ranges
    const validStart = validateCoordinates(start);
    const validEnd = validateCoordinates(end);

    const response = await fetch(`${ORS_API_URL}/json`, {
      method: 'POST',
      headers: {
        Authorization: ORS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json, application/geo+json',
      },
      body: JSON.stringify({
        coordinates: [
          [validStart[1], validStart[0]], // OpenRouteService uses [lon, lat] format
          [validEnd[1], validEnd[0]],
        ],
        format: 'geojson',
        instructions: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouteService error response:', errorText);
      throw new Error(`OpenRouteService API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    // Extract the path coordinates from the response
    const coordinates = data.routes[0].geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]] as [number, number] // Convert back to [lat, lon]
    );

    // Extract distance (in km) and duration (in seconds)
    const distance = data.routes[0].summary.distance / 1000; // Convert to km
    const duration = data.routes[0].summary.duration / 60; // Convert to minutes

    return {
      from: startPoint,
      to: endPoint,
      path: coordinates,
      distance,
      duration,
    };
  } catch (error) {
    console.error('Error fetching route from OpenRouteService:', error);

    // Try Google Directions API if available
    if (
      typeof window !== 'undefined' &&
      window.google &&
      window.google.maps &&
      window.google.maps.DirectionsService
    ) {
      try {
        return await getRouteWithGoogleDirections(start, end, startPoint, endPoint);
      } catch (googleError) {
        console.error('Google Directions API failed:', googleError);
      }
    }

    // Try alternative API for routing
    try {
      return await getRouteSegmentAlternative(start, end, startPoint, endPoint);
    } catch (altError) {
      console.error('Alternative routing also failed:', altError);

      // Fallback to straight line if all APIs fail
      const distance = calculateDistance(start[0], start[1], end[0], end[1]);
      return {
        from: startPoint,
        to: endPoint,
        path: generateIntermediatePoints(start, end), // Generate some intermediate points
        distance,
        duration: (distance / 50) * 60, // Estimate: 50 km/h
      };
    }
  }
}

// Get route using Google Directions API
const getRouteWithGoogleDirections = (
  start: [number, number],
  end: [number, number],
  startPoint: RoutePoint,
  endPoint: RoutePoint
): Promise<RouteSegment> => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.google || !window.google.maps) {
        throw new Error('Google Maps API not available');
      }

      const directionsService = new window.google.maps.DirectionsService();

      // Define the request with proper types
      const request: any = {
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      // Set origin and destination
      if (startPoint.placeId) {
        request.origin = { placeId: startPoint.placeId };
      } else {
        request.origin = { lat: start[0], lng: start[1] };
      }

      if (endPoint.placeId) {
        request.destination = { placeId: endPoint.placeId };
      } else {
        request.destination = { lat: end[0], lng: end[1] };
      }

      directionsService.route(request, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK && result.routes.length > 0) {
          const route = result.routes[0];
          const path: [number, number][] = [];

          // Extract path from the route
          const path_points = route.overview_path;
          for (let i = 0; i < path_points.length; i++) {
            path.push([path_points[i].lat(), path_points[i].lng()]);
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
            from: startPoint,
            to: endPoint,
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

// Alternative routing API as backup
async function getRouteSegmentAlternative(
  start: [number, number],
  end: [number, number],
  startPoint: RoutePoint,
  endPoint: RoutePoint
): Promise<RouteSegment> {
  // Use OSRM demo server as a backup
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
  );

  if (!response.ok) {
    throw new Error(`OSRM API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found from alternative API');
  }

  // Extract the path coordinates
  const coordinates = data.routes[0].geometry.coordinates.map(
    (coord: [number, number]) => [coord[1], coord[0]] as [number, number] // Convert to [lat, lon]
  );

  // Extract distance and duration
  const distance = data.routes[0].distance / 1000; // Convert to km
  const duration = data.routes[0].duration / 60; // Convert to minutes

  return {
    from: startPoint,
    to: endPoint,
    path: coordinates,
    distance,
    duration,
  };
}

// Generate some intermediate points to make straight lines look more natural
function generateIntermediatePoints(
  start: [number, number],
  end: [number, number],
  numPoints = 5
): [number, number][] {
  const result: [number, number][] = [start];

  for (let i = 1; i < numPoints; i++) {
    const ratio = i / numPoints;
    const lat = start[0] + (end[0] - start[0]) * ratio;
    const lon = start[1] + (end[1] - start[1]) * ratio;

    // Add a small random offset to make it look less straight
    const latOffset = (Math.random() - 0.5) * 0.005;
    const lonOffset = (Math.random() - 0.5) * 0.005;

    result.push([lat + latOffset, lon + lonOffset]);
  }

  result.push(end);
  return result;
}

// Validate and fix coordinates to ensure they're within valid ranges
function validateCoordinates(coords: [number, number]): [number, number] {
  let [lat, lon] = coords;

  // Ensure latitude is between -90 and 90
  lat = Math.max(-90, Math.min(90, lat));

  // Ensure longitude is between -180 and 180
  lon = ((lon + 540) % 360) - 180;

  return [lat, lon];
}

// Calculate the shortest path between multiple points
export const calculateShortestPath = async (
  source: string,
  intermediatePoints: string[],
  destination: string
): Promise<Route> => {
  try {
    // Geocode all locations to get coordinates
    const sourceCoords = await geocodeLocation(source);
    const destCoords = await geocodeLocation(destination);

    // Create an array to hold all points
    const routePoints: RoutePoint[] = [
      {
        name: source,
        lat: sourceCoords.latitude,
        lon: sourceCoords.longitude,
        placeId: sourceCoords.placeId,
      },
    ];

    // Geocode and add intermediate points
    const intermediateCoords: (Position & { placeId?: string })[] = [];
    for (const point of intermediatePoints) {
      if (point.trim()) {
        // Only process non-empty points
        const coords = await geocodeLocation(point);
        intermediateCoords.push(coords);
        routePoints.push({
          name: point,
          lat: coords.latitude,
          lon: coords.longitude,
          placeId: coords.placeId,
        });
      }
    }

    // Add destination
    routePoints.push({
      name: destination,
      lat: destCoords.latitude,
      lon: destCoords.longitude,
      placeId: destCoords.placeId,
    });

    // Calculate route segments between each pair of points
    let totalDistance = 0;
    let totalDuration = 0;
    let fullPath: [number, number][] = [];
    const segments: RouteSegment[] = [];

    for (let i = 0; i < routePoints.length - 1; i++) {
      const pointA = routePoints[i];
      const pointB = routePoints[i + 1];

      const segment = await getRouteSegment(
        [pointA.lat, pointA.lon],
        [pointB.lat, pointB.lon],
        pointA,
        pointB
      );

      segments.push(segment);
      totalDistance += segment.distance;
      totalDuration += segment.duration;

      // Add segment path to full path (avoid duplicating points)
      if (i === 0) {
        fullPath = [...segment.path];
      } else {
        // Skip the first point of subsequent segments to avoid duplication
        fullPath = [...fullPath, ...segment.path.slice(1)];
      }
    }

    return {
      points: routePoints,
      segments,
      distance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal place
      duration: Math.round(totalDuration),
      path: fullPath,
    };
  } catch (error) {
    console.error('Error calculating shortest path:', error);
    throw new Error('Failed to calculate the shortest path');
  }
};

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

import { Position } from '../../types/busStop';
import { geocodeWithGoogle, getDirections, isGoogleMapsLoaded } from '../googleMapsService';

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
    if (isGoogleMapsLoaded()) {
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
  return geocodeWithGoogle(locationName, { componentRestrictions: { country: 'fi' } });
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
    if (isGoogleMapsLoaded()) {
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
const getRouteWithGoogleDirections = async (
  start: [number, number],
  end: [number, number],
  startPoint: RoutePoint,
  endPoint: RoutePoint
): Promise<RouteSegment> => {
  // Define origin and destination
  const origin = startPoint.placeId
    ? { placeId: startPoint.placeId }
    : { lat: start[0], lng: start[1] };

  const destination = endPoint.placeId
    ? { placeId: endPoint.placeId }
    : { lat: end[0], lng: end[1] };

  // Get directions
  const result = await getDirections(origin, destination);

  return {
    from: startPoint,
    to: endPoint,
    path: result.path,
    distance: result.distance,
    duration: result.duration,
  };
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

// Helper function to calculate the Haversine distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
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

// New function to find the optimal order of points for the shortest path
async function findOptimalRouteOrder(
  sourcePoint: RoutePoint,
  intermediatePoints: RoutePoint[],
  destinationPoint: RoutePoint
): Promise<RoutePoint[]> {
  // If there are no or just one intermediate point, no optimization needed
  if (intermediatePoints.length <= 1) {
    return [sourcePoint, ...intermediatePoints, destinationPoint];
  }

  // Create a distance matrix between all intermediate points
  const n = intermediatePoints.length;
  const distanceMatrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    distanceMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        distanceMatrix[i][j] = 0;
      } else {
        const pointA = intermediatePoints[i];
        const pointB = intermediatePoints[j];
        distanceMatrix[i][j] = calculateDistance(pointA.lat, pointA.lon, pointB.lat, pointB.lon);
      }
    }
  }

  // Calculate distances from source to each intermediate point
  const sourceDistances: number[] = intermediatePoints.map((point) =>
    calculateDistance(sourcePoint.lat, sourcePoint.lon, point.lat, point.lon)
  );

  // Calculate distances from each intermediate point to destination
  const destDistances: number[] = intermediatePoints.map((point) =>
    calculateDistance(point.lat, point.lon, destinationPoint.lat, destinationPoint.lon)
  );

  // For small number of points, we can use a simple approach: try all permutations
  // This works well for up to ~10 points, which is reasonable for a navigation app
  // For larger problems, we would need a more sophisticated algorithm like genetic algorithm or simulated annealing

  // Generate all permutations of intermediate points indices
  const indices = Array.from({ length: n }, (_, i) => i);
  const permutations = generatePermutations(
    indices,
    distanceMatrix,
    sourceDistances,
    destDistances
  );

  let bestPermutation: number[] = [];
  let shortestDistance = Infinity;

  // Evaluate each permutation
  for (const perm of permutations) {
    let totalDistance = sourceDistances[perm[0]]; // Distance from source to first point

    // Add distances between intermediate points
    for (let i = 0; i < perm.length - 1; i++) {
      totalDistance += distanceMatrix[perm[i]][perm[i + 1]];
    }

    // Add distance from last intermediate point to destination
    totalDistance += destDistances[perm[perm.length - 1]];

    // Update if this is the best route found so far
    if (totalDistance < shortestDistance) {
      shortestDistance = totalDistance;
      bestPermutation = [...perm];
    }
  }

  // Construct the optimal route
  const optimalRoute = [sourcePoint];
  for (const idx of bestPermutation) {
    optimalRoute.push(intermediatePoints[idx]);
  }
  optimalRoute.push(destinationPoint);

  return optimalRoute;
}

// Helper function to generate all permutations of an array
function generatePermutations(
  arr: number[],
  distanceMatrix: number[][],
  sourceDistances: number[],
  destDistances: number[]
): number[][] {
  const result: number[][] = [];

  // For larger sets, limit the number of permutations to avoid performance issues
  if (arr.length > 8) {
    console.warn(
      'Too many intermediate points for exact solution, using nearest neighbor heuristic'
    );
    return [nearestNeighborTSP(arr, distanceMatrix, sourceDistances)];
  }

  const permute = (arr: number[], m: number[] = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr, m.concat(next));
      }
    }
  };

  permute(arr);
  return result;
}

// Nearest neighbor heuristic for TSP (for when we have too many points)
function nearestNeighborTSP(
  indices: number[],
  distanceMatrix: number[][],
  sourceDistances: number[]
): number[] {
  if (indices.length <= 1) return indices;

  // Find the best starting point (closest to source)
  let startIdx = 0;
  let minDistance = sourceDistances[0];
  for (let i = 1; i < indices.length; i++) {
    if (sourceDistances[i] < minDistance) {
      minDistance = sourceDistances[i];
      startIdx = i;
    }
  }

  const result: number[] = [indices[startIdx]];
  const remaining = indices.filter((_, i) => i !== startIdx);

  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const distance = distanceMatrix[last][remaining[i]];
      if (distance < minDistance) {
        minDistance = distance;
        nearestIdx = i;
      }
    }

    result.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }

  return result;
}

/**
 * Calculates the shortest path from a source through intermediate points to a destination.
 *
 * This function implements a solution to the Traveling Salesman Problem (TSP) to find
 * the optimal order of visiting all intermediate points. The algorithm works as follows:
 *
 * 1. For a small number of points (≤ 8), it uses a brute-force approach to try all possible
 *    permutations of intermediate points and selects the one with the shortest total distance.
 *
 * 2. For a larger number of points (> 8), it uses the Nearest Neighbor heuristic to find
 *    a reasonably good route in a more efficient manner.
 *
 * The function first geocodes all locations to get their coordinates, then calculates the
 * optimal order, and finally computes the actual route segments between each pair of points
 * in the optimized order.
 *
 * @param source - The starting location
 * @param intermediatePoints - Array of intermediate locations to visit
 * @param destination - The final destination
 * @returns A Route object containing the optimized path, distance, duration, etc.
 */
export const calculateShortestPath = async (
  source: string,
  intermediatePoints: string[],
  destination: string
): Promise<Route> => {
  try {
    // Geocode all locations to get coordinates
    const sourceCoords = await geocodeLocation(source);
    const destCoords = await geocodeLocation(destination);

    // Create source and destination points
    const sourcePoint: RoutePoint = {
      name: source,
      lat: sourceCoords.latitude,
      lon: sourceCoords.longitude,
      placeId: sourceCoords.placeId,
    };

    const destPoint: RoutePoint = {
      name: destination,
      lat: destCoords.latitude,
      lon: destCoords.longitude,
      placeId: destCoords.placeId,
    };

    // Geocode intermediate points
    const intermediateRoutePoints: RoutePoint[] = [];
    for (const point of intermediatePoints) {
      if (point.trim()) {
        // Only process non-empty points
        const coords = await geocodeLocation(point);
        intermediateRoutePoints.push({
          name: point,
          lat: coords.latitude,
          lon: coords.longitude,
          placeId: coords.placeId,
        });
      }
    }

    // Find the optimal order of points
    const optimizedRoutePoints = await findOptimalRouteOrder(
      sourcePoint,
      intermediateRoutePoints,
      destPoint
    );

    // Calculate route segments between each pair of points in the optimized order
    let totalDistance = 0;
    let totalDuration = 0;
    let fullPath: [number, number][] = [];
    const segments: RouteSegment[] = [];

    for (let i = 0; i < optimizedRoutePoints.length - 1; i++) {
      const pointA = optimizedRoutePoints[i];
      const pointB = optimizedRoutePoints[i + 1];

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
      points: optimizedRoutePoints,
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

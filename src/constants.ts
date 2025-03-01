export const DEFAULT_POSITION = { lat: 60.1699, lng: 24.9384 }; // Simonkatu, Helsinki
export const API_URL = 'https://api.digitransit.fi/routing/v2/hsl/gtfs/v1';
export const GEOCODING_API_URL = 'https://api.digitransit.fi/geocoding/v1/reverse';

export const SEARCH_RADIUS = 900; // meters

export const DISTANCE_FILTERS = [
  { label: 'All', value: 0 },
  { label: '100m', value: 100 },
  { label: '200m', value: 200 },
  { label: '300m', value: 300 },
  { label: '400m', value: 400 },
];

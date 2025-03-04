// Default map position (Helsinki)
export const DEFAULT_POSITION = {
  lat: 60.1699,
  lng: 24.9384,
};

// Map zoom levels
export const MAP_ZOOM = {
  DEFAULT: 12,
  MIN: 8,
  MAX: 18,
};

// Route colors
export const ROUTE_COLORS = {
  SOURCE: '#3B82F6', // Blue
  DESTINATION: '#EF4444', // Red
  INTERMEDIATE: '#10B981', // Green
};

// Segment colors for route visualization
export const SEGMENT_COLORS = [
  '#FF5733', // Bright red-orange
  '#33A8FF', // Bright blue
  '#33FF57', // Bright green
  '#FF33A8', // Bright pink
  '#A833FF', // Bright purple
  '#FFD700', // Gold
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#FF8C00', // Dark orange
  '#8A2BE2', // Blue violet
  '#32CD32', // Lime green
  '#DC143C', // Crimson
];

// API endpoints
export const API_ENDPOINTS = {
  OPENROUTE: 'https://api.openrouteservice.org/v2/directions/driving-car',
  NOMINATIM: 'https://nominatim.openstreetmap.org/search',
};

// Map tile layers
export const MAP_TILES = {
  LIGHT: {
    name: 'Light',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
  },
  DARK: {
    name: 'Dark',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
  },
  SATELLITE: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  TERRAIN: {
    name: 'Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

// Known locations for fallback geocoding
export const KNOWN_LOCATIONS: Record<string, [number, number]> = {
  'kamppi center': [60.1694, 24.9327],
  kamppi: [60.1694, 24.9327],
  'olympic stadium': [60.1841, 24.9256],
  'university of helsinki': [60.1699, 24.95],
  'helsinki central station': [60.1718, 24.9414],
  'helsinki airport': [60.3172, 24.9633],
  suomenlinna: [60.1454, 24.9881],
};

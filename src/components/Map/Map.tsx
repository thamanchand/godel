import L from 'leaflet';
import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMapEvents,
  useMap,
  ZoomControl,
  Marker,
  Popup,
} from 'react-leaflet';

import { DEFAULT_POSITION } from '../../constants';
import { Route } from '../../services/api/routeService';

// No need to redeclare Window interface as it's already defined in env.d.ts

interface MapProps {
  position: [number, number];
  onPositionChange: (newPos: [number, number]) => void;
  route?: Route | null;
  isCalculating?: boolean;
}

// Map tile layers
const MAP_STYLES = {
  light: {
    name: 'Light',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
  },
  dark: {
    name: 'Dark',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  terrain: {
    name: 'Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

// Colors for route segments
const SEGMENT_COLORS = [
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

// Map controller component to handle map events
const MapController = ({
  onPositionChange,
  onMapReady,
}: {
  onPositionChange: (newPos: [number, number]) => void;
  onMapReady: (map: L.Map) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onPositionChange([center.lat, center.lng]);
    },
  });

  return null;
};

const Map = ({
  position = [DEFAULT_POSITION.lat, DEFAULT_POSITION.lng],
  onPositionChange,
  route = null,
  isCalculating = false,
}: MapProps) => {
  const routePoints = route?.points || [];
  const routeSegments = route?.segments || [];
  const [_mapReady, setMapReady] = useState(false);
  const [_mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('light');

  // Add Font Awesome for icons
  useEffect(() => {
    // Add Font Awesome if it's not already loaded
    if (!document.getElementById('font-awesome-css')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      link.integrity =
        'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
      link.crossOrigin = 'anonymous';
      link.referrerPolicy = 'no-referrer';
      document.head.appendChild(link);
    }
  }, []);

  const handleMapReady = (map: L.Map) => {
    setMapInstance(map);
    setMapReady(true);
  };

  // Function to center the map on the route
  const centerMapOnRoute = () => {
    if (!_mapInstance || !route || !routePoints.length) return;

    // Create a bounds object from all route points
    const bounds = L.latLngBounds(routePoints.map((point) => [point.lat, point.lon]));

    // Fit the map to these bounds with some padding
    _mapInstance.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
    });
  };

  // Center the map when route changes
  useEffect(() => {
    if (route && routePoints.length > 0 && _mapInstance) {
      centerMapOnRoute();
    }
  }, [route, _mapInstance]);

  return (
    <div className="w-full h-full">
      {isCalculating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-[2000] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-gray-900">Calculating optimal route...</p>
          </div>
        </div>
      )}
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: '100%', width: '100%', maxWidth: '100vw' }}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        className="leafletContainer"
      >
        <TileLayer url={MAP_STYLES[mapStyle].url} attribution={MAP_STYLES[mapStyle].attribution} />

        <ZoomControl position="bottomright" />
        <MapController onPositionChange={onPositionChange} onMapReady={handleMapReady} />

        {/* Display route if available */}
        {routePoints.length > 1 && !isCalculating && (
          <>
            {/* Route segments with different colors */}
            {routeSegments.map((segment, index) => {
              if (!segment.path || segment.path.length < 2) return null;

              const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

              return (
                <>
                  {/* Shadow effect */}
                  <Polyline
                    key={`segment-shadow-${index}`}
                    positions={segment.path}
                    color="rgba(0, 0, 0, 0.5)"
                    weight={4}
                    opacity={0.5}
                  />
                  {/* Main route line */}
                  <Polyline
                    key={`segment-${index}`}
                    positions={segment.path}
                    color={color}
                    weight={4}
                    opacity={1.0}
                  />
                </>
              );
            })}

            {/* Route points with markers */}
            {routePoints.map((point, index) => {
              const isSource = index === 0;
              const isDestination = index === routePoints.length - 1;
              const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

              // Create custom marker icons
              const markerIcon = L.divIcon({
                className: 'customMarker',
                iconSize: isSource || isDestination ? [24, 24] : [20, 20],
                iconAnchor: isSource || isDestination ? [12, 12] : [10, 10],
                popupAnchor: isSource || isDestination ? [0, -12] : [0, -10],
                html: `
                  <div class="marker-pin" style="
                    width: 100%;
                    height: 100%;
                    background-color: ${color};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: ${isSource || isDestination ? '14px' : '12px'};
                  ">
                    ${isSource ? '<i class="fa fa-home"></i>' : ''}
                    ${isDestination ? '<i class="fa fa-flag"></i>' : ''}
                    ${!isSource && !isDestination ? '<i class="fa fa-circle"></i>' : ''}
                  </div>
                `,
              });

              return (
                <Marker key={`point-${index}`} position={[point.lat, point.lon]} icon={markerIcon}>
                  <Popup>
                    <div>
                      <strong>{point.name}</strong>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Route legend */}
            {routeSegments.length > 0 && (
              <div
                className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full z-[1000] overflow-y-auto max-h-[80vh]"
                onWheel={(e) => {
                  // Prevent scroll events from propagating to the map
                  e.stopPropagation();
                }}
                onMouseEnter={() => {
                  // Disable map scroll zoom when mouse is over the legend
                  if (_mapInstance) {
                    _mapInstance.scrollWheelZoom.disable();
                  }
                }}
                onMouseLeave={() => {
                  // Re-enable map scroll zoom when mouse leaves the legend
                  if (_mapInstance) {
                    _mapInstance.scrollWheelZoom.enable();
                  }
                }}
                onClick={(e) => {
                  // Prevent click events from propagating to the map
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  // Prevent touch events from propagating to the map
                  e.stopPropagation();
                }}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Optimized Route</h4>
                    {route && (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <i className="fa fa-road text-gray-500"></i>
                          <span className="text-sm text-gray-700">{route.distance} km</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <i className="fa fa-clock text-gray-500"></i>
                          <span className="text-sm text-gray-700">{route.duration} min</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex flex-col space-y-2">
                    {/* Render all route points with their vertical lines */}
                    {routePoints.map((point, pointIndex) => {
                      const isSource = pointIndex === 0;
                      const isDestination = pointIndex === routePoints.length - 1;
                      const color = SEGMENT_COLORS[pointIndex % SEGMENT_COLORS.length];

                      // Find connecting segment for distance info
                      const nextPoint =
                        pointIndex < routePoints.length - 1 ? routePoints[pointIndex + 1] : null;
                      const connectingSegment = nextPoint
                        ? routeSegments.find(
                            (seg) =>
                              (seg.from.name === point.name && seg.to.name === nextPoint.name) ||
                              (seg.to.name === point.name && seg.from.name === nextPoint.name)
                          )
                        : null;

                      return (
                        <div key={`route-point-${pointIndex}`} className="flex items-start">
                          {/* Connection circle and vertical line on the left */}
                          {!isDestination && (
                            <div className="flex flex-col items-center mr-3">
                              {isSource ? (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: color }}
                                >
                                  <i className="fa fa-home text-white text-sm"></i>
                                </div>
                              ) : (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: color }}
                                >
                                  <i className="fa fa-circle text-white text-sm"></i>
                                </div>
                              )}
                              <div
                                className="w-0.5 h-8 relative"
                                style={{
                                  backgroundColor: color,
                                }}
                              >
                                {/* Add direction arrow at the bottom of the line */}
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                  <i
                                    className="fa fa-arrow-down text-sm"
                                    style={{ color: color }}
                                  ></i>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Point marker and info on the right */}
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center space-x-2">
                              {isDestination && (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: color }}
                                >
                                  <i className="fa fa-flag text-white text-sm"></i>
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {point.name}
                              </span>
                            </div>

                            {/* Segment info below the address */}
                            {connectingSegment && (
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <div className="flex items-center space-x-1">
                                  <i className="fa fa-road"></i>
                                  <span>{connectingSegment.distance.toFixed(1)} km</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <i className="fa fa-clock"></i>
                                  <span>{Math.round(connectingSegment.duration)} min</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </MapContainer>

      {/* Map style selector and center button */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 z-[1000]">
        {Object.entries(MAP_STYLES).map(([key, value]) => (
          <button
            key={key}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              mapStyle === key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setMapStyle(key as keyof typeof MAP_STYLES)}
          >
            {value.name}
          </button>
        ))}
        <button
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-1"
          onClick={centerMapOnRoute}
          title="Center map on route"
        >
          <i className="fa fa-crosshairs"></i>
          <span>Center</span>
        </button>
      </div>
    </div>
  );
};

export default Map;

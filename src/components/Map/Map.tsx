import L from 'leaflet';
import { useEffect, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMapEvents,
  useMap,
  ZoomControl,
} from 'react-leaflet';

import { DEFAULT_POSITION } from '../../constants';
import { Route } from '../../services/api/routeService';

import styles from './Map.module.scss';

interface MapProps {
  position: [number, number];
  onPositionChange: (newPos: [number, number]) => void;
  route?: Route | null;
  isCalculating?: boolean;
}

// Custom marker icon for source location
const sourceIcon = L.divIcon({
  className: `${styles.customMarker} ${styles.sourceMarker}`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  html: '<div class="marker-pin"></div>',
});

// Custom marker icon for destination
const destinationIcon = L.divIcon({
  className: `${styles.customMarker} ${styles.destinationMarker}`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  html: '<div class="marker-pin"></div>',
});

// Custom marker icon for intermediate points
const intermediateIcon = L.divIcon({
  className: `${styles.customMarker} ${styles.intermediateMarker}`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
  html: '<div class="marker-pin"></div>',
});

// Array of colors for route segments
const SEGMENT_COLORS = [
  '#2196f3', // Blue
  '#4caf50', // Green
  '#f44336', // Red
  '#ff9800', // Orange
  '#9c27b0', // Purple
  '#00bcd4', // Cyan
  '#ffeb3b', // Yellow
  '#795548', // Brown
];

// Component to handle map events and initialization
const MapController = ({
  onPositionChange,
  onMapReady,
}: {
  onPositionChange: (newPos: [number, number]) => void;
  onMapReady: (map: L.Map) => void;
}) => {
  const map = useMap();

  // Initialize map when it's ready
  useEffect(() => {
    if (map) {
      // Enable scroll wheel zoom
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();

      // Notify parent component that map is ready
      onMapReady(map);

      // Force a resize to ensure the map renders correctly
      try {
        map.invalidateSize();
      } catch (e) {
        console.error('Error resizing map:', e);
      }

      return () => {
        // Cleanup if needed
      };
    }
  }, [map, onMapReady]);

  // Handle map events
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onPositionChange([center.lat, center.lng]);
    },
    zoomend: () => {
      // Force a resize when zoom changes
      if (map) {
        try {
          map.invalidateSize();
        } catch (e) {
          console.error('Error resizing map:', e);
        }
      }
    },
  });

  return null;
};

// Component to fit bounds when route changes
const BoundsUpdater = ({
  bounds,
  map,
}: {
  bounds?: L.LatLngBoundsExpression;
  map: L.Map | null;
}) => {
  const leafletMap = useMap();

  useEffect(() => {
    if (bounds && leafletMap) {
      try {
        // Add padding to ensure all points are visible
        leafletMap.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14, // Limit max zoom to prevent zooming too far in
        });

        // Force a resize after fitting bounds
        try {
          leafletMap.invalidateSize();
        } catch (e) {
          console.error('Error resizing map:', e);
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to a default view if bounds calculation fails
        leafletMap.setView([60.1699, 24.9384], 12);
      }
    }
  }, [leafletMap, bounds]);

  return null;
};

const Map = ({
  position = [DEFAULT_POSITION.lat, DEFAULT_POSITION.lng],
  onPositionChange,
  route = null,
  isCalculating = false,
}: MapProps) => {
  // Extract route points if available
  const routePoints = route?.points || [];
  const routeSegments = route?.segments || [];
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Set map bounds to include all route points if available
  const getBounds = useCallback(() => {
    if (!route) return undefined;

    try {
      // Create an array of all coordinates to include in bounds
      const allPoints: [number, number][] = [];

      // Add all route points first (these are the most important)
      if (routePoints.length > 0) {
        routePoints.forEach((point) => {
          if (!isNaN(point.lat) && !isNaN(point.lon)) {
            allPoints.push([point.lat, point.lon] as [number, number]);
          }
        });
      }

      // Add segment paths if available
      if (routeSegments.length > 0) {
        routeSegments.forEach((segment) => {
          if (segment.path && segment.path.length > 0) {
            segment.path.forEach((coord) => {
              if (
                Array.isArray(coord) &&
                coord.length === 2 &&
                !isNaN(coord[0]) &&
                !isNaN(coord[1]) &&
                coord[0] >= -90 &&
                coord[0] <= 90 &&
                coord[1] >= -180 &&
                coord[1] <= 180
              ) {
                allPoints.push(coord);
              }
            });
          }
        });
      }

      // If we have points, create bounds
      if (allPoints.length > 0) {
        return L.latLngBounds(allPoints);
      }
    } catch (error) {
      console.error('Error calculating bounds:', error);
    }

    return undefined;
  }, [route, routePoints, routeSegments]);

  const bounds = getBounds();

  const handleMapReady = (map: L.Map) => {
    setMapInstance(map);
    setMapReady(true);
  };

  // Force map resize when route changes
  useEffect(() => {
    if (mapInstance && route) {
      try {
        mapInstance.invalidateSize();
      } catch (e) {
        console.error('Error resizing map:', e);
      }
    }
  }, [mapInstance, route]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: '100%', width: '100%', position: 'relative' }}
        scrollWheelZoom={true}
        zoomControl={false} // We'll use the default Leaflet zoom control
        attributionControl={false}
      >
        {!route && !isCalculating && (
          <div className={styles.overlay}>
            Enter source and destination to calculate the shortest route
          </div>
        )}

        {isCalculating && (
          <div className={`${styles.overlay} ${styles.loadingOverlay}`}>
            <div className={styles.spinner}></div>
            Calculating the best route...
          </div>
        )}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Add default zoom control */}
        <ZoomControl position="bottomright" />

        {/* Update bounds when route changes */}
        {bounds && mapReady && <BoundsUpdater bounds={bounds} map={mapInstance} />}

        {/* Display map controller */}
        <MapController onPositionChange={onPositionChange} onMapReady={handleMapReady} />

        {/* Display route if available */}
        {routePoints.length > 1 && !isCalculating && (
          <>
            {/* Route segments with different colors */}
            {routeSegments.map((segment, index) => {
              // Ensure segment has valid path data
              if (!segment.path || segment.path.length < 2) return null;

              // Validate each coordinate in the path
              const validPath = segment.path.filter(
                (coord) =>
                  Array.isArray(coord) &&
                  coord.length === 2 &&
                  !isNaN(coord[0]) &&
                  !isNaN(coord[1]) &&
                  coord[0] >= -90 &&
                  coord[0] <= 90 &&
                  coord[1] >= -180 &&
                  coord[1] <= 180
              );

              if (validPath.length < 2) return null;

              return (
                <Polyline
                  key={`segment-${index}`}
                  positions={validPath}
                  color={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                  weight={5}
                  opacity={0.7}
                  smoothFactor={1}
                >
                  <Popup>
                    <div>
                      <strong>From:</strong> {segment.from.name}
                      <br />
                      <strong>To:</strong> {segment.to.name}
                      <br />
                      <strong>Distance:</strong> {segment.distance.toFixed(1)} km
                      <br />
                      <strong>Time:</strong> {Math.round(segment.duration)} min
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

            {/* Route points - only show the main points (source, intermediate, destination) */}
            {routePoints.map((point, index) => {
              // Validate coordinates
              if (
                isNaN(point.lat) ||
                isNaN(point.lon) ||
                point.lat < -90 ||
                point.lat > 90 ||
                point.lon < -180 ||
                point.lon > 180
              ) {
                return null;
              }

              const isSource = index === 0;
              const isDestination = index === routePoints.length - 1;

              let markerLabel = 'Intermediate Point';
              if (isSource) markerLabel = 'Source';
              if (isDestination) markerLabel = 'Destination';

              // Choose the appropriate icon
              let icon = intermediateIcon;
              if (isSource) icon = sourceIcon;
              if (isDestination) icon = destinationIcon;

              return (
                <Marker
                  key={`${point.name}-${index}`}
                  position={[point.lat, point.lon]}
                  icon={icon}
                >
                  <Popup>
                    <div>
                      <strong>{point.name}</strong>
                      <br />
                      <strong>{markerLabel}</strong>
                      <br />
                      <small>
                        ({point.lat.toFixed(5)}, {point.lon.toFixed(5)})
                      </small>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Route summary */}
            {route && (
              <div className={styles.routeSummary}>
                <p>
                  <strong>Total Distance:</strong> {route.distance} km
                </p>
                <p>
                  <strong>Estimated Time:</strong> {route.duration} minutes
                </p>
              </div>
            )}

            {/* Route legend */}
            {routeSegments.length > 1 && (
              <div className={styles.routeLegend}>
                <h4>Route Segments</h4>
                <div className={styles.legendItems}>
                  {routeSegments.map((segment, index) => (
                    <div key={`legend-${index}`} className={styles.legendItem}>
                      <span
                        className={styles.colorBox}
                        style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                      ></span>
                      <span className={styles.legendText}>
                        {segment.from.name} → {segment.to.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marker legend */}
            <div className={styles.markerLegend}>
              <h4>Map Markers</h4>
              <div className={styles.legendItems}>
                <div className={styles.legendItem}>
                  <span className={`${styles.markerSymbol} ${styles.sourceSymbol}`}></span>
                  <span className={styles.legendText}>Source</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.markerSymbol} ${styles.intermediateSymbol}`}></span>
                  <span className={styles.legendText}>Intermediate Point</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.markerSymbol} ${styles.destinationSymbol}`}></span>
                  <span className={styles.legendText}>Destination</span>
                </div>
              </div>
            </div>
          </>
        )}
      </MapContainer>

      {/* Map instructions */}
      <div className={styles.mapInstructions}>
        <p>Scroll to zoom, drag to pan</p>
      </div>
    </div>
  );
};

export default Map;

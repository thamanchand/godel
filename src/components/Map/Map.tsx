import L from 'leaflet';
import { useEffect, useState } from 'react';
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

// Custom marker icons
const sourceIcon = L.divIcon({
  className: `${styles.customMarker} ${styles.sourceMarker}`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  html: '<div class="marker-pin"></div><i class="fa fa-home"></i>',
});

const destinationIcon = L.divIcon({
  className: `${styles.customMarker} ${styles.destinationMarker}`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  html: '<div class="marker-pin"></div><i class="fa fa-flag"></i>',
});

const intermediateIcon = L.divIcon({
  className: `${styles.customMarker} ${styles.intermediateMarker}`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
  html: '<div class="marker-pin"></div>',
});

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

// Simple MapController component
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

  return (
    <div className={styles.mapContainer}>
      {isCalculating && (
        <div className={styles.mapOverlay}>
          <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loaderText}>Calculating optimal route...</p>
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
        className={styles.leafletContainer}
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
                    weight={10}
                    opacity={0.5}
                  />
                  {/* Main route line */}
                  <Polyline
                    key={`segment-${index}`}
                    positions={segment.path}
                    color={color}
                    weight={6}
                    opacity={1.0}
                  />
                </>
              );
            })}

            {/* Route points */}
            {routePoints.map((point, index) => {
              const isSource = index === 0;
              const isDestination = index === routePoints.length - 1;

              let icon = intermediateIcon;
              if (isSource) icon = sourceIcon;
              if (isDestination) icon = destinationIcon;

              return (
                <Marker key={`point-${index}`} position={[point.lat, point.lon]} icon={icon}>
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
                className={styles.routeLegend}
                onWheel={(e) => {
                  // Prevent scroll events from propagating to the map
                  e.stopPropagation();
                }}
              >
                <div className={styles.legendHeader}>
                  <h4>Optimized Route</h4>
                  {route && (
                    <div className={styles.routeStats}>
                      <div className={styles.routeStat}>
                        <i className="fa fa-road"></i>
                        <span>{route.distance} km</span>
                      </div>
                      <div className={styles.routeStat}>
                        <i className="fa fa-clock"></i>
                        <span>{route.duration} min</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.legendItems}>
                  <div className={styles.verticalRouteSequence}>
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
                        <div
                          key={`route-point-${pointIndex}`}
                          className={styles.verticalRoutePoint}
                        >
                          {/* Point marker */}
                          <div className={styles.routePointMarker}>
                            {isSource && <i className={`fa fa-home ${styles.sourceIcon}`}></i>}
                            {isDestination && (
                              <i className={`fa fa-flag ${styles.destinationIcon}`}></i>
                            )}
                            {!isSource && !isDestination && (
                              <i className={`fa fa-circle ${styles.intermediateIcon}`}></i>
                            )}
                            <span className={styles.routePointName}>{point.name}</span>
                          </div>

                          {/* Vertical line with connection dots */}
                          {!isDestination && (
                            <div className={styles.verticalRouteLine}>
                              <div
                                className={styles.verticalRouteSegment}
                                style={{
                                  backgroundColor: color,
                                }}
                              >
                                {/* Add connection dot */}
                                <div
                                  className={styles.connectionDot}
                                  style={{
                                    borderColor: color,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                  }}
                                ></div>
                              </div>

                              {/* Segment info */}
                              {connectingSegment && (
                                <div className={styles.segmentInfo}>
                                  <div className={styles.segmentStat}>
                                    <i className="fa fa-road"></i>
                                    <span>{connectingSegment.distance.toFixed(1)} km</span>
                                  </div>
                                  <div className={styles.segmentStat}>
                                    <i className="fa fa-clock"></i>
                                    <span>{Math.round(connectingSegment.duration)} min</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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

      {/* Map style selector */}
      <div className={styles.mapStyleSelector}>
        {Object.entries(MAP_STYLES).map(([key, value]) => (
          <button
            key={key}
            className={`${styles.mapStyleButton} ${mapStyle === key ? styles.active : ''}`}
            onClick={() => setMapStyle(key as keyof typeof MAP_STYLES)}
          >
            {value.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Map;

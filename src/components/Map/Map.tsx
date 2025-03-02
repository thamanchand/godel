/* eslint-disable @typescript-eslint/no-explicit-any */
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

// TypeScript declarations for browser globals
declare global {
  interface Window {
    google: any;
    ResizeObserver: typeof ResizeObserver;
  }
}

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
  html: '<div class="marker-pin"></div>',
});

const destinationIcon = L.divIcon({
  className: `${styles.customMarker} ${styles.destinationMarker}`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  html: '<div class="marker-pin"></div>',
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

  const handleMapReady = (map: L.Map) => {
    setMapInstance(map);
    setMapReady(true);
  };

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
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
              <div className={styles.routeLegend}>
                <div className={styles.legendHeader}>
                  <h4>Route Path</h4>
                  {route && (
                    <span>
                      <strong>Total:</strong> {route.distance} km · {route.duration} min
                    </span>
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
                            <span
                              className={`${styles.markerSymbol} ${
                                isSource
                                  ? styles.sourceSymbol
                                  : isDestination
                                    ? styles.destinationSymbol
                                    : styles.intermediateSymbol
                              }`}
                            ></span>
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
                              ></div>

                              {/* Segment info */}
                              {connectingSegment && (
                                <div className={styles.segmentInfo}>
                                  <span>{connectingSegment.distance.toFixed(1)} km</span>
                                  <span>{Math.round(connectingSegment.duration)} min</span>
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

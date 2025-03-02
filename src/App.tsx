import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

import styles from './App.module.scss';
import Map from './components/Map/Map';
import RouteForm from './components/RouteForm/RouteForm';
import FloatingButton from './components/common/FloatingButton';
import Modal from './components/common/Modal';
import { DEFAULT_POSITION } from './constants';
import { useRouteData } from './hooks/useRouteData';

const App = () => {
  const [mapPosition, setMapPosition] = useState<[number, number]>([
    DEFAULT_POSITION.lat,
    DEFAULT_POSITION.lng,
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { route, isCalculating, error, calculateRoute } = useRouteData();

  useEffect(() => {
    // If we have a route with points, set the map position to the first point (source)
    if (route && route.points.length > 0) {
      const source = route.points[0];
      setMapPosition([source.lat, source.lon]);
    }
  }, [route]);

  // Close modal when route calculation starts
  useEffect(() => {
    if (isCalculating) {
      setIsModalOpen(false);
    }
  }, [isCalculating]);

  const handleCalculateRoute = (...args: Parameters<typeof calculateRoute>) => {
    calculateRoute(...args);
    // Modal will be closed by the effect above when isCalculating changes
  };

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}

        {/* Desktop view - side panel always visible */}
        <div className={`${styles.sidePanel} ${styles.desktopOnly}`}>
          <RouteForm
            onCalculateRoute={calculateRoute}
            isCalculating={isCalculating}
            route={route}
          />
        </div>

        <div className={styles.mapContainer}>
          <Map
            position={mapPosition}
            onPositionChange={setMapPosition}
            route={route}
            isCalculating={isCalculating}
          />
        </div>

        {/* Mobile view - floating button and modal */}
        <FloatingButton onClick={() => setIsModalOpen(true)} label="Optimize Route" />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Optimize Delivery Route"
        >
          <RouteForm
            onCalculateRoute={handleCalculateRoute}
            isCalculating={isCalculating}
            route={route}
          />
        </Modal>
      </main>
    </div>
  );
};

export default App;

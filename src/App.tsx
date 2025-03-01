import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

import styles from './App.module.scss';
import Map from './components/Map/Map';
import RouteForm from './components/RouteForm/RouteForm';
import { DEFAULT_POSITION } from './constants';
import { useRouteData } from './hooks/useRouteData';

const App = () => {
  const [mapPosition, setMapPosition] = useState<[number, number]>([
    DEFAULT_POSITION.lat,
    DEFAULT_POSITION.lng,
  ]);

  const { route, isCalculating, error, calculateRoute } = useRouteData();

  useEffect(() => {
    // If we have a route with points, set the map position to the first point (source)
    if (route && route.points.length > 0) {
      const source = route.points[0];
      setMapPosition([source.lat, source.lon]);
    }
  }, [route]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h2>ShortPathNavigator</h2>
      </header>
      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}
        <RouteForm onCalculateRoute={calculateRoute} loading={isCalculating} />
        <Map
          position={mapPosition}
          onPositionChange={setMapPosition}
          route={route}
          isCalculating={isCalculating}
        />
      </main>
    </div>
  );
};

export default App;

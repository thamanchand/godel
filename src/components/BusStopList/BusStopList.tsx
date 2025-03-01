import { useReverseGeocode } from '../../hooks/useReverseGeocode';
import { Stop } from '../../types/busStop';
import BusStopCard from '../BusStopCard/BusStopCard';

import styles from './BusStopList.module.scss';

interface BusStopListProps {
  stops: Stop[];
  loading: boolean;
  position: [number, number];
  locationName?: string;
}

const BusStopList = ({ stops, loading, position, locationName }: BusStopListProps) => {
  const { address, isLoading: isAddressLoading } = useReverseGeocode(position);

  return (
    <div className={styles.results}>
      {(address || locationName) && (
        <div className={styles.currentLocation}>
          <h3>Stops nearby:</h3>
          <p className={styles.addressText}>{locationName || address}</p>
        </div>
      )}

      {(loading || isAddressLoading) && (
        <div className={styles.loading}>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      )}

      {!loading && !isAddressLoading && stops.length === 0 && (
        <div className={styles.noStops}>
          <p className={styles.noStopsText}>No nearby stops found</p>
        </div>
      )}

      {!loading &&
        !isAddressLoading &&
        stops.length > 0 &&
        stops.map((stop) => <BusStopCard key={stop.gtfsId} stop={stop} />)}
    </div>
  );
};

export default BusStopList;

import { Stop } from "../../types/busStop";
import Zone from "../Zone";

import styles from "./BusStopCard.module.scss";

interface BusStopCardProps {
  stop: Stop;
}

const BusStopCard = ({ stop }: BusStopCardProps) => (
  <div className={styles.card}>
    <div className={styles.stopInfo}>
      <div className={styles.row}>
        <h4 className={styles.stopName}>
          {stop.name} {`(${stop?.code || ""})`}
        </h4>
        <text className={styles.zoneText}>Zone</text>
      </div>
      <div className={styles.row}>
        {stop.distance && (
          <p className={styles.stopDistance}>{stop.distance}m away</p>
        )}
        <Zone zoneId={stop.zoneId} />
      </div>
    </div>
  </div>
);

export default BusStopCard;

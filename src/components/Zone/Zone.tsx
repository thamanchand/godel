import Chip from "../common/Chip";

import styles from "./Zone.module.scss";

interface ZoneProps {
  zoneId?: string;
}

const Zone = ({ zoneId }: ZoneProps) => {
  if (!zoneId) return null;

  return (
    <div className={styles.zoneContainer}>
      <Chip label={zoneId} className={styles[`zone${zoneId.toUpperCase()}`]} />
    </div>
  );
};

export default Zone;

import styles from "./Chip.module.scss";

interface ChipProps {
  label: string;
  color?: string;
  className?: string;
}

const Chip = ({ label, color, className }: ChipProps) => {
  const chipStyle = color ? { backgroundColor: color } : undefined;

  return (
    <span className={`${styles.chip} ${className || ""}`} style={chipStyle}>
      {label}
    </span>
  );
};

export default Chip;

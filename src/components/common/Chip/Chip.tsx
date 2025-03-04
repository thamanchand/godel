// import styles from "./Chip.module.scss";

interface ChipProps {
  label: string;
  color?: string;
  className?: string;
}

const Chip = ({ label, color, className }: ChipProps) => {
  const chipStyle = color ? { backgroundColor: color } : undefined;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ''}`}
      style={chipStyle}
    >
      {label}
    </span>
  );
};

export default Chip;

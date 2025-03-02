import React from 'react';

import styles from './FloatingButton.module.scss';

interface FloatingButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick, label, icon }) => {
  return (
    <button className={styles.floatingButton} onClick={onClick}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </button>
  );
};

export default FloatingButton;

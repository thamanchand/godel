import React from 'react';

interface FloatingButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick, label, icon }) => {
  return (
    <button className="fixed bottom-4 right-4 z-50" onClick={onClick}>
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="text-sm">{label}</span>
    </button>
  );
};

export default FloatingButton;

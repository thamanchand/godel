import React from 'react';

interface FloatingButtonProps {
  onClick: () => void;
  label: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2"
    >
      <span>{label}</span>
    </button>
  );
};

export default FloatingButton;

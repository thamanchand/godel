import React, { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

const PWAUpdateNotification: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });

    return () => {
      updateSW?.();
    };
  }, []);

  const handleUpdate = () => {
    setNeedRefresh(false);
    window.location.reload();
  };

  if (!needRefresh) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#4a90e2',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
      }}
    >
      <span>New version available!</span>
      <button
        onClick={handleUpdate}
        style={{
          backgroundColor: 'white',
          color: '#4a90e2',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Update
      </button>
    </div>
  );
};

export default PWAUpdateNotification;

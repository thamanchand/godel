import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { unregisterServiceWorker } from './unregisterServiceWorker';

import './index.css';
import './styles/mobile-overrides.css';

// Unregister service worker and clear caches before rendering
async function init() {
  try {
    // Unregister service worker and clear caches
    await unregisterServiceWorker();

    // Render the app
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Initialize the app
init();

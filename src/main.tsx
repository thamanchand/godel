import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './styles/mobile-overrides.css';
import { unregisterServiceWorker } from './unregisterServiceWorker';

// Unregister service worker and clear caches before rendering
async function init() {
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
}

// Initialize the app
init().catch(console.error);

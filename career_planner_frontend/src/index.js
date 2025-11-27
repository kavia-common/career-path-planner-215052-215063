import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Log resolved backend URL in development for diagnostics
if (process.env.NODE_ENV !== 'production') {
  // Dynamically import to avoid circular: same normalization as apiClient
  const inferred = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001` : '';
  const base = (process.env.REACT_APP_BACKEND_URL || inferred || '').replace(/\/$/, '');
  // eslint-disable-next-line no-console
  console.info('[CareerPlanner] API base URL:', base || '(not set)');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

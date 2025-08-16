/**
 * Electron Renderer Entry Point
 * Main React application for JobSwipe Desktop
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

// Initialize React app
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);

// Hot reload for development
if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').App;
    root.render(<NextApp />);
  });
}
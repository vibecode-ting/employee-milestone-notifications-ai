// ── main.tsx ──────────────────────────────────────────────────────────────────
// CultureOS AI — React App Entry Point

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/themes.css';
import './styles/i18n-typography.css';
import './styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

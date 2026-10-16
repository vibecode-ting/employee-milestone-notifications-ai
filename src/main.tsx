import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/i18n';

// Apply saved theme before paint — default to dark
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || !savedTheme) {
  document.documentElement.classList.add('dark');
  if (!savedTheme) localStorage.setItem('theme', 'dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

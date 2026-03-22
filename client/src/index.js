import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Apply theme/maximized query params to localStorage before first render,
// then strip them from the URL so they don't persist.
(function applyQueryStringOverrides() {
  const params = new URLSearchParams(window.location.search);
  const themeParam = params.get('theme');
  const maximizedParam = params.get('maximized');

  if (themeParam !== null) {
    localStorage.setItem('theme', themeParam);
    params.delete('theme');
  }
  if (maximizedParam !== null) {
    localStorage.setItem('maximized', maximizedParam);
    params.delete('maximized');
  }
  if (themeParam !== null || maximizedParam !== null) {
    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
    window.history.replaceState(null, '', newUrl);
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global 401 interceptor
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch.apply(this, args);
  if (response.status === 401) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    if (!url.includes('/auth/login')) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
  }
  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

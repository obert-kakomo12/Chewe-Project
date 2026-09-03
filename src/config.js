const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
      return envUrl.replace('http://', 'https://');
    }
    return envUrl;
  }
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}/api`;
  }
  
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiUrl().replace(/\/+$/, '');

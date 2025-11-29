// API Configuration
// Uses Vite environment variables (VITE_* prefix required)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000';

// Helper to get full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getMlApiUrl = (endpoint = '') => {
  if (!endpoint) return ML_API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${ML_API_URL}/${cleanEndpoint}`;
};

// Export base URLs for direct use
export { API_BASE_URL, ML_API_URL };

// Axios default config
export const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

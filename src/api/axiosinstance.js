import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:8080',
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (config.method === 'get') {
    // Add timestamp to query params to force fresh request
    config.params = config.params || {};
    config.params._t = new Date().getTime();
    
    // Set headers to prevent caching
    config.headers = config.headers || {};
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
  }
  return config;
});

export default axiosInstance;

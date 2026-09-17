import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for attaching Bearer JWT token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('goalforge_auth_token') || sessionStorage.getItem('goalforge_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Unable to access auth token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unwrapping standard ApiResponse and handling global auth errors
api.interceptors.response.use(
  (response) => {
    // If backend returns our ApiResponse envelope, return it
    return response.data;
  },
  (error) => {
    const status = error.response?.status || 500;
    const requestUrl = error.config?.url || '';

    // Handle token expiration or unauthorized access
    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      try {
        localStorage.removeItem('goalforge_auth_token');
        localStorage.removeItem('goalforge_auth_user');
        sessionStorage.removeItem('goalforge_auth_token');
        sessionStorage.removeItem('goalforge_auth_user');
        // Notify application of session expiration
        window.dispatchEvent(
          new CustomEvent('goalforge:session-expired', {
            detail: { message: 'Your session has expired. Please log in again.' },
          })
        );
      } catch (e) {
        console.warn('Error during auto-logout dispatch:', e);
      }
    }

    const customError = {
      message: error.response?.data?.message || error.message || 'Network error occurred',
      status,
      details: error.response?.data?.data || null,
    };
    return Promise.reject(customError);
  }
);

export default api;

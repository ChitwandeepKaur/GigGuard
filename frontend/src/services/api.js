import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we catch a 401 Unauthorized, and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevent infinite refresh loops
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            if (res.data.refreshToken) {
               localStorage.setItem('refreshToken', res.data.refreshToken);
            }
            
            // Re-mount the new token and immediately retry the original failed request
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          // Both access and refresh tokens are completely dead. Total session eviction.
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth';
          return Promise.reject(refreshErr);
        }
      } else {
        // No refresh token available, must re-authenticate
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

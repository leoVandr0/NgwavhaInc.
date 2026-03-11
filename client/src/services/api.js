import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

// Notify all subscribers with new token
const onTokenRefreshed = (newToken) => {
    refreshSubscribers.forEach(callback => callback(newToken));
    refreshSubscribers = [];
};

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Wait for token refresh
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token
                const refreshResponse = await api.post('/auth/refresh-token');
                const { token, user } = refreshResponse.data;
                
                // Store new token
                localStorage.setItem('token', token);
                
                // Update user data in store if needed
                console.log('Token refreshed successfully for user:', user.role);
                
                // Notify subscribers
                onTokenRefreshed(token);
                
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear everything and redirect
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('token');
                window.location.href = '/login?session=expired';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;

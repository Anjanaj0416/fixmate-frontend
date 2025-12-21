import axios from 'axios';
import { auth } from '../config/firebase';

/**
 * Base API Configuration
 * Axios instance with interceptors for authentication and error handling
 */

// API Base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds authentication token to requests
 */
api.interceptors.request.use(
  async (config) => {
    try {
      // Get current user from Firebase
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Get fresh Firebase ID token
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles responses and errors globally
 */
api.interceptors.response.use(
  (response) => {
    // Return only the data from successful responses
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const currentUser = auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true); // Force refresh
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Token refresh failed:', refreshError);
        // Clear auth state and redirect
        await auth.signOut();
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }

    // Handle specific error status codes
    const errorMessage = error.response?.data?.message || error.message;
    const errorCode = error.response?.status;

    switch (errorCode) {
      case 400:
        console.error('Bad Request:', errorMessage);
        break;
      case 403:
        console.error('Forbidden:', errorMessage);
        break;
      case 404:
        console.error('Not Found:', errorMessage);
        break;
      case 429:
        console.error('Too Many Requests:', errorMessage);
        break;
      case 500:
        console.error('Server Error:', errorMessage);
        break;
      default:
        console.error('API Error:', errorMessage);
    }

    // Return structured error
    return Promise.reject({
      message: errorMessage,
      status: errorCode,
      data: error.response?.data,
    });
  }
);

/**
 * Helper function to handle file uploads
 */
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File || data[key] instanceof Blob) {
        formData.append(key, data[key]);
      } else if (Array.isArray(data[key])) {
        data[key].forEach(item => formData.append(key, item));
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  
  return formData;
};

/**
 * API Status Check
 */
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    throw error;
  }
};

export default api;
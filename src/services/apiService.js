import { getAuth } from 'firebase/auth';
import storage from '../utils/storage';

/**
 * API Service with Automatic Token Refresh
 * 
 * This service handles all API requests with automatic Firebase token refresh
 * to prevent "Session expired" errors.
 * 
 * Features:
 * - Automatic token refresh before each request
 * - Retry logic for 401 errors
 * - Consistent token storage
 * - Support for all HTTP methods
 * 
 * Usage:
 * import apiService from '../services/apiService';
 * 
 * const response = await apiService.get('/api/v1/users/profile');
 * const response = await apiService.post('/api/v1/bookings', data);
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

class APIService {
  /**
   * Get fresh Firebase token
   * @returns {Promise<string>} Fresh Firebase ID token
   */
  async getFreshToken() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Force token refresh
      const token = await user.getIdToken(true);
      
      console.log('✅ Fresh token obtained (length:', token.length, ')');

      // Store in both storages for consistency
      storage.saveAuthToken(token);

      return token;
    } catch (error) {
      console.error('❌ Error getting fresh token:', error);
      throw new Error('Failed to refresh authentication token');
    }
  }

  /**
   * Make HTTP request with automatic token refresh
   * @param {string} endpoint - API endpoint (e.g., '/api/v1/users/profile')
   * @param {object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async request(endpoint, options = {}) {
    try {
      // Get fresh token
      const token = await this.getFreshToken();

      // Prepare full URL
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}${endpoint}`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };

      // Make request
      const response = await fetch(url, {
        ...options,
        headers
      });

      // If 401, try one more time with fresh token
      if (response.status === 401) {
        console.log('⚠️ Got 401, retrying with fresh token...');
        
        const newToken = await this.getFreshToken();
        headers.Authorization = `Bearer ${newToken}`;

        const retryResponse = await fetch(url, {
          ...options,
          headers
        });

        if (retryResponse.status === 401) {
          // Still unauthorized after retry - clear storage
          storage.clearAllAuthData();
          throw new Error('Authentication failed. Please login again.');
        }

        return retryResponse;
      }

      return response;
    } catch (error) {
      console.error('❌ API request error:', error);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }

  /**
   * Upload file with FormData
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData object
   * @param {object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async upload(endpoint, formData, options = {}) {
    try {
      const token = await this.getFreshToken();

      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}${endpoint}`;

      // Don't set Content-Type for FormData (browser sets it with boundary)
      const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };

      // Remove Content-Type if present (let browser set it)
      delete headers['Content-Type'];

      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers,
        body: formData
      });

      if (response.status === 401) {
        console.log('⚠️ Got 401, retrying upload with fresh token...');
        
        const newToken = await this.getFreshToken();
        headers.Authorization = `Bearer ${newToken}`;

        const retryResponse = await fetch(url, {
          ...options,
          method: 'POST',
          headers,
          body: formData
        });

        if (retryResponse.status === 401) {
          storage.clearAllAuthData();
          throw new Error('Authentication failed. Please login again.');
        }

        return retryResponse;
      }

      return response;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new APIService();
import { getAuth } from 'firebase/auth';
import storage from '../utils/storage';

/**
 * API Service with Automatic Token Refresh
 * 
 * ✅ FIXED: Now properly parses JSON responses
 * ✅ FIXED: Uses import.meta.env for Vite compatibility
 * ✅ FIXED: Proper endpoint handling with / prefix
 * 
 * This service handles all API requests with automatic Firebase token refresh
 * to prevent "Session expired" errors.
 * 
 * Features:
 * - Automatic token refresh before each request
 * - Retry logic for 401 errors
 * - Consistent token storage
 * - Support for all HTTP methods
 * - Proper JSON parsing
 * 
 * Usage:
 * import apiService from '../services/apiService';
 * 
 * const data = await apiService.get('/users/profile');
 * const data = await apiService.post('/bookings/quote-request', requestData);
 */

// ✅ FIXED: Use import.meta.env for Vite, keep base URL without /
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

console.log('🔧 API Service initialized with base URL:', API_BASE_URL);

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
   * @param {string} endpoint - API endpoint (e.g., '/users/profile' or '//users/profile')
   * @param {object} options - Fetch options
   * @returns {Promise<object>} ✅ FIXED: Returns parsed JSON data, not Response object
   */
  async request(endpoint, options = {}) {
    try {
      // Get fresh token
      const token = await this.getFreshToken();

      // ✅ FIXED: Smart endpoint handling
      // If endpoint doesn't start with /, add it
      let cleanEndpoint = endpoint;
      
      // Remove leading slash if present
      if (cleanEndpoint.startsWith('/')) {
        cleanEndpoint = cleanEndpoint.slice(1);
      }
      
      // Add / prefix if not already present
      if (!cleanEndpoint.startsWith('')) {
        cleanEndpoint = `/${cleanEndpoint}`;
      }

      // Prepare full URL
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}/${cleanEndpoint}`;

      console.log('🌐 API Request:', options.method || 'GET', url);

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

        // ✅ FIXED: Parse JSON before returning
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log('✅ API Response (after retry):', data);
          return data;
        } else {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Request failed with status ${retryResponse.status}`);
        }
      }

      // ✅ FIXED: Parse JSON before returning
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
        return data;
      } else {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

    } catch (error) {
      console.error('❌ API request error:', error);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options (can include params)
   * @returns {Promise<object>} Parsed JSON response
   */
  async get(endpoint, options = {}) {
    // Handle query parameters
    if (options.params) {
      // ✅ FIXED: Filter out null/undefined values before creating query string
      const filteredParams = Object.fromEntries(
        Object.entries(options.params).filter(([_, v]) => v != null && v !== '')
      );
      const queryString = new URLSearchParams(filteredParams).toString();
      endpoint = `${endpoint}${queryString ? '?' + queryString : ''}`;
      delete options.params;
    }

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
   * @returns {Promise<object>} Parsed JSON response
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
   * @returns {Promise<object>} Parsed JSON response
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
   * @returns {Promise<object>} Parsed JSON response
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
   * @returns {Promise<object>} Parsed JSON response
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
   * @returns {Promise<object>} Parsed JSON response
   */
  async upload(endpoint, formData, options = {}) {
    try {
      const token = await this.getFreshToken();

      // ✅ FIXED: Smart endpoint handling (same as request method)
      let cleanEndpoint = endpoint;
      
      // Remove leading slash if present
      if (cleanEndpoint.startsWith('/')) {
        cleanEndpoint = cleanEndpoint.slice(1);
      }
      
      // Add / prefix if not already present
      if (!cleanEndpoint.startsWith('')) {
        cleanEndpoint = `/${cleanEndpoint}`;
      }

      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}/${cleanEndpoint}`;

      console.log('📤 Upload Request:', url);

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

        // ✅ FIXED: Parse JSON before returning
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log('✅ Upload Response (after retry):', data);
          return data;
        } else {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Upload failed with status ${retryResponse.status}`);
        }
      }

      // ✅ FIXED: Parse JSON before returning
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upload Response:', data);
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new APIService();
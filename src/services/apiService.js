import { getAuth } from 'firebase/auth';
import storage from '../utils/storage';

/**
 * API Service with Automatic Token Refresh and Enhanced Retry Logic
 * 
 * ✅ FIXED: Now properly parses JSON responses
 * ✅ FIXED: Uses import.meta.env for Vite compatibility
 * ✅ FIXED: Proper endpoint handling with / prefix
 * ✅ ENHANCED: Proactive token refresh before expiration
 * ✅ ENHANCED: Smart retry logic with exponential backoff
 * ✅ ENHANCED: Token refresh caching to prevent race conditions
 * 
 * This service handles all API requests with automatic Firebase token refresh
 * to prevent "Session expired" errors.
 * 
 * Features:
 * - Automatic token refresh before expiration (every 50 minutes)
 * - Retry logic for 401 errors (up to 2 retries)
 * - Token refresh caching prevents multiple simultaneous refreshes
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
  constructor() {
    // Token refresh tracking
    this.tokenRefreshPromise = null;
    this.lastTokenRefresh = 0;
    this.TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes (tokens expire in 60)
  }

  /**
   * Check if token needs refresh
   * @returns {boolean} True if token should be refreshed
   */
  shouldRefreshToken() {
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastTokenRefresh;
    return timeSinceLastRefresh > this.TOKEN_REFRESH_INTERVAL;
  }

  /**
   * Get fresh Firebase token with smart caching
   * @param {boolean} forceRefresh - Force token refresh even if not expired
   * @returns {Promise<string>} Fresh Firebase ID token
   */
  async getFreshToken(forceRefresh = false) {
    try {
      // If a refresh is already in progress, wait for it
      if (this.tokenRefreshPromise) {
        console.log('⏳ Waiting for ongoing token refresh...');
        return await this.tokenRefreshPromise;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Determine if we should refresh
      const shouldRefresh = forceRefresh || this.shouldRefreshToken();

      // Create refresh promise to prevent race conditions
      this.tokenRefreshPromise = (async () => {
        try {
          // Get token (force refresh if needed)
          const token = await user.getIdToken(shouldRefresh);
          
          if (shouldRefresh) {
            console.log('✅ Fresh token obtained (forced refresh, length:', token.length, ')');
            this.lastTokenRefresh = Date.now();
          } else {
            console.log('✅ Using cached token (length:', token.length, ')');
          }

          // Store in both storages for consistency
          storage.saveAuthToken(token);

          return token;
        } finally {
          // Clear the promise after completion
          this.tokenRefreshPromise = null;
        }
      })();

      return await this.tokenRefreshPromise;
    } catch (error) {
      console.error('❌ Error getting fresh token:', error);
      this.tokenRefreshPromise = null;
      throw new Error('Failed to refresh authentication token');
    }
  }

  /**
   * Make HTTP request with automatic token refresh and retry logic
   * @param {string} endpoint - API endpoint (e.g., '/users/profile' or '//users/profile')
   * @param {object} options - Fetch options
   * @param {number} retryCount - Current retry attempt (internal use)
   * @returns {Promise<object>} ✅ FIXED: Returns parsed JSON data, not Response object
   */
  async request(endpoint, options = {}, retryCount = 0) {
    const MAX_RETRIES = 2;

    try {
      // Get fresh token (will auto-refresh if needed)
      const token = await this.getFreshToken();

      // ✅ FIXED: Smart endpoint handling
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

      console.log(`📤 ${options.method || 'GET'} ${cleanEndpoint}`);

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

      // Handle 401 errors with retry logic
      if (response.status === 401 && retryCount < MAX_RETRIES) {
        console.log(`⚠️ 401 Unauthorized, retrying with fresh token (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Force token refresh
        await this.getFreshToken(true);
        
        // Retry the request recursively
        return await this.request(endpoint, options, retryCount + 1);
      }

      // If still 401 after retries, clear auth and throw
      if (response.status === 401) {
        console.error('❌ Authentication failed after retries');
        storage.clearAllAuthData();
        throw new Error('Authentication failed. Please login again.');
      }

      // ✅ FIXED: Parse JSON before returning
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${options.method || 'GET'} ${cleanEndpoint} - Success`);
        return data;
      } else {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

    } catch (error) {
      console.error(`❌ ${options.method || 'GET'} ${endpoint} - Error:`, error.message);
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
   * @param {number} retryCount - Current retry attempt (internal use)
   * @returns {Promise<object>} Parsed JSON response
   */
  async upload(endpoint, formData, options = {}, retryCount = 0) {
    const MAX_RETRIES = 2;

    try {
      // Get fresh token
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

      console.log('📤 Upload Request:', cleanEndpoint);

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

      // Handle 401 errors with retry logic
      if (response.status === 401 && retryCount < MAX_RETRIES) {
        console.log(`⚠️ Upload 401 error, retrying with fresh token (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Force token refresh
        await this.getFreshToken(true);
        
        // Retry the upload
        return await this.upload(endpoint, formData, options, retryCount + 1);
      }

      // If still 401 after retries
      if (response.status === 401) {
        console.error('❌ Upload authentication failed after retries');
        storage.clearAllAuthData();
        throw new Error('Authentication failed. Please login again.');
      }

      // ✅ FIXED: Parse JSON before returning
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upload Response - Success');
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
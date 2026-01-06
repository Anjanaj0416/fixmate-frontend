import { auth } from '../config/firebase';

/**
 * Token Refresh Manager
 * Handles automatic Firebase auth token refresh
 */
class TokenRefreshManager {
  constructor() {
    this.refreshInterval = null;
    this.isRefreshing = false;
  }

  /**
   * Initialize automatic token refresh
   * Refreshes token every 50 minutes (10 min before expiry)
   */
  initialize() {
    console.log('🔄 Initializing token refresh manager...');
    
    // Refresh immediately on init
    this.refreshToken();
    
    // Set up periodic refresh every 50 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshToken();
    }, 50 * 60 * 1000); // 50 minutes

    console.log('✅ Token refresh manager initialized');
  }

  /**
   * Manually refresh the auth token
   */
  async refreshToken() {
    if (this.isRefreshing) {
      console.log('⏳ Token refresh already in progress...');
      return null;
    }

    try {
      this.isRefreshing = true;
      
      const user = auth.currentUser;
      
      if (!user) {
        console.log('⚠️ No user logged in, skipping token refresh');
        return null;
      }

      console.log('🔄 Refreshing Firebase auth token...');
      
      // Force refresh the token
      const token = await user.getIdToken(true);
      
      // Save to all storage locations
      localStorage.setItem('fixmate_auth_token', token);
      localStorage.setItem('authToken', token);
      sessionStorage.setItem('fixmate_auth_token', token);
      sessionStorage.setItem('authToken', token);
      
      console.log('✅ Token refreshed successfully');
      console.log('🔑 Token length:', token.length);
      
      return token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // If refresh fails, user might need to re-login
      if (error.code === 'auth/user-token-expired' || 
          error.code === 'auth/invalid-user-token') {
        console.error('❌ Token is invalid, user needs to re-login');
        this.handleAuthFailure();
      }
      
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle authentication failure
   */
  handleAuthFailure() {
    console.log('🚪 Handling auth failure - clearing tokens and redirecting...');
    
    // Clear all tokens
    localStorage.removeItem('fixmate_auth_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('fixmate_user');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Stop the refresh interval
   */
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('🛑 Token refresh manager stopped');
    }
  }

  /**
   * Get current token status
   */
  getTokenStatus() {
    const token = localStorage.getItem('fixmate_auth_token');
    
    if (!token) {
      return { exists: false, expired: true };
    }

    try {
      // Decode JWT to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = now > expiry;
      const timeUntilExpiry = expiry - now;

      return {
        exists: true,
        expired: isExpired,
        expiresAt: expiry,
        timeUntilExpiry: timeUntilExpiry,
        minutesUntilExpiry: Math.floor(timeUntilExpiry / (1000 * 60))
      };
    } catch (error) {
      console.error('Error checking token status:', error);
      return { exists: true, expired: true };
    }
  }
}

// Create singleton instance
const tokenRefreshManager = new TokenRefreshManager();

export default tokenRefreshManager;
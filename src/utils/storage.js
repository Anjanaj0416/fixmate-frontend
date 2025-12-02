// NEW FILE - src/utils/storage.js
// Centralized storage management for authentication tokens and user data

/**
 * Storage Utility
 * Provides consistent key names and storage methods across the app
 * 
 * WHY: Different components were using different storage keys:
 * - Some used 'authToken', some 'fixmate_auth_token'
 * - Some only saved to localStorage, some only to sessionStorage
 * 
 * SOLUTION: Single source of truth for storage operations
 */

// ✅ Standard storage keys - use these everywhere
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'fixmate_auth_token',
  USER_DATA: 'fixmate_user',
  FCM_TOKEN: 'fixmate_fcm_token',
  REFRESH_TOKEN: 'fixmate_refresh_token',
};

/**
 * Save authentication token
 * Saves to BOTH localStorage and sessionStorage for maximum compatibility
 */
export const saveAuthToken = (token) => {
  if (!token) {
    console.warn('⚠️ Attempted to save null/undefined token');
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    console.log('✅ Auth token saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving auth token:', error);
    return false;
  }
};

/**
 * Get authentication token
 * Checks sessionStorage first (for current session), then localStorage (for persistent sessions)
 */
export const getAuthToken = () => {
  try {
    const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
                  localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
      console.log('✅ Auth token found (length:', token.length, ')');
    } else {
      console.log('⚠️ No auth token found in storage');
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    return null;
  }
};

/**
 * Remove authentication token
 * Clears from BOTH storages
 */
export const removeAuthToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    console.log('✅ Auth token removed');
    return true;
  } catch (error) {
    console.error('❌ Error removing auth token:', error);
    return false;
  }
};

/**
 * Save user data
 * Saves to BOTH localStorage and sessionStorage
 */
export const saveUserData = (userData) => {
  if (!userData) {
    console.warn('⚠️ Attempted to save null/undefined user data');
    return false;
  }

  try {
    const userStr = JSON.stringify(userData);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, userStr);
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, userStr);
    console.log('✅ User data saved:', userData.email, 'Role:', userData.role);
    return true;
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    return false;
  }
};

/**
 * Get user data
 * Checks sessionStorage first, then localStorage
 */
export const getUserData = () => {
  try {
    const userStr = sessionStorage.getItem(STORAGE_KEYS.USER_DATA) ||
                    localStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log('✅ User data found:', userData.email);
      return userData;
    }
    
    console.log('⚠️ No user data found in storage');
    return null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

/**
 * Remove user data
 * Clears from BOTH storages
 */
export const removeUserData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    console.log('✅ User data removed');
    return true;
  } catch (error) {
    console.error('❌ Error removing user data:', error);
    return false;
  }
};

/**
 * Clear all authentication data
 * Complete logout - removes everything
 */
export const clearAllAuthData = () => {
  try {
    removeAuthToken();
    removeUserData();
    localStorage.removeItem(STORAGE_KEYS.FCM_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.FCM_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    console.log('✅ All auth data cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 * Verifies that both token and user data exist
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const userData = getUserData();
  
  const authenticated = !!(token && userData);
  console.log('🔍 Authentication check:', authenticated);
  
  return authenticated;
};

/**
 * Get user role
 * Quick utility to get the current user's role
 */
export const getUserRole = () => {
  const userData = getUserData();
  return userData?.role || null;
};

/**
 * Save FCM token for push notifications
 */
export const saveFCMToken = (fcmToken) => {
  if (!fcmToken) return false;
  
  try {
    localStorage.setItem(STORAGE_KEYS.FCM_TOKEN, fcmToken);
    sessionStorage.setItem(STORAGE_KEYS.FCM_TOKEN, fcmToken);
    console.log('✅ FCM token saved');
    return true;
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    return false;
  }
};

/**
 * Get FCM token
 */
export const getFCMToken = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.FCM_TOKEN) ||
           localStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

/**
 * Debug function - print all storage contents
 * ONLY use in development!
 */
export const debugStorage = () => {
  if (import.meta.env.MODE !== 'development') {
    console.warn('⚠️ debugStorage() should only be used in development');
    return;
  }

  console.group('🔍 Storage Debug Info');
  console.log('localStorage:', {
    authToken: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)?.substring(0, 50) + '...',
    userData: localStorage.getItem(STORAGE_KEYS.USER_DATA),
    fcmToken: localStorage.getItem(STORAGE_KEYS.FCM_TOKEN)?.substring(0, 50) + '...',
  });
  console.log('sessionStorage:', {
    authToken: sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)?.substring(0, 50) + '...',
    userData: sessionStorage.getItem(STORAGE_KEYS.USER_DATA),
    fcmToken: sessionStorage.getItem(STORAGE_KEYS.FCM_TOKEN)?.substring(0, 50) + '...',
  });
  console.groupEnd();
};

// Export as default for convenience
export default {
  STORAGE_KEYS,
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  saveUserData,
  getUserData,
  removeUserData,
  clearAllAuthData,
  isAuthenticated,
  getUserRole,
  saveFCMToken,
  getFCMToken,
  debugStorage,
};
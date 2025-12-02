import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, requestNotificationPermission } from '../config/firebase';
import authService from '../services/authService';
import storage from '../utils/storage'; // ← ADD THIS IMPORT

// Create Context
export const AuthContext = createContext();

/**
 * Auth Provider Component
 * Manages authentication state and operations
 * 
 * ✅ FIXED: Using storage utility for consistent token management
 * ✅ FIXED: Proper token storage in both localStorage and sessionStorage
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state from storage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ FIX: Use storage utility
        const token = storage.getAuthToken();
        const savedUser = storage.getUserData();

        console.log('🔍 Initializing auth...');
        console.log('Token found:', !!token);
        console.log('User data found:', !!savedUser);

        if (token && savedUser) {
          console.log('✅ Loaded user from storage:', savedUser.email, 'Role:', savedUser.role);
          
          // Set user immediately
          setUser(savedUser);
          
          // Verify token in background
          authService.verifyTokenWithBackend(token)
            .then(response => {
              if (!response.success) {
                console.log('⚠️ Token invalid, clearing storage');
                storage.clearAllAuthData();
                setUser(null);
              }
            })
            .catch(err => {
              console.warn('Token verification failed:', err);
            });
        } else {
          console.log('ℹ️ No auth data found in storage');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Listen to Firebase auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser?.email || 'null');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && !user) {
        // User signed in with Firebase but not in our context yet
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await authService.verifyTokenWithBackend(idToken);
          
          if (response.success) {
            const userData = response.user || response.data?.user;
            console.log('✅ Synced Firebase user to context:', userData.email);
            setUser(userData);
            
            // ✅ FIX: Use storage utility
            storage.saveUserData(userData);
            storage.saveAuthToken(idToken);
          }
        } catch (error) {
          console.error('Error syncing Firebase user:', error);
        }
      } else if (!firebaseUser && user) {
        // User signed out from Firebase
        console.log('🚪 User signed out');
        setUser(null);
        
        // ✅ FIX: Use storage utility
        storage.clearAllAuthData();
      }
    });

    return () => unsubscribe();
  }, [user]);

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Authenticate with backend
      const response = await authService.signIn(email, password);

      if (response.user) {
        const userData = response.user || response.backendUser;
        setUser(userData);
        
        // ✅ FIX: Use storage utility (automatically stores in both storages)
        storage.saveUserData(userData);
        storage.saveAuthToken(idToken);

        // Request notification permission
        try {
          const fcmToken = await requestNotificationPermission();
          if (fcmToken) {
            storage.saveFCMToken(fcmToken);
            await authService.updateFCMToken(fcmToken);
          }
        } catch (fcmError) {
          console.warn('FCM token registration failed:', fcmError);
        }

        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with Google
   */
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Check if user exists in backend
      const response = await authService.verifyTokenWithBackend(idToken);

      if (response.success && response.user) {
        const userData = response.user;
        setUser(userData);
        
        // ✅ FIX: Use storage utility
        storage.saveUserData(userData);
        storage.saveAuthToken(idToken);

        return { success: true, user: userData };
      } else {
        // New user, needs to complete registration
        return { 
          success: false, 
          needsRegistration: true, 
          firebaseUser: result.user,
          idToken 
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Google login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      
      // ✅ FIX: Use storage utility
      storage.clearAllAuthData();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Logout failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      const errorMessage = error.message || 'Password reset failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user data - CRITICAL for login navigation
   */
  const updateUser = useCallback((userData) => {
    console.log('🔄 updateUser called with:', userData.email, 'Role:', userData.role);
    setUser(userData);
    
    // ✅ FIX: Use storage utility
    storage.saveUserData(userData);
    
    console.log('✅ User state and storage updated');
  }, []);

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    try {
      // ✅ FIX: Use storage utility
      const token = storage.getAuthToken();
      if (!token) return;

      const response = await authService.verifyTokenWithBackend(token);
      if (response.success && response.user) {
        const userData = response.user;
        setUser(userData);
        
        // ✅ FIX: Use storage utility
        storage.saveUserData(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Default export for backwards compatibility
export default AuthProvider;
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

// Create Context
export const AuthContext = createContext();

/**
 * Auth Provider Component
 * Manages authentication state and operations
 * 
 * FIXED: Immediate state updates for navigation
 * FIXED: Proper localStorage/sessionStorage handling
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
        // Check both localStorage and sessionStorage
        const token = localStorage.getItem('fixmate_auth_token') || 
                     sessionStorage.getItem('fixmate_auth_token');
        const userDataStr = localStorage.getItem('fixmate_user') || 
                           sessionStorage.getItem('fixmate_user');

        console.log('🔍 Initializing auth...');
        console.log('Token found:', !!token);
        console.log('User data found:', !!userDataStr);

        if (token && userDataStr) {
          try {
            const savedUser = JSON.parse(userDataStr);
            console.log('✅ Loaded user from storage:', savedUser.email, 'Role:', savedUser.role);
            
            // Set user immediately
            setUser(savedUser);
            
            // Verify token in background
            authService.verifyTokenWithBackend(token)
              .then(response => {
                if (!response.success) {
                  console.log('⚠️ Token invalid, clearing storage');
                  localStorage.removeItem('fixmate_auth_token');
                  localStorage.removeItem('fixmate_user');
                  sessionStorage.removeItem('fixmate_auth_token');
                  sessionStorage.removeItem('fixmate_user');
                  setUser(null);
                }
              })
              .catch(err => {
                console.warn('Token verification failed:', err);
              });
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            localStorage.removeItem('fixmate_user');
            sessionStorage.removeItem('fixmate_user');
          }
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
            localStorage.setItem('fixmate_user', JSON.stringify(userData));
            localStorage.setItem('fixmate_auth_token', idToken);
          }
        } catch (error) {
          console.error('Error syncing Firebase user:', error);
        }
      } else if (!firebaseUser && user) {
        // User signed out from Firebase
        console.log('🚪 User signed out');
        setUser(null);
        localStorage.removeItem('fixmate_auth_token');
        localStorage.removeItem('fixmate_user');
        sessionStorage.removeItem('fixmate_auth_token');
        sessionStorage.removeItem('fixmate_user');
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
        localStorage.setItem('fixmate_user', JSON.stringify(userData));
        localStorage.setItem('fixmate_auth_token', idToken);

        // Request notification permission
        try {
          const fcmToken = await requestNotificationPermission();
          if (fcmToken) {
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
        localStorage.setItem('fixmate_user', JSON.stringify(userData));
        localStorage.setItem('fixmate_auth_token', idToken);

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
      localStorage.removeItem('fixmate_auth_token');
      localStorage.removeItem('fixmate_user');
      sessionStorage.removeItem('fixmate_auth_token');
      sessionStorage.removeItem('fixmate_user');
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
    localStorage.setItem('fixmate_user', JSON.stringify(userData));
    console.log('✅ User state and storage updated');
  }, []);

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('fixmate_auth_token') || 
                   sessionStorage.getItem('fixmate_auth_token');
      if (!token) return;

      const response = await authService.verifyTokenWithBackend(token);
      if (response.success && response.user) {
        const userData = response.user;
        setUser(userData);
        localStorage.setItem('fixmate_user', JSON.stringify(userData));
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
    isAuthenticated: !!user, // Boolean, not a function!
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Default export for backwards compatibility
export default AuthProvider;  
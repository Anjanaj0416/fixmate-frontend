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
import { 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken,
  getUserData,
  setUserData,
  removeUserData,
} from '../utils/helpers';

// Create Context
export const AuthContext = createContext();

/**
 * Auth Provider Component
 * Manages authentication state and operations
 * 
 * FIXED: Changed to named function export for Fast Refresh compatibility
 * FIXED: Changed verifyToken to verifyTokenWithBackend
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
        const token = getAuthToken();
        const savedUser = getUserData();

        if (token && savedUser) {
          // Verify token is still valid using correct method name
          const response = await authService.verifyTokenWithBackend(token); // FIXED: was verifyToken
          if (response.success) {
            setUser(savedUser);
          } else {
            // Token expired, clear storage
            removeAuthToken();
            removeUserData();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        removeAuthToken();
        removeUserData();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Listen to Firebase auth state changes
   * FIXED: Changed verifyToken to verifyTokenWithBackend
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && !user) {
        // User signed in with Firebase but not in our backend yet
        // This happens with Google Sign-In
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await authService.verifyTokenWithBackend(idToken); // FIXED: was verifyToken
          
          if (response.success) {
            setUser(response.user || response.data?.user);
            setUserData(response.user || response.data?.user);
            setAuthToken(idToken);
          }
        } catch (error) {
          console.error('Error syncing Firebase user:', error);
        }
      } else if (!firebaseUser && user) {
        // User signed out from Firebase
        setUser(null);
        removeAuthToken();
        removeUserData();
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

      // Authenticate with backend (using authService.signIn which internally calls the API)
      const response = await authService.signIn(email, password);

      if (response.user) {
        setUser(response.user || response.backendUser);
        setUserData(response.user || response.backendUser);
        setAuthToken(idToken);

        // Request notification permission
        try {
          const fcmToken = await requestNotificationPermission();
          if (fcmToken) {
            await authService.updateFCMToken(fcmToken);
          }
        } catch (fcmError) {
          console.warn('FCM token registration failed:', fcmError);
        }

        return { success: true, user: response.user || response.backendUser };
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
      const response = await authService.verifyTokenWithBackend(idToken); // FIXED: was verifyToken

      if (response.success && response.user) {
        setUser(response.user);
        setUserData(response.user);
        setAuthToken(idToken);

        return { success: true, user: response.user };
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
      removeAuthToken();
      removeUserData();
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
   * Update user data
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
    setUserData(userData);
  }, []);

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await authService.verifyTokenWithBackend(token); // FIXED: was verifyToken
      if (response.success && response.user) {
        setUser(response.user);
        setUserData(response.user);
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
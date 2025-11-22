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
 */
export const AuthProvider = ({ children }) => {
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
          // Verify token is still valid
          const response = await authService.verifyToken();
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
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && !user) {
        // User signed in with Firebase but not in our backend yet
        // This happens with Google Sign-In
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await authService.verifyToken(idToken);
          
          if (response.success) {
            setUser(response.user);
            setUserData(response.user);
            setAuthToken(idToken);
          }
        } catch (error) {
          console.error('Error syncing Firebase user:', error);
        }
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
      const response = await authService.login(email, password, idToken);

      if (response.success) {
        setUser(response.user);
        setUserData(response.user);
        setAuthToken(response.token);

        // Request notification permission
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          await authService.updateFCMToken(fcmToken);
        }

        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.register(userData);

      if (response.success) {
        // Automatically log in after registration
        await login(userData.email, userData.password);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
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

      // Sign in with Google popup
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();

      // Authenticate with backend
      const response = await authService.googleLogin(idToken);

      if (response.success) {
        setUser(response.user);
        setUserData(response.user);
        setAuthToken(response.token);

        // Request notification permission
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          await authService.updateFCMToken(fcmToken);
        }

        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setLoading(true);

      // Sign out from Firebase
      await signOut(auth);

      // Notify backend
      await authService.logout();

      // Clear local state and storage
      setUser(null);
      setFirebaseUser(null);
      removeAuthToken();
      removeUserData();

      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      // Clear state anyway
      setUser(null);
      setFirebaseUser(null);
      removeAuthToken();
      removeUserData();
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email) => {
    try {
      setError(null);
      setLoading(true);

      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateUser = useCallback((updatedData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedData,
    }));
    setUserData({
      ...user,
      ...updatedData,
    });
  }, [user]);

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.user);
        setUserData(response.user);
        return { success: true, user: response.user };
      }
      return { success: false };
    } catch (error) {
      console.error('Error refreshing user:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return !!user && !!getAuthToken();
  }, [user]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  const value = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUser,
    refreshUser,
    isAuthenticated,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
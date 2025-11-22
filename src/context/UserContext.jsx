import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from '../services/userService';
import { AuthContext } from './AuthContext';

// Create Context
export const UserContext = createContext();

/**
 * User Provider Component
 * Manages user profile, stats, and related operations
 */
export const UserProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load user profile when authenticated
   */
  useEffect(() => {
    if (isAuthenticated() && authUser) {
      loadProfile();
      loadStats();
      loadFavorites();
    } else {
      // Clear state when logged out
      setProfile(null);
      setStats(null);
      setFavorites([]);
      setBlockedUsers([]);
    }
  }, [authUser, isAuthenticated]);

  /**
   * Load user profile
   */
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getCurrentUser();
      
      if (response.success) {
        setProfile(response.user);
        return { success: true, profile: response.user };
      }
      return { success: false };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load user statistics
   */
  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      
      if (response.success) {
        setStats(response.stats);
        return { success: true, stats: response.stats };
      }
      return { success: false };
    } catch (error) {
      console.error('Error loading stats:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Load user favorites
   */
  const loadFavorites = async () => {
    try {
      // This would call an API endpoint to get favorites
      // For now, we'll get it from localStorage or user profile
      const storedFavorites = localStorage.getItem('fixmate_favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      return { success: true };
    } catch (error) {
      console.error('Error loading favorites:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.updateProfile(profileData);

      if (response.success) {
        setProfile(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update profile image
   */
  const updateProfileImage = async (imageFile) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.updateProfileImage(imageFile);

      if (response.success) {
        setProfile((prev) => ({
          ...prev,
          profileImage: response.imageUrl,
        }));
        return { success: true, imageUrl: response.imageUrl };
      } else {
        throw new Error(response.message || 'Failed to update profile image');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user location
   */
  const updateLocation = async (locationData) => {
    try {
      const response = await userService.updateLocation(locationData);

      if (response.success) {
        setProfile((prev) => ({
          ...prev,
          location: locationData,
        }));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating location:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Update notification settings
   */
  const updateNotificationSettings = async (settings) => {
    try {
      const response = await userService.updateNotificationSettings(settings);

      if (response.success) {
        setProfile((prev) => ({
          ...prev,
          notificationSettings: settings,
        }));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Add worker to favorites
   */
  const addToFavorites = (workerId) => {
    const updatedFavorites = [...favorites, workerId];
    setFavorites(updatedFavorites);
    localStorage.setItem('fixmate_favorites', JSON.stringify(updatedFavorites));
  };

  /**
   * Remove worker from favorites
   */
  const removeFromFavorites = (workerId) => {
    const updatedFavorites = favorites.filter((id) => id !== workerId);
    setFavorites(updatedFavorites);
    localStorage.setItem('fixmate_favorites', JSON.stringify(updatedFavorites));
  };

  /**
   * Check if worker is in favorites
   */
  const isFavorite = (workerId) => {
    return favorites.includes(workerId);
  };

  /**
   * Toggle favorite status
   */
  const toggleFavorite = (workerId) => {
    if (isFavorite(workerId)) {
      removeFromFavorites(workerId);
    } else {
      addToFavorites(workerId);
    }
  };

  /**
   * Report a user
   */
  const reportUser = async (userId, reason, description) => {
    try {
      setLoading(true);
      const response = await userService.reportUser(userId, reason, description);
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Block a user
   */
  const blockUser = async (userId) => {
    try {
      setLoading(true);
      const response = await userService.blockUser(userId);

      if (response.success) {
        setBlockedUsers((prev) => [...prev, userId]);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user is blocked
   */
  const isBlocked = (userId) => {
    return blockedUsers.includes(userId);
  };

  /**
   * Get nearby users
   */
  const getNearbyUsers = async (latitude, longitude, radius = 10) => {
    try {
      const response = await userService.getNearbyUsers(latitude, longitude, radius);
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Search users
   */
  const searchUsers = async (query, filters = {}) => {
    try {
      const response = await userService.searchUsers(query, filters);
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Refresh all user data
   */
  const refresh = async () => {
    await Promise.all([
      loadProfile(),
      loadStats(),
      loadFavorites(),
    ]);
  };

  const value = {
    profile,
    stats,
    favorites,
    blockedUsers,
    loading,
    error,
    loadProfile,
    loadStats,
    updateProfile,
    updateProfileImage,
    updateLocation,
    updateNotificationSettings,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    reportUser,
    blockUser,
    isBlocked,
    getNearbyUsers,
    searchUsers,
    refresh,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
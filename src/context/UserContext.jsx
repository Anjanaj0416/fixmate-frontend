import React, { createContext, useState, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import userService from '../services/userService';

export const UserContext = createContext();

/**
 * User Provider Component
 * FIXED: Changed to named function export for Fast Refresh compatibility
 */
export function UserProvider({ children }) {
  const { user: authUser, updateUser: updateAuthUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.updateProfile(userData);
      
      if (response.success) {
        // Update in AuthContext
        await updateAuthUser(response.data || response.user);
        return { success: true, user: response.data || response.user };
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAuthUser]);

  /**
   * Upload profile image
   */
  const uploadProfileImage = useCallback(async (imageFile) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.uploadProfileImage(imageFile);
      
      if (response.success) {
        // Update user with new image URL
        await updateAuthUser({
          ...authUser,
          profileImage: response.data?.imageUrl || response.imageUrl
        });
        return { success: true, imageUrl: response.data?.imageUrl || response.imageUrl };
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload image';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authUser, updateAuthUser]);

  /**
   * Update location
   */
  const updateLocation = useCallback(async (location) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.updateLocation(location);
      
      if (response.success) {
        await updateAuthUser({
          ...authUser,
          location: response.data?.location || location
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Location update failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update location';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authUser, updateAuthUser]);

  /**
   * Get user statistics
   */
  const getStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getStatistics();
      
      if (response.success) {
        return response.data || response.statistics;
      } else {
        throw new Error(response.message || 'Failed to get statistics');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get statistics';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user: authUser,
    loading,
    error,
    updateProfile,
    uploadProfileImage,
    updateLocation,
    getStatistics,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Default export for backwards compatibility
export default UserProvider;
import api, { createFormData } from './api';

/**
 * User Service
 * Handles user profile and account management
 */

class UserService {
  
  // ============= USER PROFILE =============

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Update profile image
   */
  async updateProfileImage(imageFile) {
    try {
      const formData = createFormData({
        profileImage: imageFile
      });

      const response = await api.put('/users/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update profile image error:', error);
      throw error;
    }
  }

  /**
   * Update user location
   */
  async updateLocation(locationData) {
    try {
      const response = await api.put('/users/location', locationData);
      return response.data;
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/users/notification-settings', settings);
      return response.data;
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  }

  // ============= USER STATS =============

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  // ============= USER SEARCH =============

  /**
   * Search users (Admin only)
   */
  async searchUsers(searchQuery, filters = {}) {
    try {
      const params = {
        q: searchQuery,
        ...filters
      };
      const response = await api.get('/users/search', { params });
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  /**
   * Get nearby users (for location-based features)
   */
  async getNearbyUsers(latitude, longitude, radius = 10) {
    try {
      const params = { latitude, longitude, radius };
      const response = await api.get('/users/nearby', { params });
      return response.data;
    } catch (error) {
      console.error('Get nearby users error:', error);
      throw error;
    }
  }

  // ============= USER ACTIONS =============

  /**
   * Report a user
   */
  async reportUser(userId, reportData) {
    try {
      const response = await api.post(`/users/${userId}/report`, reportData);
      return response.data;
    } catch (error) {
      console.error('Report user error:', error);
      throw error;
    }
  }

  /**
   * Block a user
   */
  async blockUser(userId) {
    try {
      const response = await api.post(`/users/${userId}/block`);
      return response.data;
    } catch (error) {
      console.error('Block user error:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}/block`);
      return response.data;
    } catch (error) {
      console.error('Unblock user error:', error);
      throw error;
    }
  }

  /**
   * Get blocked users list
   */
  async getBlockedUsers() {
    try {
      const response = await api.get('/users/blocked');
      return response.data;
    } catch (error) {
      console.error('Get blocked users error:', error);
      throw error;
    }
  }

  // ============= USER PREFERENCES =============

  /**
   * Get user preferences
   */
  async getPreferences() {
    try {
      const response = await api.get('/users/preferences');
      return response.data;
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.put('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  // ============= ACCOUNT MANAGEMENT =============

  /**
   * Deactivate account
   */
  async deactivateAccount(reason) {
    try {
      const response = await api.post('/users/deactivate', { reason });
      return response.data;
    } catch (error) {
      console.error('Deactivate account error:', error);
      throw error;
    }
  }

  /**
   * Reactivate account
   */
  async reactivateAccount() {
    try {
      const response = await api.post('/users/reactivate');
      return response.data;
    } catch (error) {
      console.error('Reactivate account error:', error);
      throw error;
    }
  }

  /**
   * Delete account permanently
   */
  async deleteAccount(password) {
    try {
      const response = await api.delete('/users/account', {
        data: { password }
      });
      return response.data;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  // ============= VERIFICATION =============

  /**
   * Request email verification
   */
  async requestEmailVerification() {
    try {
      const response = await api.post('/users/verify-email/request');
      return response.data;
    } catch (error) {
      console.error('Request email verification error:', error);
      throw error;
    }
  }

  /**
   * Verify email with code
   */
  async verifyEmail(code) {
    try {
      const response = await api.post('/users/verify-email/confirm', { code });
      return response.data;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }

  /**
   * Request phone verification
   */
  async requestPhoneVerification(phoneNumber) {
    try {
      const response = await api.post('/users/verify-phone/request', { phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Request phone verification error:', error);
      throw error;
    }
  }

  /**
   * Verify phone with code
   */
  async verifyPhone(code) {
    try {
      const response = await api.post('/users/verify-phone/confirm', { code });
      return response.data;
    } catch (error) {
      console.error('Verify phone error:', error);
      throw error;
    }
  }

  // ============= DASHBOARD DATA =============

  /**
   * Get dashboard data for current user
   */
  async getDashboardData() {
    try {
      const response = await api.get('/users/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard data error:', error);
      throw error;
    }
  }

  /**
   * Get user activity history
   */
  async getActivityHistory(page = 1, limit = 20) {
    try {
      const params = { page, limit };
      const response = await api.get('/users/activity', { params });
      return response.data;
    } catch (error) {
      console.error('Get activity history error:', error);
      throw error;
    }
  }

  // ============= HELPER METHODS =============

  /**
   * Upload and compress profile image
   */
  async compressImage(file, maxSizeMB = 1) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions (max 800x800)
          const maxDimension = 800;
          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }));
            },
            'image/jpeg',
            0.9
          );
        };
        
        img.onerror = reject;
      };
      
      reader.onerror = reject;
    });
  }

  /**
   * Validate profile data
   */
  validateProfileData(data) {
    const errors = {};

    if (data.firstName && data.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (data.lastName && data.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (data.phoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(data.phoneNumber)) {
        errors.phoneNumber = 'Invalid phone number format';
      }
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Invalid email format';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export singleton instance
export default new UserService();
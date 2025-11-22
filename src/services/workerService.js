import api, { createFormData } from './api';

/**
 * Worker Service
 * Handles worker-specific operations
 */

class WorkerService {

  // ============= WORKER PROFILE =============

  /**
   * Register as a worker
   */
  async registerWorker(workerData) {
    try {
      const response = await api.post('/workers/register', workerData);
      return response.data;
    } catch (error) {
      console.error('Worker registration error:', error);
      throw error;
    }
  }

  /**
   * Get worker profile
   */
  async getWorkerProfile(workerId) {
    try {
      const response = await api.get(`/workers/${workerId}`);
      return response.data;
    } catch (error) {
      console.error('Get worker profile error:', error);
      throw error;
    }
  }

  /**
   * Get current worker's profile
   */
  async getMyWorkerProfile() {
    try {
      const response = await api.get('/workers/me');
      return response.data;
    } catch (error) {
      console.error('Get my worker profile error:', error);
      throw error;
    }
  }

  /**
   * Update worker profile
   */
  async updateWorkerProfile(profileData) {
    try {
      const response = await api.put('/workers/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update worker profile error:', error);
      throw error;
    }
  }

  /**
   * Upload worker documents (ID, certificates, etc.)
   */
  async uploadDocuments(documents) {
    try {
      const formData = createFormData(documents);

      const response = await api.post('/workers/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload documents error:', error);
      throw error;
    }
  }

  /**
   * Update worker services/categories
   */
  async updateServices(services) {
    try {
      const response = await api.put('/workers/services', { services });
      return response.data;
    } catch (error) {
      console.error('Update services error:', error);
      throw error;
    }
  }

  /**
   * Update service area
   */
  async updateServiceArea(serviceArea) {
    try {
      const response = await api.put('/workers/service-area', serviceArea);
      return response.data;
    } catch (error) {
      console.error('Update service area error:', error);
      throw error;
    }
  }

  /**
   * Update hourly rate
   */
  async updateHourlyRate(hourlyRate) {
    try {
      const response = await api.put('/workers/hourly-rate', { hourlyRate });
      return response.data;
    } catch (error) {
      console.error('Update hourly rate error:', error);
      throw error;
    }
  }

  // ============= WORKER SEARCH =============

  /**
   * Search workers
   */
  async searchWorkers(searchParams) {
    try {
      const response = await api.get('/workers/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Search workers error:', error);
      throw error;
    }
  }

  /**
   * Get nearby workers
   */
  async getNearbyWorkers(latitude, longitude, radius = 10, category = null) {
    try {
      const params = { latitude, longitude, radius };
      if (category) params.category = category;
      
      const response = await api.get('/workers/nearby', { params });
      return response.data;
    } catch (error) {
      console.error('Get nearby workers error:', error);
      throw error;
    }
  }

  /**
   * Get top-rated workers
   */
  async getTopRatedWorkers(category = null, limit = 10) {
    try {
      const params = { limit };
      if (category) params.category = category;
      
      const response = await api.get('/workers/top-rated', { params });
      return response.data;
    } catch (error) {
      console.error('Get top-rated workers error:', error);
      throw error;
    }
  }

  /**
   * Filter workers by availability
   */
  async getAvailableWorkers(date, startTime, endTime, category = null) {
    try {
      const params = { date, startTime, endTime };
      if (category) params.category = category;
      
      const response = await api.get('/workers/available', { params });
      return response.data;
    } catch (error) {
      console.error('Get available workers error:', error);
      throw error;
    }
  }

  // ============= AVAILABILITY =============

  /**
   * Get worker availability
   */
  async getAvailability(workerId = null) {
    try {
      const endpoint = workerId ? `/workers/${workerId}/availability` : '/workers/availability';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get availability error:', error);
      throw error;
    }
  }

  /**
   * Update availability
   */
  async updateAvailability(availabilityData) {
    try {
      const response = await api.put('/workers/availability', availabilityData);
      return response.data;
    } catch (error) {
      console.error('Update availability error:', error);
      throw error;
    }
  }

  /**
   * Set unavailable dates
   */
  async setUnavailableDates(dates) {
    try {
      const response = await api.post('/workers/unavailable-dates', { dates });
      return response.data;
    } catch (error) {
      console.error('Set unavailable dates error:', error);
      throw error;
    }
  }

  /**
   * Remove unavailable dates
   */
  async removeUnavailableDates(dates) {
    try {
      const response = await api.delete('/workers/unavailable-dates', {
        data: { dates }
      });
      return response.data;
    } catch (error) {
      console.error('Remove unavailable dates error:', error);
      throw error;
    }
  }

  // ============= WORKER STATS =============

  /**
   * Get worker statistics
   */
  async getWorkerStats(workerId = null) {
    try {
      const endpoint = workerId ? `/workers/${workerId}/stats` : '/workers/stats';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get worker stats error:', error);
      throw error;
    }
  }

  /**
   * Get worker earnings
   */
  async getEarnings(startDate = null, endDate = null) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/workers/earnings', { params });
      return response.data;
    } catch (error) {
      console.error('Get earnings error:', error);
      throw error;
    }
  }

  /**
   * Get worker dashboard data
   */
  async getDashboard() {
    try {
      const response = await api.get('/workers/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get worker dashboard error:', error);
      throw error;
    }
  }

  // ============= PORTFOLIO =============

  /**
   * Get worker portfolio
   */
  async getPortfolio(workerId = null) {
    try {
      const endpoint = workerId ? `/workers/${workerId}/portfolio` : '/workers/portfolio';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get portfolio error:', error);
      throw error;
    }
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(itemData) {
    try {
      const formData = createFormData(itemData);

      const response = await api.post('/workers/portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Add portfolio item error:', error);
      throw error;
    }
  }

  /**
   * Update portfolio item
   */
  async updatePortfolioItem(itemId, itemData) {
    try {
      const response = await api.put(`/workers/portfolio/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Update portfolio item error:', error);
      throw error;
    }
  }

  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(itemId) {
    try {
      const response = await api.delete(`/workers/portfolio/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Delete portfolio item error:', error);
      throw error;
    }
  }

  // ============= VERIFICATION =============

  /**
   * Get verification status
   */
  async getVerificationStatus() {
    try {
      const response = await api.get('/workers/verification-status');
      return response.data;
    } catch (error) {
      console.error('Get verification status error:', error);
      throw error;
    }
  }

  /**
   * Request verification
   */
  async requestVerification(verificationData) {
    try {
      const formData = createFormData(verificationData);

      const response = await api.post('/workers/request-verification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Request verification error:', error);
      throw error;
    }
  }

  // ============= CATEGORIES =============

  /**
   * Get all service categories
   */
  async getCategories() {
    try {
      const response = await api.get('/workers/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  /**
   * Get workers by category
   */
  async getWorkersByCategory(categoryId, page = 1, limit = 20) {
    try {
      const params = { page, limit };
      const response = await api.get(`/workers/category/${categoryId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get workers by category error:', error);
      throw error;
    }
  }

  // ============= REVIEWS =============

  /**
   * Get worker reviews
   */
  async getReviews(workerId, page = 1, limit = 10) {
    try {
      const params = { page, limit };
      const response = await api.get(`/workers/${workerId}/reviews`, { params });
      return response.data;
    } catch (error) {
      console.error('Get reviews error:', error);
      throw error;
    }
  }

  /**
   * Get review summary
   */
  async getReviewSummary(workerId = null) {
    try {
      const endpoint = workerId 
        ? `/workers/${workerId}/reviews/summary` 
        : '/workers/reviews/summary';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get review summary error:', error);
      throw error;
    }
  }

  // ============= FAVORITES =============

  /**
   * Get favorite workers (for customers)
   */
  async getFavoriteWorkers() {
    try {
      const response = await api.get('/workers/favorites');
      return response.data;
    } catch (error) {
      console.error('Get favorite workers error:', error);
      throw error;
    }
  }

  /**
   * Add worker to favorites
   */
  async addToFavorites(workerId) {
    try {
      const response = await api.post(`/workers/${workerId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Add to favorites error:', error);
      throw error;
    }
  }

  /**
   * Remove worker from favorites
   */
  async removeFromFavorites(workerId) {
    try {
      const response = await api.delete(`/workers/${workerId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Remove from favorites error:', error);
      throw error;
    }
  }

  // ============= HELPER METHODS =============

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Format worker data for display
   */
  formatWorkerForDisplay(worker) {
    return {
      ...worker,
      fullName: `${worker.firstName} ${worker.lastName}`,
      ratingText: worker.averageRating ? `${worker.averageRating.toFixed(1)} (${worker.totalReviews})` : 'No reviews yet',
      hourlyRateText: worker.hourlyRate ? `LKR ${worker.hourlyRate}/hr` : 'Rate not set',
      verifiedBadge: worker.isVerified ? '✓ Verified' : '',
      availabilityStatus: worker.isAvailable ? 'Available' : 'Busy'
    };
  }

  /**
   * Validate worker registration data
   */
  validateWorkerData(data) {
    const errors = {};

    if (!data.services || data.services.length === 0) {
      errors.services = 'Please select at least one service category';
    }

    if (!data.hourlyRate || data.hourlyRate < 0) {
      errors.hourlyRate = 'Please enter a valid hourly rate';
    }

    if (!data.serviceArea || !data.serviceArea.coordinates) {
      errors.serviceArea = 'Please set your service area';
    }

    if (!data.bio || data.bio.length < 50) {
      errors.bio = 'Bio must be at least 50 characters';
    }

    if (!data.experience || data.experience < 0) {
      errors.experience = 'Please enter years of experience';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export singleton instance
export default new WorkerService();
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
   * Get worker profile by ID
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
   * Get worker by ID (alias for getWorkerProfile)
   */
  async getWorkerById(workerId) {
    return this.getWorkerProfile(workerId);
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
  async updateHourlyRate(rate) {
    try {
      const response = await api.put('/workers/hourly-rate', { rate });
      return response.data;
    } catch (error) {
      console.error('Update hourly rate error:', error);
      throw error;
    }
  }

  /**
   * Toggle availability
   */
  async toggleAvailability(isAvailable) {
    try {
      const response = await api.put('/workers/availability', { isAvailable });
      return response.data;
    } catch (error) {
      console.error('Toggle availability error:', error);
      throw error;
    }
  }

  // ============= WORKER SEARCH & DISCOVERY =============

  /**
   * Search for workers
   */
  async searchWorkers(searchParams) {
    try {
      const response = await api.get('/workers/search', {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      console.error('Search workers error:', error);
      throw error;
    }
  }

  /**
   * Get nearby workers
   */
  async getNearbyWorkers(latitude, longitude, radius = 10, filters = {}) {
    try {
      const params = {
        latitude,
        longitude,
        radius,
        ...filters
      };
      const response = await api.get('/workers/nearby', { params });
      return response.data;
    } catch (error) {
      console.error('Get nearby workers error:', error);
      throw error;
    }
  }

  /**
   * Get featured workers
   */
  async getFeaturedWorkers(limit = 10) {
    try {
      const response = await api.get('/workers/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get featured workers error:', error);
      throw error;
    }
  }

  /**
   * Get top-rated workers
   */
  async getTopRatedWorkers(limit = 10) {
    try {
      const response = await api.get('/workers/top-rated', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get top-rated workers error:', error);
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
        : '/workers/me/reviews/summary';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get review summary error:', error);
      throw error;
    }
  }

  // ============= PORTFOLIO =============

  /**
   * Upload portfolio images
   */
  async uploadPortfolio(images) {
    try {
      const formData = createFormData({ images });

      const response = await api.post('/workers/portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload portfolio error:', error);
      throw error;
    }
  }

  /**
   * Delete portfolio image
   */
  async deletePortfolioImage(imageId) {
    try {
      const response = await api.delete(`/workers/portfolio/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete portfolio image error:', error);
      throw error;
    }
  }

  /**
   * Get portfolio
   */
  async getPortfolio(workerId = null) {
    try {
      const endpoint = workerId 
        ? `/workers/${workerId}/portfolio`
        : '/workers/me/portfolio';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get portfolio error:', error);
      throw error;
    }
  }

  // ============= STATISTICS =============

  /**
   * Get worker statistics
   */
  async getStatistics(workerId = null) {
    try {
      const endpoint = workerId 
        ? `/workers/${workerId}/statistics`
        : '/workers/me/statistics';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  /**
   * Get earnings summary
   */
  async getEarningsSummary(period = 'month') {
    try {
      const response = await api.get('/workers/me/earnings', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get earnings summary error:', error);
      throw error;
    }
  }

  // ============= FAVORITES =============

  /**
   * Toggle favorite worker
   */
  async toggleFavorite(workerId) {
    try {
      const response = await api.post(`/workers/${workerId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw error;
    }
  }

  /**
   * Get favorite workers
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
   * Check if worker is favorite
   */
  async isFavorite(workerId) {
    try {
      const response = await api.get(`/workers/${workerId}/is-favorite`);
      return response.data;
    } catch (error) {
      console.error('Check is favorite error:', error);
      throw error;
    }
  }

  // ============= VERIFICATION =============

  /**
   * Request verification
   */
  async requestVerification(verificationData) {
    try {
      const formData = createFormData(verificationData);

      const response = await api.post('/workers/verification/request', formData, {
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

  /**
   * Get verification status
   */
  async getVerificationStatus() {
    try {
      const response = await api.get('/workers/verification/status');
      return response.data;
    } catch (error) {
      console.error('Get verification status error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const workerService = new WorkerService();
export { workerService };
export default workerService;
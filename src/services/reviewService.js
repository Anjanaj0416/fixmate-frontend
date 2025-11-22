import api, { createFormData } from './api';

/**
 * Review Service
 * Handles reviews and ratings management
 */

class ReviewService {

  // ============= CREATE & MANAGE REVIEWS =============

  /**
   * Create a review
   */
  async createReview(reviewData) {
    try {
      const formData = createFormData(reviewData);

      const response = await api.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReview(reviewId) {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Get review error:', error);
      throw error;
    }
  }

  /**
   * Update review
   */
  async updateReview(reviewId, updateData) {
    try {
      const response = await api.put(`/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update review error:', error);
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  }

  // ============= WORKER REVIEWS =============

  /**
   * Get reviews for a worker
   */
  async getWorkerReviews(workerId, page = 1, limit = 10, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get(`/reviews/worker/${workerId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get worker reviews error:', error);
      throw error;
    }
  }

  /**
   * Get worker review summary
   */
  async getWorkerReviewSummary(workerId) {
    try {
      const response = await api.get(`/reviews/worker/${workerId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Get worker review summary error:', error);
      throw error;
    }
  }

  /**
   * Get worker rating breakdown
   */
  async getWorkerRatingBreakdown(workerId) {
    try {
      const response = await api.get(`/reviews/worker/${workerId}/breakdown`);
      return response.data;
    } catch (error) {
      console.error('Get rating breakdown error:', error);
      throw error;
    }
  }

  // ============= USER REVIEWS =============

  /**
   * Get reviews by a user (as customer)
   */
  async getUserReviews(userId = null, page = 1, limit = 10) {
    try {
      const params = { page, limit };
      const endpoint = userId 
        ? `/reviews/user/${userId}` 
        : '/reviews/my';
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Get user reviews error:', error);
      throw error;
    }
  }

  /**
   * Get my reviews (current user)
   */
  async getMyReviews(page = 1, limit = 10) {
    try {
      return await this.getUserReviews(null, page, limit);
    } catch (error) {
      console.error('Get my reviews error:', error);
      throw error;
    }
  }

  // ============= BOOKING REVIEWS =============

  /**
   * Get review for a specific booking
   */
  async getBookingReview(bookingId) {
    try {
      const response = await api.get(`/reviews/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get booking review error:', error);
      throw error;
    }
  }

  /**
   * Check if booking can be reviewed
   */
  async canReviewBooking(bookingId) {
    try {
      const response = await api.get(`/reviews/booking/${bookingId}/can-review`);
      return response.data;
    } catch (error) {
      console.error('Check can review error:', error);
      throw error;
    }
  }

  // ============= REVIEW INTERACTIONS =============

  /**
   * Mark review as helpful
   */
  async markAsHelpful(reviewId) {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Mark as helpful error:', error);
      throw error;
    }
  }

  /**
   * Remove helpful mark
   */
  async removeHelpfulMark(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Remove helpful mark error:', error);
      throw error;
    }
  }

  /**
   * Report review
   */
  async reportReview(reviewId, reason) {
    try {
      const response = await api.post(`/reviews/${reviewId}/report`, { reason });
      return response.data;
    } catch (error) {
      console.error('Report review error:', error);
      throw error;
    }
  }

  // ============= REVIEW MODERATION (Admin) =============

  /**
   * Get reported reviews (Admin)
   */
  async getReportedReviews(page = 1, limit = 20) {
    try {
      const params = { page, limit };
      const response = await api.get('/reviews/reported', { params });
      return response.data;
    } catch (error) {
      console.error('Get reported reviews error:', error);
      throw error;
    }
  }

  /**
   * Moderate review (Admin)
   */
  async moderateReview(reviewId, action, reason = null) {
    try {
      const response = await api.post(`/reviews/${reviewId}/moderate`, {
        action,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Moderate review error:', error);
      throw error;
    }
  }

  // ============= STATISTICS =============

  /**
   * Get review statistics
   */
  async getReviewStatistics(workerId = null) {
    try {
      const endpoint = workerId 
        ? `/reviews/worker/${workerId}/statistics`
        : '/reviews/statistics';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get review statistics error:', error);
      throw error;
    }
  }

  /**
   * Get trending reviews
   */
  async getTrendingReviews(limit = 10) {
    try {
      const response = await api.get('/reviews/trending', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get trending reviews error:', error);
      throw error;
    }
  }

  /**
   * Get recent reviews
   */
  async getRecentReviews(limit = 10) {
    try {
      const response = await api.get('/reviews/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get recent reviews error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const reviewService = new ReviewService();
export { reviewService };
export default reviewService;
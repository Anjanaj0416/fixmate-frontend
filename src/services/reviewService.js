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
      const endpoint = userId ? `/reviews/user/${userId}` : '/reviews/my';
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

  // ============= WORKER RESPONSES =============

  /**
   * Respond to review (Worker only)
   */
  async respondToReview(reviewId, response) {
    try {
      const responseData = await api.post(`/reviews/${reviewId}/respond`, {
        response
      });
      return responseData.data;
    } catch (error) {
      console.error('Respond to review error:', error);
      throw error;
    }
  }

  /**
   * Update response to review
   */
  async updateResponse(reviewId, response) {
    try {
      const responseData = await api.put(`/reviews/${reviewId}/response`, {
        response
      });
      return responseData.data;
    } catch (error) {
      console.error('Update response error:', error);
      throw error;
    }
  }

  /**
   * Delete response to review
   */
  async deleteResponse(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}/response`);
      return response.data;
    } catch (error) {
      console.error('Delete response error:', error);
      throw error;
    }
  }

  // ============= REVIEW STATISTICS =============

  /**
   * Get review statistics for current user
   */
  async getMyReviewStats() {
    try {
      const response = await api.get('/reviews/my/stats');
      return response.data;
    } catch (error) {
      console.error('Get my review stats error:', error);
      throw error;
    }
  }

  /**
   * Get pending reviews (bookings that need review)
   */
  async getPendingReviews() {
    try {
      const response = await api.get('/reviews/pending');
      return response.data;
    } catch (error) {
      console.error('Get pending reviews error:', error);
      throw error;
    }
  }

  // ============= SEARCH & FILTER =============

  /**
   * Search reviews
   */
  async searchReviews(searchQuery, filters = {}) {
    try {
      const params = { query: searchQuery, ...filters };
      const response = await api.get('/reviews/search', { params });
      return response.data;
    } catch (error) {
      console.error('Search reviews error:', error);
      throw error;
    }
  }

  /**
   * Get top reviews (highest rated)
   */
  async getTopReviews(limit = 10) {
    try {
      const params = { limit };
      const response = await api.get('/reviews/top', { params });
      return response.data;
    } catch (error) {
      console.error('Get top reviews error:', error);
      throw error;
    }
  }

  /**
   * Get recent reviews
   */
  async getRecentReviews(limit = 10) {
    try {
      const params = { limit };
      const response = await api.get('/reviews/recent', { params });
      return response.data;
    } catch (error) {
      console.error('Get recent reviews error:', error);
      throw error;
    }
  }

  // ============= IMAGES =============

  /**
   * Upload review images
   */
  async uploadReviewImages(reviewId, images) {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.post(
        `/reviews/${reviewId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload review images error:', error);
      throw error;
    }
  }

  /**
   * Delete review image
   */
  async deleteReviewImage(reviewId, imageId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete review image error:', error);
      throw error;
    }
  }

  // ============= HELPER METHODS =============

  /**
   * Validate review data
   */
  validateReviewData(data) {
    const errors = {};

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    if (!data.comment || data.comment.trim().length < 10) {
      errors.comment = 'Review must be at least 10 characters';
    }

    if (data.comment && data.comment.length > 1000) {
      errors.comment = 'Review must not exceed 1000 characters';
    }

    if (data.images && data.images.length > 5) {
      errors.images = 'Maximum 5 images allowed';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format rating display
   */
  formatRating(rating) {
    if (!rating) return 'No rating';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return {
      stars: '⭐'.repeat(fullStars) + (hasHalfStar ? '✨' : '') + '☆'.repeat(emptyStars),
      value: rating.toFixed(1),
      percentage: (rating / 5) * 100
    };
  }

  /**
   * Get rating level text
   */
  getRatingLevel(rating) {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Average';
    if (rating >= 2.0) return 'Below Average';
    return 'Poor';
  }

  /**
   * Get rating color
   */
  getRatingColor(rating) {
    if (rating >= 4.5) return 'green';
    if (rating >= 4.0) return 'lime';
    if (rating >= 3.5) return 'yellow';
    if (rating >= 3.0) return 'orange';
    return 'red';
  }

  /**
   * Calculate review summary
   */
  calculateReviewSummary(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        },
        percentages: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      };
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    const ratingBreakdown = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    const percentages = {
      5: (ratingBreakdown[5] / totalReviews) * 100,
      4: (ratingBreakdown[4] / totalReviews) * 100,
      3: (ratingBreakdown[3] / totalReviews) * 100,
      2: (ratingBreakdown[2] / totalReviews) * 100,
      1: (ratingBreakdown[1] / totalReviews) * 100
    };

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingBreakdown,
      percentages
    };
  }

  /**
   * Format review date
   */
  formatReviewDate(date) {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffInMs = now - reviewDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return reviewDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  /**
   * Check if review is editable
   */
  canEditReview(review, currentUserId) {
    const reviewDate = new Date(review.createdAt);
    const now = new Date();
    const hoursSinceReview = (now - reviewDate) / (1000 * 60 * 60);

    return (
      review.userId === currentUserId &&
      hoursSinceReview <= 24 && // Can edit within 24 hours
      !review.isEdited
    );
  }

  /**
   * Check if review can be deleted
   */
  canDeleteReview(review, currentUserId, isAdmin = false) {
    return (
      review.userId === currentUserId ||
      isAdmin
    );
  }

  /**
   * Sort reviews
   */
  sortReviews(reviews, sortBy = 'recent') {
    const sorted = [...reviews];

    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      default:
        return sorted;
    }
  }

  /**
   * Filter reviews by rating
   */
  filterByRating(reviews, rating) {
    if (!rating) return reviews;
    return reviews.filter(review => review.rating === rating);
  }

  /**
   * Get review sentiment
   */
  getReviewSentiment(rating, comment) {
    // Simple sentiment analysis based on rating and keywords
    const positiveKeywords = ['excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'best', 'perfect', 'love', 'recommend'];
    const negativeKeywords = ['terrible', 'worst', 'horrible', 'awful', 'bad', 'poor', 'disappointing', 'never', 'avoid'];

    const lowerComment = comment.toLowerCase();
    const hasPositive = positiveKeywords.some(word => lowerComment.includes(word));
    const hasNegative = negativeKeywords.some(word => lowerComment.includes(word));

    if (rating >= 4) {
      return hasPositive ? 'Very Positive' : 'Positive';
    } else if (rating === 3) {
      return 'Neutral';
    } else {
      return hasNegative ? 'Very Negative' : 'Negative';
    }
  }
}

// Export singleton instance
export default new ReviewService();
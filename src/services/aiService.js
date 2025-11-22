import api, { createFormData } from './api';

/**
 * AI Service
 * Handles AI-powered recommendations and worker matching
 */

class AIService {

  // ============= WORKER MATCHING =============

  /**
   * Get AI-powered worker recommendations based on problem
   */
  async getWorkerRecommendations(problemData) {
    try {
      const formData = createFormData(problemData);

      const response = await api.post('/ai/recommend-workers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get worker recommendations error:', error);
      throw error;
    }
  }

  /**
   * Analyze problem from images and description
   */
  async analyzeProblem(problemImages, description, category = null) {
    try {
      const formData = new FormData();
      
      if (problemImages && problemImages.length > 0) {
        problemImages.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      formData.append('description', description);
      if (category) {
        formData.append('category', category);
      }

      const response = await api.post('/ai/analyze-problem', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Analyze problem error:', error);
      throw error;
    }
  }

  /**
   * Get suggested service category from problem description
   */
  async suggestCategory(description, images = null) {
    try {
      const formData = createFormData({
        description,
        images: images || []
      });

      const response = await api.post('/ai/suggest-category', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Suggest category error:', error);
      throw error;
    }
  }

  /**
   * Match workers based on specific criteria
   */
  async matchWorkers(criteria) {
    try {
      const response = await api.post('/ai/match-workers', criteria);
      return response.data;
    } catch (error) {
      console.error('Match workers error:', error);
      throw error;
    }
  }

  /**
   * Get similar workers to a specific worker
   */
  async getSimilarWorkers(workerId, limit = 5) {
    try {
      const params = { limit };
      const response = await api.get(`/ai/similar-workers/${workerId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get similar workers error:', error);
      throw error;
    }
  }

  // ============= PERSONALIZED RECOMMENDATIONS =============

  /**
   * Get personalized worker recommendations for current user
   */
  async getPersonalizedRecommendations(limit = 10) {
    try {
      const params = { limit };
      const response = await api.get('/ai/personalized-recommendations', { params });
      return response.data;
    } catch (error) {
      console.error('Get personalized recommendations error:', error);
      throw error;
    }
  }

  /**
   * Get trending workers
   */
  async getTrendingWorkers(category = null, limit = 10) {
    try {
      const params = { limit };
      if (category) params.category = category;
      
      const response = await api.get('/ai/trending-workers', { params });
      return response.data;
    } catch (error) {
      console.error('Get trending workers error:', error);
      throw error;
    }
  }

  /**
   * Get workers based on user's booking history
   */
  async getRecommendationsFromHistory(limit = 10) {
    try {
      const params = { limit };
      const response = await api.get('/ai/recommendations-from-history', { params });
      return response.data;
    } catch (error) {
      console.error('Get recommendations from history error:', error);
      throw error;
    }
  }

  // ============= PRICE ESTIMATION =============

  /**
   * Estimate job price based on problem details
   */
  async estimatePrice(jobDetails) {
    try {
      const response = await api.post('/ai/estimate-price', jobDetails);
      return response.data;
    } catch (error) {
      console.error('Estimate price error:', error);
      throw error;
    }
  }

  /**
   * Get price range for a service category
   */
  async getPriceRange(category, location = null) {
    try {
      const params = { category };
      if (location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }
      
      const response = await api.get('/ai/price-range', { params });
      return response.data;
    } catch (error) {
      console.error('Get price range error:', error);
      throw error;
    }
  }

  /**
   * Compare prices of different workers
   */
  async comparePrices(workerIds) {
    try {
      const response = await api.post('/ai/compare-prices', { workerIds });
      return response.data;
    } catch (error) {
      console.error('Compare prices error:', error);
      throw error;
    }
  }

  // ============= TIME ESTIMATION =============

  /**
   * Estimate job duration
   */
  async estimateDuration(jobDetails) {
    try {
      const response = await api.post('/ai/estimate-duration', jobDetails);
      return response.data;
    } catch (error) {
      console.error('Estimate duration error:', error);
      throw error;
    }
  }

  /**
   * Get optimal booking time
   */
  async getOptimalBookingTime(workerId, date) {
    try {
      const params = { workerId, date };
      const response = await api.get('/ai/optimal-booking-time', { params });
      return response.data;
    } catch (error) {
      console.error('Get optimal booking time error:', error);
      throw error;
    }
  }

  // ============= SMART SEARCH =============

  /**
   * Smart search with AI-enhanced results
   */
  async smartSearch(query, filters = {}) {
    try {
      const params = { query, ...filters };
      const response = await api.get('/ai/smart-search', { params });
      return response.data;
    } catch (error) {
      console.error('Smart search error:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query) {
    try {
      const params = { query };
      const response = await api.get('/ai/search-suggestions', { params });
      return response.data;
    } catch (error) {
      console.error('Get search suggestions error:', error);
      throw error;
    }
  }

  /**
   * Autocomplete search
   */
  async autocomplete(query, type = 'all') {
    try {
      const params = { query, type };
      const response = await api.get('/ai/autocomplete', { params });
      return response.data;
    } catch (error) {
      console.error('Autocomplete error:', error);
      throw error;
    }
  }

  // ============= WORKER INSIGHTS =============

  /**
   * Get worker performance insights
   */
  async getWorkerInsights(workerId) {
    try {
      const response = await api.get(`/ai/worker-insights/${workerId}`);
      return response.data;
    } catch (error) {
      console.error('Get worker insights error:', error);
      throw error;
    }
  }

  /**
   * Get worker availability prediction
   */
  async predictWorkerAvailability(workerId, date) {
    try {
      const params = { date };
      const response = await api.get(`/ai/predict-availability/${workerId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Predict worker availability error:', error);
      throw error;
    }
  }

  /**
   * Get worker demand forecast
   */
  async getWorkerDemandForecast(workerId, days = 7) {
    try {
      const params = { days };
      const response = await api.get(`/ai/demand-forecast/${workerId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get demand forecast error:', error);
      throw error;
    }
  }

  // ============= QUALITY PREDICTION =============

  /**
   * Predict job quality based on worker and job details
   */
  async predictJobQuality(workerId, jobDetails) {
    try {
      const response = await api.post('/ai/predict-quality', {
        workerId,
        ...jobDetails
      });
      return response.data;
    } catch (error) {
      console.error('Predict job quality error:', error);
      throw error;
    }
  }

  /**
   * Get success probability for a booking
   */
  async getBookingSuccessProbability(bookingData) {
    try {
      const response = await api.post('/ai/booking-success-probability', bookingData);
      return response.data;
    } catch (error) {
      console.error('Get booking success probability error:', error);
      throw error;
    }
  }

  // ============= CHATBOT & ASSISTANCE =============

  /**
   * Chat with AI assistant
   */
  async chatWithAssistant(message, conversationId = null) {
    try {
      const response = await api.post('/ai/chat', {
        message,
        conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Chat with assistant error:', error);
      throw error;
    }
  }

  /**
   * Get problem-solving suggestions
   */
  async getProblemSuggestions(problemDescription) {
    try {
      const response = await api.post('/ai/problem-suggestions', {
        description: problemDescription
      });
      return response.data;
    } catch (error) {
      console.error('Get problem suggestions error:', error);
      throw error;
    }
  }

  // ============= ANALYTICS & INSIGHTS =============

  /**
   * Get market insights
   */
  async getMarketInsights(category = null) {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/ai/market-insights', { params });
      return response.data;
    } catch (error) {
      console.error('Get market insights error:', error);
      throw error;
    }
  }

  /**
   * Get user behavior insights (for workers)
   */
  async getUserBehaviorInsights() {
    try {
      const response = await api.get('/ai/user-behavior-insights');
      return response.data;
    } catch (error) {
      console.error('Get user behavior insights error:', error);
      throw error;
    }
  }

  /**
   * Get booking patterns
   */
  async getBookingPatterns(workerId = null) {
    try {
      const endpoint = workerId 
        ? `/ai/booking-patterns/${workerId}` 
        : '/ai/booking-patterns';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get booking patterns error:', error);
      throw error;
    }
  }

  // ============= OPTIMIZATION =============

  /**
   * Optimize worker profile
   */
  async optimizeWorkerProfile(workerId = null) {
    try {
      const endpoint = workerId 
        ? `/ai/optimize-profile/${workerId}` 
        : '/ai/optimize-profile';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Optimize worker profile error:', error);
      throw error;
    }
  }

  /**
   * Get pricing optimization suggestions
   */
  async getPricingOptimization(workerId = null) {
    try {
      const endpoint = workerId 
        ? `/ai/pricing-optimization/${workerId}` 
        : '/ai/pricing-optimization';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get pricing optimization error:', error);
      throw error;
    }
  }

  // ============= HELPER METHODS =============

  /**
   * Calculate match score between problem and worker
   */
  calculateMatchScore(problem, worker) {
    let score = 0;
    const weights = {
      category: 30,
      rating: 25,
      location: 20,
      price: 15,
      availability: 10
    };

    // Category match
    if (problem.category === worker.primaryCategory) {
      score += weights.category;
    } else if (worker.categories && worker.categories.includes(problem.category)) {
      score += weights.category * 0.7;
    }

    // Rating
    if (worker.averageRating) {
      score += (worker.averageRating / 5) * weights.rating;
    }

    // Location proximity
    if (problem.location && worker.location) {
      const distance = this.calculateDistance(
        problem.location.latitude,
        problem.location.longitude,
        worker.location.latitude,
        worker.location.longitude
      );
      const locationScore = Math.max(0, (1 - distance / 50) * weights.location);
      score += locationScore;
    }

    // Price match
    if (problem.budget && worker.hourlyRate) {
      const priceDiff = Math.abs(problem.budget - worker.hourlyRate) / problem.budget;
      const priceScore = Math.max(0, (1 - priceDiff) * weights.price);
      score += priceScore;
    }

    // Availability
    if (worker.isAvailable) {
      score += weights.availability;
    }

    return Math.round(score);
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Format AI recommendation with explanation
   */
  formatRecommendation(worker, matchScore, reasons = []) {
    return {
      ...worker,
      matchScore,
      matchLevel: this.getMatchLevel(matchScore),
      reasons: reasons.length > 0 ? reasons : this.generateReasons(worker, matchScore),
      recommendationText: this.getRecommendationText(matchScore)
    };
  }

  /**
   * Get match level
   */
  getMatchLevel(score) {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Great Match';
    if (score >= 60) return 'Good Match';
    if (score >= 45) return 'Fair Match';
    return 'Possible Match';
  }

  /**
   * Generate reasons for recommendation
   */
  generateReasons(worker, matchScore) {
    const reasons = [];

    if (worker.isVerified) {
      reasons.push('Verified professional');
    }

    if (worker.averageRating >= 4.5) {
      reasons.push('Highly rated by customers');
    }

    if (worker.totalBookings >= 50) {
      reasons.push('Experienced with many successful jobs');
    }

    if (worker.responseTime && worker.responseTime < 3600) {
      reasons.push('Quick to respond');
    }

    if (matchScore >= 75) {
      reasons.push('Strong match for your requirements');
    }

    return reasons;
  }

  /**
   * Get recommendation text
   */
  getRecommendationText(score) {
    if (score >= 90) {
      return 'Highly recommended! This worker is an excellent match for your needs.';
    } else if (score >= 75) {
      return 'Great choice! This worker matches your requirements well.';
    } else if (score >= 60) {
      return 'Good option. This worker should meet your needs.';
    } else if (score >= 45) {
      return 'Fair match. Consider reviewing other options.';
    } else {
      return 'Possible match. You may want to explore more options.';
    }
  }
}

// Export singleton instance
export default new AIService();
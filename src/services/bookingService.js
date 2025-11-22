import api, { createFormData } from './api';

/**
 * Booking Service
 * Handles booking lifecycle management
 */

class BookingService {

  // ============= CREATE & MANAGE BOOKINGS =============

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    try {
      const formData = createFormData(bookingData);

      const response = await api.post('/bookings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get booking error:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for current user
   */
  async getMyBookings(filters = {}) {
    try {
      const response = await api.get('/bookings/my', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get my bookings error:', error);
      throw error;
    }
  }

  /**
   * Get bookings (alias for getMyBookings)
   */
  async getBookings(filters = {}) {
    return this.getMyBookings(filters);
  }

  /**
   * Get bookings as a customer
   */
  async getCustomerBookings(filters = {}) {
    try {
      const response = await api.get('/bookings/customer', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get customer bookings error:', error);
      throw error;
    }
  }

  /**
   * Get bookings as a worker
   */
  async getWorkerBookings(filters = {}) {
    try {
      const response = await api.get('/bookings/worker', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get worker bookings error:', error);
      throw error;
    }
  }

  /**
   * Update booking details
   */
  async updateBooking(bookingId, updateData) {
    try {
      const response = await api.put(`/bookings/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update booking error:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, reason) {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  // ============= BOOKING STATUS MANAGEMENT =============

  /**
   * Accept booking (Worker)
   */
  async acceptBooking(bookingId) {
    try {
      const response = await api.post(`/bookings/${bookingId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept booking error:', error);
      throw error;
    }
  }

  /**
   * Reject booking (Worker)
   */
  async rejectBooking(bookingId, reason) {
    try {
      const response = await api.post(`/bookings/${bookingId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject booking error:', error);
      throw error;
    }
  }

  /**
   * Start work (Worker)
   */
  async startWork(bookingId, startLocation) {
    try {
      const response = await api.post(`/bookings/${bookingId}/start`, {
        startLocation,
        startTime: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Start work error:', error);
      throw error;
    }
  }

  /**
   * Complete work (Worker)
   */
  async completeWork(bookingId, completionData) {
    try {
      const formData = createFormData({
        ...completionData,
        endTime: new Date().toISOString()
      });

      const response = await api.post(`/bookings/${bookingId}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Complete work error:', error);
      throw error;
    }
  }

  /**
   * Confirm completion (Customer)
   */
  async confirmCompletion(bookingId, rating, review) {
    try {
      const response = await api.post(`/bookings/${bookingId}/confirm`, {
        rating,
        review
      });
      return response.data;
    } catch (error) {
      console.error('Confirm completion error:', error);
      throw error;
    }
  }

  // ============= QUOTES & ESTIMATES =============

  /**
   * Request quote for a booking
   */
  async requestQuote(bookingId, quoteData) {
    try {
      const response = await api.post(`/bookings/${bookingId}/quote`, quoteData);
      return response.data;
    } catch (error) {
      console.error('Request quote error:', error);
      throw error;
    }
  }

  /**
   * Accept quote (Customer)
   */
  async acceptQuote(bookingId, quoteId) {
    try {
      const response = await api.post(`/bookings/${bookingId}/quote/${quoteId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept quote error:', error);
      throw error;
    }
  }

  /**
   * Reject quote (Customer)
   */
  async rejectQuote(bookingId, quoteId, reason) {
    try {
      const response = await api.post(`/bookings/${bookingId}/quote/${quoteId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Reject quote error:', error);
      throw error;
    }
  }

  // ============= PAYMENT =============

  /**
   * Get payment details
   */
  async getPaymentDetails(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}/payment`);
      return response.data;
    } catch (error) {
      console.error('Get payment details error:', error);
      throw error;
    }
  }

  /**
   * Make payment
   */
  async makePayment(bookingId, paymentData) {
    try {
      const response = await api.post(`/bookings/${bookingId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Make payment error:', error);
      throw error;
    }
  }

  // ============= TRACKING & HISTORY =============

  /**
   * Get booking history
   */
  async getBookingHistory(filters = {}) {
    try {
      const response = await api.get('/bookings/history', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get booking history error:', error);
      throw error;
    }
  }

  /**
   * Get booking timeline
   */
  async getBookingTimeline(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}/timeline`);
      return response.data;
    } catch (error) {
      console.error('Get booking timeline error:', error);
      throw error;
    }
  }

  /**
   * Track worker location
   */
  async trackWorkerLocation(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}/track`);
      return response.data;
    } catch (error) {
      console.error('Track worker location error:', error);
      throw error;
    }
  }

  // ============= STATISTICS =============

  /**
   * Get booking statistics
   */
  async getStatistics(period = 'month') {
    try {
      const response = await api.get('/bookings/statistics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const bookingService = new BookingService();
export { bookingService };
export default bookingService;
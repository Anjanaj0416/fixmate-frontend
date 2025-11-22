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

  /**
   * Dispute booking (Customer/Worker)
   */
  async disputeBooking(bookingId, disputeData) {
    try {
      const formData = createFormData(disputeData);

      const response = await api.post(`/bookings/${bookingId}/dispute`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Dispute booking error:', error);
      throw error;
    }
  }

  // ============= QUOTES =============

  /**
   * Request quote
   */
  async requestQuote(bookingId, quoteRequest) {
    try {
      const response = await api.post(`/bookings/${bookingId}/quote/request`, quoteRequest);
      return response.data;
    } catch (error) {
      console.error('Request quote error:', error);
      throw error;
    }
  }

  /**
   * Send quote (Worker)
   */
  async sendQuote(bookingId, quoteData) {
    try {
      const response = await api.post(`/bookings/${bookingId}/quote/send`, quoteData);
      return response.data;
    } catch (error) {
      console.error('Send quote error:', error);
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
      const response = await api.post(`/bookings/${bookingId}/quote/${quoteId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject quote error:', error);
      throw error;
    }
  }

  // ============= PAYMENT =============

  /**
   * Process payment
   */
  async processPayment(bookingId, paymentData) {
    try {
      const response = await api.post(`/bookings/${bookingId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  }

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
   * Request refund
   */
  async requestRefund(bookingId, refundReason) {
    try {
      const response = await api.post(`/bookings/${bookingId}/refund`, {
        reason: refundReason
      });
      return response.data;
    } catch (error) {
      console.error('Request refund error:', error);
      throw error;
    }
  }

  // ============= IMAGES & ATTACHMENTS =============

  /**
   * Upload problem images
   */
  async uploadProblemImages(bookingId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const response = await api.post(
        `/bookings/${bookingId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload problem images error:', error);
      throw error;
    }
  }

  /**
   * Get booking images
   */
  async getBookingImages(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}/images`);
      return response.data;
    } catch (error) {
      console.error('Get booking images error:', error);
      throw error;
    }
  }

  /**
   * Delete booking image
   */
  async deleteBookingImage(bookingId, imageId) {
    try {
      const response = await api.delete(`/bookings/${bookingId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete booking image error:', error);
      throw error;
    }
  }

  // ============= SCHEDULING =============

  /**
   * Reschedule booking
   */
  async rescheduleBooking(bookingId, newSchedule) {
    try {
      const response = await api.post(`/bookings/${bookingId}/reschedule`, newSchedule);
      return response.data;
    } catch (error) {
      console.error('Reschedule booking error:', error);
      throw error;
    }
  }

  /**
   * Check worker availability for booking
   */
  async checkAvailability(workerId, date, startTime, endTime) {
    try {
      const params = { workerId, date, startTime, endTime };
      const response = await api.get('/bookings/check-availability', { params });
      return response.data;
    } catch (error) {
      console.error('Check availability error:', error);
      throw error;
    }
  }

  // ============= STATISTICS =============

  /**
   * Get booking statistics
   */
  async getBookingStats() {
    try {
      const response = await api.get('/bookings/stats');
      return response.data;
    } catch (error) {
      console.error('Get booking stats error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(limit = 5) {
    try {
      const params = { limit, status: 'scheduled,confirmed' };
      const response = await api.get('/bookings/upcoming', { params });
      return response.data;
    } catch (error) {
      console.error('Get upcoming bookings error:', error);
      throw error;
    }
  }

  /**
   * Get booking history
   */
  async getBookingHistory(page = 1, limit = 20, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/bookings/history', { params });
      return response.data;
    } catch (error) {
      console.error('Get booking history error:', error);
      throw error;
    }
  }

  // ============= NOTIFICATIONS =============

  /**
   * Send reminder notification
   */
  async sendReminder(bookingId) {
    try {
      const response = await api.post(`/bookings/${bookingId}/remind`);
      return response.data;
    } catch (error) {
      console.error('Send reminder error:', error);
      throw error;
    }
  }

  // ============= HELPER METHODS =============

  /**
   * Calculate booking cost
   */
  calculateCost(hourlyRate, hours, additionalCosts = 0) {
    const subtotal = hourlyRate * hours;
    const platformFee = subtotal * 0.1; // 10% platform fee
    const total = subtotal + platformFee + additionalCosts;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      additionalCosts,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Format booking status
   */
  getStatusInfo(status) {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: 'yellow',
        icon: '⏳',
        description: 'Waiting for worker response'
      },
      accepted: {
        label: 'Accepted',
        color: 'blue',
        icon: '✓',
        description: 'Worker has accepted the booking'
      },
      confirmed: {
        label: 'Confirmed',
        color: 'green',
        icon: '✓✓',
        description: 'Booking is confirmed'
      },
      in_progress: {
        label: 'In Progress',
        color: 'orange',
        icon: '🔨',
        description: 'Work is in progress'
      },
      completed: {
        label: 'Completed',
        color: 'green',
        icon: '✅',
        description: 'Work has been completed'
      },
      cancelled: {
        label: 'Cancelled',
        color: 'red',
        icon: '❌',
        description: 'Booking was cancelled'
      },
      rejected: {
        label: 'Rejected',
        color: 'red',
        icon: '⛔',
        description: 'Worker rejected the booking'
      },
      disputed: {
        label: 'Disputed',
        color: 'purple',
        icon: '⚠️',
        description: 'Booking is under dispute'
      }
    };

    return statusMap[status] || {
      label: status,
      color: 'gray',
      icon: '?',
      description: 'Unknown status'
    };
  }

  /**
   * Validate booking data
   */
  validateBookingData(data) {
    const errors = {};

    if (!data.workerId) {
      errors.workerId = 'Please select a worker';
    }

    if (!data.serviceType) {
      errors.serviceType = 'Please select a service type';
    }

    if (!data.scheduledDate) {
      errors.scheduledDate = 'Please select a date';
    } else {
      const selectedDate = new Date(data.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.scheduledDate = 'Date cannot be in the past';
      }
    }

    if (!data.scheduledTime) {
      errors.scheduledTime = 'Please select a time';
    }

    if (!data.location || !data.location.coordinates) {
      errors.location = 'Please provide a location';
    }

    if (!data.problemDescription || data.problemDescription.length < 20) {
      errors.problemDescription = 'Please provide a detailed description (at least 20 characters)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format booking date and time
   */
  formatBookingDateTime(date, time) {
    const bookingDate = new Date(date);
    const [hours, minutes] = time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return {
      dateTime: bookingDate.toISOString(),
      displayDate: bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      displayTime: bookingDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  }

  /**
   * Check if booking can be cancelled
   */
  canCancelBooking(booking) {
    const allowedStatuses = ['pending', 'accepted', 'confirmed'];
    const scheduledTime = new Date(booking.scheduledDate + 'T' + booking.scheduledTime);
    const now = new Date();
    const hoursUntilBooking = (scheduledTime - now) / (1000 * 60 * 60);

    return (
      allowedStatuses.includes(booking.status) &&
      hoursUntilBooking > 2 // Can cancel if more than 2 hours before scheduled time
    );
  }

  /**
   * Check if booking can be rescheduled
   */
  canRescheduleBooking(booking) {
    const allowedStatuses = ['pending', 'accepted', 'confirmed'];
    const scheduledTime = new Date(booking.scheduledDate + 'T' + booking.scheduledTime);
    const now = new Date();
    const hoursUntilBooking = (scheduledTime - now) / (1000 * 60 * 60);

    return (
      allowedStatuses.includes(booking.status) &&
      hoursUntilBooking > 4 // Can reschedule if more than 4 hours before scheduled time
    );
  }
}

// Export singleton instance
export default new BookingService();
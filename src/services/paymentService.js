import api from './api';

/**
 * Payment Service
 * Handles payment processing and transactions
 */

class PaymentService {

  // ============= PAYMENT PROCESSING =============

  /**
   * Create payment intent
   */
  async createPaymentIntent(bookingId, amount) {
    try {
      const response = await api.post('/payments/intent', {
        bookingId,
        amount
      });
      return response.data;
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw error;
    }
  }

  /**
   * Process payment
   */
  async processPayment(paymentData) {
    try {
      const response = await api.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentId) {
    try {
      const response = await api.post(`/payments/${paymentId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw error;
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId, reason) {
    try {
      const response = await api.post(`/payments/${paymentId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Cancel payment error:', error);
      throw error;
    }
  }

  // ============= PAYMENT HISTORY =============

  /**
   * Get payment by ID
   */
  async getPayment(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Get payment error:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(filters = {}) {
    try {
      const response = await api.get('/payments/history', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  /**
   * Get payment for booking
   */
  async getBookingPayment(bookingId) {
    try {
      const response = await api.get(`/payments/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get booking payment error:', error);
      throw error;
    }
  }

  // ============= EARNINGS (WORKER) =============

  /**
   * Get earnings summary
   */
  async getEarnings(period = 'month') {
    try {
      const response = await api.get('/payments/earnings', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get earnings error:', error);
      throw error;
    }
  }

  /**
   * Get earnings breakdown
   */
  async getEarningsBreakdown(startDate, endDate) {
    try {
      const response = await api.get('/payments/earnings/breakdown', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Get earnings breakdown error:', error);
      throw error;
    }
  }

  /**
   * Request payout
   */
  async requestPayout(amount, paymentMethod) {
    try {
      const response = await api.post('/payments/payout', {
        amount,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Request payout error:', error);
      throw error;
    }
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(page = 1, limit = 20) {
    try {
      const response = await api.get('/payments/payouts', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get payout history error:', error);
      throw error;
    }
  }

  // ============= PAYMENT METHODS =============

  /**
   * Add payment method
   */
  async addPaymentMethod(paymentMethodData) {
    try {
      const response = await api.post('/payments/methods', paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Add payment method error:', error);
      throw error;
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId) {
    try {
      const response = await api.delete(`/payments/methods/${methodId}`);
      return response.data;
    } catch (error) {
      console.error('Delete payment method error:', error);
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId) {
    try {
      const response = await api.put(`/payments/methods/${methodId}/default`);
      return response.data;
    } catch (error) {
      console.error('Set default payment method error:', error);
      throw error;
    }
  }

  // ============= REFUNDS =============

  /**
   * Request refund
   */
  async requestRefund(paymentId, amount, reason) {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Request refund error:', error);
      throw error;
    }
  }

  /**
   * Get refund status
   */
  async getRefundStatus(refundId) {
    try {
      const response = await api.get(`/payments/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      console.error('Get refund status error:', error);
      throw error;
    }
  }

  // ============= STATISTICS =============

  /**
   * Get payment statistics
   */
  async getStatistics(period = 'month') {
    try {
      const response = await api.get('/payments/statistics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get payment statistics error:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(filters = {}) {
    try {
      const response = await api.get('/payments/transactions', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const paymentService = new PaymentService();
export { paymentService };
export default paymentService;
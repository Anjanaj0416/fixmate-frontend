import api from './api';

/**
 * Notification Service
 * Handles notification management and preferences
 */

class NotificationService {

  // ============= GET NOTIFICATIONS =============

  /**
   * Get all notifications for current user
   */
  async getNotifications(page = 1, limit = 20, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async getNotification(notificationId) {
    try {
      const response = await api.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Get notification error:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(limit = 20) {
    try {
      const params = { limit, read: false };
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Get unread notifications error:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  // ============= MARK AS READ =============

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds) {
    try {
      const response = await api.put('/notifications/read-multiple', {
        notificationIds
      });
      return response.data;
    } catch (error) {
      console.error('Mark multiple as read error:', error);
      throw error;
    }
  }

  // ============= DELETE NOTIFICATIONS =============

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications() {
    try {
      const response = await api.delete('/notifications/all');
      return response.data;
    } catch (error) {
      console.error('Delete all notifications error:', error);
      throw error;
    }
  }

  /**
   * Delete read notifications
   */
  async deleteReadNotifications() {
    try {
      const response = await api.delete('/notifications/read');
      return response.data;
    } catch (error) {
      console.error('Delete read notifications error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultipleNotifications(notificationIds) {
    try {
      const response = await api.delete('/notifications/multiple', {
        data: { notificationIds }
      });
      return response.data;
    } catch (error) {
      console.error('Delete multiple notifications error:', error);
      throw error;
    }
  }

  // ============= NOTIFICATION PREFERENCES =============

  /**
   * Get notification preferences
   */
  async getPreferences() {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Get notification preferences error:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }

  /**
   * Enable notification type
   */
  async enableNotificationType(type) {
    try {
      const response = await api.put('/notifications/preferences/enable', { type });
      return response.data;
    } catch (error) {
      console.error('Enable notification type error:', error);
      throw error;
    }
  }

  /**
   * Disable notification type
   */
  async disableNotificationType(type) {
    try {
      const response = await api.put('/notifications/preferences/disable', { type });
      return response.data;
    } catch (error) {
      console.error('Disable notification type error:', error);
      throw error;
    }
  }

  // ============= PUSH NOTIFICATIONS =============

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription) {
    try {
      const response = await api.post('/notifications/push/subscribe', subscription);
      return response.data;
    } catch (error) {
      console.error('Subscribe to push error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush() {
    try {
      const response = await api.delete('/notifications/push/unsubscribe');
      return response.data;
    } catch (error) {
      console.error('Unsubscribe from push error:', error);
      throw error;
    }
  }

  /**
   * Test push notification
   */
  async testPushNotification() {
    try {
      const response = await api.post('/notifications/push/test');
      return response.data;
    } catch (error) {
      console.error('Test push notification error:', error);
      throw error;
    }
  }

  // ============= NOTIFICATION CHANNELS =============

  /**
   * Get notification channels
   */
  async getChannels() {
    try {
      const response = await api.get('/notifications/channels');
      return response.data;
    } catch (error) {
      console.error('Get notification channels error:', error);
      throw error;
    }
  }

  /**
   * Update channel settings
   */
  async updateChannelSettings(channel, settings) {
    try {
      const response = await api.put(`/notifications/channels/${channel}`, settings);
      return response.data;
    } catch (error) {
      console.error('Update channel settings error:', error);
      throw error;
    }
  }

  // ============= NOTIFICATION FILTERS =============

  /**
   * Get notifications by type
   */
  async getByType(type, page = 1, limit = 20) {
    try {
      const params = { type, page, limit };
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Get notifications by type error:', error);
      throw error;
    }
  }

  /**
   * Get notifications by category
   */
  async getByCategory(category, page = 1, limit = 20) {
    try {
      const params = { category, page, limit };
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Get notifications by category error:', error);
      throw error;
    }
  }

  // ============= NOTIFICATION STATISTICS =============

  /**
   * Get notification statistics
   */
  async getStatistics() {
    try {
      const response = await api.get('/notifications/statistics');
      return response.data;
    } catch (error) {
      console.error('Get notification statistics error:', error);
      throw error;
    }
  }

  // ============= HELPER METHODS =============

  /**
   * Group notifications by date
   */
  groupByDate(notifications) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    notifications.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notifDate >= lastWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }

  /**
   * Format notification time
   */
  formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  /**
   * Get notification icon
   */
  getNotificationIcon(type) {
    const iconMap = {
      booking_created: '📅',
      booking_accepted: '✅',
      booking_rejected: '❌',
      booking_cancelled: '🚫',
      booking_completed: '✔️',
      booking_started: '🔨',
      payment_received: '💰',
      payment_pending: '⏳',
      review_received: '⭐',
      message_received: '💬',
      quote_received: '📋',
      quote_accepted: '✅',
      worker_nearby: '📍',
      verification_approved: '✓',
      verification_rejected: '✗',
      profile_updated: '👤',
      reminder: '🔔',
      promotion: '🎉',
      system: 'ℹ️'
    };

    return iconMap[type] || '🔔';
  }

  /**
   * Get notification priority
   */
  getPriority(notification) {
    const highPriorityTypes = [
      'booking_cancelled',
      'booking_rejected',
      'payment_pending',
      'verification_rejected'
    ];

    if (highPriorityTypes.includes(notification.type)) {
      return 'high';
    }

    if (!notification.read) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get notification color
   */
  getNotificationColor(type) {
    const colorMap = {
      booking_created: 'blue',
      booking_accepted: 'green',
      booking_rejected: 'red',
      booking_cancelled: 'orange',
      booking_completed: 'green',
      booking_started: 'blue',
      payment_received: 'green',
      payment_pending: 'yellow',
      review_received: 'purple',
      message_received: 'blue',
      quote_received: 'indigo',
      quote_accepted: 'green',
      worker_nearby: 'teal',
      verification_approved: 'green',
      verification_rejected: 'red',
      profile_updated: 'gray',
      reminder: 'yellow',
      promotion: 'pink',
      system: 'gray'
    };

    return colorMap[type] || 'gray';
  }

  /**
   * Filter notifications
   */
  filterNotifications(notifications, filters) {
    let filtered = [...notifications];

    if (filters.read !== undefined) {
      filtered = filtered.filter(n => n.read === filters.read);
    }

    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(n => new Date(n.createdAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(n => new Date(n.createdAt) <= endDate);
    }

    return filtered;
  }

  /**
   * Sort notifications
   */
  sortNotifications(notifications, sortBy = 'recent') {
    const sorted = [...notifications];

    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'unread':
        return sorted.sort((a, b) => {
          if (a.read === b.read) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return a.read ? 1 : -1;
        });
      case 'priority':
        return sorted.sort((a, b) => {
          const priorityA = this.getPriority(a);
          const priorityB = this.getPriority(b);
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[priorityA] - priorityOrder[priorityB];
        });
      default:
        return sorted;
    }
  }

  /**
   * Get action URL for notification
   */
  getActionUrl(notification) {
    const urlMap = {
      booking_created: `/bookings/${notification.data?.bookingId}`,
      booking_accepted: `/bookings/${notification.data?.bookingId}`,
      booking_rejected: `/bookings/${notification.data?.bookingId}`,
      booking_cancelled: `/bookings/${notification.data?.bookingId}`,
      booking_completed: `/bookings/${notification.data?.bookingId}`,
      booking_started: `/bookings/${notification.data?.bookingId}`,
      payment_received: `/bookings/${notification.data?.bookingId}`,
      payment_pending: `/bookings/${notification.data?.bookingId}`,
      review_received: `/reviews/${notification.data?.reviewId}`,
      message_received: `/chat/${notification.data?.conversationId}`,
      quote_received: `/bookings/${notification.data?.bookingId}`,
      quote_accepted: `/bookings/${notification.data?.bookingId}`,
      worker_nearby: `/workers/${notification.data?.workerId}`,
      verification_approved: '/profile',
      verification_rejected: '/profile',
      profile_updated: '/profile'
    };

    return urlMap[notification.type] || '/';
  }

  /**
   * Check if notification is important
   */
  isImportant(notification) {
    const importantTypes = [
      'booking_cancelled',
      'booking_rejected',
      'payment_pending',
      'verification_rejected',
      'booking_accepted',
      'booking_completed'
    ];

    return importantTypes.includes(notification.type);
  }
}

// Export singleton instance
export default new NotificationService();
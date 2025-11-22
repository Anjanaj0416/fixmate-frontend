import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../config/firebase';
import api from './api';

/**
 * Firebase Cloud Messaging Service
 * Handles push notifications
 */

class FCMService {
  constructor() {
    this.messaging = null;
    this.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    this.currentToken = null;
    this.notificationHandlers = [];
  }

  /**
   * Initialize FCM
   */
  async initialize() {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
      }

      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker is not supported');
        return false;
      }

      // Initialize messaging
      this.messaging = getMessaging(app);

      // Setup message listener
      this.setupMessageListener();

      return true;
    } catch (error) {
      console.error('FCM initialization error:', error);
      return false;
    }
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermission() {
    try {
      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Get FCM token
        const token = await this.getToken();
        return { 
          granted: true, 
          token 
        };
      } else if (permission === 'denied') {
        console.log('Notification permission denied');
        return { 
          granted: false, 
          message: 'Notification permission denied' 
        };
      } else {
        console.log('Notification permission dismissed');
        return { 
          granted: false, 
          message: 'Notification permission dismissed' 
        };
      }
    } catch (error) {
      console.error('Permission request error:', error);
      throw error;
    }
  }

  /**
   * Get FCM token
   */
  async getToken() {
    try {
      if (!this.messaging) {
        await this.initialize();
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Get token
      const currentToken = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        console.log('FCM Token obtained:', currentToken);
        this.currentToken = currentToken;
        
        // Save token to backend
        await this.saveTokenToBackend(currentToken);
        
        return currentToken;
      } else {
        console.log('No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      throw error;
    }
  }

  /**
   * Save FCM token to backend
   */
  async saveTokenToBackend(token) {
    try {
      await api.post('/notifications/fcm-token', {
        fcmToken: token,
        platform: 'web'
      });
      console.log('FCM token saved to backend');
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  }

  /**
   * Delete FCM token from backend
   */
  async deleteTokenFromBackend() {
    try {
      await api.delete('/notifications/fcm-token');
      console.log('FCM token deleted from backend');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      throw error;
    }
  }

  /**
   * Setup listener for foreground messages
   */
  setupMessageListener() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Extract notification data
      const { notification, data } = payload;
      
      // Create notification object
      const notificationData = {
        title: notification?.title || 'New Notification',
        body: notification?.body || '',
        icon: notification?.icon || '/logo.png',
        badge: notification?.badge || '/badge.png',
        image: notification?.image,
        data: data || {},
        timestamp: new Date().toISOString()
      };

      // Show browser notification
      this.showNotification(notificationData);

      // Call registered handlers
      this.notificationHandlers.forEach(handler => {
        try {
          handler(notificationData);
        } catch (error) {
          console.error('Error in notification handler:', error);
        }
      });
    });
  }

  /**
   * Show browser notification
   */
  async showNotification(notificationData) {
    try {
      if (Notification.permission !== 'granted') {
        return;
      }

      // Check if page is visible
      if (document.visibilityState === 'visible') {
        // Page is visible, might want to show in-app notification instead
        console.log('Page is visible, notification shown in-app');
      }

      // Create notification
      const notification = new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        image: notificationData.image,
        tag: notificationData.data?.tag || 'default',
        requireInteraction: notificationData.data?.requireInteraction || false,
        data: notificationData.data
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Handle navigation based on notification type
        const { type, url, bookingId, chatId } = notificationData.data;
        
        if (url) {
          window.location.href = url;
        } else if (type === 'booking' && bookingId) {
          window.location.href = `/bookings/${bookingId}`;
        } else if (type === 'chat' && chatId) {
          window.location.href = `/chat/${chatId}`;
        }
        
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Register notification handler
   */
  onNotification(handler) {
    if (typeof handler === 'function') {
      this.notificationHandlers.push(handler);
      
      // Return unsubscribe function
      return () => {
        const index = this.notificationHandlers.indexOf(handler);
        if (index > -1) {
          this.notificationHandlers.splice(index, 1);
        }
      };
    }
  }

  /**
   * Clear all notification handlers
   */
  clearHandlers() {
    this.notificationHandlers = [];
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled() {
    return this.getPermissionStatus() === 'granted';
  }

  /**
   * Get current token
   */
  getCurrentToken() {
    return this.currentToken;
  }

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      // Delete old token
      if (this.currentToken) {
        await this.deleteTokenFromBackend();
      }
      
      // Get new token
      const newToken = await this.getToken();
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Test notification
   */
  async sendTestNotification() {
    try {
      const response = await api.post('/notifications/test', {
        title: 'Test Notification',
        body: 'This is a test notification from FixMate',
        type: 'test'
      });
      return response;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FCMService();
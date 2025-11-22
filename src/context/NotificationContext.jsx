import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { onMessageListener } from '../config/firebase';
import { AuthContext } from './AuthContext';
import { NOTIFICATION_TYPES } from '../utils/constants';

// Create Context
export const NotificationContext = createContext();

/**
 * Notification Provider Component
 * Manages notifications, push notifications, and real-time updates
 */
export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  /**
   * Load notifications when authenticated
   */
  useEffect(() => {
    if (isAuthenticated()) {
      loadNotifications();
      loadUnreadCount();
      loadSettings();
      setupRealtimeNotifications();
    } else {
      // Clear state when logged out
      setNotifications([]);
      setUnreadCount(0);
      setSettings(null);
    }
  }, [user, isAuthenticated]);

  /**
   * Setup real-time notification listener
   */
  const setupRealtimeNotifications = () => {
    // Listen for foreground messages from Firebase
    const unsubscribe = onMessageListener((payload) => {
      console.log('Received foreground message:', payload);
      
      // Show toast notification
      showToast({
        type: 'info',
        title: payload.notification?.title || 'New Notification',
        message: payload.notification?.body || '',
        duration: 5000,
      });

      // Add to notifications list
      const newNotification = {
        id: Date.now().toString(),
        title: payload.notification?.title,
        message: payload.notification?.body,
        type: payload.data?.type || NOTIFICATION_TYPES.SYSTEM,
        read: false,
        createdAt: new Date().toISOString(),
        data: payload.data,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Play notification sound
      playNotificationSound();
    });

    return unsubscribe;
  };

  /**
   * Load notifications
   */
  const loadNotifications = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(page, limit);

      if (response.success) {
        if (page === 1) {
          setNotifications(response.notifications);
        } else {
          setNotifications((prev) => [...prev, ...response.notifications]);
        }
        return { success: true, notifications: response.notifications };
      }
      return { success: false };
    } catch (error) {
      console.error('Error loading notifications:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load unread count
   */
  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();

      if (response.success) {
        setUnreadCount(response.count);
        return { success: true, count: response.count };
      }
      return { success: false };
    } catch (error) {
      console.error('Error loading unread count:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Load notification settings
   */
  const loadSettings = async () => {
    try {
      const response = await notificationService.getSettings();

      if (response.success) {
        setSettings(response.settings);
        return { success: true, settings: response.settings };
      }
      return { success: false };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error marking as read:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();

      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error marking all as read:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);

      if (response.success) {
        const notification = notifications.find((n) => n.id === notificationId);
        
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
        
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Clear all notifications
   */
  const clearAll = async () => {
    try {
      const response = await notificationService.clearAll();

      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Update notification settings
   */
  const updateSettings = async (newSettings) => {
    try {
      const response = await notificationService.updateSettings(newSettings);

      if (response.success) {
        setSettings(newSettings);
        showToast({
          type: 'success',
          title: 'Settings Updated',
          message: 'Notification settings have been updated successfully',
        });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update notification settings',
      });
      return { success: false, message: error.message };
    }
  };

  /**
   * Show toast notification
   */
  const showToast = useCallback((toastData) => {
    setToast(toastData);

    // Auto-hide after duration
    const duration = toastData.duration || 3000;
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  /**
   * Hide toast notification
   */
  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  /**
   * Show success toast
   */
  const showSuccess = useCallback((title, message = '', duration = 3000) => {
    showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  /**
   * Show error toast
   */
  const showError = useCallback((title, message = '', duration = 3000) => {
    showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  /**
   * Show info toast
   */
  const showInfo = useCallback((title, message = '', duration = 3000) => {
    showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  /**
   * Show warning toast
   */
  const showWarning = useCallback((title, message = '', duration = 3000) => {
    showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  /**
   * Play notification sound
   */
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  /**
   * Request browser notification permission
   */
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  /**
   * Check if browser notifications are supported
   */
  const isSupported = () => {
    return 'Notification' in window;
  };

  /**
   * Check if browser notifications are enabled
   */
  const isEnabled = () => {
    return isSupported() && Notification.permission === 'granted';
  };

  /**
   * Refresh notifications
   */
  const refresh = async () => {
    await Promise.all([
      loadNotifications(),
      loadUnreadCount(),
    ]);
  };

  const value = {
    notifications,
    unreadCount,
    settings,
    loading,
    toast,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    requestPermission,
    isSupported,
    isEnabled,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
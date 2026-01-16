import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import ToastNotification from '../components/common/ToastNotification';
import notificationService from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export const NotificationToastContext = createContext();

/**
 * Notification Toast Provider
 * Manages displaying toast notifications from database
 * Polls for new notifications and displays them as toasts
 */
export function NotificationToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [lastCheckedId, setLastCheckedId] = useState(null);
  const { user } = useAuth();

  /**
   * Add a new toast notification
   */
  const addToast = useCallback((notification) => {
    const toastId = notification._id || Date.now().toString();
    
    setToasts(prev => {
      // Prevent duplicate toasts
      if (prev.find(t => t._id === toastId)) {
        return prev;
      }
      
      // Limit to 5 toasts maximum
      const newToasts = [...prev, { ...notification, _id: toastId }];
      return newToasts.slice(-5);
    });

    // Mark notification as read after showing
    if (notification._id && !notification.isRead) {
      setTimeout(() => {
        notificationService.markAsRead(notification._id).catch(console.error);
      }, 1000);
    }
  }, []);

  /**
   * Remove a toast notification
   */
  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t._id !== toastId));
  }, []);

  /**
   * Show a manual toast (for app-generated notifications)
   */
  const showToast = useCallback((title, message, type = 'info', duration = 5000) => {
    const notification = {
      _id: Date.now().toString(),
      title,
      message,
      type,
      duration,
      createdAt: new Date().toISOString()
    };
    addToast(notification);
  }, [addToast]);

  /**
   * Fetch and display new unread notifications
   */
  const checkForNewNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.getUnreadNotifications(10);
      
      if (response.success) {
        const notifications = response.data || response.notifications || [];
        
        // Filter out notifications we've already shown
        const newNotifications = notifications.filter(notif => {
          if (!lastCheckedId) return true;
          return notif._id > lastCheckedId;
        });

        // Display new notifications as toasts
        if (newNotifications.length > 0) {
          // Sort by priority and show high priority first
          const sorted = newNotifications.sort((a, b) => {
            const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;
            return aPriority - bPriority;
          });

          // Show toasts with delay between each
          sorted.forEach((notif, index) => {
            setTimeout(() => {
              addToast(notif);
            }, index * 500); // 500ms delay between each toast
          });

          // Update last checked ID
          setLastCheckedId(notifications[0]._id);
        }
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }, [user, lastCheckedId, addToast]);

  /**
   * Poll for new notifications every 30 seconds when user is active
   */
  useEffect(() => {
    if (!user) return;

    // Initial check
    checkForNewNotifications();

    // Set up polling interval
    const interval = setInterval(() => {
      // Only poll if tab is visible
      if (document.visibilityState === 'visible') {
        checkForNewNotifications();
      }
    }, 30000); // Poll every 30 seconds

    // Check immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForNewNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, checkForNewNotifications]);

  const value = {
    toasts,
    addToast,
    removeToast,
    showToast,
    checkForNewNotifications
  };

  return (
    <NotificationToastContext.Provider value={value}>
      {children}
      
      {/* Render toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <ToastNotification
            key={toast._id}
            notification={toast}
            onDismiss={() => removeToast(toast._id)}
            position="top-right"
            style={{ 
              transform: `translateY(${index * 8}px)`,
              zIndex: 50 - index 
            }}
          />
        ))}
      </div>
    </NotificationToastContext.Provider>
  );
}

/**
 * Hook to use notification toast context
 */
export const useNotificationToast = () => {
  const context = useContext(NotificationToastContext);
  
  if (!context) {
    throw new Error('useNotificationToast must be used within NotificationToastProvider');
  }
  
  return context;
};

export default NotificationToastProvider;
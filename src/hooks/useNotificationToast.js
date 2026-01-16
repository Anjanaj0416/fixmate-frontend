import { useContext } from 'react';
import { NotificationToastContext } from '../context/NotificationToastContext';

/**
 * Custom hook to use Notification Toast Context
 * Provides easy access to toast notification methods
 * 
 * @returns {Object} Notification toast context value
 * @throws {Error} If used outside NotificationToastProvider
 * 
 * @example
 * const { showToast, checkForNewNotifications } = useNotificationToast();
 * 
 * // Show a success toast
 * showToast('Success', 'Profile updated successfully', 'success');
 * 
 * // Manually check for new notifications
 * checkForNewNotifications();
 */
const useNotificationToast = () => {
  const context = useContext(NotificationToastContext);

  if (!context) {
    throw new Error('useNotificationToast must be used within a NotificationToastProvider');
  }

  return context;
};

export default useNotificationToast;
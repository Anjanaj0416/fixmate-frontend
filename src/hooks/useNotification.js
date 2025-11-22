import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Custom hook to use Notification Context
 * Provides easy access to notifications and toast methods
 * 
 * @returns {Object} Notification context value
 * @throws {Error} If used outside NotificationProvider
 */
const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return context;
};

export default useNotification;
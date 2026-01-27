import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useNotificationToast } from '../../context/NotificationToastContext';

/**
 * Notification Bell Component
 * ✅ FIXED: Uses apiService with automatic token refresh
 * ✅ FIXED: Handles 401 errors properly
 * Displays notification icon with unread count badge
 * Shows dropdown with recent notifications
 * Integrates with toast notification system
 */
const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  
  const { checkForNewNotifications } = useNotificationToast();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch recent notifications
  const fetchNotifications = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log('🔔 Fetching notifications...');
      
      // Use apiService with automatic token refresh
      const response = await apiService.get('/notifications', {
        params: { 
          page: 1,
          limit: 5,
          isRead: false  // Only get unread notifications
        }
      });
      
      console.log('✅ Notifications response:', response);
      
      if (response.success) {
        // Handle different response structures
        const notifs = response.data?.notifications || response.data || [];
        console.log('📬 Found notifications:', notifs.length);
        setRecentNotifications(notifs);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      console.log('📊 Fetching unread count...');
      
      // Use apiService with automatic token refresh
      const response = await apiService.get('/notifications/unread-count');
      
      console.log('✅ Unread count response:', response);
      
      if (response.success) {
        const count = response.data?.unreadCount || 0;
        console.log('📊 Unread count:', count);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      // Don't show error to user, just log it
    }
  };

  // Manually trigger notification check
  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Check for new notifications when opening dropdown
      console.log('🔔 Bell clicked, fetching fresh notifications...');
      checkForNewNotifications();
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      console.log('📍 Notification clicked:', notification._id);
      
      // Mark as read
      if (!notification.isRead) {
        await apiService.put(`/notifications/${notification._id}/read`);
        console.log('✅ Marked as read:', notification._id);
        
        // Update local state
        setRecentNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Close dropdown
      setIsOpen(false);

      // Navigate to relevant page based on notification type
      if (notification.relatedBooking) {
        console.log('📍 Navigating to booking:', notification.relatedBooking);
        navigate(`/customer/bookings/${notification.relatedBooking}`);
      } else if (notification.relatedReview) {
        console.log('📍 Navigating to reviews');
        navigate(`/reviews`);
      } else if (notification.type && notification.type.includes('message')) {
        console.log('📍 Navigating to messages');
        navigate(`/customer/messages`);
      }
    } catch (error) {
      console.error('❌ Error handling notification click:', error);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
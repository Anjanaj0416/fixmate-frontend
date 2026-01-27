import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useNotificationToast } from '../../context/NotificationToastContext';

/**
 * Enhanced Notification Bell Component
 * ✅ Shows BOTH read and unread notifications in dropdown
 * ✅ Visual distinction between read (dimmed) and unread (highlighted)
 * ✅ "See All Notifications" button always visible
 * ✅ Uses apiService with automatic token refresh
 * ✅ Handles 401 errors properly
 * ✅ Notifications persist after being marked as read
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

  // Fetch recent notifications (BOTH read and unread)
  const fetchNotifications = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log('🔔 Fetching notifications...');
      
      // ✅ CHANGE: Get last 10 notifications (both read and unread)
      const response = await apiService.get('/notifications', {
        params: { 
          page: 1,
          limit: 10  // Get last 10 notifications regardless of read status
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
      
      // Mark as read (only if not already read)
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
        
        // Get user role to determine correct route
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const role = user.role || 'customer';
        
        navigate(`/${role}/bookings/${notification.relatedBooking}`);
      } else if (notification.relatedReview) {
        console.log('📍 Navigating to reviews');
        navigate(`/reviews`);
      } else if (notification.type && notification.type.includes('message')) {
        console.log('📍 Navigating to messages');
        
        // Get user role to determine correct route
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const role = user.role || 'customer';
        
        navigate(`/${role}/messages`);
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
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see updates here when you have new activity
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notification.isRead 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread Indicator */}
                      <div className="flex-shrink-0 mt-1.5">
                        {!notification.isRead ? (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <p className={`text-sm line-clamp-1 ${
                          !notification.isRead 
                            ? 'font-semibold text-gray-900' 
                            : 'font-medium text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        
                        {/* Message */}
                        <p className={`text-sm line-clamp-2 mt-0.5 ${
                          !notification.isRead 
                            ? 'text-gray-700' 
                            : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Time */}
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

          {/* Footer - Always visible "See All" button */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-2 rounded-lg hover:bg-indigo-50"
            >
              View All Notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
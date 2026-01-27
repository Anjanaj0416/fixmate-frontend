import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Calendar,
  MessageSquare,
  Star,
  DollarSign,
  Briefcase,
  X,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import apiService from '../services/apiService';
import { useNotificationToast } from '../context/NotificationToastContext';

/**
 * Notifications Page Component
 * ✅ FIXED: Uses apiService with automatic token refresh (same as NotificationBell)
 * ✅ FIXED: Handles 401 errors properly
 * ✅ FIXED: Removed duplicate filter section
 * Displays all user notifications with filtering and management options
 */
const Notifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedType, setSelectedType] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useNotificationToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching all notifications...');
      
      // ✅ FIX: Use apiService instead of notificationService
      const response = await apiService.get('/notifications', {
        params: { 
          page: 1,
          limit: 100  // Get all notifications
        }
      });
      
      console.log('✅ Notifications response:', response);
      
      if (response.success) {
        // Handle different response structures
        const notifs = response.data?.notifications || response.data || [];
        console.log('📬 Found notifications:', notifs.length);
        setNotifications(notifs);
        
        const unread = notifs.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        console.log('📊 Unread count:', unread);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      showToast('Error', 'Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log('📍 Marking notification as read:', notificationId);
      
      // ✅ FIX: Use apiService instead of notificationService
      await apiService.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('❌ Error marking as read:', error);
      showToast('Error', 'Failed to mark as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('📍 Marking all notifications as read...');
      
      // ✅ FIX: Use apiService instead of notificationService
      await apiService.put('/notifications/read-all');
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      setUnreadCount(0);
      showToast('Success', 'All notifications marked as read', 'success', 2000);
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      showToast('Error', 'Failed to mark all as read', 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      
      // ✅ FIX: Use apiService instead of notificationService
      await apiService.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId)
      );
      
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      showToast('Success', 'Notification deleted', 'success', 2000);
      console.log('✅ Notification deleted');
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      showToast('Error', 'Failed to delete notification', 'error');
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) return;
    
    try {
      console.log('🗑️ Clearing all notifications...');
      
      // ✅ FIX: Delete each notification individually
      const deletePromises = notifications.map(n => 
        apiService.delete(`/notifications/${n._id}`).catch(err => {
          console.error(`Failed to delete notification ${n._id}:`, err);
          return null;
        })
      );
      
      await Promise.all(deletePromises);
      
      setNotifications([]);
      setUnreadCount(0);
      showToast('Success', 'All notifications cleared', 'success', 2000);
      console.log('✅ All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      showToast('Error', 'Failed to clear notifications', 'error');
    }
  };

  // Filter notifications based on selected filters
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type && n.type.includes(selectedType));
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, selectedType]);

  const getNotificationIcon = (type) => {
    if (!type) return <Bell className="w-5 h-5 text-gray-500" />;
    
    if (type.includes('booking')) return <Calendar className="w-5 h-5 text-blue-500" />;
    if (type.includes('message') || type.includes('quote')) return <MessageSquare className="w-5 h-5 text-green-500" />;
    if (type.includes('review')) return <Star className="w-5 h-5 text-yellow-500" />;
    if (type.includes('payment')) return <DollarSign className="w-5 h-5 text-green-500" />;
    if (type.includes('job') || type.includes('work')) return <Briefcase className="w-5 h-5 text-indigo-500" />;
    
    return <Bell className="w-5 h-5 text-gray-500" />;
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

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
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-indigo-600" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Actions - Using plain div with card styling instead of Card component */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === 'read'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Read
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Type:</span>
            <div className="flex gap-2 flex-wrap">
              {['all', 'booking', 'message', 'quote', 'review', 'payment'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : "You haven't received any notifications yet"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg cursor-pointer ${
                  !notification.isRead ? 'border-l-4 border-l-indigo-600 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <span className="inline-block w-2 h-2 rounded-full bg-indigo-600"></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex items-start gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Bell,
  Calendar,
  MessageSquare,
  Star,
  DollarSign,
  Briefcase
} from 'lucide-react';

/**
 * Toast Notification Component
 * Displays toast notifications from database with auto-dismiss
 * Supports different notification types with appropriate icons and colors
 */
const ToastNotification = ({ notification, onDismiss, position = 'top-right' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!notification) return;

    // Auto dismiss after duration
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, notification.duration || 5000);

    return () => clearTimeout(dismissTimer);
  }, [notification]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  if (!notification || !isVisible) return null;

  // Get icon based on notification type
  const getIcon = () => {
    const type = notification.type || '';
    
    if (type.includes('booking')) {
      return <Calendar className="w-5 h-5" />;
    } else if (type.includes('message') || type.includes('quote')) {
      return <MessageSquare className="w-5 h-5" />;
    } else if (type.includes('review')) {
      return <Star className="w-5 h-5" />;
    } else if (type.includes('payment')) {
      return <DollarSign className="w-5 h-5" />;
    } else if (type.includes('profile') || type.includes('verification')) {
      return <Briefcase className="w-5 h-5" />;
    } else if (type.includes('error') || type.includes('rejected') || type.includes('declined') || type.includes('cancelled')) {
      return <XCircle className="w-5 h-5" />;
    } else if (type.includes('success') || type.includes('completed') || type.includes('accepted') || type.includes('approved')) {
      return <CheckCircle className="w-5 h-5" />;
    } else if (type.includes('warning') || type.includes('reminder') || type.includes('pending')) {
      return <AlertCircle className="w-5 h-5" />;
    } else {
      return <Bell className="w-5 h-5" />;
    }
  };

  // Get color scheme based on notification type and priority
  const getColorScheme = () => {
    const type = notification.type || '';
    const priority = notification.priority || 'normal';

    // High priority notifications
    if (priority === 'high' || priority === 'urgent') {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-500',
        title: 'text-red-900',
        message: 'text-red-700'
      };
    }

    // Success notifications
    if (type.includes('completed') || type.includes('accepted') || type.includes('approved') || type.includes('received')) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-500',
        title: 'text-green-900',
        message: 'text-green-700'
      };
    }

    // Error/Rejected notifications
    if (type.includes('rejected') || type.includes('declined') || type.includes('cancelled') || type.includes('failed')) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-500',
        title: 'text-red-900',
        message: 'text-red-700'
      };
    }

    // Warning notifications
    if (type.includes('pending') || type.includes('reminder')) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
        title: 'text-yellow-900',
        message: 'text-yellow-700'
      };
    }

    // Info/Default notifications
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-900',
      message: 'text-blue-700'
    };
  };

  // Get position classes
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
  };

  // Get animation classes
  const getAnimationClasses = () => {
    if (isExiting) {
      return 'animate-slide-out-right opacity-0';
    }
    return 'animate-slide-in-right';
  };

  const colors = getColorScheme();

  return (
    <div 
      className={`fixed ${getPositionClasses()} z-50 ${getAnimationClasses()}`}
      style={{ 
        maxWidth: '400px',
        minWidth: '320px'
      }}
    >
      <div
        className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg p-4 backdrop-blur-sm`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${colors.icon} mt-0.5`}>
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            {notification.title && (
              <p className={`text-sm font-semibold ${colors.title} mb-1`}>
                {notification.title}
              </p>
            )}
            
            {/* Message */}
            {notification.message && (
              <p className={`text-sm ${colors.message}`}>
                {notification.message}
              </p>
            )}

            {/* Timestamp */}
            {notification.createdAt && (
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(notification.createdAt)}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  } catch (error) {
    return '';
  }
};

export default ToastNotification;
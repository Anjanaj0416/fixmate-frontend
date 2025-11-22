import React from 'react';
import PropTypes from 'prop-types';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Package,
  TruckIcon,
  Home
} from 'lucide-react';

const BookingStatus = ({ booking, detailed = false }) => {
  const statusFlow = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle },
    { key: 'in_progress', label: 'In Progress', icon: Briefcase },
    { key: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  const getStatusIndex = (status) => {
    const index = statusFlow.findIndex(s => s.key === status);
    return index !== -1 ? index : -1;
  };

  const currentStatusIndex = getStatusIndex(booking.status);

  const getStatusColor = (status) => {
    const colors = {
      pending: {
        bg: 'bg-yellow-500',
        text: 'text-yellow-600',
        lightBg: 'bg-yellow-50',
        border: 'border-yellow-300'
      },
      accepted: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        lightBg: 'bg-blue-50',
        border: 'border-blue-300'
      },
      in_progress: {
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        lightBg: 'bg-purple-50',
        border: 'border-purple-300'
      },
      completed: {
        bg: 'bg-green-500',
        text: 'text-green-600',
        lightBg: 'bg-green-50',
        border: 'border-green-300'
      },
      cancelled: {
        bg: 'bg-red-500',
        text: 'text-red-600',
        lightBg: 'bg-red-50',
        border: 'border-red-300'
      },
      declined: {
        bg: 'bg-gray-500',
        text: 'text-gray-600',
        lightBg: 'bg-gray-50',
        border: 'border-gray-300'
      }
    };
    return colors[status] || colors.pending;
  };

  const statusColor = getStatusColor(booking.status);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusMessage = (status) => {
    const messages = {
      pending: 'Your booking is awaiting worker acceptance',
      accepted: 'Worker has accepted your booking',
      in_progress: 'Work is currently in progress',
      completed: 'Booking has been completed',
      cancelled: 'Booking was cancelled',
      declined: 'Booking was declined by worker'
    };
    return messages[status] || 'Status unknown';
  };

  // Compact version for cards
  if (!detailed) {
    return (
      <div className={`${statusColor.lightBg} border ${statusColor.border} rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${statusColor.bg} p-2 rounded-full`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${statusColor.text} capitalize`}>
                {booking.status.replace('_', ' ')}
              </p>
              <p className="text-xs text-gray-600">{getStatusMessage(booking.status)}</p>
            </div>
          </div>
          {booking.updatedAt && (
            <span className="text-xs text-gray-500">{formatDateTime(booking.updatedAt)}</span>
          )}
        </div>
      </div>
    );
  }

  // Detailed version with timeline
  if (booking.status === 'cancelled' || booking.status === 'declined') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className={`${statusColor.lightBg} border ${statusColor.border} rounded-lg p-6 text-center`}>
          <div className={`${statusColor.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${statusColor.text} mb-2 capitalize`}>
            Booking {booking.status}
          </h3>
          <p className="text-gray-600 mb-4">{getStatusMessage(booking.status)}</p>
          {booking.cancellationReason && (
            <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
              <p className="text-sm text-gray-600">{booking.cancellationReason}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Current Status Header */}
      <div className={`${statusColor.lightBg} border ${statusColor.border} rounded-lg p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Status</p>
            <h3 className={`text-2xl font-bold ${statusColor.text} capitalize`}>
              {booking.status.replace('_', ' ')}
            </h3>
          </div>
          <div className={`${statusColor.bg} p-4 rounded-full`}>
            {booking.status === 'pending' && <Clock className="w-8 h-8 text-white" />}
            {booking.status === 'accepted' && <CheckCircle className="w-8 h-8 text-white" />}
            {booking.status === 'in_progress' && <Briefcase className="w-8 h-8 text-white" />}
            {booking.status === 'completed' && <CheckCircle className="w-8 h-8 text-white" />}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">{getStatusMessage(booking.status)}</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {statusFlow.map((status, index) => {
          const isPast = index < currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const StatusIcon = status.icon;
          const isComplete = isPast || isCurrent;

          return (
            <div key={status.key} className="relative flex items-start mb-8 last:mb-0">
              {/* Icon */}
              <div
                className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white ${
                  isComplete
                    ? isCurrent
                      ? statusColor.bg
                      : 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              >
                <StatusIcon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="ml-6 flex-1">
                <div className={`${isComplete ? statusColor.lightBg : 'bg-gray-50'} rounded-lg p-4 border ${
                  isComplete ? statusColor.border : 'border-gray-200'
                }`}>
                  <h4
                    className={`font-semibold mb-1 ${
                      isComplete ? statusColor.text : 'text-gray-500'
                    }`}
                  >
                    {status.label}
                  </h4>
                  
                  {isCurrent && (
                    <p className="text-sm text-gray-600 mb-2">
                      {getStatusMessage(booking.status)}
                    </p>
                  )}

                  {isPast && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Completed</span>
                    </div>
                  )}

                  {!isComplete && (
                    <p className="text-sm text-gray-400">Pending</p>
                  )}

                  {/* Timestamp */}
                  {isComplete && booking.statusHistory && (
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDateTime(
                        booking.statusHistory.find(h => h.status === status.key)?.timestamp ||
                        booking.updatedAt
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      {booking.estimatedCompletionDate && booking.status !== 'completed' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Estimated Completion</p>
              <p className="text-sm text-blue-700 mt-1">
                {formatDateTime(booking.estimatedCompletionDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Work Progress Updates */}
      {booking.workProgress && booking.workProgress.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Recent Updates</h4>
          <div className="space-y-3">
            {booking.workProgress.slice(-3).reverse().map((progress, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {progress.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(progress.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{progress.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

BookingStatus.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    cancellationReason: PropTypes.string,
    estimatedCompletionDate: PropTypes.string,
    statusHistory: PropTypes.array,
    workProgress: PropTypes.array
  }).isRequired,
  detailed: PropTypes.bool
};

export default BookingStatus;
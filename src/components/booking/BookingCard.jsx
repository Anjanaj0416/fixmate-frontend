import React from 'react';
import PropTypes from 'prop-types';
import {
  Calendar,
  MapPin,
  User,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const BookingCard = ({ booking, onViewDetails, compact = false }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pending'
      },
      accepted: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: CheckCircle,
        label: 'Accepted'
      },
      in_progress: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        icon: Briefcase,
        label: 'In Progress'
      },
      completed: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Completed'
      },
      cancelled: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Cancelled'
      },
      declined: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        icon: XCircle,
        label: 'Declined'
      }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (compact) {
    return (
      <div 
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onViewDetails && onViewDetails(booking)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-2 rounded-full ${statusConfig.bg}`}>
              <Briefcase className={`w-5 h-5 ${statusConfig.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {booking.serviceType}
              </h4>
              <p className="text-sm text-gray-500 truncate">
                {formatDate(booking.scheduledDate)}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${statusConfig.bg} border ${statusConfig.border}`}>
            <span className={`text-xs font-medium ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Status Header */}
      <div className={`${statusConfig.bg} border-b ${statusConfig.border} px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
            <span className={`font-semibold ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            Booking ID: {booking._id?.slice(-8)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Service Type */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {booking.serviceType}
          </h3>
          <p className="text-gray-600 line-clamp-2">
            {booking.problemDescription}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Customer/Worker Info */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {booking.customerId?.name || booking.workerId?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {booking.customerId ? 'Customer' : 'Worker'}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {formatDate(booking.scheduledDate)}
              </p>
              <p className="text-sm text-gray-500">
                {formatTime(booking.scheduledDate)}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {booking.serviceLocation?.address || 'Location not specified'}
              </p>
              <p className="text-sm text-gray-500">
                {booking.serviceLocation?.city || ''}
              </p>
            </div>
          </div>

          {/* Price */}
          {booking.totalAmount && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Rs {booking.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.paymentStatus || 'Pending payment'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Problem Images */}
        {booking.problemImages && booking.problemImages.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Problem Images:</p>
            <div className="flex space-x-2 overflow-x-auto">
              {booking.problemImages.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Problem ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md border border-gray-200"
                />
              ))}
              {booking.problemImages.length > 3 && (
                <div className="w-20 h-20 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                  <span className="text-sm text-gray-600 font-medium">
                    +{booking.problemImages.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quote Info */}
        {booking.quote && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900">Quote Provided</p>
                <p className="text-lg font-bold text-indigo-700">
                  Rs {booking.quote.totalAmount.toLocaleString()}
                </p>
              </div>
              {booking.quote.status === 'accepted' && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
          </div>
        )}

        {/* Progress Updates */}
        {booking.workProgress && booking.workProgress.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Latest Update:</p>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-900">
                {booking.workProgress[booking.workProgress.length - 1].note}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(booking.workProgress[booking.workProgress.length - 1].timestamp)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => onViewDetails && onViewDetails(booking)}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <span className="mr-2">View Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {booking.status === 'pending' && (
            <>
              <button
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Accept
              </button>
              <button
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Decline
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Created {formatDate(booking.createdAt)}</span>
          {booking.updatedAt && (
            <span>Updated {formatDate(booking.updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

BookingCard.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    problemDescription: PropTypes.string,
    scheduledDate: PropTypes.string.isRequired,
    customerId: PropTypes.object,
    workerId: PropTypes.object,
    serviceLocation: PropTypes.shape({
      address: PropTypes.string,
      city: PropTypes.string
    }),
    totalAmount: PropTypes.number,
    paymentStatus: PropTypes.string,
    problemImages: PropTypes.array,
    quote: PropTypes.object,
    workProgress: PropTypes.array,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string
  }).isRequired,
  onViewDetails: PropTypes.func,
  compact: PropTypes.bool
};

export default BookingCard;
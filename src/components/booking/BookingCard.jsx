import React, { useState } from 'react';
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
  ArrowRight,
  Check
} from 'lucide-react';

/**
 * BookingCard Component - ENHANCED WITH COMPLETE BUTTON
 * ✅ Fixed: Proper null/undefined checks for all properties
 * ✅ Added: Worker view support
 * ✅ Enhanced: Better handling of missing data
 * ✅ NEW: Complete button for active bookings
 */
const BookingCard = ({ booking, onViewDetails, onCompleteBooking, compact = false, workerView = false }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  // ✅ Safety check: Return null if booking is invalid
  if (!booking || typeof booking !== 'object') {
    console.warn('⚠️ BookingCard received invalid booking:', booking);
    return null;
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pending'
      },
      quote_requested: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Quote Requested'
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
      'in-progress': {
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
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Time not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  // ✅ Safe getter for customer/worker name
  const getPersonName = () => {
    if (workerView) {
      // For worker view, show customer info
      return booking.customerId?.fullName || 
             booking.customerId?.name || 
             booking.customerName ||
             'Customer';
    } else {
      // For customer view, show worker info
      return booking.workerId?.fullName || 
             booking.workerId?.name || 
             booking.workerName ||
             'Worker';
    }
  };

  const getPersonRole = () => {
    return workerView ? 'Customer' : 'Worker';
  };

  // ✅ Check if booking is active (accepted or in_progress)
  const isActiveBooking = () => {
    const status = booking.status?.toLowerCase();
    return status === 'accepted' || 
           status === 'in_progress' || 
           status === 'in-progress' ||
           status === 'inprogress';
  };

  // Handle complete booking
  const handleCompleteBooking = async () => {
    if (!onCompleteBooking) {
      console.warn('No onCompleteBooking handler provided');
      return;
    }

    if (window.confirm('Mark this job as completed?')) {
      setIsCompleting(true);
      try {
        await onCompleteBooking(booking._id);
      } catch (error) {
        console.error('Error completing booking:', error);
        alert('Failed to complete booking. Please try again.');
      } finally {
        setIsCompleting(false);
      }
    }
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
              <h4 className="font-semibold text-gray-900 truncate capitalize">
                {booking.serviceType || 'Service Request'}
              </h4>
              <p className="text-sm text-gray-500 truncate">
                {booking.scheduledDate ? formatDate(booking.scheduledDate) : formatDate(booking.createdAt)}
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
            ID: {booking._id ? booking._id.slice(-8) : 'N/A'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Service Type */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 capitalize">
            {booking.serviceType || 'Service Request'}
          </h3>
          <p className="text-gray-600 line-clamp-2">
            {booking.problemDescription || booking.description || 'No description provided'}
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
                {getPersonName()}
              </p>
              <p className="text-sm text-gray-500">
                {getPersonRole()}
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
                {booking.scheduledDate ? formatDate(booking.scheduledDate) : formatDate(booking.serviceDate || booking.createdAt)}
              </p>
              <p className="text-sm text-gray-500">
                {booking.scheduledDate ? formatTime(booking.scheduledDate) : 'Time not specified'}
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
                {booking.serviceLocation?.address || 
                 booking.issueLocation ||
                 booking.location?.address ||
                 'Location not specified'}
              </p>
              <p className="text-sm text-gray-500">
                {booking.serviceLocation?.city || 
                 booking.serviceLocation?.town ||
                 booking.location?.city || 
                 ''}
              </p>
            </div>
          </div>

          {/* Price - Only show if available */}
          {(booking.totalAmount || booking.quote?.amount || booking.customerBudget) && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  LKR {(booking.totalAmount || booking.quote?.amount || booking.customerBudget?.max || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.paymentStatus ? booking.paymentStatus.replace('_', ' ') : 'pending'}
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
              {booking.problemImages.slice(0, 3).map((image, index) => {
                // Handle both URL strings and objects with url property
                const imageUrl = typeof image === 'string' ? image : image?.url;
                if (!imageUrl) return null;
                
                return (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Problem ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                );
              })}
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
        {booking.quote && booking.quote.amount && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900">Quote Provided</p>
                <p className="text-lg font-bold text-indigo-700">
                  LKR {booking.quote.amount.toLocaleString()}
                </p>
                {booking.quote.details && (
                  <p className="text-sm text-indigo-600 mt-1">{booking.quote.details}</p>
                )}
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
                {booking.workProgress[booking.workProgress.length - 1].note || 'Update recorded'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(booking.workProgress[booking.workProgress.length - 1].timestamp)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
          {/* Primary Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => onViewDetails && onViewDetails(booking)}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <span className="mr-2">View Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            {/* Show Accept/Decline for pending bookings in worker view */}
            {booking.status === 'pending' && workerView && (
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

          {/* ✅ NEW: Complete Button for Active Bookings in Worker View */}
          {workerView && isActiveBooking() && (
            <button
              onClick={handleCompleteBooking}
              disabled={isCompleting}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-semibold transition-colors ${
                isCompleting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Completing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Mark as Completed
                </>
              )}
            </button>
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
    _id: PropTypes.string,
    serviceType: PropTypes.string,
    status: PropTypes.string,
    problemDescription: PropTypes.string,
    description: PropTypes.string,
    scheduledDate: PropTypes.string,
    serviceDate: PropTypes.string,
    customerId: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    workerId: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    customerName: PropTypes.string,
    workerName: PropTypes.string,
    serviceLocation: PropTypes.shape({
      address: PropTypes.string,
      city: PropTypes.string,
      town: PropTypes.string
    }),
    location: PropTypes.object,
    issueLocation: PropTypes.string,
    totalAmount: PropTypes.number,
    paymentStatus: PropTypes.string,
    problemImages: PropTypes.array,
    quote: PropTypes.shape({
      amount: PropTypes.number,
      details: PropTypes.string,
      status: PropTypes.string
    }),
    customerBudget: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number
    }),
    workProgress: PropTypes.array,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string
  }).isRequired,
  onViewDetails: PropTypes.func,
  onCompleteBooking: PropTypes.func,
  compact: PropTypes.bool,
  workerView: PropTypes.bool
};

export default BookingCard;
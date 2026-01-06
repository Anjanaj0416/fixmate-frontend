import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Phone,
  MessageCircle,
  Eye,
  Check,
  Users
} from 'lucide-react';

/**
 * Booking Card Component - FINAL VERSION
 * ✅ Shows "Message Worker" for bookings with assigned workers
 * ✅ Shows "Message Workers" (plural) for quote requests sent to multiple workers
 * ✅ Proper handling of sentToWorkers array
 */
const BookingCard = ({ 
  booking, 
  onViewDetails, 
  onCompleteBooking,
  compact = false,
  workerView = false 
}) => {
  const navigate = useNavigate();

  // Status configuration
  const statusConfig = {
    quote_requested: {
      label: 'Quote Requested',
      icon: Clock,
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    accepted: {
      label: 'Accepted',
      icon: CheckCircle,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    in_progress: {
      label: 'In Progress',
      icon: AlertCircle,
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200'
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200'
    },
    declined: {
      label: 'Declined',
      icon: XCircle,
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200'
    }
  };

  const currentStatus = booking.status || 'pending';
  const StatusIcon = statusConfig[currentStatus]?.icon || Clock;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    
    if (typeof amount === 'object' && amount.value !== undefined) {
      return `LKR ${amount.value.toLocaleString()}`;
    }
    
    if (typeof amount === 'number') {
      return `LKR ${amount.toLocaleString()}`;
    }
    
    return 'N/A';
  };

  const getPersonName = () => {
    if (workerView) {
      return booking.customerId?.fullName || 
             booking.customerId?.name || 
             booking.customerName || 
             'Customer';
    } else {
      return booking.workerId?.fullName || 
             booking.workerId?.name || 
             booking.workerName || 
             'Worker';
    }
  };

  const getPersonRole = () => {
    return workerView ? 'Customer' : 'Service Provider';
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  const [isCompleting, setIsCompleting] = React.useState(false);

  const handleCompleteBooking = async () => {
    if (!onCompleteBooking) return;
    
    setIsCompleting(true);
    try {
      await onCompleteBooking(booking._id);
    } finally {
      setIsCompleting(false);
    }
  };

  // ✅ ENHANCED: Message Worker handler with sentToWorkers support
  const handleMessageWorker = () => {
    console.log('💬 handleMessageWorker called');
    
    // First, try to get assigned workerId
    if (booking?.workerId) {
      let workerId;
      if (typeof booking.workerId === 'object') {
        workerId = booking.workerId._id || booking.workerId.id;
      } else {
        workerId = booking.workerId;
      }

      if (workerId) {
        console.log('✅ Navigating to assigned worker:', workerId);
        navigate(`/customer/chat/${workerId}`);
        return;
      }
    }

    // ✅ NEW: If no assigned worker, but quote sent to workers, use first one
    if (booking?.sentToWorkers && booking.sentToWorkers.length > 0) {
      const workerId = booking.sentToWorkers[0];
      console.log('✅ Navigating to first worker from sentToWorkers:', workerId);
      navigate(`/customer/chat/${workerId}`);
      return;
    }

    // No worker found
    console.error('❌ No worker found for messaging');
    alert('Worker information not available');
  };

  // Message Customer handler (for worker view)
  const handleMessageCustomer = () => {
    if (!booking?.customerId) {
      alert('Customer information not available');
      return;
    }

    let customerId;
    if (typeof booking.customerId === 'object') {
      customerId = booking.customerId._id || booking.customerId.id;
    } else {
      customerId = booking.customerId;
    }

    if (!customerId) {
      console.error('❌ Could not extract customer ID:', booking.customerId);
      alert('Unable to open chat. Customer information is incomplete.');
      return;
    }

    console.log('💬 Opening chat with customer:', customerId);
    navigate(`/worker/chat/${customerId}`);
  };

  // ✅ FINAL: Comprehensive worker detection
  const hasWorkerInfo = () => {
    if (workerView) return false;
    
    // Check for assigned workerId (accepted/in-progress/completed bookings)
    if (booking.workerId) {
      if (typeof booking.workerId === 'object') {
        return !!(booking.workerId._id || booking.workerId.id);
      }
      return true;
    }
    
    // Check for workerName (fallback)
    if (booking.workerName) {
      return true;
    }

    // ✅ Check if quote was sent to workers (quote_requested status)
    if (booking.sentToWorkers && booking.sentToWorkers.length > 0) {
      return true;
    }
    
    return false;
  };

  const hasWorker = hasWorkerInfo();
  const hasCustomer = workerView && booking.customerId;

  // Get message button label
  const getMessageButtonLabel = () => {
    // If worker is assigned, show "Message Worker"
    if (booking.workerId) {
      return 'Message Worker';
    }
    
    // If quote sent to multiple workers, show count
    if (booking.sentToWorkers && booking.sentToWorkers.length > 1) {
      return `Message Workers (${booking.sentToWorkers.length})`;
    }
    
    // If quote sent to one worker
    if (booking.sentToWorkers && booking.sentToWorkers.length === 1) {
      return 'Message Worker';
    }
    
    return 'Message Worker';
  };

  // Compact view
  if (compact) {
    return (
      <div 
        onClick={handleViewDetails}
        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-4 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 capitalize truncate">
              {booking.serviceType || 'Service Request'}
            </h3>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {booking.problemDescription || booking.description || 'No description'}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {booking.scheduledDate ? formatDate(booking.scheduledDate) : formatDate(booking.createdAt)}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${statusConfig[currentStatus]?.bg} border ${statusConfig[currentStatus]?.border}`}>
            <span className={`text-xs font-medium ${statusConfig[currentStatus]?.text}`}>
              {statusConfig[currentStatus]?.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Status Header */}
      <div className={`${statusConfig[currentStatus]?.bg} border-b ${statusConfig[currentStatus]?.border} px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-5 h-5 ${statusConfig[currentStatus]?.text}`} />
            <span className={`font-semibold ${statusConfig[currentStatus]?.text}`}>
              {statusConfig[currentStatus]?.label}
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
                {booking.scheduledDate ? 'Scheduled' : 'Requested'}
              </p>
            </div>
          </div>

          {/* Location */}
          {(booking.serviceLocation || booking.location) && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {booking.serviceLocation?.city || booking.location?.city || 'Location'}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.serviceLocation?.address || booking.location?.address || booking.issueLocation || 'Not specified'}
                </p>
              </div>
            </div>
          )}

          {/* Price/Budget */}
          {(booking.totalAmount || booking.quote?.amount || booking.customerBudget) && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {booking.totalAmount 
                    ? formatCurrency(booking.totalAmount)
                    : booking.quote?.amount 
                      ? formatCurrency(booking.quote.amount)
                      : booking.customerBudget 
                        ? `${formatCurrency(booking.customerBudget.min)} - ${formatCurrency(booking.customerBudget.max)}`
                        : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.totalAmount ? 'Total Amount' : booking.quote?.amount ? 'Quoted Amount' : 'Budget Range'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quote Details */}
        {booking.quote && booking.quote.details && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Quote Details:</span> {booking.quote.details}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* View Details Button */}
          <button
            onClick={handleViewDetails}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            View Details
          </button>

          {/* ✅ FINAL: Message Worker Button - Shows when worker(s) available */}
          {hasWorker && (
            <button
              onClick={handleMessageWorker}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {booking.sentToWorkers && booking.sentToWorkers.length > 1 ? (
                <Users className="w-5 h-5" />
              ) : (
                <MessageCircle className="w-5 h-5" />
              )}
              <span>{getMessageButtonLabel()}</span>
            </button>
          )}

          {/* Message Customer Button (Worker View) */}
          {hasCustomer && (
            <button
              onClick={handleMessageCustomer}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Message Customer
            </button>
          )}

          {/* Complete Booking Button (Worker View - In Progress Only) */}
          {workerView && booking.status === 'in_progress' && onCompleteBooking && (
            <button
              onClick={handleCompleteBooking}
              disabled={isCompleting}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isCompleting 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Completing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
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
    customerId: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    workerId: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    customerName: PropTypes.string,
    workerName: PropTypes.string,
    sentToWorkers: PropTypes.array,
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
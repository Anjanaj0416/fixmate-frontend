import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Timer,
  Star
} from 'lucide-react';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import ReviewModal from '../../components/review/ReviewModal';
import reviewService from '../../services/reviewService';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
      checkExistingReview();
    }
  }, [bookingId]);

  const checkExistingReview = async () => {
    try {
      const response = await reviewService.getBookingReview(bookingId);
      if (response.success && response.data) {
        setHasReview(true);
        setExistingReview(response.data.review);
        console.log('✅ Existing review found:', response.data.review);
      }
    } catch (error) {
      console.log('ℹ️ No existing review for this booking');
      setHasReview(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      console.log('📝 Submitting review:', reviewData);
      
      const response = await reviewService.createReview(reviewData);
      
      if (response.success) {
        console.log('✅ Review submitted successfully');
        alert('Thank you for your review!');
        setShowReviewModal(false);
        setHasReview(true);
        checkExistingReview();
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      throw error;
    }
  };

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      console.log('📡 Fetching booking details for:', bookingId);

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        if (response.status === 404) {
          throw new Error('Booking not found.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Booking details response:', data);

      if (data.success && data.data) {
        const bookingData = data.data.booking || data.data;
        console.log('✅ Booking data loaded:', bookingData);
        setBooking(bookingData);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('❌ Error fetching booking details:', error);
      setError(error.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/customer/bookings');
  };

  const handleMessageWorker = () => {
    if (!booking?.workerId) {
      alert('Worker information not available');
      return;
    }

    let workerId;
    if (typeof booking.workerId === 'object') {
      workerId = booking.workerId._id || booking.workerId.id;
    } else {
      workerId = booking.workerId;
    }

    if (!workerId) {
      console.error('❌ Could not extract worker ID:', booking.workerId);
      alert('Unable to open chat. Worker information is incomplete.');
      return;
    }

    console.log('💬 Opening chat with worker:', workerId);
    navigate(`/customer/chat/${workerId}`);
  };

  const handleCallWorker = () => {
    const phoneNumber = booking.workerId?.phoneNumber;
    if (!phoneNumber) {
      alert('Worker phone number not available');
      return;
    }
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      console.log('🗑️ Attempting to cancel booking:', bookingId);

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Cancelled by customer'
        })
      });

      console.log('📡 Cancel response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Cancel error:', errorData);
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const data = await response.json();
      console.log('✅ Cancel response:', data);
      
      if (data.success) {
        alert('Booking cancelled successfully');
        fetchBookingDetails();
      } else {
        throw new Error(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      alert(error.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      quote_requested: {
        label: 'Quote Requested',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        icon: Timer
      },
      pending: {
        label: 'Pending',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        icon: Clock
      },
      accepted: {
        label: 'Accepted',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        icon: CheckCircle
      },
      in_progress: {
        label: 'In Progress',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        icon: Clock
      },
      completed: {
        label: 'Completed',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: CheckCircle
      },
      cancelled: {
        label: 'Cancelled',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: XCircle
      },
      declined: {
        label: 'Declined',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: XCircle
      }
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No booking data available</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  const hasWorkerInfo = booking.workerId && (
    typeof booking.workerId === 'object'
      ? (booking.workerId._id || booking.workerId.id)
      : booking.workerId
  );

  // Show review button only for completed bookings
  const canReview = booking.status === 'completed' && hasWorkerInfo;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                <p className="text-sm text-gray-500">ID: {booking._id?.slice(-8)}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <span className={`font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Service Information Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Service Type</p>
                  <p className="font-medium text-gray-900 capitalize">{booking.serviceType || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Problem Description</p>
                  <p className="text-gray-900">{booking.problemDescription || 'No description provided'}</p>
                </div>
              </div>
              {booking.specialInstructions && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Special Instructions</p>
                    <p className="text-gray-900">{booking.specialInstructions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Location & Schedule Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Service Location</p>
                  <p className="font-medium text-gray-900">
                    {booking.serviceLocation?.address ||
                     `${booking.serviceLocation?.city || ''}, ${booking.serviceLocation?.district || ''}`.trim() ||
                     'Location not specified'}
                  </p>
                  {booking.serviceLocation?.city && booking.serviceLocation?.district && (
                    <p className="text-sm text-gray-600">
                      {booking.serviceLocation.city}, {booking.serviceLocation.district}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Scheduled Date</p>
                  <p className="font-medium text-gray-900">{formatDate(booking.scheduledDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Scheduled Time</p>
                  <p className="font-medium text-gray-900">{formatTime(booking.scheduledDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Worker Information Card */}
        {hasWorkerInfo && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Worker Information</h2>
              <div className="flex items-center gap-4 mb-4">
                {booking.workerId?.profileImage ? (
                  <img
                    src={booking.workerId.profileImage}
                    alt={booking.workerId.fullName || 'Worker'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-indigo-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {booking.workerId?.fullName || booking.workerId?.name || 'Worker Name'}
                  </p>
                  {booking.workerId?.phoneNumber && (
                    <p className="text-sm text-gray-600">{booking.workerId.phoneNumber}</p>
                  )}
                  {booking.workerId?.serviceCategories && (
                    <p className="text-sm text-gray-600 capitalize">
                      {booking.workerId.serviceCategories.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleMessageWorker}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message Worker
                </button>
                {booking.workerId?.phoneNumber && (
                  <button
                    onClick={handleCallWorker}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Worker
                  </button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Quote Information Card */}
        {booking.quote && booking.quote.amount && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quote Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Quote Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        LKR {booking.quote.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                {booking.quote.details && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Quote Details</p>
                    <p className="text-gray-900">{booking.quote.details}</p>
                  </div>
                )}
                {booking.quote.validUntil && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Valid Until:</span>{' '}
                    {formatDate(booking.quote.validUntil)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Problem Images Card */}
        {booking.problemImages && booking.problemImages.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {booking.problemImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt={`Problem ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(image, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Budget Information Card */}
        {booking.customerBudget && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Information</h2>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Minimum Budget</p>
                  <p className="text-lg font-semibold text-blue-600">
                    LKR {booking.customerBudget.min?.toLocaleString() || 'Not specified'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Maximum Budget</p>
                  <p className="text-lg font-semibold text-blue-600">
                    LKR {booking.customerBudget.max?.toLocaleString() || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Timeline Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900 font-medium">
                  {formatDate(booking.createdAt)} at {formatTime(booking.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-900 font-medium">
                  {formatDate(booking.updatedAt)} at {formatTime(booking.updatedAt)}
                </span>
              </div>
              {booking.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(booking.completedAt)} at {formatTime(booking.completedAt)}
                  </span>
                </div>
              )}
              {booking.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelled</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(booking.cancelledAt)} at {formatTime(booking.cancelledAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ✅ NEW: Review Section for Completed Bookings */}
        {canReview && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review</h2>
              
              {hasReview ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={`${
                            i < (existingReview?.rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {existingReview?.rating}/5
                    </span>
                  </div>
                  {existingReview?.comment && (
                    <p className="text-gray-700 mb-3">{existingReview.comment}</p>
                  )}
                  {existingReview?.images && existingReview.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {existingReview.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.imageUrl || img}
                          alt={`Review ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-3">
                    Reviewed on {formatDate(existingReview?.createdAt)}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Share your experience with {booking.workerId?.fullName || 'the worker'}
                  </p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    Write a Review
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Cancel Booking Action */}
        {(booking.status === 'quote_requested' || booking.status === 'pending') && (
          <Card>
            <div className="p-6">
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Cancel Booking
                  </>
                )}
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          booking={booking}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default BookingDetails;
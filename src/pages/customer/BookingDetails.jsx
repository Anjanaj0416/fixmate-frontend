import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  DollarSign,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

/**
 * Booking Details Page - Customer View
 * Displays comprehensive booking information with messaging capability
 */
const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
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

    const workerId = booking.workerId._id || booking.workerId.id || booking.workerId;
    console.log('💬 Opening chat with worker:', workerId);
    navigate(`/customer/chat/${workerId}`);
  };

  const handleCallWorker = () => {
    if (!booking?.workerId?.phoneNumber) {
      alert('Worker phone number not available');
      return;
    }
    window.location.href = `tel:${booking.workerId.phoneNumber}`;
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Customer requested cancellation'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      alert('Booking cancelled successfully');
      fetchBookingDetails();
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      quote_requested: {
        icon: Clock,
        label: 'Quote Requested',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      pending: {
        icon: Clock,
        label: 'Pending',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      accepted: {
        icon: CheckCircle,
        label: 'Accepted',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      in_progress: {
        icon: Loader2,
        label: 'In Progress',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      completed: {
        icon: CheckCircle,
        label: 'Completed',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      cancelled: {
        icon: XCircle,
        label: 'Cancelled',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      declined: {
        icon: XCircle,
        label: 'Declined',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Booking</h2>
            <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
            <Button onClick={handleBack} variant="primary">
              Back to Bookings
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Booking Details</h1>
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
                  <p className="font-medium text-gray-900">{booking.serviceType || 'N/A'}</p>
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
        {booking.workerId && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Worker Information</h2>
              <div className="flex items-center gap-4 mb-4">
                {booking.workerId.profileImage ? (
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
                  <h3 className="font-semibold text-gray-900">
                    {booking.workerId.fullName || 'Worker'}
                  </h3>
                  {booking.workerId.phoneNumber && (
                    <p className="text-sm text-gray-600">{booking.workerId.phoneNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleMessageWorker}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Message Worker
                </Button>
                {booking.workerId.phoneNumber && (
                  <Button
                    onClick={handleCallWorker}
                    variant="outline"
                    className="flex items-center justify-center gap-2 px-6"
                  >
                    <Phone size={18} />
                    Call
                  </Button>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Problem Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {booking.problemImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Problem ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => window.open(image, '_blank')}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center"
                    >
                      <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                        View Full Size
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Booking Timeline Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h2>
            <div className="space-y-3 text-sm">
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

        {/* Cancel Booking Action */}
        {(booking.status === 'quote_requested' || booking.status === 'pending') && (
          <Card>
            <div className="p-6">
              <Button
                onClick={handleCancelBooking}
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
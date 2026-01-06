import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

/**
 * Worker Booking Details Page
 * Shows full details of a booking and allows worker to:
 * - View all booking information
 * - Mark job as completed
 * - Message customer
 * - Rate customer after completion
 */
const WorkerBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      console.log('🔍 Fetching booking details:', id);
      
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch booking: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Booking details fetched:', data);
      
      // ✅ FIX: Proper data extraction based on your API response structure
      const bookingData = data.data?.booking || data.data || data.booking || data;
      console.log('📋 Extracted booking:', bookingData);
      
      setBooking(bookingData);
    } catch (err) {
      console.error('❌ Error fetching booking:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    if (!window.confirm('Mark this job as completed? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      console.log('🏁 Marking booking as completed:', id);
      
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: 'PUT',  // ✅ Changed from PATCH to PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) {
        throw new Error('Failed to complete booking');
      }

      console.log('✅ Booking marked as completed');
      
      // Refresh booking data to show completed status
      await fetchBookingDetails();
      
      // Show success message
      alert('Job marked as completed successfully! 🎉');
      
    } catch (err) {
      console.error('❌ Error completing booking:', err);
      alert('Failed to complete booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageCustomer = () => {
    const customerId = typeof booking.customerId === 'object' 
      ? booking.customerId._id 
      : booking.customerId;
    
    if (customerId) {
      console.log('💬 Navigating to chat with customer:', customerId);
      navigate(`/worker/chat/${customerId}`);
    } else {
      alert('Customer information not available');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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

  const getStatusConfig = (status) => {
    const configs = {
      quote_requested: {
        label: 'Quote Requested',
        icon: Clock,
        bgClass: 'bg-yellow-50',
        textClass: 'text-yellow-700',
        borderClass: 'border-yellow-200'
      },
      pending: {
        label: 'Pending',
        icon: Clock,
        bgClass: 'bg-yellow-50',
        textClass: 'text-yellow-700',
        borderClass: 'border-yellow-200'
      },
      accepted: {
        label: 'Accepted',
        icon: CheckCircle,
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-700',
        borderClass: 'border-blue-200'
      },
      in_progress: {
        label: 'In Progress',
        icon: AlertCircle,
        bgClass: 'bg-indigo-50',
        textClass: 'text-indigo-700',
        borderClass: 'border-indigo-200'
      },
      completed: {
        label: 'Completed',
        icon: CheckCircle,
        bgClass: 'bg-green-50',
        textClass: 'text-green-700',
        borderClass: 'border-green-200'
      },
      cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        borderClass: 'border-red-200'
      },
      declined: {
        label: 'Declined',
        icon: XCircle,
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-700',
        borderClass: 'border-gray-200'
      }
    };

    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Booking
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button onClick={() => navigate('/worker/jobs')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Back to Jobs
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Booking Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                The booking you're looking for doesn't exist or you don't have access to it.
              </p>
              <button onClick={() => navigate('/worker/jobs')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Back to Jobs
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const customerInfo = typeof booking.customerId === 'object' 
    ? booking.customerId 
    : { fullName: booking.customerName || 'Customer' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/worker/jobs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {booking.serviceType || 'Service Request'}
              </h1>
              <p className="text-gray-600 mt-1">
                Booking ID: {booking._id ? booking._id.slice(-8).toUpperCase() : 'N/A'}
              </p>
            </div>
            
            <div className={`px-4 py-2 rounded-lg border ${statusConfig.borderClass} ${statusConfig.bgClass}`}>
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${statusConfig.textClass}`} />
                <span className={`font-semibold ${statusConfig.textClass}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Problem Description</label>
                  <p className="mt-1 text-gray-900">
                    {booking.problemDescription || booking.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Type</label>
                    <p className="mt-1 text-gray-900 capitalize">
                      {booking.serviceType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Urgency</label>
                    <p className="mt-1 text-gray-900 capitalize">
                      {booking.urgency || 'Normal'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Service Location
                  </label>
                  <p className="mt-1 text-gray-900">
                    {booking.serviceLocation?.address || booking.location?.address || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {[
                      booking.serviceLocation?.city,
                      booking.serviceLocation?.town
                    ].filter(Boolean).join(', ') || booking.issueLocation}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Scheduled Date
                  </label>
                  <p className="mt-1 text-gray-900">
                    {formatDate(booking.scheduledDate || booking.serviceDate || booking.createdAt)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Problem Images */}
            {booking.problemImages && booking.problemImages.length > 0 && (
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Problem Images</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {booking.problemImages.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image}
                          alt={`Problem ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                          onClick={() => window.open(image, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Quote Information */}
            {booking.quote && (
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quote Information</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quoted Amount</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(booking.quote.amount)}
                    </span>
                  </div>
                  {booking.quote.details && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quote Details</label>
                      <p className="mt-1 text-gray-900">{booking.quote.details}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Payment Information */}
            {booking.totalAmount && (
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Customer Info & Actions */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {customerInfo.profileImage ? (
                    <img
                      src={customerInfo.profileImage}
                      alt={customerInfo.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {customerInfo.fullName || customerInfo.name || 'Customer'}
                    </p>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                </div>

                {customerInfo.phoneNumber && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{customerInfo.phoneNumber}</span>
                  </div>
                )}

                {customerInfo.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{customerInfo.email}</span>
                  </div>
                )}

                <button
                  onClick={handleMessageCustomer}
                  variant="primary"
                  className="w-full"
                  icon={MessageCircle}
                >
                  Message Customer
                </button>
              </div>
            </Card>

            {/* Action Buttons - Mark as Completed */}
            {(booking.status === 'accepted' || booking.status === 'in_progress') && (
              <Card>
                <div className="p-6">
                  <button
                    onClick={handleCompleteBooking}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {actionLoading ? (
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
                </div>
              </Card>
            )}

            {/* Booking Timestamps */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(booking.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(booking.updatedAt)}
                  </span>
                </div>
                {booking.completedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-gray-900 font-medium">
                      {formatDate(booking.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerBookingDetails;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, DollarSign, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

/**
 * Customer Booking Details Page - FIXED
 * ✅ No duplication of content
 * ✅ Clean, single display of all information
 * ✅ Proper data formatting
 */
const CustomerBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('📡 Fetching booking details for ID:', id);

      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Booking details:', data);

      if (data.success && data.data && data.data.booking) {
        setBooking(data.data.booking);
      } else {
        throw new Error('Invalid response structure');
      }

    } catch (error) {
      console.error('❌ Error fetching booking details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      quote_requested: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        label: 'Quote Requested'
      },
      pending: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        label: 'Pending'
      },
      accepted: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        label: 'Accepted'
      },
      in_progress: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        label: 'In Progress'
      },
      completed: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        label: 'Completed'
      },
      cancelled: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        label: 'Cancelled'
      },
      declined: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        label: 'Declined'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid time';
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Not specified';
    
    if (typeof location === 'string') {
      return location;
    }
    
    // Handle object location with various field names
    const parts = [];
    if (location.issueLocation) parts.push(location.issueLocation);
    if (location.nearestTown) parts.push(location.nearestTown);
    if (location.town) parts.push(location.town);
    if (location.district) parts.push(location.district);
    if (location.city) parts.push(location.city);
    
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    
    // Handle case where budget is an object
    if (typeof budget === 'object') {
      return 'Not specified';
    }
    
    // Handle number
    if (typeof budget === 'number') {
      return `LKR ${budget.toLocaleString()}`;
    }
    
    return budget;
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="bg-red-50 border-red-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Error Loading Booking</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => navigate('/customer/bookings')}>
              Back to My Bookings
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/customer/bookings')}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
        </div>

        {/* Status Card - SINGLE INSTANCE */}
        <Card className={`mb-6 ${statusConfig.bg} border ${statusConfig.border}`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <h2 className={`text-2xl font-bold ${statusConfig.text}`}>
                  {statusConfig.label}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-mono text-sm">{booking._id.slice(-8)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Service Information - SINGLE INSTANCE */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Service Information</h3>
            
            <div className="space-y-4">
              {/* Service Type */}
              <div>
                <p className="text-sm font-medium text-gray-500">Service Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {booking.serviceType || 'Not specified'}
                </p>
              </div>

              {/* Problem Description */}
              {booking.problemDescription && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Problem Description</p>
                  <p className="text-gray-900">{booking.problemDescription}</p>
                </div>
              )}

              {/* Scheduled Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                    <p className="text-gray-900">{formatDate(booking.scheduledDate || booking.serviceDate)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="text-gray-900">{formatTime(booking.scheduledDate || booking.serviceDate)}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {booking.serviceLocation && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service Location</p>
                    <p className="text-gray-900">{formatLocation(booking.serviceLocation)}</p>
                  </div>
                </div>
              )}

              {/* Budget */}
              {booking.customerBudget && (
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget</p>
                    <p className="text-gray-900">{formatBudget(booking.customerBudget)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Worker Information - SINGLE INSTANCE */}
        {booking.workerId && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Worker Information</h3>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {booking.workerId.profileImage ? (
                    <img
                      src={booking.workerId.profileImage}
                      alt={booking.workerId.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {booking.workerId.fullName || 'Worker'}
                  </h4>
                  {booking.workerId.phoneNumber && (
                    <p className="text-gray-600">{booking.workerId.phoneNumber}</p>
                  )}
                  {booking.workerId.email && (
                    <p className="text-gray-600">{booking.workerId.email}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Problem Images - SINGLE INSTANCE */}
        {booking.problemImages && booking.problemImages.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Problem Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {booking.problemImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Problem ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {booking.workerId && (
            <Button
              onClick={() => navigate(`/customer/chat/${booking.workerId._id}`)}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Message Worker</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/customer/bookings')}
            className="flex-1"
          >
            View All Bookings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingDetails;
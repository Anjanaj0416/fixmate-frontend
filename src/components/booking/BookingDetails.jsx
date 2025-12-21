import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  MessageSquare,
  Star,
  Download,
  AlertCircle
} from 'lucide-react';

const BookingDetails = ({ bookingId, onClose, onStatusUpdate }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `http://localhost:5001/bookings/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch booking details');

      const data = await response.json();
      setBooking(data.data.booking);
    } catch (err) {
      setError(err.message);
      console.error('Fetch booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Accepted' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Progress' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      declined: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Declined' }
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Error Loading Booking</h3>
          </div>
          <p className="text-gray-600 mb-4">{error || 'Booking not found'}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const datetime = formatDateTime(booking.scheduledDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {booking._id}</p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(booking.status)}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'progress'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('quote')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'quote'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Quote
            </button>
            {booking.review && (
              <button
                onClick={() => setActiveTab('review')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'review'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Review
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Service Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Service Type</p>
                    <p className="font-semibold text-gray-900">{booking.serviceType}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Scheduled Date & Time</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="font-semibold text-gray-900">{datetime.date}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">{datetime.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Worker Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.customerId?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Customer</p>
                      </div>
                    </div>
                    {booking.customerId?.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-700">{booking.customerId.email}</p>
                      </div>
                    )}
                    {booking.customerId?.phoneNumber && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-700">{booking.customerId.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Worker Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.workerId?.name || 'Not assigned'}</p>
                        <p className="text-sm text-gray-500">Worker</p>
                      </div>
                    </div>
                    {booking.workerId?.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-700">{booking.workerId.email}</p>
                      </div>
                    )}
                    {booking.workerId?.phoneNumber && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-700">{booking.workerId.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Location</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.serviceLocation?.address || 'Address not provided'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.serviceLocation?.city}, {booking.serviceLocation?.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Description</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{booking.problemDescription}</p>
                </div>
              </div>

              {/* Problem Images */}
              {booking.problemImages && booking.problemImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {booking.problemImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Problem ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Progress</h3>
              {booking.workProgress && booking.workProgress.length > 0 ? (
                <div className="space-y-4">
                  {booking.workProgress.map((progress, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 capitalize">{progress.status}</span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(progress.timestamp).date}
                          </span>
                        </div>
                        <p className="text-gray-700">{progress.note}</p>
                        {progress.images && progress.images.length > 0 && (
                          <div className="flex space-x-2 mt-3">
                            {progress.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Progress ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No progress updates yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quote' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Details</h3>
              {booking.quote ? (
                <div className="space-y-4">
                  <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-indigo-600 font-medium">Total Amount</p>
                        <p className="text-3xl font-bold text-indigo-900">
                          Rs {booking.quote.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(booking.quote.status || 'pending')}
                    </div>
                  </div>

                  {booking.quote.breakdown && booking.quote.breakdown.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {booking.quote.breakdown.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                Rs {item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {booking.quote.notes && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                      <p className="text-gray-600">{booking.quote.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No quote provided yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'review' && booking.review && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Review</h3>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  {renderStars(booking.review.rating)}
                  <span className="text-sm text-gray-500">
                    {formatDateTime(booking.review.createdAt).date}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{booking.review.comment}</p>
                {booking.review.images && booking.review.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {booking.review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {booking.status === 'pending' && onStatusUpdate && (
              <>
                <button
                  onClick={() => onStatusUpdate(booking._id, 'accepted')}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Accept Booking
                </button>
                <button
                  onClick={() => onStatusUpdate(booking._id, 'declined')}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Decline
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

BookingDetails.propTypes = {
  bookingId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onStatusUpdate: PropTypes.func
};

export default BookingDetails;
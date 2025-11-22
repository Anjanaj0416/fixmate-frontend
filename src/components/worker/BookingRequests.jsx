import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, Button, Modal, Input, Spinner } from '../common';

/**
 * Booking Requests Component
 * Manage incoming booking requests for workers
 */
const BookingRequests = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, accepted, rejected, all
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/workers/bookings?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (booking) => {
    setSelectedBooking(booking);
    setShowQuoteModal(true);
  };

  const handleReject = (booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
  };

  const BookingCard = ({ booking }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        {/* Left Side - Booking Details */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <h3 className="text-lg font-bold text-gray-900">{booking.serviceType}</h3>
              <span
                className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : booking.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {booking.status.toUpperCase()}
              </span>
              {booking.urgency === 'high' && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  URGENT
                </span>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold mr-3">
              {booking.customer?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{booking.customer?.name}</p>
              <p className="text-sm text-gray-600">{booking.customer?.phoneNumber}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Problem Description:</p>
            <p className="text-sm text-gray-600">{booking.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Date & Time */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Scheduled Date & Time</p>
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-700 mt-1">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{booking.scheduledTime}</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <div className="flex items-start text-sm text-gray-700">
                <svg className="w-4 h-4 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p>{booking.location?.address}</p>
                  <p>{booking.location?.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {booking.estimatedDuration && (
            <div className="mb-2">
              <span className="text-xs text-gray-500">Estimated Duration: </span>
              <span className="text-sm text-gray-700">{booking.estimatedDuration} hours</span>
            </div>
          )}

          {booking.additionalNotes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Additional Notes:</p>
              <p className="text-sm text-gray-700">{booking.additionalNotes}</p>
            </div>
          )}

          {/* Images */}
          {booking.images && booking.images.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Problem Images:</p>
              <div className="flex space-x-2">
                {booking.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Problem ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75"
                    onClick={() => window.open(image, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2 md:w-40">
          {booking.status === 'pending' && (
            <>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => handleAccept(booking)}
              >
                Accept & Quote
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => handleReject(booking)}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => navigate(`/worker/bookings/${booking.id}`)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="text-gray-600 mt-1">Manage your incoming job requests</p>
        </div>
        <Button variant="outline" onClick={fetchBookings}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { value: 'pending', label: 'Pending' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'all', label: 'All' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === tab.value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Loading bookings..." />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter !== 'all' && filter} bookings
            </h3>
            <p className="text-gray-600">
              {filter === 'pending'
                ? "You don't have any pending booking requests at the moment."
                : 'No bookings found with the selected filter.'}
            </p>
          </div>
        </Card>
      )}

      {/* Accept & Quote Modal */}
      <QuoteModal
        isOpen={showQuoteModal}
        onClose={() => {
          setShowQuoteModal(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onSuccess={() => {
          fetchBookings();
          setShowQuoteModal(false);
        }}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onSuccess={() => {
          fetchBookings();
          setShowRejectModal(false);
        }}
      />
    </div>
  );
};

// Quote Modal Component
const QuoteModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({
    estimatedCost: '',
    estimatedDuration: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/workers/bookings/${booking.id}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(quoteData),
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Accept Booking & Send Quote" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="number"
          name="estimatedCost"
          label="Estimated Cost (LKR)"
          value={quoteData.estimatedCost}
          onChange={(e) => setQuoteData({ ...quoteData, estimatedCost: e.target.value })}
          placeholder="5000"
          required
        />

        <Input
          type="number"
          name="estimatedDuration"
          label="Estimated Duration (hours)"
          value={quoteData.estimatedDuration}
          onChange={(e) => setQuoteData({ ...quoteData, estimatedDuration: e.target.value })}
          placeholder="2"
          required
        />

        <Input
          type="textarea"
          name="message"
          label="Message to Customer"
          value={quoteData.message}
          onChange={(e) => setQuoteData({ ...quoteData, message: e.target.value })}
          placeholder="I'm available for this job and will bring all necessary tools..."
          rows={4}
        />

        <div className="flex space-x-4 pt-4">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Accept & Send Quote
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Reject Modal Component
const RejectModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/workers/bookings/${booking.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Booking Request" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Please provide a reason for rejecting this booking request (optional).
        </p>

        <Input
          type="textarea"
          name="reason"
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Not available at the requested time..."
          rows={3}
        />

        <div className="flex space-x-4 pt-4">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" fullWidth loading={loading}>
            Reject Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};

QuoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

RejectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default BookingRequests;
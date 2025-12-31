import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Clock, User, AlertCircle } from 'lucide-react';

/**
 * Worker Booking Requests Page - FIXED
 * View and manage incoming quote requests from customers
 */
const WorkerBookingRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      console.log('🌐 API URL:', `${API_BASE_URL}/bookings/received-quotes`);
      
      const response = await fetch(`${API_BASE_URL}/bookings/received-quotes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📨 Received quotes:', data);
        setRequests(data.data.receivedQuotes || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to fetch requests:', response.status, errorData);
        alert(`Failed to load requests: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      alert('Failed to load requests. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (request) => {
    console.log('✅ Accept clicked for request:', request);
    if (!request || !request._id) {
      console.error('❌ Invalid request object:', request);
      alert('Error: Invalid request data');
      return;
    }
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const handleDecline = (request) => {
    console.log('❌ Decline clicked for request:', request);
    if (!request || !request._id) {
      console.error('❌ Invalid request object:', request);
      alert('Error: Invalid request data');
      return;
    }
    setSelectedRequest(request);
    setShowDeclineModal(true);
  };

  const submitAccept = async (quoteData) => {
    try {
      if (!selectedRequest || !selectedRequest._id) {
        console.error('❌ No selected request or missing ID:', selectedRequest);
        alert('Error: No request selected');
        return;
      }

      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      console.log('📤 Submitting accept:', {
        requestId: selectedRequest._id,
        quoteData,
        token: token ? 'Present' : 'Missing'
      });

      const response = await fetch(
        `${API_BASE_URL}/bookings/${selectedRequest._id}/respond`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            response: 'accept',
            quoteAmount: quoteData.amount,
            quoteDetails: quoteData.details
          })
        }
      );

      const responseData = await response.json();
      console.log('📥 Response:', responseData);

      if (response.ok) {
        alert('Quote accepted successfully!');
        setShowAcceptModal(false);
        setSelectedRequest(null);
        fetchRequests(); // Refresh list
      } else {
        console.error('❌ Failed to accept:', responseData);
        alert(responseData.message || 'Failed to accept quote');
      }
    } catch (error) {
      console.error('❌ Error accepting quote:', error);
      alert('Failed to accept quote. Please try again.');
    }
  };

  const submitDecline = async (reason) => {
    try {
      if (!selectedRequest || !selectedRequest._id) {
        console.error('❌ No selected request or missing ID:', selectedRequest);
        alert('Error: No request selected');
        return;
      }

      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      console.log('📤 Submitting decline:', {
        requestId: selectedRequest._id,
        reason,
        token: token ? 'Present' : 'Missing'
      });

      const response = await fetch(
        `${API_BASE_URL}/bookings/${selectedRequest._id}/respond`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            response: 'decline',
            declineReason: reason
          })
        }
      );

      const responseData = await response.json();
      console.log('📥 Response:', responseData);

      if (response.ok) {
        alert('Quote declined.');
        setShowDeclineModal(false);
        setSelectedRequest(null);
        fetchRequests(); // Refresh list
      } else {
        console.error('❌ Failed to decline:', responseData);
        alert(responseData.message || 'Failed to decline quote');
      }
    } catch (error) {
      console.error('❌ Error declining quote:', error);
      alert('Failed to decline quote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
              <p className="text-gray-600 mt-1">
                Manage incoming quote requests from customers
              </p>
            </div>
            <button
              onClick={fetchRequests}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pending Requests
            </h3>
            <p className="text-gray-600">
              You don't have any booking requests at the moment.
            </p>
            <button
              onClick={() => navigate('/worker/dashboard')}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAcceptModal && selectedRequest && (
        <AcceptModal
          request={selectedRequest}
          onClose={() => {
            setShowAcceptModal(false);
            setSelectedRequest(null);
          }}
          onSubmit={submitAccept}
        />
      )}

      {showDeclineModal && selectedRequest && (
        <DeclineModal
          request={selectedRequest}
          onClose={() => {
            setShowDeclineModal(false);
            setSelectedRequest(null);
          }}
          onSubmit={submitDecline}
        />
      )}
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, onAccept, onDecline }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'quote_requested':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canRespond = request.status === 'quote_requested' || request.status === 'pending';

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Left side - Request details */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-gray-900 capitalize">
              {request.serviceType}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                request.status
              )}`}
            >
              {request.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Customer info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <img
              src={request.customerId?.profileImage || '/default-avatar.png'}
              alt={request.customerId?.fullName || 'Customer'}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900">
                {request.customerId?.fullName || 'Customer'}
              </p>
              <p className="text-sm text-gray-600">
                {request.customerId?.phoneNumber || 'No phone'}
              </p>
            </div>
          </div>

          {/* Request details */}
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-600">
                  {request.serviceLocation?.town}, {request.serviceLocation?.district}
                </p>
              </div>
            </div>

            {/* Issue Location */}
            {request.issueLocation && (
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700">Issue Location</p>
                  <p className="text-sm text-gray-600">{request.issueLocation}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {request.problemDescription && (
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="text-sm text-gray-600">{request.problemDescription}</p>
                </div>
              </div>
            )}

            {/* Budget */}
            {request.budgetRange && (
              <div className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Budget</p>
                  <p className="text-sm text-gray-600">LKR {request.budgetRange}</p>
                </div>
              </div>
            )}

            {/* Urgency */}
            {request.urgency && (
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Urgency</p>
                  <p className="text-sm text-gray-600 capitalize">{request.urgency}</p>
                </div>
              </div>
            )}
          </div>

          {/* Problem Images */}
          {request.problemImages && request.problemImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Problem Images</p>
              <div className="flex gap-2 overflow-x-auto">
                {request.problemImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Problem ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-gray-500 mt-4">
            Received: {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col gap-2 lg:w-48">
          {canRespond ? (
            <>
              <button
                onClick={() => onAccept(request)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Accept & Quote
              </button>
              <button
                onClick={() => onDecline(request)}
                className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Decline
              </button>
            </>
          ) : (
            <div className="text-center text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              Already {request.status === 'accepted' ? 'accepted' : 'responded'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Accept Modal
const AcceptModal = ({ request, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }

    setLoading(true);
    await onSubmit({ amount: parseFloat(amount), details });
    setLoading(false);
  };

  if (!request) {
    console.error('❌ AcceptModal: No request provided');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Accept & Send Quote</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quote Amount (LKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="5000"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quote Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="I can complete this job within 2 hours. I'll bring all necessary tools and materials..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Decline Modal
const DeclineModal = ({ request, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(reason);
    setLoading(false);
  };

  if (!request) {
    console.error('❌ DeclineModal: No request provided');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Decline Request</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-600 text-sm">
            Are you sure you want to decline this booking request? You can optionally provide a reason.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Not available during this time period..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Declining...' : 'Decline Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerBookingRequests;
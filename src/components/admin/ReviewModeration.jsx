import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Clock
} from 'lucide-react';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [moderationNote, setModerationNote] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(
        `http://localhost:5001/admin/reviews?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.data.reviews || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateReview = async (reviewId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:5001/admin/reviews/${reviewId}/moderate`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status,
            moderationNote: moderationNote || undefined
          })
        }
      );

      if (!response.ok) throw new Error('Failed to moderate review');

      alert(`Review ${status} successfully`);
      setShowModal(false);
      setModerationNote('');
      fetchReviews();
    } catch (err) {
      alert('Error moderating review: ' + err.message);
    }
  };

  const openModerationModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.workerId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status, isFlagged) => {
    if (isFlagged) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center">
          <Flag className="w-3 h-3 mr-1" />
          Flagged
        </span>
      );
    }

    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="w-8 h-8 mr-3" />
          Review Moderation
        </h1>
        <p className="text-gray-600 mt-2">Review and moderate customer reviews</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {reviews.filter(r => r.moderationStatus === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Flagged</p>
          <p className="text-2xl font-bold text-red-600">
            {reviews.filter(r => r.isFlagged).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {reviews.filter(r => r.moderationStatus === 'approved').length}
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Customer Info */}
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {review.customerId?.name?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.customerId?.name || 'Customer'}
                      </h3>
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {review.rating}/5
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      Review for: <span className="font-medium">{review.workerId?.name || 'Worker'}</span>
                    </p>
                    
                    <p className="text-gray-700 mt-3">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 mt-3">
                        {review.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt={`Review ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Booking ID: {review.bookingId?.slice(-8)}</span>
                      {review.helpfulCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {review.helpfulCount} helpful
                          </span>
                        </>
                      )}
                    </div>

                    {review.isFlagged && review.flagReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Flagged for moderation</p>
                            <p className="text-sm text-red-600 mt-1">{review.flagReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {review.workerResponse && (
                      <div className="mt-3 p-3 bg-gray-50 border-l-4 border-indigo-500 rounded">
                        <p className="text-sm font-medium text-gray-900 mb-1">Worker Response:</p>
                        <p className="text-sm text-gray-700">{review.workerResponse.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end space-y-3">
                  {getStatusBadge(review.moderationStatus, review.isFlagged)}
                  
                  <button
                    onClick={() => openModerationModal(review)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reviews found</p>
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Review Details</h3>

            {/* Review Content */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer</p>
                <p className="font-medium">{selectedReview.customerId?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{selectedReview.customerId?.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Worker</p>
                <p className="font-medium">{selectedReview.workerId?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{selectedReview.workerId?.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Rating</p>
                <div className="flex items-center space-x-2">
                  {renderStars(selectedReview.rating)}
                  <span className="font-medium">{selectedReview.rating}/5</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Comment</p>
                <p className="text-gray-900">{selectedReview.comment}</p>
              </div>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReview.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Review ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedReview.isFlagged && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800 mb-1">Flag Reason</p>
                  <p className="text-sm text-red-600">{selectedReview.flagReason}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Moderation Note (Optional)</p>
                <textarea
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Add a note about your moderation decision..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setModerationNote('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerateReview(selectedReview._id, 'rejected')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleModerateReview(selectedReview._id, 'approved')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
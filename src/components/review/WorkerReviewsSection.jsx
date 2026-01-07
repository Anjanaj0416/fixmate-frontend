import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle, Image as ImageIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import reviewService from '../../services/reviewService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

/**
 * WorkerReviewsSection Component
 * Displays reviews for a worker on their profile page
 * Shows rating distribution, individual reviews with images, and helpful votes
 */
const WorkerReviewsSection = ({ workerId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (workerId) {
      fetchReviews();
    }
  }, [workerId, currentPage, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (ratingFilter) {
        filters.rating = ratingFilter;
      }

      const response = await reviewService.getWorkerReviews(
        workerId,
        currentPage,
        10,
        filters
      );

      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalReviews(response.data.total || 0);
        setAverageRating(response.data.averageRating || 0);
        setRatingDistribution(response.data.ratingDistribution || {});
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingFilter = (rating) => {
    setRatingFilter(rating === ratingFilter ? null : rating);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const distribution = {};
    for (let i = 5; i >= 1; i--) {
      const count = ratingDistribution[i] || 0;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      distribution[i] = { count, percentage };
    }

    return (
      <div className="space-y-2">
        {Object.entries(distribution).map(([rating, data]) => (
          <button
            key={rating}
            onClick={() => handleRatingFilter(parseInt(rating))}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
              ratingFilter === parseInt(rating)
                ? 'bg-indigo-50 border border-indigo-200'
                : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-medium text-gray-700 w-8">
              {rating}★
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all"
                style={{ width: `${data.percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">
              {data.count}
            </span>
          </button>
        ))}
      </div>
    );
  };

  if (loading && currentPage === 1) {
    return (
      <Card>
        <div className="p-8 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reviews & Ratings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-gray-600">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Rating Distribution
              </h3>
              {renderRatingDistribution()}
            </div>
          </div>

          {/* Active Filter */}
          {ratingFilter && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {ratingFilter}-star reviews
              </span>
              <button
                onClick={() => setRatingFilter(null)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-gray-500">
              {ratingFilter
                ? `No ${ratingFilter}-star reviews yet`
                : 'No reviews yet'}
            </div>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <div className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.customerId?.profileImage ? (
                      <img
                        src={review.customerId.profileImage}
                        alt={review.customerId.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {review.customerId?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.customerId?.fullName || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* Service Type */}
                {review.serviceType && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize">
                      {review.serviceType}
                    </span>
                  </div>
                )}

                {/* Review Comment */}
                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* Detailed Ratings */}
                {review.detailedRatings && Object.keys(review.detailedRatings).length > 0 && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Detailed Ratings
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(review.detailedRatings).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="flex items-center gap-1">
                              {renderStars(value)}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {review.images.map((img, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={img.imageUrl || img}
                            alt={`Review ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(img.imageUrl || img, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Would Recommend Badge */}
                {review.wouldRecommend && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      <ThumbsUp size={14} />
                      Recommends this worker
                    </span>
                  </div>
                )}

                {/* Worker Response */}
                {review.workerResponse && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageCircle size={16} className="text-blue-600 mt-1" />
                      <p className="text-sm font-medium text-blue-900">
                        Worker Response
                      </p>
                    </div>
                    <p className="text-sm text-blue-800 ml-6">
                      {review.workerResponse.message}
                    </p>
                    <p className="text-xs text-blue-600 ml-6 mt-1">
                      {formatDate(review.workerResponse.respondedAt)}
                    </p>
                  </div>
                )}

                {/* Review Actions */}
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                    <ThumbsUp size={16} />
                    <span>Helpful ({review.helpfulVotes || 0})</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-red-600">
                    <Flag size={16} />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

WorkerReviewsSection.propTypes = {
  workerId: PropTypes.string.isRequired
};

export default WorkerReviewsSection;
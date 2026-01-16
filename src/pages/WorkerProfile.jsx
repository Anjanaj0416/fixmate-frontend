import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Award,
  Shield,
  Heart,
  Send,
  CheckCircle,
  User,
  ThumbsUp
} from 'lucide-react';
import apiService from '../services/apiService';
import reviewService from '../services/reviewService';

const WorkerProfile = () => {
  const { workerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);

  // Review states
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);

  const quoteRequestId = location.state?.quoteRequestId;
  const returnTo = location.state?.returnTo;
  const returnState = location.state?.returnState;

  useEffect(() => {
    if (workerId) {
      fetchWorkerProfile();
      fetchWorkerReviews(1, null);
      checkIfQuoteAlreadySent();
    }
  }, [workerId]);

  // Enhanced fetchWorkerReviews function with better error handling
  // Replace the existing fetchWorkerReviews function in WorkerProfile.jsx

  const fetchWorkerReviews = async (page = 1, rating = null) => {
    try {
      console.log('📊 Fetching reviews for worker:', workerId, 'page:', page, 'rating filter:', rating);

      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMoreReviews(true);
      }

      const filters = rating ? { rating } : {};
      console.log('📊 Review filters:', filters);

      const response = await reviewService.getWorkerReviews(workerId, page, 10, filters);
      console.log('📊 Reviews API response:', response);

      if (response && response.success && response.data) {
        const newReviews = response.data.reviews || [];

        console.log(`📊 Reviews received: ${newReviews.length}`);
        console.log('📊 Total reviews:', response.data.total);
        console.log('📊 Rating distribution:', response.data.ratingDistribution);

        if (page === 1) {
          setReviews(newReviews);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }

        setTotalReviews(response.data.total || 0);
        setHasMoreReviews(page < (response.data.totalPages || 1));
        setReviewPage(page);

        if (response.data.ratingDistribution) {
          const stats = {
            distribution: response.data.ratingDistribution,
            total: response.data.total,
            average: calculateAverageFromDistribution(response.data.ratingDistribution, response.data.total)
          };
          console.log('📊 Review stats calculated:', stats);
          setReviewStats(stats);
        } else {
          console.warn('⚠️ No rating distribution in response');
        }
      } else {
        console.warn('⚠️ Reviews API returned unexpected format:', response);
        // Set empty state when no data
        setReviews([]);
        setTotalReviews(0);
        setReviewStats(null);
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      // Set empty state on error
      setReviews([]);
      setTotalReviews(0);
      setReviewStats(null);

      // Log specific error types
      if (error.response?.status === 404) {
        console.log('ℹ️ Reviews endpoint returned 404 - worker may have no reviews yet');
      } else if (error.response?.status === 500) {
        console.error('❌ Server error fetching reviews - check backend logs');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('❌ Network error - check if backend is running');
      }
    } finally {
      setLoading(false);
      setLoadingMoreReviews(false);
    }
  };

  const calculateAverageFromDistribution = (distribution, total) => {
    if (!distribution || distribution.length === 0 || total === 0) return 0;
    const sum = distribution.reduce((acc, item) => acc + (item._id * item.count), 0);
    return (sum / total).toFixed(1);
  };

  const handleFilterByRating = (rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    setReviewPage(1);
    fetchWorkerReviews(1, newRating);
  };

  const handleLoadMoreReviews = () => {
    fetchWorkerReviews(reviewPage + 1, selectedRating);
  };

  const checkIfQuoteAlreadySent = async () => {
    if (!quoteRequestId) return;

    try {
      const response = await apiService.get(`/bookings/${quoteRequestId}`);
      const booking = response.data?.data || response.data;

      if (booking && booking.sentToWorkers && Array.isArray(booking.sentToWorkers)) {
        const wasSent = booking.sentToWorkers.some(
          id => id.toString() === workerId.toString()
        );

        setAlreadySent(wasSent);
        if (wasSent) {
          setSent(true);
        }
      }
    } catch (error) {
      console.error('❌ Error checking quote status:', error);
    }
  };

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiService.get(`/workers/${workerId}/profile`);

      let workerData = null;
      let jobsCount = 0;

      if (response.data) {
        if (response.data.data && response.data.data.worker) {
          workerData = response.data.data.worker;
          jobsCount = response.data.data.completedJobs || 0;
        } else if (response.data.worker) {
          workerData = response.data.worker;
          jobsCount = response.data.completedJobs || 0;
        } else {
          workerData = response.data;
          jobsCount = 0;
        }
      }

      if (!workerData) {
        throw new Error('Worker data not found in response');
      }

      setWorker(workerData);
      setCompletedJobs(jobsCount);

    } catch (error) {
      console.error('❌ Error fetching worker profile:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load worker profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    if (!quoteRequestId) {
      alert('No quote request found. Please create a quote request first.');
      return;
    }

    if (alreadySent || sent) {
      alert('Quote request has already been sent to this worker.');
      return;
    }

    try {
      setSending(true);
      setError('');

      const response = await apiService.post(
        `/bookings/${quoteRequestId}/send-to-worker`,
        { workerId: workerId }
      );

      if (response.data?.success) {
        setSent(true);
        setAlreadySent(true);

        setTimeout(() => {
          if (returnTo) {
            navigate(returnTo, { state: returnState });
          } else {
            navigate('/customer/bookings');
          }
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error sending quote:', error);

      if (error.response?.data?.message?.includes('already sent')) {
        setAlreadySent(true);
        setSent(true);
        alert('This quote request has already been sent to this worker.');
      } else {
        setError(error.response?.data?.message || 'Failed to send quote request');
        alert(error.response?.data?.message || 'Failed to send quote request. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleGoBack = () => {
    if (returnTo) {
      navigate(returnTo, { state: returnState });
    } else {
      navigate(-1);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      setIsFavorite(!isFavorite);
      console.log('Favorite toggled:', !isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorite(!isFavorite);
    }
  };

  const handleContact = () => {
    if (!worker) {
      alert('Worker information not available. Please try again.');
      return;
    }

    let chatUserId;

    if (worker.userId) {
      if (typeof worker.userId === 'object' && worker.userId !== null) {
        chatUserId = worker.userId._id || worker.userId.id;
      } else if (typeof worker.userId === 'string') {
        chatUserId = worker.userId;
      }
    }

    if (!chatUserId) {
      chatUserId = workerId;
    }

    if (!chatUserId) {
      alert('Unable to open chat. User information is incomplete.');
      return;
    }

    navigate(`/customer/chat/${chatUserId}`);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading worker profile...</p>
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            <p className="font-medium">{error || 'Worker not found'}</p>
          </div>
          <button
            onClick={handleGoBack}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>

            <button
              onClick={handleFavoriteToggle}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart
                size={24}
                className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {worker.userId?.profileImage ? (
                    <img
                      src={worker.userId.profileImage}
                      alt={worker.userId?.fullName || 'Worker'}
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-indigo-100">
                      {getInitials(worker.userId?.fullName || 'Worker')}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {worker.userId?.fullName || 'Name not available'}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Briefcase size={16} />
                        <span className="capitalize">
                          {worker.serviceCategories?.[0] || 'Service Provider'}
                        </span>
                      </div>
                    </div>

                    {worker.isVerified && (
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        <Shield size={16} />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < Math.round(worker.rating || 0)  // ✅ Changed to worker.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                      <span className="ml-2 text-gray-700 font-medium">
                        {(worker.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({worker.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {worker.serviceAreas?.[0] && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>
                          {worker.serviceAreas[0].city}, {worker.serviceAreas[0].district}
                        </span>
                      </div>
                    )}
                    {worker.experience && (
                      <div className="flex items-center gap-1">
                        <Award size={16} />
                        <span>{worker.experience} years experience</span>
                      </div>
                    )}
                    {completedJobs > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={16} />
                        <span>{completedJobs} jobs completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {worker.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed">{worker.bio}</p>
                </div>
              )}

              {worker.specializations && worker.specializations.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {worker.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {worker.skills && worker.skills.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {worker.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {worker.serviceAreas && worker.serviceAreas.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Areas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {worker.serviceAreas.map((area, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg"
                      >
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {area.city}
                          {area.district && area.city !== area.district && `, ${area.district}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ ENHANCED Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Reviews ({totalReviews})
                </h3>
              </div>

              {/* Rating Statistics */}
              {reviewStats && reviewStats.distribution && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {reviewStats.average}
                    </span>
                    <div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={
                              i < Math.round(reviewStats.average)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        Based on {totalReviews} reviews
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const ratingData = reviewStats.distribution.find(d => d._id === rating);
                      const count = ratingData?.count || 0;
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                      return (
                        <button
                          key={rating}
                          onClick={() => handleFilterByRating(rating)}
                          className={`w-full flex items-center gap-3 text-sm hover:bg-white p-2 rounded transition-colors ${selectedRating === rating ? 'bg-white ring-2 ring-indigo-500' : ''
                            }`}
                        >
                          <span className="text-gray-700 w-12 text-right">{rating} star</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-600 w-12">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedRating && (
                    <button
                      onClick={() => handleFilterByRating(null)}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {review.customerId?.profileImage ? (
                            <img
                              src={review.customerId.profileImage}
                              alt={review.customerId.fullName || 'Customer'}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User size={20} className="text-gray-500" />
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
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                      )}

                      {review.images && review.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {review.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={img.imageUrl || img}
                                alt={img.caption || `Review image ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                onClick={() => window.open(img.imageUrl || img, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {review.wouldRecommend && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          <ThumbsUp size={14} />
                          <span>Recommends</span>
                        </div>
                      )}

                      {review.workerResponse && (
                        <div className="mt-4 pl-6 border-l-2 border-indigo-200">
                          <div className="bg-indigo-50 rounded-lg p-4">
                            <p className="text-sm font-semibold text-indigo-900 mb-2">
                              Response from {worker.userId?.fullName}
                            </p>
                            <p className="text-sm text-gray-700">
                              {review.workerResponse.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(review.workerResponse.respondedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {hasMoreReviews && (
                    <div className="text-center pt-4">
                      <button
                        onClick={handleLoadMoreReviews}
                        disabled={loadingMoreReviews}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {loadingMoreReviews ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                            Loading...
                          </span>
                        ) : (
                          'Load More Reviews'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {selectedRating
                      ? `No ${selectedRating}-star reviews yet`
                      : 'No reviews yet'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quote Request Card */}
            {quoteRequestId && (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Quote Request</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {worker.hourlyRate ? formatCurrency(worker.hourlyRate) : 'On request'}
                    </p>
                    {worker.hourlyRate && <p className="text-xs text-gray-500">per hour</p>}
                  </div>

                  {worker.availability !== undefined && (
                    <div className={`flex items-center gap-2 ${worker.availability ? 'text-green-600' : 'text-gray-500'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${worker.availability ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      <span className="text-sm font-medium">
                        {worker.availability ? 'Available now' : 'Currently unavailable'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSendQuote}
                  disabled={sending || sent || alreadySent || !worker.availability}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${sent || alreadySent
                    ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (sent || alreadySent) ? (
                    <>
                      <CheckCircle size={20} />
                      <span>Quote Sent</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Quote Request</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  {(sent || alreadySent)
                    ? 'This worker has received your quote request'
                    : 'This worker will receive your quote request and respond with availability and pricing.'}
                </p>
              </div>
            )}

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

              <div className="space-y-3">
                {worker.userId?.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{worker.userId.phoneNumber}</span>
                  </div>
                )}
                {worker.userId?.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="break-all">{worker.userId.email}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleContact}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MessageSquare size={18} />
                <span>Send Message</span>
              </button>
            </div>

            {/* Member Since Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {worker.memberSince
                      ? new Date(worker.memberSince).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })
                      : worker.createdAt
                        ? new Date(worker.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })
                        : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
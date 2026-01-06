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
  CheckCircle
} from 'lucide-react';
import apiService from '../services/apiService';

/**
 * Worker Profile Component - FIXED VERSION
 * ✅ FIXED: handleContact() now properly extracts userId for chat navigation
 * ✅ FIXED: Handles both object and string formats for worker.userId
 * ✅ FIXED: Added comprehensive error handling and logging
 */
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
  
  // Quote request states
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);

  // Get state from navigation
  const quoteRequestId = location.state?.quoteRequestId;
  const returnTo = location.state?.returnTo;
  const returnState = location.state?.returnState;

  useEffect(() => {
    if (workerId) {
      fetchWorkerProfile();
      checkIfQuoteAlreadySent();
    }
  }, [workerId]);

  const checkIfQuoteAlreadySent = async () => {
    if (!quoteRequestId) return;

    try {
      console.log('🔍 Checking if quote already sent:', { quoteRequestId, workerId });
      
      const response = await apiService.get(`/bookings/${quoteRequestId}`);
      const booking = response.data?.data || response.data;

      console.log('📋 Booking data:', booking);

      if (booking && booking.sentToWorkers && Array.isArray(booking.sentToWorkers)) {
        const wasSent = booking.sentToWorkers.some(
          id => id.toString() === workerId.toString()
        );
        
        console.log('✅ Was sent?', wasSent);
        setAlreadySent(wasSent);
        if (wasSent) {
          setSent(true);
        }
      }
    } catch (error) {
      console.error('❌ Error checking quote status:', error);
      // Don't show error to user, just log it
    }
  };

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📥 Fetching worker profile:', workerId);

      const response = await apiService.get(`/workers/${workerId}/profile`);
      console.log('📦 API Response:', response);

      let workerData = null;
      let reviewsData = [];
      let jobsCount = 0;

      // Handle different response structures
      if (response.data) {
        if (response.data.data && response.data.data.worker) {
          // Structure: { data: { worker, reviews, completedJobs } }
          workerData = response.data.data.worker;
          reviewsData = response.data.data.reviews || [];
          jobsCount = response.data.data.completedJobs || 0;
        } else if (response.data.worker) {
          // Structure: { worker, reviews, completedJobs }
          workerData = response.data.worker;
          reviewsData = response.data.reviews || [];
          jobsCount = response.data.completedJobs || 0;
        } else {
          // Direct worker data
          workerData = response.data;
          reviewsData = [];
          jobsCount = 0;
        }
      }

      console.log('✅ Parsed worker data:', workerData);
      console.log('📝 Reviews:', reviewsData);
      console.log('💼 Completed jobs:', jobsCount);

      if (!workerData) {
        throw new Error('Worker data not found in response');
      }

      setWorker(workerData);
      setReviews(reviewsData);
      setCompletedJobs(jobsCount);

    } catch (error) {
      console.error('❌ Error fetching worker profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
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

    // Prevent sending if already sent
    if (alreadySent || sent) {
      alert('Quote request has already been sent to this worker.');
      return;
    }

    try {
      setSending(true);
      setError('');

      console.log('📤 Sending quote to worker:', {
        quoteRequestId,
        workerId
      });

      const response = await apiService.post(
        `/bookings/${quoteRequestId}/send-to-worker`,
        { workerId: workerId }
      );

      console.log('✅ Quote sent successfully:', response.data);
      setSent(true);
      setAlreadySent(true);

      // Show success message briefly
      setTimeout(() => {
        // Navigate back to worker selection or bookings page
        if (returnTo) {
          navigate(returnTo, { state: returnState });
        } else {
          navigate('/customer/bookings');
        }
      }, 1500);

    } catch (error) {
      console.error('❌ Error sending quote:', error);
      
      // Handle duplicate sending error gracefully
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
      // TODO: Implement favorite API call
      console.log('Favorite toggled:', !isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorite(!isFavorite); // Revert on error
    }
  };

  /**
   * ✅ FIXED: Handle Send Message button click
   * Properly extracts worker's userId for chat navigation
   */
  const handleContact = () => {
    console.log('💬 Send Message clicked');
    console.log('📊 Worker data:', worker);
    
    if (!worker) {
      alert('Worker information not available. Please try again.');
      return;
    }

    // ✅ CRITICAL: Extract userId - handle both object and string formats
    let chatUserId;
    
    if (worker.userId) {
      if (typeof worker.userId === 'object' && worker.userId !== null) {
        // userId is an object, extract _id or id
        chatUserId = worker.userId._id || worker.userId.id;
        console.log('✅ Extracted userId from object:', chatUserId);
      } else if (typeof worker.userId === 'string') {
        // userId is already a string
        chatUserId = worker.userId;
        console.log('✅ Using userId string directly:', chatUserId);
      }
    }

    // Fallback: try using workerId if userId extraction failed
    if (!chatUserId) {
      console.warn('⚠️ Could not extract userId, trying workerId as fallback');
      chatUserId = workerId;
    }

    if (!chatUserId) {
      console.error('❌ No valid user ID found for chat');
      alert('Unable to open chat. User information is incomplete.');
      return;
    }

    console.log('✅ Navigating to chat with userId:', chatUserId);
    const chatPath = `/customer/chat/${chatUserId}`;
    console.log('🔗 Chat path:', chatPath);
    
    // Navigate to chat page
    navigate(chatPath);
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

  if (loading) {
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
                {/* Avatar */}
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

                {/* Info */}
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

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < Math.round(worker.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                      <span className="ml-2 text-gray-700 font-medium">
                        {(worker.averageRating || 0).toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({worker.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Location & Experience */}
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

              {/* Bio */}
              {worker.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed">{worker.bio}</p>
                </div>
              )}

              {/* Specializations */}
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

              {/* Skills */}
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

              {/* Service Areas */}
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

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h3>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {getInitials(review.customerName || 'Anonymous')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.customerName || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 ml-13">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
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
                    <div className={`flex items-center gap-2 ${
                      worker.availability ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        worker.availability ? 'bg-green-500' : 'bg-gray-400'
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
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    sent || alreadySent
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

              {/* ✅ FIXED: Send Message button with proper onClick handler */}
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
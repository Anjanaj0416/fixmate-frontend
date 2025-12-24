import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Calendar,
  Award,
  Send,
  User as UserIcon,
  Briefcase,
  Shield,
  Clock,
  DollarSign,
  Heart,
  MessageCircle
} from 'lucide-react';
import apiService from '../services/apiService';

/**
 * WorkerProfile Component
 * Displays detailed worker profile for customers
 * Allows customers to send quote requests and view worker details
 */
const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { quoteRequestId, returnTo, returnState } = location.state || {};

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (workerId) {
      fetchWorkerProfile();
    }
  }, [workerId]);

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📋 Fetching worker profile:', workerId);
      console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5001');

      const response = await apiService.get(`/workers/${workerId}/profile`);
      
      console.log('📦 Full API Response:', response);
      console.log('📊 Response data structure:', JSON.stringify(response.data, null, 2));

      // ✅ CRITICAL FIX: Handle different possible response structures
      let workerData = null;
      let reviewsData = [];
      let jobsCount = 0;

      if (response.data) {
        // Check different possible response structures
        if (response.data.success && response.data.data) {
          // Structure: { success: true, data: { worker, reviews, completedJobs } }
          workerData = response.data.data.worker;
          reviewsData = response.data.data.reviews || [];
          jobsCount = response.data.data.completedJobs || 0;
        } else if (response.data.data) {
          // Structure: { data: { worker, reviews, completedJobs } }
          workerData = response.data.data.worker || response.data.data;
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
      setError(error.response?.data?.message || 'Failed to send quote request');
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

  const handleContact = () => {
    // TODO: Navigate to chat or show contact modal
    navigate(`/customer/chat/${workerId}`);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading worker profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No worker found
  if (!worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Worker not found</h2>
          <p className="text-gray-600 mb-6">The worker profile you're looking for doesn't exist.</p>
          <button
            onClick={handleGoBack}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {worker.userId?.profileImage || worker.profileImage ? (
                    <img
                      src={worker.userId?.profileImage || worker.profileImage}
                      alt={worker.userId?.fullName || worker.fullName}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {getInitials(worker.userId?.fullName || worker.fullName)}
                    </div>
                  )}
                  {worker.isVerified && (
                    <div className="flex items-center justify-center mt-2">
                      <Shield className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">Verified</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {worker.userId?.fullName || worker.fullName || 'Unknown Worker'}
                      </h1>
                      
                      {/* Service Categories */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(worker.serviceCategories || []).map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      {/* Location & Experience */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {worker.serviceAreas && worker.serviceAreas.length > 0 && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {worker.serviceAreas[0].city || worker.serviceAreas[0].district}
                          </span>
                        )}
                        {worker.experience && (
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {worker.experience} years experience
                          </span>
                        )}
                        {worker.availability !== undefined && (
                          <span className={`flex items-center ${worker.availability ? 'text-green-600' : 'text-gray-500'}`}>
                            <Clock className="w-4 h-4 mr-1" />
                            {worker.availability ? 'Available' : 'Unavailable'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleFavoriteToggle}
                        className={`p-2 rounded-lg transition-colors ${
                          isFavorite
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={handleContact}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Send message"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                      <span className="text-lg font-semibold text-gray-900">
                        {worker.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-gray-600 ml-2">
                        ({worker.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{completedJobs}</span> jobs completed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            {worker.bio && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed">{worker.bio}</p>
              </div>
            )}

            {/* Skills & Specializations */}
            {(worker.specializations?.length > 0 || worker.skills?.length > 0) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Specializations</h2>
                
                {worker.specializations?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {worker.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {worker.skills?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Service Areas */}
            {worker.serviceAreas?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Areas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {worker.serviceAreas.map((area, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {area.town || area.city || area.district}
                        </div>
                        <div className="text-sm text-gray-600">
                          {[area.city, area.district].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h2>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {review.customerId?.profileImage ? (
                              <img
                                src={review.customerId.profileImage}
                                alt={review.customerId.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 font-medium">
                                {getInitials(review.customerId?.fullName || 'Anonymous')}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {review.customerId?.fullName || 'Anonymous'}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
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
                  disabled={sending || sent || !worker.availability}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    sent
                      ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : sent ? (
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
                  This worker will receive your quote request and respond with availability and pricing.
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
                <MessageCircle className="w-5 h-5" />
                Send Message
              </button>
            </div>

            {/* Member Since Card */}
            {worker.userId?.createdAt && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Member Since</span>
                </div>
                <p className="text-lg text-gray-900">
                  {new Date(worker.userId.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Certifications */}
            {worker.certifications?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                </div>
                <div className="space-y-3">
                  {worker.certifications.map((cert, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">{cert.name}</div>
                        {cert.issuedBy && (
                          <div className="text-sm text-gray-600">{cert.issuedBy}</div>
                        )}
                        {cert.year && (
                          <div className="text-xs text-gray-500">{cert.year}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
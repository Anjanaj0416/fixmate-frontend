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
  User as UserIcon
} from 'lucide-react';
import apiService from '../services/apiService';

/**
 * WorkerProfile Component
 * Displays detailed worker profile including reviews, ratings, and completed jobs
 * Allows customers to send quote requests
 */
const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { quoteRequestId, returnTo, returnState } = location.state || {};

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkerProfile();
  }, [workerId]);

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📋 Fetching worker profile:', workerId);

      const response = await apiService.get(`/workers/${workerId}/profile`);
      
      console.log('✅ Worker profile loaded');
      setWorker(response.data.data.worker);

    } catch (error) {
      console.error('❌ Error fetching worker profile:', error);
      setError(error.response?.data?.message || 'Failed to load worker profile');
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

      console.log('📤 Sending quote to worker:', workerId);

      await apiService.post(`/bookings/${quoteRequestId}/send-to-worker`, {
        workerId: workerId
      });

      console.log('✅ Quote sent successfully');
      setSent(true);

      // Show success message
      alert('Quote request sent successfully!');

      // Navigate back after a short delay
      setTimeout(() => {
        if (returnTo) {
          navigate(returnTo, { state: returnState });
        } else {
          navigate('/customer/bookings');
        }
      }, 1500);

    } catch (error) {
      console.error('❌ Error sending quote:', error);
      setError(error.response?.data?.message || 'Failed to send quote');
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo, { state: returnState });
    } else {
      navigate(-1);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={16} className="text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={16} className="text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={16} className="text-gray-300" />
      );
    }

    return stars;
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

  if (error && !worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <UserIcon size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load profile
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!worker) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Worker Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <div className="relative">
                  {worker.userId?.profileImage ? (
                    <img
                      src={worker.userId.profileImage}
                      alt={worker.userId?.fullName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon size={48} className="text-gray-400" />
                    </div>
                  )}
                  
                  {worker.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </div>

                {/* Worker Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {worker.userId?.fullName || 'Worker'}
                      </h1>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          {renderStars(worker.averageRating || 0)}
                        </div>
                        <span className="text-gray-600">
                          {(worker.averageRating || 0).toFixed(1)} ({worker.totalReviews || 0} reviews)
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span>{worker.completedBookingsCount || 0} completed jobs</span>
                        </div>
                        {worker.experience && (
                          <div className="flex items-center gap-2">
                            <Award size={16} className="text-indigo-600" />
                            <span>{worker.experience} years experience</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-2">
                    {worker.userId?.phoneNumber && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} />
                        <span>{worker.userId.phoneNumber}</span>
                      </div>
                    )}
                    {worker.userId?.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        <span>{worker.userId.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            {worker.bio && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 whitespace-pre-line">{worker.bio}</p>
              </div>
            )}

            {/* Skills */}
            {worker.skills && worker.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {worker.serviceAreas && worker.serviceAreas.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Areas</h2>
                <div className="space-y-2">
                  {worker.serviceAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{area.town}, {area.district}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reviews ({worker.reviews?.length || 0})
              </h2>

              {worker.reviews && worker.reviews.length > 0 ? (
                <div className="space-y-6">
                  {worker.reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        {/* Reviewer Image */}
                        <div className="flex-shrink-0">
                          {review.customerId?.profileImage ? (
                            <img
                              src={review.customerId.profileImage}
                              alt={review.customerId.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {review.customerId?.fullName || 'Customer'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {review.comment && (
                            <p className="text-gray-700 mt-2">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Send Quote Card */}
            {quoteRequestId && (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Send Quote Request
                </h3>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSendQuote}
                  disabled={sending || sent}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
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
                  This worker will receive your quote request and respond with their availability and pricing.
                </p>
              </div>
            )}

            {/* Availability Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
              
              <div className={`flex items-center gap-2 ${worker.availability ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-3 h-3 rounded-full ${worker.availability ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-medium">
                  {worker.availability ? 'Available for work' : 'Currently unavailable'}
                </span>
              </div>

              {worker.memberSince && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm">
                      Member since {new Date(worker.memberSince).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
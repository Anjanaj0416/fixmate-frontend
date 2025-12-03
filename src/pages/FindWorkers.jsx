import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Send, User, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import apiService from '../services/apiService';

/**
 * FindWorkers Component
 * Displays available workers based on quote request location and service type
 * Allows customers to view worker profiles and send quote requests
 */
const FindWorkers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quoteRequestId, serviceType, location: serviceLocation, category } = location.state || {};

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState(null); // Track which worker quote is being sent to
  const [sentTo, setSentTo] = useState([]); // Track which workers have received the quote
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quoteRequestId || !serviceType || !serviceLocation) {
      navigate('/customer/service-selection');
      return;
    }

    fetchWorkers();
  }, [quoteRequestId, serviceType, serviceLocation]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Searching for workers...', {
        serviceType,
        location: serviceLocation
      });

      // ✅ Fetch workers by service type and location
      const response = await apiService.get('/workers/search', {
        params: {
          serviceType: serviceType,
          district: serviceLocation.district,
          town: serviceLocation.town,
          // Optional: Add more filters
          availability: true,
          verified: true
        }
      });

      console.log('✅ Workers found:', response.data.data.workers.length);
      setWorkers(response.data.data.workers || []);

    } catch (error) {
      console.error('❌ Error fetching workers:', error);
      setError(error.response?.data?.message || 'Failed to load workers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async (workerId) => {
    try {
      setSendingTo(workerId);
      setError('');

      console.log('📤 Sending quote to worker:', workerId);

      // ✅ Send quote request to specific worker
      const response = await apiService.post(`/bookings/${quoteRequestId}/send-to-worker`, {
        workerId: workerId
      });

      console.log('✅ Quote sent successfully');

      // Add worker to sent list
      setSentTo(prev => [...prev, workerId]);

      // Show success message (you can use a toast notification here)
      alert('Quote request sent successfully!');

    } catch (error) {
      console.error('❌ Error sending quote:', error);
      setError(error.response?.data?.message || 'Failed to send quote. Please try again.');
    } finally {
      setSendingTo(null);
    }
  };

  const handleViewProfile = (workerId) => {
    navigate(`/customer/worker-profile/${workerId}`, {
      state: {
        quoteRequestId,
        returnTo: '/customer/find-workers',
        returnState: location.state
      }
    });
  };

  const handleBack = () => {
    navigate('/customer/bookings');
  };

  // Helper function to get worker rating display
  const getRatingDisplay = (worker) => {
    const rating = worker.averageRating || 0;
    const reviewCount = worker.totalReviews || 0;
    
    return {
      rating: rating.toFixed(1),
      count: reviewCount,
      stars: Math.round(rating)
    };
  };

  // Helper function to format distance (if available)
  const formatDistance = (distance) => {
    if (!distance) return null;
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Available Workers</h1>
          <p className="text-gray-600 mt-2">
            {category?.name} in {serviceLocation?.town}, {serviceLocation?.district}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Finding workers near you...</p>
          </div>
        )}

        {/* No Workers Found */}
        {!loading && workers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <User size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any workers in {serviceLocation?.town} for {category?.name}.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Try searching in nearby towns or post your request to our worker network.
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View My Bookings
            </button>
          </div>
        )}

        {/* Workers Grid */}
        {!loading && workers.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Found {workers.length} worker{workers.length !== 1 ? 's' : ''} near you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map((worker) => {
                const ratingDisplay = getRatingDisplay(worker);
                const isSent = sentTo.includes(worker._id);
                const isSending = sendingTo === worker._id;

                return (
                  <div
                    key={worker._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Worker Image */}
                    <div className="relative h-48 bg-gray-200">
                      {worker.profileImage ? (
                        <img
                          src={worker.profileImage}
                          alt={worker.userId?.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={64} className="text-gray-400" />
                        </div>
                      )}
                      
                      {/* Verified Badge */}
                      {worker.isVerified && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle size={12} />
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Worker Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {worker.userId?.fullName || 'Worker'}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900">
                            {ratingDisplay.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({ratingDisplay.count} review{ratingDisplay.count !== 1 ? 's' : ''})
                        </span>
                      </div>

                      {/* Location */}
                      {worker.serviceAreas && worker.serviceAreas.length > 0 && (
                        <div className="flex items-start gap-2 mb-3">
                          <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-600">
                            {worker.serviceAreas.slice(0, 2).map(area => area.town).join(', ')}
                            {worker.serviceAreas.length > 2 && ` +${worker.serviceAreas.length - 2} more`}
                          </p>
                        </div>
                      )}

                      {/* Experience */}
                      {worker.experience && (
                        <p className="text-sm text-gray-600 mb-3">
                          {worker.experience} years experience
                        </p>
                      )}

                      {/* Skills */}
                      {worker.skills && worker.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {worker.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {worker.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{worker.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewProfile(worker._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Eye size={16} />
                          <span className="text-sm font-medium">View Profile</span>
                        </button>

                        <button
                          onClick={() => handleSendQuote(worker._id)}
                          disabled={isSent || isSending}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isSent
                              ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {isSending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span className="text-sm font-medium">Sending...</span>
                            </>
                          ) : isSent ? (
                            <>
                              <CheckCircle size={16} />
                              <span className="text-sm font-medium">Sent</span>
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              <span className="text-sm font-medium">Send Quote</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> View worker profiles to see their previous work, customer reviews, 
                and detailed ratings before sending your quote request. Workers will receive a notification 
                and can respond with their availability and pricing.
              </p>
            </div>

            {/* Sent Quotes Summary */}
            {sentTo.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Quote request sent to {sentTo.length} worker{sentTo.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      You can track responses in your bookings page. Workers typically respond within 24 hours.
                    </p>
                    <button
                      onClick={handleBack}
                      className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 underline"
                    >
                      Go to My Bookings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindWorkers;
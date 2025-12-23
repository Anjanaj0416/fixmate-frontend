import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Send, User, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import apiService from '../services/apiService';

// Note: This component does NOT use WorkerList to avoid "process is not defined" errors

/**
 * FindWorkers Component
 * Displays available workers based on quote request location and service type
 * Allows customers to view worker profiles and send quote requests
 * 
 * ✅ FIXED: Properly passes serviceType and location to API
 * ✅ FIXED: Handles response data structure correctly
 */
function FindWorkers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quoteRequestId, serviceType, location: serviceLocation, category } = location.state || {};

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState(null);
  const [sentTo, setSentTo] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quoteRequestId || !serviceType || !serviceLocation) {
      console.error('❌ Missing required data:', { quoteRequestId, serviceType, serviceLocation });
      navigate('/customer/service-selection');
      return;
    }

    fetchWorkers();
  }, [quoteRequestId, serviceType, serviceLocation]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Searching for workers with:', {
        serviceType,
        district: serviceLocation?.district,
        town: serviceLocation?.town,
        location: serviceLocation
      });

      // ✅ FIXED: Properly construct params object
      const params = {
        serviceType: serviceType,
        district: serviceLocation?.district,
        town: serviceLocation?.town,
        availability: true,
        verified: true
      };

      console.log('📤 API Request params:', params);

      // ✅ Use apiService with params
      const response = await apiService.get('/workers/search', { params });

      console.log('✅ API Response:', response);

      // ✅ FIXED: Handle response structure correctly
      const workersData = response?.data?.data?.workers || response?.data?.workers || [];
      
      console.log(`✅ Found ${workersData.length} workers`);
      setWorkers(workersData);

      if (workersData.length === 0) {
        setError(`No workers found for ${serviceType} in ${serviceLocation?.town}, ${serviceLocation?.district}. Try expanding your search area.`);
      }

    } catch (error) {
      console.error('❌ Error fetching workers:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load workers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async (workerId) => {
    try {
      setSendingTo(workerId);
      setError('');

      console.log('📤 Sending quote to worker:', workerId);

      const response = await apiService.post(`/bookings/${quoteRequestId}/send-to-worker`, {
        workerId: workerId
      });

      console.log('✅ Quote sent successfully');

      setSentTo(prev => [...prev, workerId]);
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

  const getRatingDisplay = (worker) => {
    const rating = worker.averageRating || 0;
    const reviewCount = worker.totalReviews || 0;
    
    return {
      rating: rating.toFixed(1),
      count: reviewCount,
      stars: Math.round(rating)
    };
  };

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
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Available Workers</h1>
          <p className="text-gray-600 mt-2">
            {serviceType} in {serviceLocation?.town}, {serviceLocation?.district}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">Unable to find workers</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
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

        {/* Workers List */}
        {!loading && workers.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workers.map((worker) => {
              const ratingData = getRatingDisplay(worker);
              const distance = formatDistance(worker.distance);
              const isSent = sentTo.includes(worker._id);
              const isSending = sendingTo === worker._id;

              return (
                <div
                  key={worker._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Worker Image */}
                  <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                    {worker.userId?.profileImage ? (
                      <img
                        src={worker.userId.profileImage}
                        alt={worker.userId?.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={64} className="text-white opacity-50" />
                      </div>
                    )}
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
                      {worker.userId?.fullName || 'Unknown Worker'}
                    </h3>
                    
                    {/* Service Categories */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {worker.serviceCategories?.slice(0, 2).map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                      {worker.serviceCategories?.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{worker.serviceCategories.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-gray-900">{ratingData.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({ratingData.count} {ratingData.count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    {/* Location */}
                    {distance && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin size={14} />
                        <span>{distance}</span>
                      </div>
                    )}

                    {/* Service Areas */}
                    {worker.serviceAreas && worker.serviceAreas.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Service Areas:</p>
                        <p className="text-sm text-gray-700">
                          {worker.serviceAreas.map(area => area.town).join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(worker._id)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Profile
                      </button>
                      
                      {isSent ? (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <CheckCircle size={16} />
                          Sent
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendQuote(worker._id)}
                          disabled={isSending}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              Send Quote
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Workers Found */}
        {!loading && workers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <User size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any workers for {serviceType} in {serviceLocation?.town}, {serviceLocation?.district}.
              This might be because:
            </p>
            <ul className="text-left text-gray-600 mb-6 max-w-md mx-auto space-y-2">
              <li>• No workers serve this area yet</li>
              <li>• All workers are currently unavailable</li>
              <li>• Try selecting a different location or service type</li>
            </ul>
            <button
              onClick={() => navigate('/customer/quote-request', { state: location.state })}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Modify Search Criteria
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindWorkers;
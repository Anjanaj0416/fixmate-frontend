import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Award, DollarSign, Clock, Send, Eye, Filter, ArrowLeft } from 'lucide-react';
import apiService from '../services/apiService'; // ✅ NEW IMPORT

/**
 * Worker Selection Page
 * Shows filtered workers based on quote request details
 * Allows customer to view profiles and send quote requests
 * 
 * ✅ FIXED: Uses apiService for automatic token refresh
 * ✅ FIXED: Better error handling
 * ✅ FIXED: Improved worker filtering and sorting
 */
const WorkerSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quoteRequestId, serviceType, location: customerLocation } = location.state || {};

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [sendingQuotes, setSendingQuotes] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'distance', // distance, rating, price
    maxDistance: 10, // km
    minRating: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!quoteRequestId || !serviceType || !customerLocation) {
      console.error('Missing required data:', { quoteRequestId, serviceType, customerLocation });
      navigate('/customer/dashboard');
      return;
    }
    fetchWorkers();
  }, [filters, quoteRequestId, serviceType, customerLocation]);

  // ✅ UPDATED: Use apiService instead of fetch
  const fetchWorkers = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Fetching workers:', {
        serviceType,
        location: customerLocation,
        filters
      });

      // Validate customer location
      if (!customerLocation || !customerLocation.coordinates) {
        throw new Error('Customer location is required');
      }

      const params = new URLSearchParams({
        serviceType,
        latitude: customerLocation.coordinates.latitude,
        longitude: customerLocation.coordinates.longitude,
        maxDistance: filters.maxDistance * 1000, // Convert km to meters
        minRating: filters.minRating,
        sortBy: filters.sortBy
      });

      // ✅ Use apiService (handles token refresh automatically)
      const response = await apiService.get(`/api/v1/workers/nearby?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch workers');
      }

      const data = await response.json();
      
      console.log('✅ Workers fetched:', data.count);
      
      setWorkers(data.workers || []);
      
      if (!data.workers || data.workers.length === 0) {
        setError('No workers found in your area. Try increasing the distance filter.');
      }
    } catch (err) {
      console.error('❌ Error fetching workers:', err);
      setError(err.message || 'Failed to load workers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkerSelection = (workerId) => {
    setSelectedWorkers(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      } else {
        return [...prev, workerId];
      }
    });
  };

  // ✅ UPDATED: Use apiService instead of fetch
  const sendQuoteRequests = async () => {
    if (selectedWorkers.length === 0) {
      alert('Please select at least one worker');
      return;
    }

    setSendingQuotes(true);
    try {
      console.log('📤 Sending quote to workers:', selectedWorkers);

      // ✅ Use apiService (handles token refresh automatically)
      const response = await apiService.post(
        `/api/v1/bookings/${quoteRequestId}/send-to-workers`,
        { workerIds: selectedWorkers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send quote requests');
      }

      const data = await response.json();
      
      console.log('✅ Quotes sent successfully:', data);

      // Show success message
      alert(`Quote request sent to ${selectedWorkers.length} worker(s) successfully!`);
      
      // Navigate to bookings page
      navigate('/customer/bookings');
    } catch (err) {
      console.error('❌ Error sending quote requests:', err);
      alert(err.message || 'Failed to send quote requests. Please try again.');
    } finally {
      setSendingQuotes(false);
    }
  };

  const viewWorkerProfile = (workerId) => {
    navigate(`/worker/${workerId}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)} km away`;
  };

  if (!quoteRequestId || !serviceType || !customerLocation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Select Workers</h1>
                <p className="text-sm text-gray-600">
                  {workers.length} worker{workers.length !== 1 ? 's' : ''} found for {serviceType}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="distance">Distance</option>
                    <option value="rating">Rating</option>
                    <option value="price">Price</option>
                  </select>
                </div>

                {/* Max Distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Distance: {filters.maxDistance} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.maxDistance}
                    onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Rating: {filters.minRating || 'Any'}
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding workers near you...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchWorkers}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Workers List */}
        {!loading && !error && workers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map((worker) => (
                <div
                  key={worker._id}
                  className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                    selectedWorkers.includes(worker._id)
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Worker Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.userId?.profileImage || '/default-avatar.png'}
                          alt={worker.userId?.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {worker.userId?.fullName || 'Unknown Worker'}
                          </h3>
                          {worker.distance !== undefined && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {formatDistance(worker.distance)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rating & Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{worker.rating?.average?.toFixed(1) || 'N/A'}</span>
                        <span className="text-sm text-gray-600">
                          ({worker.rating?.count || 0} reviews)
                        </span>
                      </div>
                      
                      {worker.completedJobs > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award size={16} />
                          {worker.completedJobs} jobs completed
                        </div>
                      )}
                      
                      {worker.hourlyRate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign size={16} />
                          LKR {worker.hourlyRate}/hour
                        </div>
                      )}
                      
                      {worker.responseTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} />
                          Responds in {Math.round(worker.responseTime / 60)} mins
                        </div>
                      )}
                    </div>

                    {/* Specializations */}
                    {worker.specializations && worker.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {worker.specializations.slice(0, 3).map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-200 p-4 flex gap-2">
                    <button
                      onClick={() => viewWorkerProfile(worker._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye size={18} />
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => toggleWorkerSelection(worker._id)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        selectedWorkers.includes(worker._id)
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedWorkers.includes(worker._id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed Bottom Bar */}
            {selectedWorkers.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedWorkers.length} worker{selectedWorkers.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedWorkers([])}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Clear Selection
                      </button>
                      
                      <button
                        onClick={sendQuoteRequests}
                        disabled={sendingQuotes}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingQuotes ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Send Quote Requests
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && workers.length === 0 && (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Workers Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any workers matching your criteria.
              Try adjusting your filters.
            </p>
            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Adjust Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerSelectionPage;
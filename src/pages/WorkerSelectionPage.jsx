import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Award, DollarSign, Clock, Send, Eye, Filter } from 'lucide-react';
import { Button } from '../components/common';

/**
 * Worker Selection Page
 * Shows filtered workers based on quote request details
 * Allows customer to view profiles and send quote requests
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

  useEffect(() => {
    if (!quoteRequestId || !serviceType || !customerLocation) {
      navigate('/customer/dashboard');
      return;
    }
    fetchWorkers();
  }, [filters]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        serviceType,
        latitude: customerLocation.coordinates.latitude,
        longitude: customerLocation.coordinates.longitude,
        maxDistance: filters.maxDistance * 1000, // Convert km to meters
        minRating: filters.minRating,
        sortBy: filters.sortBy
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/workers/nearby?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch workers');
      }

      const data = await response.json();
      setWorkers(data.workers || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('Failed to load workers. Please try again.');
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

  const sendQuoteRequests = async () => {
    if (selectedWorkers.length === 0) {
      alert('Please select at least one worker');
      return;
    }

    setSendingQuotes(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/bookings/${quoteRequestId}/send-to-workers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ workerIds: selectedWorkers })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send quote requests');
      }

      // Navigate to bookings page
      navigate('/customer/bookings', {
        state: { message: `Quote request sent to ${selectedWorkers.length} worker(s)` }
      });

    } catch (err) {
      console.error('Error sending quotes:', err);
      alert('Failed to send quote requests. Please try again.');
    } finally {
      setSendingQuotes(false);
    }
  };

  const viewWorkerProfile = (workerId) => {
    navigate(`/customer/worker/${workerId}`);
  };

  const calculateDistance = (workerLat, workerLng) => {
    const R = 6371; // Earth's radius in km
    const dLat = (workerLat - customerLocation.coordinates.latitude) * Math.PI / 180;
    const dLon = (workerLng - customerLocation.coordinates.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(customerLocation.coordinates.latitude * Math.PI / 180) * 
      Math.cos(workerLat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Available Workers</h1>
              <p className="text-sm text-gray-600 mt-1">
                Select workers to send your quote request
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedWorkers.length} selected
              </span>
              <Button
                variant="primary"
                onClick={sendQuoteRequests}
                loading={sendingQuotes}
                disabled={selectedWorkers.length === 0 || sendingQuotes}
              >
                <Send size={20} className="mr-2" />
                Send Requests
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="distance">Nearest First</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
            </select>

            <select
              value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
              <option value="50">Within 50 km</option>
            </select>

            <select
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="0">All Ratings</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Finding workers near you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
            <Button
              variant="outline"
              onClick={fetchWorkers}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* No Workers Found */}
        {!loading && !error && workers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or expanding the search radius
            </p>
            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, maxDistance: filters.maxDistance + 10 })}
            >
              Expand Search Area
            </Button>
          </div>
        )}

        {/* Workers List */}
        {!loading && !error && workers.length > 0 && (
          <div className="space-y-4">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  selectedWorkers.includes(worker._id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-transparent hover:shadow-md'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <div className="flex items-center pt-1">
                      <input
                        type="checkbox"
                        checked={selectedWorkers.includes(worker._id)}
                        onChange={() => toggleWorkerSelection(worker._id)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </div>

                    {/* Worker Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={worker.userId?.profileImage || '/default-avatar.png'}
                        alt={worker.userId?.fullName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>

                    {/* Worker Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {worker.userId?.fullName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {worker.specializations?.join(', ')}
                          </p>
                        </div>
                        
                        {worker.verified && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                            <Award size={14} className="text-green-600" />
                            <span className="text-xs font-medium text-green-600">Verified</span>
                          </div>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="font-medium text-gray-900">
                            {worker.rating?.average?.toFixed(1) || 'N/A'}
                          </span>
                          <span>({worker.rating?.count || 0})</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin size={16} className="text-gray-400" />
                          <span>
                            {calculateDistance(
                              worker.location?.coordinates?.latitude,
                              worker.location?.coordinates?.longitude
                            )} km away
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock size={16} className="text-gray-400" />
                          <span>{worker.experience || 0}+ years exp</span>
                        </div>
                      </div>

                      {/* Hourly Rate */}
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Starting from{' '}
                          <span className="font-semibold text-gray-900">
                            LKR {worker.hourlyRate || 'N/A'}/hour
                          </span>
                        </span>
                      </div>

                      {/* Bio */}
                      {worker.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {worker.bio}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewWorkerProfile(worker._id)}
                        >
                          <Eye size={16} className="mr-1" />
                          View Profile
                        </Button>
                        
                        {worker.portfolio?.length > 0 && (
                          <span className="text-xs text-gray-500 self-center">
                            {worker.portfolio.length} portfolio item(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Indicator */}
                {selectedWorkers.includes(worker._id) && (
                  <div className="px-6 py-3 bg-indigo-100 border-t border-indigo-200">
                    <p className="text-sm text-indigo-800">
                      ✓ Quote request will be sent to this worker
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Action Bar */}
        {workers.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-6 p-4 rounded-t-lg shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedWorkers.length} worker(s) selected
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={sendQuoteRequests}
                loading={sendingQuotes}
                disabled={selectedWorkers.length === 0 || sendingQuotes}
              >
                <Send size={20} className="mr-2" />
                Send Quote Request{selectedWorkers.length > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerSelectionPage;
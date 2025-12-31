import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import BookingCard from '../../components/booking/BookingCard';

/**
 * My Jobs Component - IMPROVED VERSION
 * ✅ Tries multiple API endpoints
 * ✅ Better error handling
 * ✅ Fallback strategies
 */
const MyJobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');

  const filters = [
    { value: 'all', label: 'All Jobs', icon: Calendar },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'active', label: 'Active', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'declined', label: 'Declined', icon: XCircle }
  ];

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      console.log('🔍 Fetching bookings with filter:', filter);
      
      // Build query params
      const params = new URLSearchParams({
        role: 'worker'
      });
      
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      // ✅ Try multiple endpoint strategies
      const endpoints = [
        `/bookings/my?${params}`,           // Strategy 1: /my endpoint
        `/bookings?${params}`,              // Strategy 2: root endpoint with params
        `/bookings/worker?${params}`,       // Strategy 3: /worker endpoint
      ];
      
      let response = null;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });

          console.log(`📡 Response status: ${response.status} for ${endpoint}`);

          if (response.ok) {
            console.log(`✅ Success with endpoint: ${endpoint}`);
            break; // Found a working endpoint
          } else {
            lastError = `${endpoint}: HTTP ${response.status}`;
          }
        } catch (fetchError) {
          console.log(`❌ Endpoint failed: ${endpoint}`, fetchError.message);
          lastError = fetchError.message;
          continue; // Try next endpoint
        }
      }
      
      // If no endpoint worked
      if (!response || !response.ok) {
        throw new Error(lastError || 'All API endpoints failed');
      }

      const data = await response.json();
      console.log('✅ Bookings response:', data);
      
      // ✅ Safely extract bookings array with multiple fallback strategies
      let bookingsArray = [];
      
      if (data.success && data.data) {
        // Try different response structures
        if (Array.isArray(data.data.bookings)) {
          bookingsArray = data.data.bookings;
        } else if (Array.isArray(data.data)) {
          bookingsArray = data.data;
        }
      } else if (Array.isArray(data.bookings)) {
        bookingsArray = data.bookings;
      } else if (Array.isArray(data)) {
        bookingsArray = data;
      }
      
      console.log('📊 Extracted bookings:', bookingsArray.length);
      setBookings(bookingsArray);
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      setError(error.message || 'Failed to load bookings. Please check if the backend is running.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchParams(newFilter !== 'all' ? { filter: newFilter } : {});
  };

  const getFilteredBookings = () => {
    if (!Array.isArray(bookings)) {
      console.warn('⚠️ Bookings is not an array');
      return [];
    }
    
    if (filter === 'all') return bookings;
    
    if (filter === 'active') {
      return bookings.filter(b => ['accepted', 'in_progress'].includes(b?.status));
    }
    
    return bookings.filter(b => b?.status === filter);
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/worker/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
          <p className="text-gray-600">Manage all your job bookings</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Error Loading Jobs</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <p className="text-xs text-red-500 mt-2">
                  Make sure your backend server is running on port 5001
                </p>
              </div>
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {filters.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              {error 
                ? "Unable to load jobs. Please check the error above."
                : filter === 'all' 
                  ? "You don't have any jobs yet. Check your pending requests!"
                  : `No ${filter} jobs at the moment.`}
            </p>
            <div className="flex gap-3 justify-center">
              {!error && (
                <button
                  onClick={() => navigate('/worker/requests')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Requests
                </button>
              )}
              <button
                onClick={() => navigate('/worker/dashboard')}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'job' : 'jobs'}
            </div>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id || booking.id}
                booking={booking}
                workerView={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
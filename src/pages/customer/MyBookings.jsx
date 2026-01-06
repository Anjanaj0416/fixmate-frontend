import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import BookingCard from '../../components/booking/BookingCard';

/**
 * My Bookings Page - Customer View
 * ✅ ENHANCED: Automatically filters out quote requests that haven't been sent to workers
 * ✅ ENHANCED: Option to automatically delete unsent quotes
 */
const MyBookings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [deletingUnsentQuotes, setDeletingUnsentQuotes] = useState(false);

  const filters = [
    { value: 'all', label: 'All', icon: Calendar },
    { value: 'quote_requested', label: 'Quote Requested', icon: Clock },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'accepted', label: 'Accepted', icon: CheckCircle },
    { value: 'in_progress', label: 'In Progress', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle },
    { value: 'declined', label: 'Declined', icon: XCircle }
  ];

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      // Build query parameters
      const params = new URLSearchParams({
        role: 'customer'
      });
      
      // Only add status filter if not 'all'
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      console.log('📡 Fetching customer bookings...', params.toString());
      
      const response = await fetch(`${API_BASE_URL}/bookings/my?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Bookings response:', data);
      
      // Extract bookings from nested data structure
      if (data.success && data.data) {
        const bookingsArray = data.data.bookings || data.data || [];
        console.log('✅ Extracted bookings:', bookingsArray);
        console.log('📊 Number of bookings:', bookingsArray.length);
        
        if (Array.isArray(bookingsArray)) {
          // ✅ NEW: Filter out quote requests that haven't been sent to workers
          const filteredBookings = filterUnsentQuotes(bookingsArray);
          setBookings(filteredBookings);
        } else {
          console.warn('⚠️ Bookings data is not an array:', bookingsArray);
          setBookings([]);
        }
      } else {
        console.warn('⚠️ Unexpected response structure:', data);
        setBookings([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      setError(error.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ NEW: Filter out quote requests that haven't been sent to any workers
   * This prevents showing "draft" quotes that the customer created but never sent
   */
  const filterUnsentQuotes = (bookingsArray) => {
    const filtered = bookingsArray.filter(booking => {
      // Keep all non-quote-requested bookings
      if (booking.status !== 'quote_requested') {
        return true;
      }

      // For quote_requested bookings, only keep those sent to workers
      const hasSentToWorkers = booking.sentToWorkers && booking.sentToWorkers.length > 0;
      
      if (!hasSentToWorkers) {
        console.log('🗑️ Filtering out unsent quote:', {
          id: booking._id?.slice(-8),
          serviceType: booking.serviceType,
          sentToWorkers: booking.sentToWorkers?.length || 0
        });
      }
      
      return hasSentToWorkers;
    });

    const removedCount = bookingsArray.length - filtered.length;
    if (removedCount > 0) {
      console.log(`✅ Filtered out ${removedCount} unsent quote(s)`);
    }

    return filtered;
  };

  /**
   * ✅ NEW: Delete unsent quote requests from the database
   * Call this when you want to permanently remove draft quotes
   */
  const deleteUnsentQuotes = async () => {
    try {
      setDeletingUnsentQuotes(true);
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      // Find unsent quotes
      const unsentQuotes = bookings.filter(booking => {
        return booking.status === 'quote_requested' && 
               (!booking.sentToWorkers || booking.sentToWorkers.length === 0);
      });

      if (unsentQuotes.length === 0) {
        console.log('ℹ️ No unsent quotes to delete');
        return;
      }

      console.log(`🗑️ Deleting ${unsentQuotes.length} unsent quote(s)...`);

      // Delete each unsent quote
      const deletePromises = unsentQuotes.map(booking => 
        fetch(`${API_BASE_URL}/bookings/${booking._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      await Promise.all(deletePromises);
      
      console.log('✅ Unsent quotes deleted successfully');
      
      // Refresh bookings list
      await fetchBookings();
      
    } catch (error) {
      console.error('❌ Error deleting unsent quotes:', error);
      setError('Failed to delete unsent quotes');
    } finally {
      setDeletingUnsentQuotes(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchParams(newFilter !== 'all' ? { filter: newFilter } : {});
  };

  const handleViewDetails = (booking) => {
    const bookingId = booking._id || booking.id;
    console.log('🔍 Navigating to booking details:', bookingId);
    
    if (!bookingId) {
      console.error('❌ Booking ID is missing:', booking);
      alert('Unable to view booking details. Booking ID is missing.');
      return;
    }
    
    navigate(`/customer/bookings/${bookingId}`);
  };

  // Safe filtering with null checks
  const getFilteredBookings = () => {
    if (!Array.isArray(bookings)) {
      console.warn('⚠️ Bookings is not an array:', bookings);
      return [];
    }

    if (filter === 'all') {
      return bookings;
    }

    return bookings.filter(booking => {
      if (!booking || !booking.status) {
        console.warn('⚠️ Invalid booking object:', booking);
        return false;
      }
      
      const status = booking.status.toLowerCase().replace(/[_-]/g, '_');
      const filterLower = filter.toLowerCase().replace(/[_-]/g, '_');
      
      return status === filterLower;
    });
  };

  const filteredBookings = getFilteredBookings();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
              <p className="text-gray-600">Manage and track all your service bookings</p>
            </div>
            <Button
              variant="outline"
              onClick={fetchBookings}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-red-900 font-semibold">Error Loading Bookings</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={fetchBookings}
                className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </Button>
            </div>
          </Card>
        )}
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter by Status:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {filters.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                onClick={() => handleFilterChange(value)}
                variant={filter === value ? 'primary' : 'outline'}
                className={`flex items-center space-x-2 ${
                  filter === value ? '' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter.replace('_', ' ')} bookings`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't made any bookings yet. Find workers to get started!" 
                : `You don't have any bookings with ${filter.replace('_', ' ')} status.`}
            </p>
            {filter === 'all' && (
              <Button onClick={() => navigate('/customer/service-selection')}>
                Find Workers
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onViewDetails={() => handleViewDetails(booking)}
                workerView={false}
              />
            ))}
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && bookings.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            <p>
              Showing <span className="font-semibold">{filteredBookings.length}</span> of{' '}
              <span className="font-semibold">{bookings.length}</span>{' '}
              {bookings.length === 1 ? 'booking' : 'bookings'}
              {filter !== 'all' && ` (filtered by ${filter.replace('_', ' ')})`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
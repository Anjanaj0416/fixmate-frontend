import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import BookingCard from '../../components/booking/BookingCard';
import { bookingService } from '../../services/bookingService';

const MyJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      setLoading(true);
      const response = await bookingService.getBookings({ 
        role: 'worker',
        status: filter !== 'all' ? filter : undefined 
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchParams(newFilter !== 'all' ? { filter: newFilter } : {});
  };

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    if (filter === 'active') {
      return bookings.filter(b => ['accepted', 'in_progress'].includes(b.status));
    }
    return bookings.filter(b => b.status === filter);
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
          <p className="text-gray-600">Manage all your job bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {filters.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                onClick={() => handleFilterChange(value)}
                variant={filter === value ? 'primary' : 'outline'}
                className={filter === value ? '' : 'border-gray-300'}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' ? "You don't have any jobs yet" : `No ${filter} jobs`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                workerView
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
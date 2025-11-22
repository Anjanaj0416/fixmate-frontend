import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  TrendingUp,
  Star,
  ArrowRight,
  BookOpen,
  Heart
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import BookingCard from '../../components/booking/BookingCard';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    favoriteWorkers: 0,
    pendingReviews: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch bookings
      const bookingsResponse = await bookingService.getBookings();
      const bookings = bookingsResponse.data;

      // Calculate stats
      const stats = {
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => 
          ['pending', 'accepted', 'in_progress'].includes(b.status)
        ).length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        favoriteWorkers: 0, // TODO: Implement favorites
        pendingReviews: bookings.filter(b => 
          b.status === 'completed' && !b.reviewId
        ).length
      };

      setStats(stats);
      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: 'Completed Jobs',
      value: stats.completedBookings,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      trend: '+8%'
    },
    {
      title: 'Favorites',
      value: stats.favoriteWorkers,
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-pink-500',
      trend: '+3'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: <Star className="w-6 h-6" />,
      color: 'bg-yellow-500',
      trend: 'Action needed'
    }
  ];

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your bookings today
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={() => navigate('/customer/find-workers')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-auto py-6"
          >
            <div className="flex flex-col items-center">
              <Search className="w-8 h-8 mb-2" />
              <span className="font-semibold">Find Workers</span>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/customer/bookings')}
            variant="outline"
            className="h-auto py-6 border-2"
          >
            <div className="flex flex-col items-center">
              <BookOpen className="w-8 h-8 mb-2" />
              <span className="font-semibold">My Bookings</span>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/customer/favorites')}
            variant="outline"
            className="h-auto py-6 border-2"
          >
            <div className="flex flex-col items-center">
              <Heart className="w-8 h-8 mb-2" />
              <span className="font-semibold">Favorites</span>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/customer/profile')}
            variant="outline"
            className="h-auto py-6 border-2"
          >
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 mb-2" />
              <span className="font-semibold">My Profile</span>
            </div>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Bookings
                </h2>
                <Button
                  onClick={() => navigate('/customer/bookings')}
                  variant="outline"
                  size="sm"
                >
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <Button onClick={() => navigate('/customer/find-workers')}>
                    Find Workers
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onClick={() => navigate(`/customer/bookings/${booking._id}`)}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Pending Reviews Card */}
            {stats.pendingReviews > 0 && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Pending Reviews
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      You have {stats.pendingReviews} completed job{stats.pendingReviews > 1 ? 's' : ''} waiting for your review
                    </p>
                    <Button
                      onClick={() => navigate('/customer/bookings?filter=completed')}
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      Leave Reviews
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                💡 Pro Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Upload clear photos of your problem for better matches
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Save your favorite workers for quick booking
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Leave detailed reviews to help other customers
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Use the chat feature to clarify job details
                </li>
              </ul>
            </Card>

            {/* Support Card */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Our support team is here to help you 24/7
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open('tel:+94112345678')}
                >
                  Call Support
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/help')}
                >
                  Help Center
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
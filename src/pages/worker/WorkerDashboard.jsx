import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Star,
  User,
  Award
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import BookingRequests from '../../components/worker/BookingRequests';
import { bookingService } from '../../services/bookingService';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: 0,
    totalReviews: 0
  });
  const [pendingBookings, setPendingBookings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookings({ role: 'worker' });
      const bookings = response.data;

      setStats({
        pendingRequests: bookings.filter(b => b.status === 'pending').length,
        activeJobs: bookings.filter(b => ['accepted', 'in_progress'].includes(b.status)).length,
        completedJobs: bookings.filter(b => b.status === 'completed').length,
        totalEarnings: bookings
          .filter(b => b.status === 'completed' && b.quote)
          .reduce((sum, b) => sum + b.quote.totalAmount, 0),
        rating: 4.8, // TODO: Get from worker profile
        totalReviews: 127 // TODO: Get from worker profile
      });

      setPendingBookings(bookings.filter(b => b.status === 'pending').slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      action: () => navigate('/worker/jobs?filter=pending')
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => navigate('/worker/jobs?filter=active')
    },
    {
      title: 'Completed Jobs',
      value: stats.completedJobs,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => navigate('/worker/jobs?filter=completed')
    },
    {
      title: 'Total Earnings',
      value: `Rs. ${stats.totalEarnings.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => navigate('/worker/earnings')
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName}! 👷
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your business overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={stat.action}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Pending Booking Requests
                </h2>
                <Button
                  onClick={() => navigate('/worker/jobs?filter=pending')}
                  variant="outline"
                  size="sm"
                >
                  View All
                </Button>
              </div>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <BookingRequests bookings={pendingBookings} onUpdate={fetchDashboardData} />
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Card */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="text-center">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3 fill-current" />
                <div className="text-4xl font-bold text-gray-900 mb-1">{stats.rating}</div>
                <p className="text-gray-600 text-sm">{stats.totalReviews} reviews</p>
                <Button
                  onClick={() => navigate('/worker/profile')}
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  View Profile
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/worker/profile')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => navigate('/worker/earnings')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Earnings
                </Button>
                <Button
                  onClick={() => navigate('/worker/profile#portfolio')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Manage Portfolio
                </Button>
              </div>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Respond to requests within 2 hours for better visibility
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Keep your portfolio updated with recent work
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Maintain a 4.5+ rating for premium placement
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
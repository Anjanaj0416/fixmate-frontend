import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Briefcase, DollarSign, Calendar, AlertCircle } from 'lucide-react';

/**
 * Enhanced Worker Dashboard Component
 * Main dashboard with sign-out button for workers
 */
const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      pendingRequests: 0,
      activeJobs: 0,
      completedJobs: 0,
      monthlyEarnings: 0,
    },
    recentBookings: [],
    upcomingJobs: [],
    notifications: [],
    profileCompletion: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
      const response = await fetch(`${API_URL}/workers/dashboard`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
        
        // Call backend logout endpoint
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fcmToken: sessionStorage.getItem('fcmToken') || null,
          }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear session storage
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('fcmToken');
        
        // Navigate to login page
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Sign Out Button */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-6 text-white mb-6">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.fullName || user.name}!
          </h2>
          <p className="text-indigo-100">
            Here's what's happening with your business today
          </p>
        </div>

        {/* Profile Completion Alert */}
        {dashboardData.profileCompletion < 100 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-yellow-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Complete your profile to get more bookings!
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your profile is {dashboardData.profileCompletion}% complete
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/worker/profile')}
                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Pending Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.stats.pendingRequests}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Briefcase className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.stats.activeJobs}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Completed Jobs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.stats.completedJobs}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  LKR {dashboardData.stats.monthlyEarnings.toLocaleString()}
                </p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Booking Requests</h3>
            {dashboardData.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/worker/jobs/${booking.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{booking.serviceType}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{booking.location?.city}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No recent bookings</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/worker/profile')}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
              >
                <User className="w-5 h-5 text-gray-600 mr-3" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => navigate('/worker/portfolio')}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
              >
                <Briefcase className="w-5 h-5 text-gray-600 mr-3" />
                <span>Manage Portfolio</span>
              </button>
              <button
                onClick={() => navigate('/worker/earnings')}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
              >
                <DollarSign className="w-5 h-5 text-gray-600 mr-3" />
                <span>View Earnings</span>
              </button>
              <button
                onClick={() => navigate('/worker/availability')}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
              >
                <Calendar className="w-5 h-5 text-gray-600 mr-3" />
                <span>Update Availability</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Jobs */}
        {dashboardData.upcomingJobs.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Jobs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/worker/jobs/${job.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{job.serviceType}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{job.location?.city}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
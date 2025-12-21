import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Briefcase, DollarSign, Calendar, AlertCircle } from 'lucide-react';

/**
 * Worker Dashboard Component - FIXED
 * Calculates profile completion from worker profile data
 */
const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
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
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateProfileCompletion = (worker) => {
    if (!worker) return 0;
    
    const fields = [
      worker.userId?.fullName || worker.fullName,
      worker.userId?.email || worker.email,
      worker.userId?.phoneNumber || worker.phoneNumber,
      worker.serviceCategories?.length > 0,
      worker.specializations?.length > 0,
      worker.experience > 0,
      worker.hourlyRate > 0,
      worker.bio,
      worker.skills?.length > 0,
      worker.userId?.location?.address || worker.address
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Fetch worker profile to calculate completion
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/workers/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.data) {
            const completion = calculateProfileCompletion(profileData.data);
            console.log('📊 Calculated profile completion:', completion + '%');
            setProfileCompletion(completion);
          }
        }
      } catch (profileError) {
        console.error('Error fetching profile for completion:', profileError);
        // Fallback: try to calculate from localStorage
        const userStr = localStorage.getItem('fixmate_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const completion = calculateProfileCompletion(user);
          setProfileCompletion(completion);
        }
      }

      // Try to fetch dashboard stats (may not exist yet)
      try {
        const dashboardResponse = await fetch(`${API_BASE_URL}/workers/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          setDashboardData(data.data);
        }
      } catch (dashboardError) {
        console.log('Dashboard endpoint not available, using defaults');
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
        localStorage.removeItem('fixmate_user');
        localStorage.removeItem('fixmate_auth_token');
        navigate('/login');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-6 text-white mb-6">
          <h2 className="text-3xl font-bold mb-2">Welcome back, !</h2>
          <p className="text-indigo-100">
            Here's what's happening with your business today
          </p>
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <AlertCircle className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Complete your profile to get more bookings!
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your profile is {profileCompletion}% complete
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/worker/profile')}
                className="ml-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                Complete Profile
              </button>
            </div>
            <div className="mt-3">
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
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
                  LKR {dashboardData.stats.monthlyEarnings}
                </p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Booking Requests */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Booking Requests</h3>
          </div>
          <div className="p-6">
            {dashboardData.recentBookings && dashboardData.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentBookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.serviceType}</h4>
                        <p className="text-sm text-gray-600 mt-1">{booking.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent bookings
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/worker/profile')}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <User className="w-5 h-5" />
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/worker/jobs')}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Briefcase className="w-5 h-5" />
                View All Jobs
              </button>
              <button
                onClick={() => navigate('/worker/earnings')}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                View Earnings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
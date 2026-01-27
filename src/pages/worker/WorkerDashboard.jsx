import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Briefcase, DollarSign, Calendar, AlertCircle, MessageCircle } from 'lucide-react';
import AvailabilityToggle from '../../components/worker/AvailabilityToggle';
import NotificationBell from '../../components/common/NotificationBell';

/**
 * Worker Dashboard Component
 * ✅ UPDATED: Added NotificationBell component to header
 * ✅ Active Jobs card is clickable
 * ✅ View All Jobs button works correctly
 * ✅ Messages button in Quick Actions
 * ✅ Availability toggle that also controls verification status
 */
const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [workerProfile, setWorkerProfile] = useState(null);
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
      
      // Fetch worker profile to get availability and verification status
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
            setWorkerProfile(profileData.data);
            const completion = calculateProfileCompletion(profileData.data);
            console.log('📊 Worker profile loaded:', {
              completion: completion + '%',
              availability: profileData.data.availability,
              isVerified: profileData.data.isVerified
            });
            setProfileCompletion(completion);
          }
        }
      } catch (profileError) {
        console.error('Error fetching profile for completion:', profileError);
      }

      // Fetch dashboard stats
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
        // Clear all auth data
        localStorage.removeItem('fixmate_auth_token');
        localStorage.removeItem('fixmate_user');
        sessionStorage.clear();
        
        // Navigate to login
        navigate('/login');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  const handleAvailabilityToggle = (newAvailability, newVerified) => {
    console.log('🔄 Availability and verification toggled:', {
      availability: newAvailability,
      isVerified: newVerified
    });
    
    // Update local worker profile state
    setWorkerProfile(prev => ({
      ...prev,
      availability: newAvailability,
      isVerified: newVerified
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
              <p className="text-indigo-100">
                Here's what's happening with your business today
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* ✅ NEW: Notification Bell */}
              <NotificationBell />
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Availability + Verification Toggle Section */}
        <div className="mb-6">
          <AvailabilityToggle 
            initialAvailability={workerProfile?.availability ?? true}
            initialVerified={workerProfile?.isVerified ?? false}
            onToggle={handleAvailabilityToggle}
          />
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
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
          {/* Pending Requests - Clickable */}
          <div 
            onClick={() => navigate('/worker/requests')}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.stats.pendingRequests}
                </p>
                {dashboardData.stats.pendingRequests > 0 && (
                  <p className="text-sm text-indigo-600 font-medium mt-2 hover:underline">
                    View Requests →
                  </p>
                )}
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Briefcase className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Active Jobs - Clickable */}
          <div 
            onClick={() => navigate('/worker/jobs?filter=active')}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.stats.activeJobs}
                </p>
                {dashboardData.stats.activeJobs > 0 && (
                  <p className="text-sm text-blue-600 font-medium mt-2 hover:underline">
                    View Jobs →
                  </p>
                )}
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
                  <div 
                    key={booking._id} 
                    onClick={() => navigate('/worker/requests')}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{booking.serviceType}</h4>
                        <p className="text-sm text-gray-600 mt-1">{booking.problemDescription || booking.description || 'No description'}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'pending' || booking.status === 'quote_requested' ? 
                        'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status.replace('_', ' ')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={() => navigate('/worker/requests')}
                className="flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Briefcase className="w-5 h-5" />
                View Requests
              </button>
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
                onClick={() => navigate('/worker/messages')}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Messages
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
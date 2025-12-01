import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Star, MessageSquare, Clock, Briefcase } from 'lucide-react';

/**
 * Updated Customer Dashboard
 * With Find Worker button that starts the quote request flow
 */
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedJobs: 0,
    favorites: 0
  });

  useEffect(() => {
    // Load user data
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Fetch stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/bookings/stats`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats({
          activeBookings: data.data?.stats?.pending + data.data?.stats?.accepted || 0,
          completedJobs: data.data?.stats?.completed || 0,
          favorites: 0 // Fetch from favorites API
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFindWorker = () => {
    navigate('/customer/service-selection');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
              </h1>
              <p className="text-gray-600 mt-1">
                Find skilled workers for your home services
              </p>
            </div>
            
            {/* Main CTA - Find Worker Button */}
            <button
              onClick={handleFindWorker}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              <Search size={20} />
              Find Worker
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section with Service Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Large CTA Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">
                Need a skilled worker?
              </h2>
              <p className="text-indigo-100 mb-4">
                Get quotes from verified professionals in your area
              </p>
              <button
                onClick={handleFindWorker}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <Search size={20} />
                Start Your Request
              </button>
            </div>
            <div className="hidden md:block">
              <div className="w-48 h-48 bg-indigo-500 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={handleFindWorker}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-600 text-left"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="text-indigo-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Find Workers</h3>
            <p className="text-sm text-gray-600">
              Browse and request quotes
            </p>
          </button>

          <button
            onClick={() => navigate('/customer/bookings')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-600 text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">My Bookings</h3>
            <p className="text-sm text-gray-600">
              {stats.activeBookings} active
            </p>
          </button>

          <button
            onClick={() => navigate('/customer/favorites')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-600 text-left"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="text-yellow-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Favorites</h3>
            <p className="text-sm text-gray-600">
              Saved workers
            </p>
          </button>

          <button
            onClick={() => navigate('/customer/messages')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-600 text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Messages</h3>
            <p className="text-sm text-gray-600">
              Chat with workers
            </p>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedJobs}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorite Workers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.favorites}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <button
              onClick={handleFindWorker}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Get started by finding a worker →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
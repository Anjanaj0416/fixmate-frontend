import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Star, MessageSquare, Clock, Briefcase, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import NotificationBell from '../../components/common/NotificationBell';

/**
 * Enhanced Customer Dashboard
 * ✅ UPDATED: Added NotificationBell component to header
 * With profile dropdown menu, notifications, and sign-out functionality
 */
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedJobs: 0,
    favorites: 0
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Load user data
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Fetch stats
    fetchStats();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bookings/stats`,
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

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        // Call backend logout endpoint
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear session storage regardless of API response
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        
        // Navigate to login
        navigate('/login');
      }
    }
  };

  const getUserInitial = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.fullName || user?.name || 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Profile Menu and Notifications */}
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
            
            <div className="flex items-center gap-3">
              {/* Find Worker Button */}
              <button
                onClick={handleFindWorker}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
              >
                <Search size={20} />
                Find Worker
              </button>

              {/* ✅ NEW: Notification Bell */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {getUserInitial()}
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/customer/profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User size={18} />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/customer/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
              >
                <Search size={20} />
                Start Your Request
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={handleFindWorker}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Find Workers</h3>
            <p className="text-sm text-gray-600">Browse and request quotes</p>
          </button>

          <button
            onClick={() => navigate('/customer/bookings')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">My Bookings</h3>
            <p className="text-sm text-gray-600">{stats.activeBookings} active</p>
          </button>

          <button
            onClick={() => navigate('/customer/favorites')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="text-yellow-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Favorites</h3>
            <p className="text-sm text-gray-600">Saved workers</p>
          </button>

          <button
            onClick={() => navigate('/customer/messages')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-sm text-gray-600">Chat with workers</p>
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
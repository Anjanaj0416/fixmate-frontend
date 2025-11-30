import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, DollarSign, Clock, CheckCircle, LogOut } from 'lucide-react';

/**
 * Worker Profile Page - FIXED FOR YOUR APP
 * Uses correct localStorage keys: fixmate_user and fixmate_auth_token
 */
const WorkerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [userData, setUserData] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  const fetchWorkerProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ FIXED: Use correct localStorage keys
      const userStr = localStorage.getItem('fixmate_user');
      const token = localStorage.getItem('fixmate_auth_token');
      
      console.log('🔍 Checking localStorage...');
      console.log('User data found:', !!userStr);
      console.log('Token found:', !!token);
      
      if (!userStr) {
        throw new Error('User data not found. Please login again.');
      }

      const user = JSON.parse(userStr);
      console.log('👤 User from localStorage:', user);
      setUserData(user);

      // Extract worker data directly from user object
      // (Your registration stores everything in the user object)
      const worker = {
        serviceCategories: user.serviceCategories || [],
        specializations: user.specializations || [],
        experience: user.experience || 0,
        hourlyRate: user.hourlyRate || 0,
        bio: user.bio || '',
        skills: user.skills || [],
        availability: user.availability !== undefined ? user.availability : true,
        rating: user.rating || { average: 0, count: 0 },
        completedJobs: user.completedJobs || 0,
        totalEarnings: user.totalEarnings || 0,
        isVerified: user.isVerified || false,
      };

      console.log('🔧 Worker data extracted:', worker);
      setWorkerData(worker);
      calculateProfileCompletion(user, worker);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (user, worker) => {
    const fields = [
      user.fullName || user.name,
      user.phoneNumber || user.phone,
      user.address,
      worker.bio,
      worker.serviceCategories?.length > 0,
      worker.specializations?.length > 0,
      worker.skills?.length > 0,
      worker.experience > 0,
      worker.hourlyRate > 0,
      user.profileImage || user.profileImageUrl,
    ];

    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    console.log(`📊 Profile completion: ${completed}/${fields.length} = ${percentage}%`);
    setProfileCompletion(percentage);
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
        
        // Call backend logout endpoint
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fixmate_auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fcmToken: localStorage.getItem('fcmToken') || null,
          }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // ✅ Clear ALL storage keys
        localStorage.removeItem('fixmate_auth_token');
        localStorage.removeItem('fixmate_user');
        localStorage.removeItem('fixmate_remember');
        sessionStorage.clear();
        
        // Navigate to login page
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Sign Out */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Worker Profile</h1>
            <p className="text-gray-600 mt-1">Manage your profile and service details</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Profile Completion */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
            <span className="text-2xl font-bold text-indigo-600">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          {profileCompletion < 100 && (
            <p className="text-sm text-gray-600 mt-2">
              Complete your profile to get more visibility and bookings!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Image & Stats */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold mx-auto">
                    {userData?.profileImage || userData?.profileImageUrl ? (
                      <img
                        src={userData.profileImage || userData.profileImageUrl}
                        alt={userData.fullName || userData.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      (userData?.fullName || userData?.name)?.charAt(0) || 'W'
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">
                  {userData?.fullName || userData?.name || 'Worker'}
                </h2>
                <p className="text-gray-600">{userData?.email}</p>
                <div className="flex items-center justify-center mt-2">
                  {workerData?.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-semibold">
                      {workerData?.rating?.average?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({workerData?.rating?.count || 0})
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Jobs</span>
                  <span className="font-semibold">{workerData?.completedJobs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Earnings</span>
                  <span className="font-semibold">
                    LKR {workerData?.totalEarnings?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    workerData?.availability 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workerData?.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <p className="text-gray-900">{userData?.fullName || userData?.name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <p className="text-gray-900">{userData?.phoneNumber || userData?.phone || 'Not set'}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <p className="text-gray-900">{userData?.address || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Bio</h3>
              <p className="text-gray-700">{workerData?.bio || 'No bio added yet'}</p>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Service Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {workerData?.serviceCategories?.length > 0 ? (
                      workerData.serviceCategories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm capitalize"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No categories selected</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {workerData?.specializations?.length > 0 ? (
                      workerData.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No specializations added</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Years of Experience
                    </label>
                    <p className="text-gray-900">{workerData?.experience || 0} years</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Hourly Rate
                    </label>
                    <p className="text-gray-900">
                      LKR {workerData?.hourlyRate?.toLocaleString() || 0}/hour
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/worker/dashboard')}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center"
                >
                  <Briefcase className="w-5 h-5 text-gray-600 mr-3" />
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={() => navigate('/worker/jobs')}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center"
                >
                  <Clock className="w-5 h-5 text-gray-600 mr-3" />
                  <span>View My Jobs</span>
                </button>
                <button
                  onClick={() => navigate('/worker/earnings')}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center"
                >
                  <DollarSign className="w-5 h-5 text-gray-600 mr-3" />
                  <span>View Earnings</span>
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-3 border border-indigo-300 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left flex items-center"
                >
                  <User className="w-5 h-5 text-indigo-600 mr-3" />
                  <span>Refresh Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
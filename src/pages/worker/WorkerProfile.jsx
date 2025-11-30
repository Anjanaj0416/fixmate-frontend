import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, DollarSign, Clock, CheckCircle, LogOut, MapPin, Award } from 'lucide-react';

/**
 * Worker Profile Page - CORRECTED VERSION
 * Uses /workers/stats endpoint (not /workers/profile which doesn't exist)
 * 
 * ✅ FIXES:
 * 1. Changed endpoint from /workers/profile to /workers/stats
 * 2. Correctly displays serviceCategories, specializations, experience, hourlyRate
 * 3. Shows proper profile completion percentage
 * 4. Includes sign-out functionality
 */
const WorkerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
      // Get user and token from localStorage
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

      // ✅ CORRECTED: Use /workers/stats endpoint (not /workers/profile)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
      const endpoint = `${API_URL}/workers/stats`;
      
      console.log('🌐 Fetching worker data from:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        console.warn('⚠️ API call failed with status:', response.status);
        
        // If API call fails, use localStorage data as fallback
        console.log('📦 Using localStorage data as fallback');
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
        setWorkerData(worker);
        calculateProfileCompletion(user, worker);
      } else {
        // ✅ Parse worker data from API response
        const result = await response.json();
        console.log('✅ API Response:', result);
        
        // The response might be in different formats, handle all cases
        const worker = result.data || result.worker || result;
        console.log('✅ Worker data from MongoDB:', worker);
        
        setWorkerData(worker);
        calculateProfileCompletion(user, worker);
      }
      
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
        // Clear localStorage
        localStorage.removeItem('fixmate_user');
        localStorage.removeItem('fixmate_auth_token');
        
        // Sign out from Firebase if available
        if (window.firebase && window.firebase.auth) {
          await window.firebase.auth().signOut();
        }
        
        console.log('✅ Signed out successfully');
        navigate('/login');
      } catch (err) {
        console.error('❌ Sign out error:', err);
        alert('Error signing out. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Sign Out */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Worker Profile</h1>
            <p className="text-gray-600 mt-1">Manage your profile and service details</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>

        {/* Profile Completion Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
            <span className="text-2xl font-bold text-indigo-600">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Complete your profile to get more visibility and bookings!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="mb-4">
                {userData?.profileImage || userData?.profileImageUrl ? (
                  <img
                    src={userData.profileImage || userData.profileImageUrl}
                    alt={userData.fullName || userData.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                    {(userData?.fullName || userData?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {userData?.fullName || userData?.name || 'Anjana Jayasinghe'}
              </h2>
              <p className="text-gray-600 mb-4">{userData?.email || 't@gmail.com'}</p>

              {/* Statistics */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="font-semibold">{workerData?.rating?.average?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-500 text-sm ml-1">({workerData?.rating?.count || 0})</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Jobs</span>
                  <span className="font-semibold">{workerData?.completedJobs || 0}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Earnings</span>
                  <span className="font-semibold">LKR {workerData?.totalEarnings || 0}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                    <p className="text-gray-900">LKR {workerData?.hourlyRate || 0}/hour</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {workerData?.skills?.length > 0 ? (
                      workerData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No skills added</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            {workerData?.workingHours && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <p className="text-gray-900">{workerData.workingHours.startTime || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <p className="text-gray-900">{workerData.workingHours.endTime || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Service Locations */}
            {workerData?.serviceLocations?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="w-5 h-5 inline mr-2" />
                  Service Locations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {workerData.serviceLocations.map((location, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {typeof location === 'object' ? location.city || location.address : location}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
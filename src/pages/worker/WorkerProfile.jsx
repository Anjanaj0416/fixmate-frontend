import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  LogOut, 
  MapPin, 
  Award,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

/**
 * Worker Profile Page - FINAL FIXED VERSION
 * 
 * ✅ CRITICAL FIX: Uses /workers/profile endpoint (not /workers/stats)
 * The stats endpoint doesn't return worker profile data (serviceCategories, etc.)
 * The profile endpoint returns the complete Worker document from MongoDB
 */
const WorkerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError, setRetrying] = useState(false);
  
  const [userData, setUserData] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  const fetchWorkerProfile = async () => {
    setLoading(true);
    setError(null);
    setRetrying(false);
    
    try {
      // Step 1: Get user and token from localStorage
      const userStr = localStorage.getItem('fixmate_user');
      const token = localStorage.getItem('fixmate_auth_token');
      
      console.log('🔍 Checking localStorage...');
      console.log('User data found:', !!userStr);
      console.log('Token found:', !!token);
      
      if (!userStr || !token) {
        throw new Error('Authentication data not found. Please login again.');
      }

      const user = JSON.parse(userStr);
      console.log('👤 User from localStorage:', user);
      setUserData(user);

      // ✅ CRITICAL FIX: Use /workers/profile endpoint (returns full Worker document)
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${API_BASE_URL}/api/v1/workers/profile`;
      
      console.log('🌐 Fetching worker profile from:', endpoint);
      console.log('🔑 Using token:', token.substring(0, 20) + '...');
      
      // Step 2: Fetch worker profile from backend
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Worker profile data received:', data);

      if (data.success && data.data) {
        // Extract worker data - the profile endpoint returns the full Worker document
        const worker = data.data;
        
        console.log('📊 Worker profile:', {
          serviceCategories: worker.serviceCategories,
          specializations: worker.specializations,
          experience: worker.experience,
          hourlyRate: worker.hourlyRate
        });
        
        setWorkerData(worker);
        
        // Calculate profile completion
        const completion = calculateProfileCompletion(worker);
        setProfileCompletion(completion);
        
      } else {
        throw new Error('Invalid response format from server');
      }

      setError(null);

    } catch (err) {
      console.error('❌ Error fetching worker profile:', err);
      
      let errorMessage = err.message;
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on port 5001.';
      } else if (err.message.includes('Authentication')) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.message.includes('Worker profile not found')) {
        errorMessage = 'Worker profile not found. Please complete your worker registration.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (worker) => {
    if (!worker) return 0;
    
    const fields = [
      worker.userId,  // Has user
      worker.serviceCategories?.length > 0,
      worker.specializations?.length > 0,
      worker.experience > 0,
      worker.hourlyRate > 0,
      worker.bio,
      worker.skills?.length > 0,
      worker.serviceLocations?.length > 0,
      worker.workingHours && Object.keys(worker.workingHours).length > 0,
      worker.portfolio?.length > 0
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleRetry = () => {
    setRetrying(true);
    fetchWorkerProfile();
  };

  const handleSignOut = () => {
    localStorage.removeItem('fixmate_user');
    localStorage.removeItem('fixmate_auth_token');
    sessionStorage.clear();
    navigate('/login');
  };

  // Loading state
  if (loading && !workerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

        {/* Error Message with Retry */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-900">Error Loading Profile</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  {error.includes('backend') && (
                    <p className="text-sm text-red-600 mt-2">
                      💡 Make sure your backend server is running: <code>npm start</code> in fixmate-backend directory
                    </p>
                  )}
                  {error.includes('not found') && (
                    <p className="text-sm text-red-600 mt-2">
                      💡 You may need to complete the worker registration flow again
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Profile Completion */}
        {workerData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Profile Completion</h2>
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
        )}

        {workerData && (
          <>
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {userData?.fullName?.charAt(0).toUpperCase() || 'W'}
                </div>

                {/* Name and Email */}
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userData?.fullName || 'Worker Name'}
                </h2>
                <p className="text-gray-600 mb-4">{userData?.email}</p>

                {/* Statistics */}
                <div className="w-full max-w-2xl mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Rating */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span className="text-2xl font-bold text-gray-900">
                          {workerData.rating?.average?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Rating ({workerData.rating?.count || 0})
                      </p>
                    </div>

                    {/* Completed Jobs */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-gray-900">
                          {workerData.completedJobs || 0}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Completed Jobs</p>
                    </div>

                    {/* Total Earnings */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-indigo-500" />
                        <span className="text-2xl font-bold text-gray-900">
                          LKR {workerData.totalEarnings || 0}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                    </div>

                    {/* Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          workerData.availability ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workerData.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Status</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900">{userData?.fullName || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900">{userData?.phoneNumber || 'Not set'}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <p className="text-gray-900">{workerData.address || userData?.address || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            {workerData.bio && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Bio</h3>
                <p className="text-gray-700">{workerData.bio}</p>
              </div>
            )}

            {/* Service Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Briefcase className="inline h-5 w-5 mr-2" />
                Service Details
              </h3>
              
              <div className="space-y-4">
                {/* Service Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Categories
                  </label>
                  {workerData.serviceCategories?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {workerData.serviceCategories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No categories selected</p>
                  )}
                </div>

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations
                  </label>
                  {workerData.specializations?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {workerData.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No specializations added</p>
                  )}
                </div>

                {/* Experience and Rate */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Years of Experience
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      {workerData.experience || 0} years
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Hourly Rate
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      LKR {workerData.hourlyRate || 0}/hour
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {workerData.skills?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {workerData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerProfile;
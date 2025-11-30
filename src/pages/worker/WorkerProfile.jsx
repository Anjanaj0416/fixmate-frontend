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
 * Worker Profile Page - FIXED VERSION
 * 
 * ✅ CRITICAL FIX: Changed endpoint from /workers/stats to /workers/profile
 * This endpoint returns COMPLETE worker data including:
 * - serviceCategories, specializations, experience, hourlyRate, bio, skills
 * - Plus statistics like rating, completedJobs, totalEarnings
 */
const WorkerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  
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

      // ✅ CRITICAL FIX: Changed from /workers/stats to /workers/profile
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${API_BASE_URL}/api/v1/workers/profile`;
      
      console.log('🌐 Fetching worker profile from:', endpoint);
      console.log('🔑 Using token:', token.substring(0, 20) + '...');
      
      // Step 2: Fetch complete worker profile from backend
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
        // The /profile endpoint returns the complete worker document
        const workerProfile = data.data;
        
        console.log('📊 Worker profile details:', {
          serviceCategories: workerProfile.serviceCategories,
          specializations: workerProfile.specializations,
          experience: workerProfile.experience,
          hourlyRate: workerProfile.hourlyRate,
          bio: workerProfile.bio,
          skills: workerProfile.skills
        });
        
        setWorkerData(workerProfile);
        
        // Calculate profile completion
        const completion = calculateProfileCompletion(workerProfile);
        console.log('📈 Profile completion:', completion + '%');
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
      }
      
      setError(errorMessage);
      
      // Use localStorage data as fallback
      if (userData) {
        console.log('📦 Using localStorage data as fallback');
        const fallbackWorker = {
          ...userData,
          rating: { average: 0, count: 0 },
          completedJobs: 0,
          totalEarnings: 0,
          acceptanceRate: 0,
          responseTime: 0
        };
        setWorkerData(fallbackWorker);
        setProfileCompletion(calculateProfileCompletion(fallbackWorker));
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (worker) => {
    if (!worker) return 0;
    
    const fields = [
      worker.fullName || worker.userId?.fullName,
      worker.email || worker.userId?.email,
      worker.phoneNumber || worker.userId?.phoneNumber,
      worker.serviceCategories?.length > 0,
      worker.specializations?.length > 0,
      worker.experience > 0,
      worker.hourlyRate > 0,
      worker.bio,
      worker.skills?.length > 0,
      worker.address || worker.userId?.location?.address
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleRetry = () => {
    setRetrying(true);
    fetchWorkerProfile();
  };

  const handleSignOut = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('fixmate_user');
      localStorage.removeItem('fixmate_auth_token');
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !workerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Unable to Load Profile
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {retrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Worker Profile</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700">{error}</p>
              <p className="text-xs text-yellow-600 mt-1">Showing cached data. Click retry to fetch latest data.</p>
            </div>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="ml-3 text-yellow-700 hover:text-yellow-800 font-medium text-sm"
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        {/* Profile Completion */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Completion</h2>
              <p className="text-sm text-gray-600">Complete your profile to get more visibility and bookings!</p>
            </div>
            <div className="text-3xl font-bold text-indigo-600">{profileCompletion}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-center flex-col">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
              {workerData?.userId?.fullName?.[0] || workerData?.fullName?.[0] || 'W'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {workerData?.userId?.fullName || workerData?.fullName || 'Worker Name'}
            </h2>
            <p className="text-gray-600">
              {workerData?.userId?.email || workerData?.email || 'email@example.com'}
            </p>
          </div>

          {/* Statistics */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {workerData?.rating?.average?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-gray-600">Rating ({workerData?.rating?.count || 0})</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {workerData?.completedJobs || 0}
                </div>
                <div className="text-sm text-gray-600">Completed Jobs</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  LKR {workerData?.totalEarnings || 0}
                </div>
                <div className="text-sm text-gray-600">Total Earnings</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  workerData?.availability ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workerData?.availability ? 'Available' : 'Unavailable'}
                </span>
                <div className="text-sm text-gray-600 mt-2">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-gray-900">
                {workerData?.userId?.fullName || workerData?.fullName || 'Not set'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <p className="mt-1 text-gray-900">
                {workerData?.userId?.phoneNumber || workerData?.phoneNumber || 'Not set'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-gray-900">
                {workerData?.address || workerData?.userId?.location?.address || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Service Details
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Service Categories</label>
              <div className="mt-2">
                {workerData?.serviceCategories && workerData.serviceCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {workerData.serviceCategories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No categories selected</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Specializations</label>
              <div className="mt-2">
                {workerData?.specializations && workerData.specializations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {workerData.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No specializations added</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Years of Experience
                </label>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {workerData?.experience || 0} years
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Hourly Rate
                </label>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  LKR {workerData?.hourlyRate || 0}/hour
                </p>
              </div>
            </div>

            {workerData?.bio && (
              <div>
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <p className="mt-1 text-gray-900">{workerData.bio}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Skills</label>
              <div className="mt-2">
                {workerData?.skills && workerData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {workerData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills added</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/worker/dashboard')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/worker/edit-profile')}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/common';

/**
 * Account Type Selection Component
 * Allows users to choose between Customer and Worker roles
 * FIXED: Proper backend registration with correct API endpoint
 */
const AccountTypeSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  useEffect(() => {
    // Get temporary user data from session storage
    const data = sessionStorage.getItem('tempUserData');
    
    if (!data) {
      // No temp data, redirect to signup
      navigate('/signup');
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setTempUserData(parsedData);
      
      // Log for debugging
      console.log('📋 Temp user data loaded:', {
        email: parsedData.email,
        hasToken: !!parsedData.idToken,
        hasFirebaseUid: !!parsedData.firebaseUid
      });
    } catch (err) {
      console.error('Error parsing temp user data:', err);
      setError('Invalid registration data. Please start again.');
      setTimeout(() => navigate('/signup'), 3000);
    }
  }, [navigate]);

  const accountTypes = [
    {
      id: 'customer',
      title: 'I Need Services',
      description: 'Find and hire skilled professionals for your home repairs and improvements',
      icon: Users,
      features: [
        'Browse skilled workers',
        'Book services instantly',
        'Track job progress',
        'Rate and review workers'
      ],
      color: 'indigo'
    },
    {
      id: 'worker',
      title: 'I Provide Services',
      description: 'Offer your skills and connect with customers who need your expertise',
      icon: Wrench,
      features: [
        'Create professional profile',
        'Receive job requests',
        'Manage your schedule',
        'Grow your business'
      ],
      color: 'green'
    }
  ];

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select an account type');
      return;
    }

    if (!tempUserData) {
      setError('Registration data not found. Please start registration again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Starting backend registration...');
      console.log('Selected role:', selectedRole);
      console.log('API URL:', import.meta.env.VITE_API_URL);

      // Prepare registration data for backend
      const registrationData = {
        firebaseUid: tempUserData.firebaseUid,
        email: tempUserData.email,
        fullName: tempUserData.name,
        phoneNumber: tempUserData.phoneNumber,
        address: tempUserData.address,
        role: selectedRole,
      };

      console.log('📤 Sending registration data:', {
        ...registrationData,
        hasToken: !!tempUserData.idToken
      });

      // Call backend API to create user in MongoDB
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${apiUrl}/api/v1/auth/signup`;
      
      console.log('📍 API Endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempUserData.idToken}`
        },
        body: JSON.stringify(registrationData)
      });

      console.log('📥 Response status:', response.status);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Registration failed: ${response.status}`);
      }

      // Registration successful
      console.log('✅ Registration successful!');
      console.log('User created:', data.data?.user || data.user);

      // Store auth token and user data
      sessionStorage.setItem('authToken', tempUserData.idToken);
      sessionStorage.setItem('user', JSON.stringify(data.data?.user || data.user));

      // Clear temporary data
      sessionStorage.removeItem('tempUserData');

      // Redirect based on role
      if (selectedRole === 'customer') {
        console.log('➡️ Redirecting to customer dashboard');
        navigate('/customer/dashboard');
      } else if (selectedRole === 'worker') {
        console.log('➡️ Redirecting to worker registration flow');
        navigate('/worker-registration');
      }

    } catch (err) {
      console.error('❌ Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 5001.';
      } else if (err.message.includes('already exists')) {
        errorMessage = 'This account already exists. Please login instead.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!tempUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Account Type
          </h1>
          <p className="text-lg text-gray-600">
            Welcome, {tempUserData.name}! How would you like to use FixMate?
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Account Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {accountTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedRole === type.id;
            
            return (
              <div
                key={type.id}
                onClick={() => handleRoleSelection(type.id)}
                className={`
                  relative bg-white rounded-2xl shadow-lg p-8 cursor-pointer
                  transition-all duration-300 transform hover:scale-105
                  ${isSelected 
                    ? `ring-4 ring-${type.color}-500 ring-opacity-50 shadow-2xl` 
                    : 'hover:shadow-xl'
                  }
                `}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className={`h-8 w-8 text-${type.color}-600`} />
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-full mb-6
                  ${isSelected 
                    ? `bg-${type.color}-100` 
                    : 'bg-gray-100'
                  }
                `}>
                  <Icon className={`
                    h-8 w-8 
                    ${isSelected 
                      ? `text-${type.color}-600` 
                      : 'text-gray-600'
                    }
                  `} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {type.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {type.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className={`
                        h-5 w-5 mr-3 mt-0.5 flex-shrink-0
                        ${isSelected 
                          ? `text-${type.color}-600` 
                          : 'text-gray-400'
                        }
                      `} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Select Button */}
                <div className="mt-8">
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelection(type.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            fullWidth
            size="lg"
            icon={<ArrowRight className="h-5 w-5" />}
            iconPosition="right"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </Button>

          {/* Back to Signup */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/signup')}
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              ← Back to Registration
            </button>
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono max-w-2xl mx-auto">
            <div className="font-bold mb-2">Debug Info:</div>
            <div>Email: {tempUserData.email}</div>
            <div>Has Token: {tempUserData.idToken ? 'Yes' : 'No'}</div>
            <div>Has Firebase UID: {tempUserData.firebaseUid ? 'Yes' : 'No'}</div>
            <div>API URL: {import.meta.env.VITE_API_URL || 'Not set'}</div>
            <div>Selected Role: {selectedRole || 'None'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountTypeSelection;
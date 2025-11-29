import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/common';

/**
 * Account Type Selection Component
 * ✅ FIXED: Workers navigate to registration flow FIRST, then register with complete data
 */
function AccountTypeSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem('tempUserData');
    
    if (!data) {
      navigate('/signup');
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setTempUserData(parsedData);
      
      console.log('✅ User data loaded');
      console.log('Email:', parsedData.email);
      console.log('Firebase UID:', parsedData.firebaseUid);
      console.log('Has Token:', !!parsedData.idToken);
    } catch (err) {
      console.error('Error:', err);
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
    console.log('Selected role:', role);
    setSelectedRole(role);
    setError('');
  };

  // ✅ NEW: Separate function for customer registration
  const registerCustomer = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${apiUrl}/api/v1/auth/signup`;
      
      console.log('🚀 Registering customer...');

      const registrationData = {
        firebaseUid: tempUserData.firebaseUid,
        email: tempUserData.email,
        phoneNumber: tempUserData.phoneNumber,
        fullName: tempUserData.name || tempUserData.fullName || `${tempUserData.firstName} ${tempUserData.lastName}`,
        role: 'customer',
        firstName: tempUserData.firstName,
        lastName: tempUserData.lastName,
        address: tempUserData.address,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempUserData.idToken}`
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Registration failed: ${response.status}`);
      }

      console.log('✅ Customer registration successful!');

      sessionStorage.setItem('authToken', data.token || tempUserData.idToken);
      sessionStorage.setItem('user', JSON.stringify(data.data?.user || data.user));
      sessionStorage.removeItem('tempUserData');

      navigate('/customer/dashboard');

    } catch (err) {
      console.error('❌ Registration error:', err);
      
      let errorMessage = 'Registration failed. ';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if backend is running on port 5001.';
      } else if (err.message.includes('already exists')) {
        errorMessage = 'This account already exists. Please login instead.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Main handler - navigate to worker flow instead of registering
  const handleContinue = () => {
    if (!selectedRole) {
      setError('Please select an account type');
      return;
    }

    if (!tempUserData) {
      setError('Registration data not found.');
      return;
    }

    if (!tempUserData.firebaseUid) {
      console.error('❌ Firebase UID is missing!');
      setError('Firebase UID is missing. Please sign up again.');
      return;
    }

    console.log('🎯 Navigating to registration flow for:', selectedRole);

    if (selectedRole === 'customer') {
      // Customers register immediately (no additional profile data needed)
      registerCustomer();
    } else if (selectedRole === 'worker') {
      // ✅ NEW APPROACH: Workers navigate to complete registration form FIRST
      // Registration happens AFTER they fill out the complete profile
      console.log('→ Navigating to Worker Registration Flow');
      console.log('📝 Worker will fill complete profile before registration');
      navigate('/worker-registration');
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
            Welcome, {tempUserData.name || `${tempUserData.firstName} ${tempUserData.lastName}`}! How would you like to use FixMate?
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
                    ? 'ring-4 ring-indigo-500 ring-opacity-50 shadow-2xl' 
                    : 'hover:shadow-xl'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="h-8 w-8 text-indigo-600" />
                  </div>
                )}

                <div className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-full mb-6
                  ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}
                `}>
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {type.title}
                </h3>

                <p className="text-gray-600 mb-6">
                  {type.description}
                </p>

                <ul className="space-y-3">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className={`
                        h-5 w-5 mr-3 mt-0.5 flex-shrink-0
                        ${isSelected ? 'text-indigo-600' : 'text-gray-400'}
                      `} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

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

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/signup')}
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              ← Back to Registration
            </button>
          </div>
        </div>

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono max-w-2xl mx-auto">
            <div className="font-bold mb-2">Debug Info:</div>
            <div>Email: {tempUserData.email}</div>
            <div>Firebase UID: {tempUserData.firebaseUid || '❌ MISSING'}</div>
            <div>Has Token: {tempUserData.idToken ? 'Yes' : 'No'}</div>
            <div>Phone: {tempUserData.phoneNumber}</div>
            <div>Name: {tempUserData.name || `${tempUserData.firstName} ${tempUserData.lastName}`}</div>
            <div>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:5001 (default)'}</div>
            <div>Selected Role: {selectedRole || 'None'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountTypeSelection;
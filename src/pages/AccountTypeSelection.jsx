import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/common';
import { getAuth } from 'firebase/auth';

/**
 * Account Type Selection Component
 * ✅ FIXED: Proper token refresh and customer navigation
 */
function AccountTypeSelection() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem('tempUserData');
    
    if (!data) {
      console.warn('⚠️ No temp user data found, redirecting to signup');
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
      console.error('❌ Parse error:', err);
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

  // ✅ CRITICAL FIX: Get fresh Firebase token before registration
  const getFreshToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      console.log('🔄 Refreshing Firebase token...');
      const freshToken = await currentUser.getIdToken(true); // Force refresh
      console.log('✅ Fresh token obtained (length:', freshToken.length, ')');
      return freshToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw new Error('Failed to refresh authentication token. Please try logging in again.');
    }
  };

  // ✅ FIXED: Customer registration with fresh token
  const registerCustomer = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('\n🚀 Starting customer registration...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Step 1: Get fresh token
      const freshToken = await getFreshToken();
      
      // Step 2: Prepare registration data
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${apiUrl}/auth/signup`;
      
      const registrationData = {
        firebaseUid: tempUserData.firebaseUid,
        email: tempUserData.email,
        phoneNumber: tempUserData.phoneNumber || '',
        fullName: tempUserData.name || tempUserData.fullName || `${tempUserData.firstName || ''} ${tempUserData.lastName || ''}`.trim(),
        role: 'customer',
        firstName: tempUserData.firstName || '',
        lastName: tempUserData.lastName || '',
        address: tempUserData.address || '',
      };

      console.log('📤 Sending registration request...');
      console.log('Endpoint:', endpoint);
      console.log('Email:', registrationData.email);
      console.log('Role:', registrationData.role);

      // Step 3: Make registration API call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}` // ✅ Use fresh token
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      console.log('📥 Registration response:', {
        status: response.status,
        success: data.success,
        message: data.message
      });

      if (!response.ok) {
        throw new Error(data.message || `Registration failed: ${response.status}`);
      }

      console.log('✅ Customer registration successful!');
      console.log('User ID:', data.data?.user?.id);
      console.log('Customer ID:', data.data?.customer?.id);

      // ✅ CRITICAL FIX: Save BOTH token and user data to sessionStorage AND localStorage
      const userDataToSave = {
        id: data.data?.user?.id,
        email: data.data?.user?.email,
        fullName: data.data?.user?.fullName,
        role: 'customer',
        firebaseUid: data.data?.user?.firebaseUid,
        customerId: data.data?.customer?.id
      };

      // Save to both storages for reliability
      sessionStorage.setItem('authToken', freshToken);
      sessionStorage.setItem('user', JSON.stringify(userDataToSave));
      localStorage.setItem('authToken', freshToken);
      localStorage.setItem('user', JSON.stringify(userDataToSave));
      
      console.log('💾 User data saved to storage');

      // Remove temp data
      sessionStorage.removeItem('tempUserData');
      
      console.log('🎯 Navigating to customer dashboard...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Step 4: Navigate to customer dashboard
      navigate('/customer/dashboard', { replace: true });

    } catch (err) {
      console.error('❌ Registration error:', err);
      
      let errorMessage = 'Registration failed. ';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if backend is running on port 5001.';
      } else if (err.message.includes('already exists')) {
        errorMessage = 'This account already exists. Please login instead.';
      } else if (err.message.includes('token')) {
        errorMessage = 'Authentication token expired. Please sign up again.';
        // Redirect to signup if token issue
        setTimeout(() => {
          sessionStorage.removeItem('tempUserData');
          navigate('/signup');
        }, 3000);
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

    console.log('🎯 Processing registration for:', selectedRole);

    if (selectedRole === 'customer') {
      // Customers register immediately
      registerCustomer();
    } else if (selectedRole === 'worker') {
      // Workers navigate to registration form
      console.log('→ Navigating to Worker Registration Flow');
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
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {accountTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedRole === type.id;
            
            return (
              <div
                key={type.id}
                onClick={() => handleRoleSelection(type.id)}
                className={`
                  relative p-8 rounded-2xl cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? `bg-${type.color}-50 border-2 border-${type.color}-500 shadow-lg transform scale-105` 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {isSelected && (
                  <div className={`absolute top-4 right-4 bg-${type.color}-500 text-white rounded-full p-1.5`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}

                <div className={`
                  inline-flex p-4 rounded-xl mb-4
                  ${isSelected ? `bg-${type.color}-100` : 'bg-gray-100'}
                `}>
                  <Icon className={`
                    h-12 w-12
                    ${isSelected ? `text-${type.color}-600` : 'text-gray-600'}
                  `} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {type.description}
                </p>

                <ul className="space-y-3">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className={`
                        h-5 w-5 flex-shrink-0
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

        {/* Debug Info (DEV only) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono max-w-2xl mx-auto">
            <div className="font-bold mb-2">Debug Info:</div>
            <div>Email: {tempUserData.email}</div>
            <div>Firebase UID: {tempUserData.firebaseUid || '❌ MISSING'}</div>
            <div>Has Token: {tempUserData.idToken ? 'Yes ✅' : 'No ❌'}</div>
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
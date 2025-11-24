import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wrench, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';

const AccountTypeSelection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);

  useEffect(() => {
    // Retrieve temporary user data from sessionStorage
    const data = sessionStorage.getItem('tempUserData');
    if (data) {
      try {
        setTempUserData(JSON.parse(data));
      } catch (error) {
        console.error('Error parsing temp user data:', error);
        navigate('/signup');
      }
    } else {
      // No temp data, redirect to signup
      navigate('/signup');
    }
  }, [navigate]);

  const handleCustomerSelection = async () => {
    if (!tempUserData) {
      alert('Session expired. Please sign up again.');
      navigate('/signup');
      return;
    }

    setLoading(true);

    try {
      // Get API URL from environment variables
      // Support both VITE_API_URL and VITE_API_BASE_URL
      const apiBaseUrl = import.meta.env.VITE_API_URL || 
                         import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
                         'http://localhost:5001';
      
      const apiUrl = `${apiBaseUrl}/api/v1/auth/signup`;

      console.log('Creating customer account at:', apiUrl);

      // Create customer account
      const customerData = {
        firstName: tempUserData.firstName,
        lastName: tempUserData.lastName,
        name: tempUserData.name,
        email: tempUserData.email,
        phoneNumber: tempUserData.phoneNumber,
        address: tempUserData.address,
        role: 'customer',
        firebaseUid: tempUserData.firebaseUid
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempUserData.idToken}`
        },
        body: JSON.stringify(customerData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Customer account created:', data);

      if (data.success || data.user) {
        // Store auth token and user data
        const authToken = data.token || tempUserData.idToken;
        sessionStorage.setItem('authToken', authToken);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Clear temporary data
        sessionStorage.removeItem('tempUserData');

        // Show success message
        alert('Customer account created successfully!');

        // Redirect to customer dashboard
        navigate('/customer/dashboard');
      } else {
        throw new Error(data.message || 'Failed to create customer account');
      }
    } catch (error) {
      console.error('Customer registration error:', error);
      alert(`Failed to create customer account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSelection = () => {
    // Navigate to worker registration flow
    navigate('/worker-registration');
  };

  if (!tempUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to FixMate!
          </h1>
          <p className="text-lg text-gray-600">
            How would you like to use FixMate?
          </p>
        </div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Looking for Services
            </h2>
            
            <p className="text-gray-600 mb-6">
              Find skilled professionals for your home repairs, maintenance, and improvement projects
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Find Workers
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Get Quotes
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Book Services
              </li>
            </ul>

            <Button
              onClick={handleCustomerSelection}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Setting up...
                </>
              ) : (
                <>
                  I Need Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          {/* Worker Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-orange-500 transition-all duration-300 transform hover:scale-105">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Providing Services
            </h2>
            
            <p className="text-gray-600 mb-6">
              Offer your skills and grow your business by connecting with clients who need your expertise
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Get Clients
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Send Quotes
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Earn More
              </li>
            </ul>

            <Button
              onClick={handleWorkerSelection}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg font-semibold rounded-lg flex items-center justify-center"
            >
              I Provide Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 mt-8 text-sm">
          You can always switch your account type later from your profile settings
        </p>
      </div>
    </div>
  );
};

export default AccountTypeSelection;
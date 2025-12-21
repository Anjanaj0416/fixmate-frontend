import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Input, Button } from '../common';
import { AuthContext } from '../../context/AuthContext';
import storage from '../../utils/storage'; // ← ADD THIS IMPORT

/**
 * Login Form Component
 * Handles user login with email and password
 * 
 * ✅ FIXED: Using storage utility for consistent token management
 * ✅ FIXED: Proper error handling with detailed messages
 */
const LoginForm = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { updateUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔐 Starting login process...');

      // Step 1: Sign in with Firebase
      console.log('1️⃣ Authenticating with Firebase...');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log('✅ Firebase authentication successful');
      console.log('👤 Firebase UID:', userCredential.user.uid);

      // Step 2: Get Firebase ID token
      console.log('2️⃣ Getting Firebase ID token...');
      const idToken = await userCredential.user.getIdToken();
      console.log('✅ ID token obtained');

      // Step 3: Verify with backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      console.log('3️⃣ Verifying with backend:', `${apiUrl}/auth/login`);

      const requestBody = {
        firebaseUid: userCredential.user.uid,
      };

      console.log('📤 Request body:', requestBody);

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('✅ Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Response data:', data);

      // Extract user data from response
      const userData = data.data?.user || data.user || data.data || data;
      
      if (!userData || !userData.role) {
        console.error('❌ Invalid user data in response:', data);
        throw new Error('Invalid response - missing user data');
      }

      const userRole = userData.role;

      console.log('👤 User data:', userData);
      console.log('🎭 User role:', userRole);

      // ✅ FIX: Use storage utility for consistent token storage
      console.log('💾 Storing authentication data...');
      storage.saveAuthToken(idToken);
      storage.saveUserData(userData);
      console.log('✅ Authentication data stored');

      // ✅ CRITICAL: Update AuthContext BEFORE navigation
      if (updateUser) {
        console.log('🔄 Updating AuthContext with user data...');
        updateUser(userData);
        console.log('✅ AuthContext updated');
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(userData);
      }

      console.log('✅ Login successful!');

      // Small delay to ensure state updates complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate based on user role with fallback
      console.log('🧭 Navigating based on role:', userRole);
      
      if (userRole === 'customer') {
        console.log('→ Redirecting to customer dashboard');
        navigate('/customer/dashboard', { replace: true });
        // Fallback if React Router fails
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            console.log('🚨 React Router failed, using window.location');
            window.location.href = '/customer/dashboard';
          }
        }, 500);
      } else if (userRole === 'worker') {
        console.log('→ Redirecting to worker dashboard');
        navigate('/worker/dashboard', { replace: true });
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = '/worker/dashboard';
          }
        }, 500);
      } else if (userRole === 'admin') {
        console.log('→ Redirecting to admin panel');
        navigate('/admin', { replace: true });
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = '/admin';
          }
        }, 500);
      } else {
        console.log('⚠️ Unknown role, redirecting to home');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'An error occurred during login';
      
      // Handle Firebase errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({
        submit: errorMessage,
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Error Alert */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <Input
          type="email"
          name="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email"
          required
          autoComplete="email"
        />

        {/* Password Input */}
        <Input
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

export default LoginForm;
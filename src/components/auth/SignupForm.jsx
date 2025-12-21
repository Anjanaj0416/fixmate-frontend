import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Input, Button } from '../common';

/**
 * Signup Form Component
 * Handles user registration with role selection
 */
const SignupForm = ({ onSuccess, onError, defaultRole = 'customer' }) => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [step, setStep] = useState(1); // Multi-step form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: defaultRole,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

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

  // Validate step 1 (Role selection)
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2 (Personal info)
  const validateStep2 = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (Sri Lankan format)
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+94|0)[0-9]{9}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number (e.g., +94712345678)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  // Handle previous step
  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      // Create user in backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          firebaseUid: userCredential.user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      sessionStorage.setItem('authToken', idToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Call success callback
      if (onSuccess) {
        onSuccess(data.user);
      }

      // Redirect based on role
      if (formData.role === 'customer') {
        navigate('/customer/onboarding');
      } else if (formData.role === 'worker') {
        navigate('/worker/onboarding');
      }
    } catch (error) {
      console.error('Signup error:', error);

      let errorMessage = 'An error occurred during registration';

      // Handle Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({
        general: errorMessage,
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join FixMate today</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 ${
                  step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Choose Role</span>
            <span>Your Info</span>
          </div>
        </div>

        {/* General error message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              I want to:
            </h3>

            {/* Customer option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'customer' })}
              className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                formData.role === 'customer'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.role === 'customer'
                        ? 'border-indigo-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {formData.role === 'customer' && (
                      <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Find Skilled Workers
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Book trusted professionals for home services and repairs
                  </p>
                </div>
              </div>
            </button>

            {/* Worker option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'worker' })}
              className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                formData.role === 'worker'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.role === 'worker'
                        ? 'border-indigo-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {formData.role === 'worker' && (
                      <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Offer My Services
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Join as a skilled worker and grow your business
                  </p>
                </div>
              </div>
            </button>

            {errors.role && (
              <p className="text-sm text-red-600">{errors.role}</p>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleNext}
              className="mt-6"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: User Information */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <Input
              type="text"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter your full name"
              required
            />

            {/* Email */}
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

            {/* Phone Number */}
            <Input
              type="tel"
              name="phoneNumber"
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              placeholder="+94 71 234 5678"
              helperText="Format: +94 XXX XXX XXX"
              required
            />

            {/* Password */}
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a strong password"
              helperText="At least 8 characters with uppercase, lowercase, and numbers"
              autoComplete="new-password"
              required
            />

            {/* Confirm Password */}
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1 cursor-pointer"
              />
              <label
                htmlFor="accept-terms"
                className="ml-2 block text-sm text-gray-700 cursor-pointer"
              >
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-indigo-600 hover:text-indigo-800"
                  target="_blank"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-indigo-600 hover:text-indigo-800"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600 -mt-2">{errors.terms}</p>
            )}

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        )}

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

SignupForm.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  defaultRole: PropTypes.oneOf(['customer', 'worker']),
};

export default SignupForm;
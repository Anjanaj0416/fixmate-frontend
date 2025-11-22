import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button } from '../common';

/**
 * Google Authentication Button Component
 * Handles Google OAuth sign-in/sign-up
 */
const GoogleAuthButton = ({ 
  mode = 'signin', 
  role = 'customer',
  onSuccess, 
  onError,
  fullWidth = true,
}) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);

    try {
      // Create Google provider
      const provider = new GoogleAuthProvider();
      
      // Add custom parameters
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      
      // Get user data
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = await user.getIdToken();

      // Check if this is a new user
      const isNewUser = result._tokenResponse?.isNewUser || false;

      // Determine endpoint based on mode and new user status
      let endpoint = '/api/v1/auth/login';
      let requestBody = {
        email: user.email,
        provider: 'google',
      };

      // If new user or signup mode, register in backend
      if (isNewUser || mode === 'signup') {
        endpoint = '/api/v1/auth/signup';
        requestBody = {
          name: user.displayName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          role: role,
          firebaseUid: user.uid,
          profileImage: user.photoURL,
          provider: 'google',
          emailVerified: user.emailVerified,
        };
      }

      // Call backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token and user data
      sessionStorage.setItem('authToken', idToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Call success callback
      if (onSuccess) {
        onSuccess(data.user);
      }

      // Redirect based on user status and role
      if (isNewUser || mode === 'signup') {
        // New user - go to onboarding
        if (data.user.role === 'customer') {
          navigate('/customer/onboarding');
        } else if (data.user.role === 'worker') {
          navigate('/worker/onboarding');
        }
      } else {
        // Existing user - go to dashboard
        if (data.user.role === 'customer') {
          navigate('/customer/dashboard');
        } else if (data.user.role === 'worker') {
          navigate('/worker/dashboard');
        } else if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Google auth error:', error);

      let errorMessage = 'An error occurred during authentication';

      // Handle Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by browser';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (onError) {
        onError(new Error(errorMessage));
      } else {
        // Show error in UI
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      fullWidth={fullWidth}
      onClick={handleGoogleAuth}
      loading={loading}
      disabled={loading}
      icon={
        !loading && (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )
      }
      iconPosition="left"
    >
      {loading
        ? 'Connecting...'
        : mode === 'signup'
        ? 'Sign up with Google'
        : 'Continue with Google'}
    </Button>
  );
};

GoogleAuthButton.propTypes = {
  mode: PropTypes.oneOf(['signin', 'signup']),
  role: PropTypes.oneOf(['customer', 'worker']),
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  fullWidth: PropTypes.bool,
};

export default GoogleAuthButton;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Button } from '../common';

/**
 * Two-Factor Authentication Component
 * Handles SMS-based phone verification
 */
const TwoFactorAuth = ({ 
  phoneNumber, 
  onSuccess, 
  onError,
  onCancel,
  showCancel = true,
}) => {
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [step, setStep] = useState('send'); // 'send' | 'verify'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const recaptchaRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('94')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  // Initialize reCAPTCHA
  useEffect(() => {
    if (!window.recaptchaVerifier && recaptchaRef.current) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          recaptchaRef.current,
          {
            size: 'invisible',
            callback: (response) => {
              console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
              window.recaptchaVerifier = null;
            },
          },
          auth
        );
      } catch (error) {
        console.error('reCAPTCHA initialization error:', error);
      }
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [auth]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Send OTP
  const handleSendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      // Format phone number (ensure it starts with +)
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+94' + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith('94')) {
          formattedPhone = '+' + formattedPhone;
        }
      }

      // Get or create reCAPTCHA verifier
      const appVerifier = window.recaptchaVerifier;
      
      if (!appVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      // Send verification code
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResult(confirmation);
      setStep('verify');
      setResendTimer(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Send OTP error:', error);

      let errorMessage = 'Failed to send verification code';

      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again tomorrow';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      if (onError) {
        onError(new Error(errorMessage));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  // Handle OTP input keydown
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    // Focus last filled input or first empty
    const lastFilledIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify the code
      const result = await confirmationResult.confirm(otpCode);
      
      // Get user
      const user = result.user;

      // Call backend to verify 2FA
      const idToken = await user.getIdToken();
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/auth/verify-2fa`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            verified: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '2FA verification failed');
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(data.user);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);

      let errorMessage = 'Invalid verification code';

      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code expired. Please request a new one';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      if (onError) {
        onError(new Error(errorMessage));
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      return;
    }

    setOtp(['', '', '', '', '', '']);
    setError('');
    await handleSendOTP();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'send' ? 'Verify Your Phone' : 'Enter Verification Code'}
          </h2>
          <p className="text-gray-600">
            {step === 'send'
              ? `We'll send a verification code to ${formatPhoneNumber(phoneNumber)}`
              : `Enter the 6-digit code sent to ${formatPhoneNumber(phoneNumber)}`}
          </p>
        </div>

        {/* Error message */}
        {error && (
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
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Send OTP Step */}
        {step === 'send' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-600 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-800">
                  Standard SMS rates may apply. The verification code will expire in 5 minutes.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleSendOTP}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>

            {showCancel && (
              <Button
                variant="ghost"
                fullWidth
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* Verify OTP Step */}
        {step === 'verify' && (
          <div className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    error
                      ? 'border-red-500'
                      : digit
                      ? 'border-indigo-600'
                      : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Resend button */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Verify button */}
            <Button
              variant="primary"
              fullWidth
              onClick={handleVerifyOTP}
              loading={loading}
              disabled={loading || otp.some((digit) => !digit)}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            {showCancel && (
              <Button
                variant="ghost"
                fullWidth
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* reCAPTCHA container */}
        <div ref={recaptchaRef} id="recaptcha-container" />
      </div>
    </div>
  );
};

TwoFactorAuth.propTypes = {
  phoneNumber: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onCancel: PropTypes.func,
  showCancel: PropTypes.bool,
};

export default TwoFactorAuth;
import React, { useState } from 'react';
import { Power, CheckCircle, XCircle, Loader, Shield, ShieldOff } from 'lucide-react';
import apiService from '../../services/apiService';

/**
 * AvailabilityToggle Component - UPDATED WITH VERIFICATION
 * Allows workers to toggle their availability status on/off
 * ✅ UPDATED: Also updates isVerified status (ON = verified: true, OFF = verified: false)
 * 
 * Features:
 * - Visual toggle switch with smooth animations
 * - Real-time status updates for both availability AND verification
 * - Loading states
 * - Error handling
 * - Success feedback
 */
const AvailabilityToggle = ({ initialAvailability = true, initialVerified = false, onToggle }) => {
  const [availability, setAvailability] = useState(initialAvailability);
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleToggle = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const newAvailability = !availability;
      const newVerified = newAvailability; // ✅ When ON (available), verified = true; when OFF, verified = false

      console.log('🔄 Toggling availability and verification:', {
        availability: newAvailability,
        isVerified: newVerified
      });

      const response = await apiService.put('/workers/availability', {
        availability: newAvailability,
        isVerified: newVerified  // ✅ Send both fields
      });

      console.log('✅ Availability and verification updated:', response);

      // Update local state
      setAvailability(newAvailability);
      setIsVerified(newVerified);
      
      // Show success message
      const statusText = newAvailability ? 'available and verified' : 'unavailable and unverified';
      setSuccessMessage(`You are now ${statusText} for new bookings`);
      
      // Call parent callback if provided
      if (onToggle) {
        onToggle(newAvailability, newVerified);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('❌ Error updating availability:', error);
      setError(error.response?.data?.message || 'Failed to update availability. Please try again.');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${availability ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Power className={`w-5 h-5 ${availability ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Availability Status</h3>
            <p className="text-sm text-gray-600">
              {availability ? 'Currently accepting new bookings' : 'Not accepting new bookings'}
            </p>
          </div>
        </div>
        
        {/* Status Badges */}
        <div className="flex items-center gap-2">
          {/* Availability Badge */}
          <div className={`px-3 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${
            availability 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {availability ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Available
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Unavailable
              </>
            )}
          </div>

          {/* ✅ NEW: Verification Badge */}
          <div className={`px-3 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${
            isVerified 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isVerified ? (
              <>
                <Shield className="w-4 h-4" />
                Verified
              </>
            ) : (
              <>
                <ShieldOff className="w-4 h-4" />
                Unverified
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1">
          <p className="font-medium text-gray-900 mb-1">
            Accept New Bookings
          </p>
          <p className="text-sm text-gray-600">
            {availability 
              ? 'Toggle OFF to stop receiving requests and become unverified' 
              : 'Toggle ON to start receiving requests and become verified'}
          </p>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            availability 
              ? 'bg-green-600 focus:ring-green-500' 
              : 'bg-gray-300 focus:ring-gray-400'
          }`}
        >
          <span className="sr-only">Toggle availability</span>
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
              availability ? 'translate-x-7' : 'translate-x-1'
            } ${loading ? 'animate-pulse' : ''}`}
          >
            {loading && (
              <Loader className="w-4 h-4 m-1 animate-spin text-gray-600" />
            )}
          </span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Info Message */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> When you're <strong>available</strong>, you'll be marked as <strong>verified</strong> and customers can send you quote requests. 
          When <strong>unavailable</strong>, you'll be marked as <strong>unverified</strong> and won't appear in customer searches.
        </p>
      </div>
    </div>
  );
};

export default AvailabilityToggle;
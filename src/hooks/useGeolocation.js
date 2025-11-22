import { useState, useEffect } from 'react';

/**
 * Custom hook for accessing geolocation
 * Provides current position, loading state, and error handling
 * 
 * @param {Object} options - Geolocation options
 * @returns {Object} Geolocation state
 * 
 * @example
 * const { position, loading, error, getCurrentPosition } = useGeolocation();
 * 
 * if (position) {
 *   console.log('Lat:', position.latitude, 'Lng:', position.longitude);
 * }
 */
const useGeolocation = (options = {}) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  };

  /**
   * Get current position
   */
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
        setLoading(false);
        setError(null);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      defaultOptions
    );
  };

  /**
   * Watch position (continuous tracking)
   */
  const watchPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return null;
    }

    setLoading(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
        setLoading(false);
        setError(null);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      defaultOptions
    );

    return watchId;
  };

  /**
   * Stop watching position
   */
  const clearWatch = (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  };

  /**
   * Check if geolocation is supported
   */
  const isSupported = () => {
    return 'geolocation' in navigator;
  };

  /**
   * Request permission for geolocation
   */
  const requestPermission = async () => {
    try {
      if (!isSupported()) {
        return { granted: false, error: 'Geolocation not supported' };
      }

      // Try to get position to trigger permission prompt
      const result = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve({ granted: true }),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              resolve({ granted: false, error: 'Permission denied' });
            } else {
              reject(error);
            }
          },
          { timeout: 5000 }
        );
      });

      return result;
    } catch (error) {
      return { granted: false, error: error.message };
    }
  };

  return {
    position,
    loading,
    error,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    isSupported,
    requestPermission,
  };
};

export default useGeolocation;
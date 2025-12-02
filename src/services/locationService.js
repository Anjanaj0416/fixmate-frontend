/**
 * Location Service
 * Handles GPS location capture with fallback options
 * 
 * WHY: Need to capture customer location for finding nearby workers
 * FEATURES:
 * - GPS location with permission handling
 * - Reverse geocoding (coordinates → address)
 * - Distance calculations
 * - Fallback to manual entry
 */

class LocationService {
  constructor() {
    // Default location: Colombo, Sri Lanka
    this.defaultLocation = {
      coordinates: {
        latitude: 6.9271,
        longitude: 79.9616,
      },
      address: 'Colombo, Sri Lanka',
    };
  }

  /**
   * Get current GPS location
   * @returns {Promise} Resolves with location object or rejects with error
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      console.log('📍 Requesting GPS location...');

      const options = {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 15000, // 15 seconds timeout
        maximumAge: 0, // Don't use cached position
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('✅ GPS location obtained:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: `${position.coords.accuracy}m`,
          });

          const location = {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };

          // Optionally get address from coordinates
          try {
            const address = await this.reverseGeocode(
              location.coordinates.latitude,
              location.coordinates.longitude
            );
            location.address = address;
          } catch (error) {
            console.warn('Could not get address:', error);
            location.address = {
              full: 'Location obtained',
            };
          }

          resolve(location);
        },
        (error) => {
          console.error('❌ GPS error:', error);
          
          let errorMessage;
          let errorCode = error.code;

          switch (errorCode) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'Unknown error getting location.';
          }

          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Get location with user-friendly error handling
   * Falls back to manual address entry if GPS fails
   * 
   * @returns {Promise} Location result with success status
   */
  async getLocationWithFallback() {
    try {
      const location = await this.getCurrentLocation();
      return {
        success: true,
        location,
        method: 'gps',
      };
    } catch (error) {
      console.warn('GPS failed, using fallback:', error.message);
      return {
        success: false,
        error: error.message,
        location: null,
        method: 'fallback',
        requiresManualInput: true,
      };
    }
  }

  /**
   * Reverse geocode coordinates to address
   * Uses Nominatim (OpenStreetMap) API - free, no API key required
   * 
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<Object>} Address object
   */
  async reverseGeocode(latitude, longitude) {
    try {
      console.log('🗺️ Reverse geocoding:', { latitude, longitude });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FixMate App', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      const address = {
        full: data.display_name,
        road: data.address.road,
        suburb: data.address.suburb,
        city: data.address.city || data.address.town || data.address.village,
        district: data.address.state_district || data.address.county,
        province: data.address.state,
        postcode: data.address.postcode,
        country: data.address.country,
        countryCode: data.address.country_code,
      };

      console.log('✅ Address obtained:', address.full);

      return address;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return {
        full: 'Location obtained',
      };
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * 
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if location permissions are granted
   * 
   * @returns {Promise<string>} Permission state: 'granted', 'denied', or 'prompt'
   */
  async checkPermission() {
    try {
      if (!navigator.permissions) {
        return 'unsupported';
      }

      const result = await navigator.permissions.query({ name: 'geolocation' });
      console.log('📋 Location permission status:', result.state);
      
      return result.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Permission check error:', error);
      return 'unsupported';
    }
  }

  /**
   * Format distance for display
   * 
   * @param {number} distanceKm - Distance in kilometers
   * @returns {string} Formatted distance string
   */
  formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }

  /**
   * Get location from address using geocoding (address → coordinates)
   * 
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Location object with coordinates
   */
  async geocodeAddress(address) {
    try {
      console.log('🗺️ Geocoding address:', address);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FixMate App',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('Address not found');
      }

      const result = data[0];

      const location = {
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        },
        address: {
          full: result.display_name,
          city: result.address.city || result.address.town,
          district: result.address.state_district,
          province: result.address.state,
          country: result.address.country,
        },
      };

      console.log('✅ Coordinates obtained:', location.coordinates);

      return location;
    } catch (error) {
      console.error('Geocode error:', error);
      throw error;
    }
  }

  /**
   * Watch location changes
   * Useful for real-time tracking
   * 
   * @param {Function} callback - Called with location updates
   * @returns {number} Watch ID (use to clear watch)
   */
  watchLocation(callback) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        };
        callback(null, location);
      },
      (error) => {
        callback(error, null);
      },
      options
    );

    console.log('👁️ Started watching location, watchId:', watchId);

    return watchId;
  }

  /**
   * Stop watching location changes
   * 
   * @param {number} watchId - Watch ID from watchLocation()
   */
  clearWatch(watchId) {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      console.log('🛑 Stopped watching location, watchId:', watchId);
    }
  }
}

// Export singleton instance
export default new LocationService();
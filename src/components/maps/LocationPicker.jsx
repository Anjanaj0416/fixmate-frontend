import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  MapPin,
  Search,
  Navigation,
  CheckCircle,
  X,
  Loader
} from 'lucide-react';

const LocationPicker = ({
  initialLocation = { lat: 7.8731, lng: 80.7718 }, // Sri Lanka center
  onLocationSelect,
  onClose,
  height = '500px'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      initializeMap();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && searchInputRef.current && window.google) {
      initializeAutocomplete();
    }
  }, [isLoaded]);

  const loadGoogleMapsScript = () => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your API key.');
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapOptions = {
      center: selectedLocation,
      zoom: 13,
      mapTypeId: 'roadmap',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy'
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

    // Add marker
    markerRef.current = new window.google.maps.Marker({
      position: selectedLocation,
      map: mapInstanceRef.current,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });

    // Handle marker drag
    markerRef.current.addListener('dragend', (event) => {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setSelectedLocation(newLocation);
      reverseGeocode(newLocation);
    });

    // Handle map click
    mapInstanceRef.current.addListener('click', (event) => {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setSelectedLocation(newLocation);
      updateMarkerPosition(newLocation);
      reverseGeocode(newLocation);
    });

    // Get initial address
    reverseGeocode(selectedLocation);
  };

  const initializeAutocomplete = () => {
    if (!searchInputRef.current || !window.google) return;

    const options = {
      componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
      fields: ['address_components', 'geometry', 'name', 'formatted_address']
    };

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      searchInputRef.current,
      options
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry || !place.geometry.location) {
        alert('No details available for input: ' + place.name);
        return;
      }

      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      setSelectedLocation(newLocation);
      setAddress(place.formatted_address);
      updateMarkerPosition(newLocation);
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(newLocation);
        mapInstanceRef.current.setZoom(15);
      }
    });
  };

  const reverseGeocode = async (location) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ location });
      
      if (response.results[0]) {
        setAddress(response.results[0].formatted_address);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const updateMarkerPosition = (location) => {
    if (markerRef.current) {
      markerRef.current.setPosition(location);
      markerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        markerRef.current.setAnimation(null);
      }, 750);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsSearching(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setSelectedLocation(newLocation);
        updateMarkerPosition(newLocation);
        reverseGeocode(newLocation);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(newLocation);
          mapInstanceRef.current.setZoom(15);
        }
        
        setIsSearching(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location. Please check your browser permissions.');
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleConfirmLocation = () => {
    if (onLocationSelect) {
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: address
      });
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading location picker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapPin className="w-6 h-6" />
          <h2 className="text-xl font-bold">Select Location</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleUseMyLocation}
          disabled={isSearching}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {isSearching ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Getting your location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              <span>Use My Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Selected Location Info */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Selected Location
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {address || 'Select a location on the map'}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Lat: {selectedLocation.lat.toFixed(6)}</span>
                <span>Lng: {selectedLocation.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirmLocation}
            disabled={!address}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Confirm Location</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 pb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Click on the map or drag the marker to select a location. 
            You can also search for an address using the search bar above.
          </p>
        </div>
      </div>
    </div>
  );
};

LocationPicker.propTypes = {
  initialLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  onLocationSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  height: PropTypes.string
};

export default LocationPicker;
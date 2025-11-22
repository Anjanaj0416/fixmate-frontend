import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const GoogleMapComponent = ({
  center = { lat: 7.8731, lng: 80.7718 }, // Sri Lanka center
  zoom = 8,
  markers = [],
  height = '400px',
  showControls = true,
  onMarkerClick,
  style = 'roadmap' // roadmap, satellite, hybrid, terrain
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      initializeMap();
    }
  }, [isLoaded, center, zoom, style]);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [markers, isLoaded]);

  const loadGoogleMapsScript = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    // Note: Replace YOUR_API_KEY with actual Google Maps API key
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your API key and internet connection.');
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapOptions = {
      center: center,
      zoom: zoom,
      mapTypeId: style,
      disableDefaultUI: !showControls,
      zoomControl: showControls,
      mapTypeControl: showControls,
      scaleControl: showControls,
      streetViewControl: showControls,
      rotateControl: showControls,
      fullscreenControl: showControls
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstanceRef.current,
        title: markerData.title || `Marker ${index + 1}`,
        icon: markerData.icon || undefined,
        animation: markerData.animation ? window.google.maps.Animation.BOUNCE : null
      });

      // Add info window if description exists
      if (markerData.description) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${markerData.title || 'Location'}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">${markerData.description}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          // Close other info windows
          markersRef.current.forEach(m => {
            if (m.infoWindow) m.infoWindow.close();
          });
          
          infoWindow.open(mapInstanceRef.current, marker);
          if (onMarkerClick) onMarkerClick(markerData, index);
        });

        marker.infoWindow = infoWindow;
      } else if (onMarkerClick) {
        marker.addListener('click', () => {
          onMarkerClick(markerData, index);
        });
      }

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend({ lat: marker.lat, lng: marker.lng });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(pos);
            mapInstanceRef.current.setZoom(15);
            
            // Add marker at current location
            new window.google.maps.Marker({
              position: pos,
              map: mapInstanceRef.current,
              title: 'Your Location',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            });
          }
        },
        () => {
          alert('Error: The Geolocation service failed.');
        }
      );
    } else {
      alert('Error: Your browser doesn\'t support geolocation.');
    }
  };

  if (error) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200"
      >
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-2">Map Loading Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 animate-pulse"
      >
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-bounce" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapRef} style={{ height, width: '100%' }} />
      
      {/* Custom Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleMyLocation}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="My location"
          >
            <Navigation className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleRecenter}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Reset view"
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}
      
      {/* Legend/Info */}
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span className="font-medium">{markers.length} location{markers.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

GoogleMapComponent.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  zoom: PropTypes.number,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      icon: PropTypes.string,
      animation: PropTypes.bool
    })
  ),
  height: PropTypes.string,
  showControls: PropTypes.bool,
  onMarkerClick: PropTypes.func,
  style: PropTypes.oneOf(['roadmap', 'satellite', 'hybrid', 'terrain'])
};

export default GoogleMapComponent;
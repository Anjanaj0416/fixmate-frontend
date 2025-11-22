import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, Button } from '../common';

/**
 * Worker Card Component
 * Display worker profile information in a card format
 */
const WorkerCard = ({ worker, onFavorite, onContact, variant = 'default' }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(worker.isFavorite || false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Handle favorite toggle
  const handleFavorite = async (e) => {
    e.stopPropagation();
    setFavoriteLoading(true);

    try {
      if (onFavorite) {
        await onFavorite(worker.id, !isFavorite);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle contact
  const handleContact = (e) => {
    e.stopPropagation();
    if (onContact) {
      onContact(worker);
    } else {
      navigate(`/chat/${worker.id}`);
    }
  };

  // Handle view profile
  const handleViewProfile = () => {
    navigate(`/worker/${worker.id}`);
  };

  // Handle book now
  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/booking?workerId=${worker.id}`);
  };

  // Calculate distance display
  const getDistanceDisplay = () => {
    if (!worker.distance) return null;
    if (worker.distance < 1) {
      return `${(worker.distance * 1000).toFixed(0)}m away`;
    }
    return `${worker.distance.toFixed(1)}km away`;
  };

  // Get availability badge
  const getAvailabilityBadge = () => {
    if (!worker.isAvailable) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
          Unavailable
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded">
        Available
      </span>
    );
  };

  // Compact variant (for lists)
  if (variant === 'compact') {
    return (
      <div
        onClick={handleViewProfile}
        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-center space-x-4">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {worker.profileImage ? (
              <img
                src={worker.profileImage}
                alt={worker.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
                {worker.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Worker Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {worker.name}
              </h3>
              <button
                onClick={handleFavorite}
                disabled={favoriteLoading}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  className={`w-6 h-6 ${isFavorite ? 'fill-current text-red-500' : ''}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-2">{worker.serviceCategory}</p>

            <div className="flex items-center space-x-4 text-sm">
              {/* Rating */}
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">{worker.rating?.toFixed(1) || 0}</span>
                <span className="text-gray-500 ml-1">
                  ({worker.reviewCount || 0})
                </span>
              </div>

              {/* Distance */}
              {worker.distance && (
                <span className="text-gray-600">{getDistanceDisplay()}</span>
              )}

              {/* Availability */}
              {getAvailabilityBadge()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant (full card)
  return (
    <Card
      hover
      clickable
      onClick={handleViewProfile}
      className="relative overflow-hidden"
    >
      {/* Verified Badge */}
      {worker.isVerified && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </div>
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        disabled={favoriteLoading}
        className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
      >
        <svg
          className={`w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-400'}`}
          fill={isFavorite ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Profile Image */}
      <div className="relative">
        {worker.profileImage ? (
          <img
            src={worker.profileImage}
            alt={worker.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
            <span className="text-6xl font-bold text-white">
              {worker.name?.[0]?.toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Availability Badge on Image */}
        <div className="absolute bottom-4 left-4">
          {getAvailabilityBadge()}
        </div>
      </div>

      {/* Worker Details */}
      <div className="p-6">
        {/* Name and Service */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">{worker.name}</h3>
        <p className="text-sm text-indigo-600 font-medium mb-3">
          {worker.serviceCategory}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-4">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-5 h-5 ${
                  index < Math.floor(worker.rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            <span className="font-semibold">{worker.rating?.toFixed(1) || 0}</span> ({worker.reviewCount || 0} reviews)
          </span>
        </div>

        {/* Experience and Jobs */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{worker.experience || 0}+ years</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>{worker.completedJobs || 0} jobs done</span>
          </div>
        </div>

        {/* Distance */}
        {worker.distance && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{getDistanceDisplay()}</span>
          </div>
        )}

        {/* Hourly Rate */}
        {worker.hourlyRate && (
          <div className="mb-4">
            <span className="text-2xl font-bold text-gray-900">
              LKR {worker.hourlyRate?.toLocaleString()}
            </span>
            <span className="text-gray-600">/hour</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="primary"
            fullWidth
            onClick={handleBookNow}
            disabled={!worker.isAvailable}
          >
            Book Now
          </Button>
          <Button
            variant="outline"
            onClick={handleContact}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
        </div>
      </div>
    </Card>
  );
};

WorkerCard.propTypes = {
  worker: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    serviceCategory: PropTypes.string.isRequired,
    profileImage: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    experience: PropTypes.number,
    completedJobs: PropTypes.number,
    hourlyRate: PropTypes.number,
    distance: PropTypes.number,
    isAvailable: PropTypes.bool,
    isVerified: PropTypes.bool,
    isFavorite: PropTypes.bool,
  }).isRequired,
  onFavorite: PropTypes.func,
  onContact: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'compact']),
};

export default WorkerCard;
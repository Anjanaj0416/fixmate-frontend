import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from '../common';

/**
 * Review Form Component
 * Form for customers to submit reviews for workers
 */
const ReviewForm = ({ bookingId, workerId, workerName, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    serviceQuality: 0,
    communication: 0,
    punctuality: 0,
    professionalism: 0,
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle rating change
  const handleRatingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please provide an overall rating';
    }

    if (formData.comment.trim().length < 20) {
      newErrors.comment = 'Please write a detailed review (minimum 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            bookingId,
            workerId,
            ...formData,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      if (onSuccess) {
        onSuccess(data.review);
      }

      setFormData({
        rating: 0,
        comment: '',
        serviceQuality: 0,
        communication: 0,
        punctuality: 0,
        professionalism: 0,
      });

      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({
        general: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Star Rating Component
  const StarRating = ({ value, onChange, label, error }) => (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} <span className="text-red-500">*</span>
        </label>
      )}
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg
              className={`w-8 h-8 ${
                star <= value ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review ${workerName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Overall Rating */}
        <div>
          <StarRating
            value={formData.rating}
            onChange={(value) => handleRatingChange('rating', value)}
            label="Overall Rating"
            error={errors.rating}
          />
          {formData.rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {formData.rating === 5 && 'Excellent!'}
              {formData.rating === 4 && 'Very Good'}
              {formData.rating === 3 && 'Good'}
              {formData.rating === 2 && 'Fair'}
              {formData.rating === 1 && 'Poor'}
            </p>
          )}
        </div>

        {/* Detailed Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StarRating
            value={formData.serviceQuality}
            onChange={(value) => handleRatingChange('serviceQuality', value)}
            label="Service Quality"
          />
          <StarRating
            value={formData.communication}
            onChange={(value) => handleRatingChange('communication', value)}
            label="Communication"
          />
          <StarRating
            value={formData.punctuality}
            onChange={(value) => handleRatingChange('punctuality', value)}
            label="Punctuality"
          />
          <StarRating
            value={formData.professionalism}
            onChange={(value) => handleRatingChange('professionalism', value)}
            label="Professionalism"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Share your experience with this worker..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={500}
          />
          <div className="flex justify-between mt-2">
            <p className="text-sm text-gray-500">
              Minimum 20 characters
            </p>
            <p className="text-sm text-gray-500">
              {formData.comment.length}/500
            </p>
          </div>
          {errors.comment && (
            <p className="text-sm text-red-600 mt-1">{errors.comment}</p>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Tips for writing a good review:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Be specific about what you liked or didn't like</li>
                <li>Mention the quality of work and professionalism</li>
                <li>Help other customers make informed decisions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

ReviewForm.propTypes = {
  bookingId: PropTypes.string.isRequired,
  workerId: PropTypes.string.isRequired,
  workerName: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default ReviewForm;
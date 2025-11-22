import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Input, Button, Modal } from '../common';

/**
 * Booking Form Component
 * Form for customers to book worker services
 */
const BookingForm = ({ workerId: propWorkerId, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workerId = propWorkerId || searchParams.get('workerId');

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    urgency: 'medium',
    location: {
      address: '',
      city: '',
      postalCode: '',
      coordinates: {
        latitude: '',
        longitude: '',
      },
    },
    contactPhone: '',
    estimatedDuration: '',
    additionalNotes: '',
  });

  useEffect(() => {
    if (workerId) {
      fetchWorkerDetails();
    }
    loadUserLocation();
  }, [workerId]);

  // Fetch worker details
  const fetchWorkerDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/workers/${workerId}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorker(data.worker);
        // Pre-fill service type if worker has a category
        if (data.worker.serviceCategory) {
          setFormData(prev => ({
            ...prev,
            serviceType: data.worker.serviceCategory,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching worker details:', error);
    }
  };

  // Load user's saved location
  const loadUserLocation = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user?.location) {
      setFormData(prev => ({
        ...prev,
        location: user.location,
        contactPhone: user.phoneNumber || '',
      }));
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
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

    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }

    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Please provide a detailed description (minimum 20 characters)';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.scheduledDate = 'Date cannot be in the past';
      }
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Please select a time';
    }

    if (!formData.location.address) {
      newErrors['location.address'] = 'Address is required';
    }

    if (!formData.location.city) {
      newErrors['location.city'] = 'City is required';
    }

    if (!formData.contactPhone) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!/^(\+94|0)[0-9]{9}$/.test(formData.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Invalid phone number';
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

    setShowConfirmation(true);
  };

  // Confirm booking
  const confirmBooking = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            workerId,
            ...formData,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      if (onSuccess) {
        onSuccess(data.booking);
      } else {
        navigate(`/customer/bookings/${data.booking.id}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrors({
        general: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Service type options
  const serviceTypes = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'AC Repair',
    'Appliance Repair',
    'Cleaning',
    'Pest Control',
    'Gardening',
    'Masonry',
    'Roofing',
    'Welding',
    'Other',
  ];

  // Time slots
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Book a Service
          </h2>
          {worker && (
            <p className="text-gray-600">
              Booking with <span className="font-semibold">{worker.name}</span>
            </p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type <span className="text-red-500">*</span>
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a service</option>
              {serviceTypes.map(service => (
                <option key={service} value={service.toLowerCase().replace(' ', '_')}>
                  {service}
                </option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="mt-1 text-sm text-red-600">{errors.serviceType}</p>
            )}
          </div>

          {/* Description */}
          <Input
            type="textarea"
            name="description"
            label="Problem Description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Please describe the problem in detail..."
            rows={4}
            maxLength={500}
            required
            helperText="Minimum 20 characters"
          />

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              name="scheduledDate"
              label="Preferred Date"
              value={formData.scheduledDate}
              onChange={handleChange}
              error={errors.scheduledDate}
              min={getMinDate()}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time <span className="text-red-500">*</span>
              </label>
              <select
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.scheduledTime && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
              )}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <div className="flex space-x-4">
              {['low', 'medium', 'high'].map(level => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={formData.urgency === level}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Service Location
            </h3>

            <Input
              type="text"
              name="location.address"
              label="Address"
              value={formData.location.address}
              onChange={handleChange}
              error={errors['location.address']}
              placeholder="Street address, house/apartment number"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                name="location.city"
                label="City"
                value={formData.location.city}
                onChange={handleChange}
                error={errors['location.city']}
                placeholder="City"
                required
              />

              <Input
                type="text"
                name="location.postalCode"
                label="Postal Code"
                value={formData.location.postalCode}
                onChange={handleChange}
                placeholder="10400"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <Input
            type="tel"
            name="contactPhone"
            label="Contact Phone"
            value={formData.contactPhone}
            onChange={handleChange}
            error={errors.contactPhone}
            placeholder="+94 71 234 5678"
            helperText="Worker will contact you on this number"
            required
          />

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (Optional)
            </label>
            <select
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Not sure</option>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="5">5+ hours</option>
            </select>
          </div>

          {/* Additional Notes */}
          <Input
            type="textarea"
            name="additionalNotes"
            label="Additional Notes (Optional)"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Any special requirements or instructions..."
            rows={3}
          />

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              Continue to Booking
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Booking"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please review your booking details before confirming:
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-semibold">
                {formData.serviceType.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">
                {new Date(formData.scheduledDate).toLocaleDateString()} at {formData.scheduledTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold">{formData.location.city}</span>
            </div>
            {worker && (
              <div className="flex justify-between">
                <span className="text-gray-600">Worker:</span>
                <span className="font-semibold">{worker.name}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
            >
              Go Back
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={confirmBooking}
              loading={loading}
              disabled={loading}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

BookingForm.propTypes = {
  workerId: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default BookingForm;
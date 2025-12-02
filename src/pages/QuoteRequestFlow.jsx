import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import storage from '../utils/storage';
import apiService from '../services/apiService'; // ✅ NEW IMPORT
import locationService from '../services/locationService'; // ✅ NEW IMPORT
import ImageUpload from '../components/quote/ImageUpload'; // ✅ NEW IMPORT

/**
 * Quote Request Flow Component
 * Multi-step form for customers to create quote requests
 * 
 * ✅ FIXED: Uses apiService for automatic token refresh
 * ✅ FIXED: Uses locationService for GPS capture
 * ✅ FIXED: Uses ImageUpload component for photos
 * ✅ FIXED: Proper Base64 image handling
 */
const QuoteRequestFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCategory = location.state?.category;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [quoteRequestId, setQuoteRequestId] = useState(null);

  const [formData, setFormData] = useState({
    serviceType: selectedCategory?.id || '',
    problemDescription: '',
    issueLocation: '',
    serviceDate: '',
    urgency: 'normal',
    budgetRange: '',
    problemImages: [], // Will hold image objects with base64
    customerLocation: null, // Will be set by locationService
    contactPhone: ''
  });

  const locationOptions = [
    'Kitchen',
    'Bathroom',
    'Living room',
    'Bedroom',
    'Garage',
    'Basement',
    'Outdoor area',
    'Other'
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low - Within a week' },
    { value: 'normal', label: 'Normal - Within 2-3 days' },
    { value: 'high', label: 'High - Within 24 hours' },
    { value: 'emergency', label: 'Emergency - ASAP' }
  ];

  const budgetOptions = [
    '1000-3000',
    '3000-5000',
    '5000-10000',
    '10000-20000',
    '20000+'
  ];

  // Load user data on mount
  useEffect(() => {
    if (!selectedCategory) {
      navigate('/customer/service-selection');
      return;
    }
    
    loadUserData();
  }, [selectedCategory, navigate]);

  // ✅ NEW: Capture GPS location when reaching Step 3
  useEffect(() => {
    if (currentStep === 3 && !formData.customerLocation) {
      captureLocation();
    }
  }, [currentStep]);

  const loadUserData = () => {
    const user = storage.getUserData();
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactPhone: user.phoneNumber || ''
      }));
    }
  };

  // ✅ NEW: GPS location capture function
  const captureLocation = async () => {
    try {
      console.log('📍 Capturing GPS location...');
      
      const result = await locationService.getLocationWithFallback();
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          customerLocation: result.location
        }));
        console.log('✅ Location captured:', result.location);
        
        // Clear any previous location errors
        if (errors.location) {
          setErrors(prev => ({ ...prev, location: '' }));
        }
      } else {
        // Location capture failed, show error
        setErrors(prev => ({
          ...prev,
          location: result.error
        }));
      }
    } catch (error) {
      console.error('Location error:', error);
      setErrors(prev => ({
        ...prev,
        location: 'Could not get your location. Please ensure location permissions are enabled.'
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.serviceType) {
        newErrors.serviceType = 'Please select a service type';
      }
    }

    if (currentStep === 2) {
      if (!formData.problemDescription || formData.problemDescription.length < 20) {
        newErrors.problemDescription = 'Please provide a detailed description (minimum 20 characters)';
      }
      if (!formData.issueLocation) {
        newErrors.issueLocation = 'Please specify where the issue is located';
      }
      if (!formData.serviceDate) {
        newErrors.serviceDate = 'Please select a preferred service date';
      }
      if (!formData.budgetRange) {
        newErrors.budgetRange = 'Please select a budget range';
      }
    }

    if (currentStep === 3) {
      if (!formData.customerLocation) {
        newErrors.location = 'Location is required to find nearby workers';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  // ✅ UPDATED: Handle submit with Base64 images and proper location
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      console.log('📤 Submitting quote request...');

      // ✅ Prepare Base64 images for MongoDB
      const imageData = formData.problemImages.map((img) => img.base64);

      // ✅ Prepare request data
      const requestData = {
        serviceType: formData.serviceType,
        problemDescription: formData.problemDescription,
        issueLocation: formData.issueLocation,
        serviceDate: formData.serviceDate,
        urgency: formData.urgency,
        budgetRange: formData.budgetRange,
        problemImages: imageData, // ✅ Send as Base64 array
        customerLocation: formData.customerLocation, // ✅ GPS location object
        contactPhone: formData.contactPhone,
      };

      console.log('Request data prepared:', {
        serviceType: requestData.serviceType,
        imageCount: requestData.problemImages.length,
        hasLocation: !!requestData.customerLocation,
      });

      // ✅ Use apiService (handles token refresh automatically)
      const response = await apiService.post(
        '/api/v1/bookings/quote-request',
        requestData
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorData.message || 'Failed to create quote request');
      }

      const data = await response.json();
      
      if (!data.success || !data.quoteRequest) {
        throw new Error('Invalid response from server');
      }
      
      setQuoteRequestId(data.quoteRequest._id);

      console.log('✅ Quote request created:', data.quoteRequest._id);

      // Navigate to worker selection with quote request data
      navigate('/customer/select-worker', {
        state: {
          quoteRequestId: data.quoteRequest._id,
          serviceType: formData.serviceType,
          location: formData.customerLocation
        }
      });

    } catch (error) {
      console.error('❌ Error creating quote request:', error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!selectedCategory) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Request Quote</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  What service do you need?
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  You selected: <span className="font-medium">{selectedCategory?.name}</span>
                </p>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-indigo-900 font-medium">{selectedCategory?.name}</p>
                  <p className="text-sm text-indigo-700 mt-1">{selectedCategory?.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Problem Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Describe Your Problem
                </h2>
              </div>

              {/* Problem Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Please describe the issue in detail. Include when it started, what you've noticed, and any relevant information..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.problemDescription ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.problemDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.problemDescription}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.problemDescription.length}/1000 characters
                </p>
              </div>

              {/* Issue Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where is the issue located? <span className="text-red-500">*</span>
                </label>
                <select
                  name="issueLocation"
                  value={formData.issueLocation}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.issueLocation ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select location</option>
                  {locationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.issueLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.issueLocation}</p>
                )}
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Service Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.serviceDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.serviceDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceDate}</p>
                )}
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {urgencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (LKR) <span className="text-red-500">*</span>
                </label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.budgetRange ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select budget range</option>
                  {budgetOptions.map(option => (
                    <option key={option} value={option}>LKR {option}</option>
                  ))}
                </select>
                {errors.budgetRange && (
                  <p className="mt-1 text-sm text-red-600">{errors.budgetRange}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+94 XX XXX XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Photos & Location - ✅ UPDATED */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upload Problem Photos
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Photos help workers understand the problem better and provide accurate quotes.
                </p>
                {/* ✅ NEW: Use ImageUpload component */}
                <ImageUpload
                  images={formData.problemImages}
                  setImages={(images) => setFormData({ ...formData, problemImages: images })}
                  maxImages={5}
                />
              </div>

              {/* ✅ NEW: Location Display */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Location
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  We need your location to find nearby workers.
                </p>
                
                {formData.customerLocation ? (
                  // Location captured successfully
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                          Location captured successfully
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {formData.customerLocation.address?.full || 
                           `${formData.customerLocation.coordinates.latitude.toFixed(4)}, ${formData.customerLocation.coordinates.longitude.toFixed(4)}`}
                        </p>
                        <button
                          onClick={captureLocation}
                          type="button"
                          className="text-xs text-green-700 underline mt-2 hover:text-green-800"
                        >
                          Update location
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Location not captured yet or failed
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">
                          Getting your location...
                        </p>
                        {errors.location && (
                          <p className="text-xs text-yellow-700 mt-1">
                            {errors.location}
                          </p>
                        )}
                        <button
                          onClick={captureLocation}
                          type="button"
                          className="text-sm text-yellow-700 underline mt-2 hover:text-yellow-800"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Review & Confirm
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Please review your request before submitting
                </p>
              </div>

              <div className="space-y-4">
                {/* Service Type */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="text-base font-medium text-gray-900">{selectedCategory?.name}</p>
                </div>

                {/* Problem Description */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-base text-gray-900">{formData.problemDescription}</p>
                </div>

                {/* Location */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Issue Location</p>
                  <p className="text-base font-medium text-gray-900">{formData.issueLocation}</p>
                </div>

                {/* Date & Urgency */}
                <div className="pb-4 border-b border-gray-200 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Service Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(formData.serviceDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Urgency</p>
                    <p className="text-base font-medium text-gray-900 capitalize">{formData.urgency}</p>
                  </div>
                </div>

                {/* Budget */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Budget Range</p>
                  <p className="text-base font-medium text-gray-900">LKR {formData.budgetRange}</p>
                </div>

                {/* Photos */}
                {formData.problemImages.length > 0 && (
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Photos ({formData.problemImages.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.problemImages.map((img, index) => (
                        <img
                          key={img.id}
                          src={img.base64}
                          alt={`Problem ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* GPS Location */}
                {formData.customerLocation && (
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Your Location</p>
                    <p className="text-base text-gray-900">
                      {formData.customerLocation.address?.full || 'Location captured'}
                    </p>
                  </div>
                )}

                {/* Contact */}
                {formData.contactPhone && (
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="text-base font-medium text-gray-900">{formData.contactPhone}</p>
                  </div>
                )}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-indigo-900">
                  <strong>Next Steps:</strong> After submitting, you'll see a list of available workers 
                  near your location. You can view their profiles and send your quote request to 
                  workers you prefer.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  {currentStep === 4 ? 'Submit Request' : 'Next'}
                  {currentStep < 4 && <ArrowRight size={20} />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestFlow;
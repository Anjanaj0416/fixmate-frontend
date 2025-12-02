import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, MapPin, Calendar, X } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import storage from '../utils/storage'; // ← ADD THIS IMPORT

/**
 * Quote Request Flow Component
 * Multi-step form for customers to create quote requests
 * 
 * ✅ FIXED: Proper token retrieval using storage utility
 * ✅ FIXED: Firebase fallback for token
 * ✅ FIXED: Better error handling
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
    budgetRange: {
      min: '',
      max: ''
    },
    problemImages: [],
    customerLocation: {
      address: '',
      city: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    contactPhone: ''
  });

  const [imagePreview, setImagePreview] = useState([]);

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

  useEffect(() => {
    if (!selectedCategory) {
      navigate('/customer/service-selection');
      return;
    }
    
    loadUserData();
    getCurrentLocation();
  }, []);

  const loadUserData = () => {
    // ✅ FIX: Use storage utility
    const user = storage.getUserData();
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactPhone: user.phoneNumber || '',
        customerLocation: {
          ...prev.customerLocation,
          address: user.location?.address || '',
          city: user.location?.city || ''
        }
      }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            customerLocation: {
              ...prev.customerLocation,
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          }));
          console.log('✅ GPS location captured:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('❌ Error getting location:', error);
        }
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('budgetRange.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        budgetRange: {
          ...prev.budgetRange,
          [field]: value
        }
      }));
    } else if (name.startsWith('customerLocation.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customerLocation: {
          ...prev.customerLocation,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + formData.problemImages.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          problemImages: [...prev.problemImages, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });

    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      problemImages: prev.problemImages.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.serviceType) {
        newErrors.serviceType = 'Please select a service type';
      }
    }

    if (step === 2) {
      if (!formData.problemDescription || formData.problemDescription.length < 20) {
        newErrors.problemDescription = 'Please provide detailed description (min 20 characters)';
      }
      if (!formData.issueLocation) {
        newErrors.issueLocation = 'Please select where the service is needed';
      }
    }

    if (step === 3) {
      if (!formData.serviceDate) {
        newErrors.serviceDate = 'Please select preferred date';
      }
      if (!formData.budgetRange.min || !formData.budgetRange.max) {
        newErrors.budgetRange = 'Please provide budget range';
      } else if (parseFloat(formData.budgetRange.min) >= parseFloat(formData.budgetRange.max)) {
        newErrors.budgetRange = 'Maximum budget must be greater than minimum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/customer/service-selection');
    }
  };

  // ✅ FIXED SUBMIT FUNCTION
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      console.log('📝 Submitting quote request...');
      
      // ✅ FIX 1: Get token using storage utility with Firebase fallback
      let token = storage.getAuthToken();
      
      // ✅ FIX 2: If no token in storage, get fresh token from Firebase
      if (!token) {
        console.log('⚠️ No token in storage, getting fresh token from Firebase...');
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          throw new Error('Not authenticated. Please login again.');
        }
        
        token = await currentUser.getIdToken(true); // Force refresh
        console.log('✅ Got fresh token from Firebase');
        
        // Store it for future use
        storage.saveAuthToken(token);
      }
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      console.log('🔐 Using auth token (length:', token.length, ')');
      
      // ✅ FIX 3: Proper API URL construction
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${API_URL}/api/v1/bookings/quote-request`;
      
      console.log('🌐 Sending request to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      // ✅ FIX 4: Better error handling
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to create quote request'
        }));
        
        console.error('❌ API Error:', {
          status: response.status,
          message: errorData.message,
          error: errorData
        });
        
        // Specific error messages based on status
        if (response.status === 401) {
          // Token might be expired, try to get fresh one
          console.log('🔄 Token expired, getting fresh token...');
          const auth = getAuth();
          if (auth.currentUser) {
            const freshToken = await auth.currentUser.getIdToken(true);
            storage.saveAuthToken(freshToken);
            throw new Error('Session expired. Please try again.');
          }
          throw new Error('Invalid token. Please login again.');
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
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  What service do you need?
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Service: <span className="font-medium text-indigo-600">{selectedCategory?.name}</span>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Details & Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Describe your problem
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Provide details to help workers understand your needs
                </p>
              </div>

              {/* Problem Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description <span className="text-red-500">*</span>
                </label>
                {errors.problemDescription && (
                  <p className="text-sm text-red-600 mb-2">{errors.problemDescription}</p>
                )}
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleChange}
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                  placeholder="Describe the problem in detail. Include any relevant information that will help workers provide accurate quotes..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.problemDescription.length}/500 characters
                </p>
              </div>

              {/* Issue Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where is the service needed? <span className="text-red-500">*</span>
                </label>
                {errors.issueLocation && (
                  <p className="text-sm text-red-600 mb-2">{errors.issueLocation}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {locationOptions.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, issueLocation: location }))}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        formData.issueLocation === location
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Date & Budget */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  When & Budget
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Select your preferred date and budget range
                </p>
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Service Date <span className="text-red-500">*</span>
                </label>
                {errors.serviceDate && (
                  <p className="text-sm text-red-600 mb-2">{errors.serviceDate}</p>
                )}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleChange}
                    min={getMinDate()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="normal">Normal - Within a week</option>
                  <option value="high">High - ASAP</option>
                  <option value="emergency">Emergency - Immediate</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (LKR) <span className="text-red-500">*</span>
                </label>
                {errors.budgetRange && (
                  <p className="text-sm text-red-600 mb-2">{errors.budgetRange}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="budgetRange.min"
                    value={formData.budgetRange.min}
                    onChange={handleChange}
                    placeholder="Min"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="budgetRange.max"
                    value={formData.budgetRange.max}
                    onChange={handleChange}
                    placeholder="Max"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Add photos to help workers understand the problem better (Max 5)
                </p>
                {errors.images && (
                  <p className="text-sm text-red-600 mb-2">{errors.images}</p>
                )}
                
                {imagePreview.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload photos</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Review & Confirm
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Please review your request before submitting
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-medium text-gray-900">{selectedCategory?.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{formData.issueLocation}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900">{formData.problemDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Preferred Date</p>
                    <p className="font-medium text-gray-900">{formData.serviceDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Urgency</p>
                    <p className="font-medium text-gray-900 capitalize">{formData.urgency}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Budget Range</p>
                  <p className="font-medium text-gray-900">
                    LKR {formData.budgetRange.min} - {formData.budgetRange.max}
                  </p>
                </div>

                {formData.problemImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Photos ({formData.problemImages.length})</p>
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreview.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> After submitting, we'll show you available workers in your area. 
                  You can view their profiles and send your quote request to workers you prefer.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
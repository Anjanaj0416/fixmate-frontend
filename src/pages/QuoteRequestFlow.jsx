import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, MapPin, Calendar, X } from 'lucide-react';

/**
 * Quote Request Flow Component
 * Multi-step form for customers to create quote requests
 * 
 * Flow: Service Type → Details & Location → Date & Photos → Review → Worker Selection
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
    issueLocation: '', // Kitchen, Bathroom, Living room, etc.
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

  // Room/location options
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

  // Load user data and get GPS location on mount
  useEffect(() => {
    // Redirect if no category selected
    if (!selectedCategory) {
      navigate('/customer/service-selection');
      return;
    }
    
    loadUserData();
    getCurrentLocation();
  }, []);

  const loadUserData = () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
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
          console.log('✅ GPS location captured:', position.coords);
        },
        (error) => {
          console.error('❌ Error getting location:', error);
          // Continue without GPS - it's optional
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

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + formData.problemImages.length > 5) {
      setErrors({ images: 'Maximum 5 images allowed' });
      return;
    }

    // Convert images to base64 for upload
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Images = await Promise.all(imagePromises);
      setFormData(prev => ({
        ...prev,
        problemImages: [...prev.problemImages, ...base64Images]
      }));
      setImagePreview(prev => [...prev, ...base64Images]);
      setErrors(prev => ({ ...prev, images: '' }));
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrors({ images: 'Failed to upload images' });
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      problemImages: prev.problemImages.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/bookings/quote-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create quote request');
      }

      const data = await response.json();
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
    return null; // Will redirect in useEffect
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

          {/* Step 1: Service Type (pre-selected) */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  What service do you need?
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Selected service category
                </p>
              </div>

              <div className="p-4 border-2 border-indigo-600 rounded-lg bg-indigo-50">
                <h3 className="font-semibold text-indigo-900 text-lg">{selectedCategory.name}</h3>
                <p className="text-sm text-indigo-700 mt-1">{selectedCategory.description}</p>
              </div>
            </div>
          )}

          {/* Step 2: Location & Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Location & Details
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Tell us about your problem and where it's located
                </p>
              </div>

              {/* Issue Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where is the {selectedCategory.name.toLowerCase()} service needed? <span className="text-red-500">*</span>
                </label>
                {errors.issueLocation && (
                  <p className="text-sm text-red-600 mb-2">{errors.issueLocation}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {locationOptions.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'issueLocation', value: loc } })}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        formData.issueLocation === loc
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
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
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Describe your problem in detail. Include any relevant information that will help workers provide accurate quotes..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.problemDescription.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Date & Photos */}
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
                  <option value="normal">Normal - Within a week</option>
                  <option value="urgent">Urgent - Within 2-3 days</option>
                  <option value="emergency">Emergency - Same day</option>
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
                    placeholder="Minimum"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="budgetRange.max"
                    value={formData.budgetRange.max}
                    onChange={handleChange}
                    placeholder="Maximum"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Photos (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Upload photos to help workers understand the problem (Max 5 images)
                </p>
                {errors.images && (
                  <p className="text-sm text-red-600 mb-2">{errors.images}</p>
                )}

                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {imagePreview.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Problem ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {formData.problemImages.length < 5 && (
                  <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload images
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
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
                <p className="text-gray-600 text-sm mb-4">
                  Please review your request before submitting
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Service Type</h3>
                  <p className="text-gray-900 font-medium">{selectedCategory.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-gray-900">{formData.issueLocation}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-gray-900 text-sm">{formData.problemDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Preferred Date</h3>
                    <p className="text-gray-900">
                      {new Date(formData.serviceDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Urgency</h3>
                    <p className="text-gray-900 capitalize">{formData.urgency}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Budget Range</h3>
                  <p className="text-gray-900">
                    LKR {formData.budgetRange.min} - {formData.budgetRange.max}
                  </p>
                </div>

                {formData.problemImages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Photos ({formData.problemImages.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreview.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Problem ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> After submitting, we'll show you available workers
                  in your area. You can view their profiles and send your quote request to the
                  workers you prefer.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Processing...'
              ) : currentStep === 4 ? (
                'Find Workers'
              ) : (
                <>
                  Continue
                  <ArrowRight size={20} />
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
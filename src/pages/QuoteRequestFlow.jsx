import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, X, MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import apiService from '../services/apiService';
import { LOCATION_DATA } from '../utils/locationData';

/**
 * ✅ FIXED: Quote Request Flow Component
 * 
 * Changes:
 * - Fixed response data structure access (response.data.quoteRequest instead of response.data.data.quoteRequest)
 * - Better error handling
 * - Improved console logging
 */

const QuoteRequestFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    serviceType: category?.id || '',
    problemDescription: '',
    issueLocation: '',
    serviceDate: '',
    urgency: 'medium',
    budgetRange: '',
    problemImages: [],
    district: '',
    town: '',
    contactPhone: '',
  });

  const [availableTowns, setAvailableTowns] = useState([]);

  useEffect(() => {
    if (!category) {
      navigate('/customer/service-selection');
    }
  }, [category, navigate]);

  useEffect(() => {
    if (formData.district) {
      const districtData = LOCATION_DATA.find(d => d.district === formData.district);
      setAvailableTowns(districtData?.towns || []);
      setFormData(prev => ({ ...prev, town: '' }));
    }
  }, [formData.district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (formData.problemImages.length + files.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: Date.now() + Math.random(),
            file: file,
            base64: e.target.result,
            preview: URL.createObjectURL(file)
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(newImages => {
      setFormData(prev => ({
        ...prev,
        problemImages: [...prev.problemImages, ...newImages]
      }));
      setErrors(prev => ({ ...prev, images: '' }));
    });
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      problemImages: prev.problemImages.filter(img => img.id !== imageId)
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.problemDescription.trim()) {
        newErrors.problemDescription = 'Problem description is required';
      }
      if (!formData.issueLocation) {
        newErrors.issueLocation = 'Issue location is required';
      }
    }

    if (currentStep === 2) {
      if (!formData.serviceDate) {
        newErrors.serviceDate = 'Service date is required';
      }
      const selectedDate = new Date(formData.serviceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.serviceDate = 'Service date cannot be in the past';
      }
    }

    if (currentStep === 3) {
      if (!formData.budgetRange) {
        newErrors.budgetRange = 'Budget range is required';
      }
    }

    if (currentStep === 4) {
      if (!formData.district) {
        newErrors.district = 'District is required';
      }
      if (!formData.town) {
        newErrors.town = 'Town is required';
      }
      if (!formData.contactPhone.trim()) {
        newErrors.contactPhone = 'Contact phone is required';
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

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      console.log('📤 Submitting quote request...');

      // Prepare Base64 images
      const imageData = formData.problemImages.map((img) => img.base64);

      // Prepare location object
      const serviceLocation = {
        town: formData.town,
        city: formData.town,
        district: formData.district,
        address: `${formData.town}, ${formData.district}`,
        coordinates: null
      };

      // Prepare request data
      const requestData = {
        serviceType: formData.serviceType,
        problemDescription: formData.problemDescription,
        issueLocation: formData.issueLocation,
        scheduledDate: formData.serviceDate,
        serviceDate: formData.serviceDate,
        urgency: formData.urgency,
        budgetRange: formData.budgetRange,
        problemImages: imageData,
        serviceLocation: serviceLocation,
        contactPhone: formData.contactPhone,
      };

      console.log('Request data prepared:', {
        serviceType: requestData.serviceType,
        issueLocation: requestData.issueLocation,
        imageCount: requestData.problemImages.length,
        location: requestData.serviceLocation
      });

      // ✅ FIXED: Submit quote request
      const response = await apiService.post('/api/v1/bookings/quote-request', requestData);

      console.log('✅ Raw API response:', response);

      // ✅ FIXED: Access response data correctly
      // The response structure is: { success: true, message: '...', data: { quoteRequest: {...} } }
      if (!response || !response.data || !response.data.quoteRequest) {
        throw new Error('Invalid response structure from server');
      }

      const quoteRequest = response.data.quoteRequest;

      console.log('✅ Quote request created:', {
        id: quoteRequest._id,
        serviceType: quoteRequest.serviceType,
        status: quoteRequest.status
      });

      // Navigate to worker listing
      navigate('/customer/find-workers', {
        state: {
          quoteRequestId: quoteRequest._id,
          serviceType: formData.serviceType,
          location: serviceLocation,
          category: category
        }
      });

    } catch (error) {
      console.error('❌ Error creating quote request:', error);
      
      setErrors({
        submit: error.response?.data?.message || error.message || 'Failed to create quote request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Issue location options based on service type
  const getIssueLocationOptions = () => {
    const commonLocations = [
      'Kitchen',
      'Bathroom',
      'Living Room',
      'Bedroom',
      'Garage',
      'Garden',
      'Roof',
      'Other'
    ];
    return commonLocations;
  };

  // Rest of the render code remains the same...
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between mt-2">
            <span className={`text-xs ${currentStep >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              Problem
            </span>
            <span className={`text-xs ${currentStep >= 2 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              Schedule
            </span>
            <span className={`text-xs ${currentStep >= 3 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              Budget
            </span>
            <span className={`text-xs ${currentStep >= 4 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              Review
            </span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error Creating Quote Request</p>
              <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Step 1: Problem Description */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Describe Your Problem
                </h2>
                <p className="text-gray-600">
                  Tell us about the {category?.name.toLowerCase()} issue you're experiencing
                </p>
              </div>

              {/* Problem Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description *
                </label>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Please describe the problem in detail..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.problemDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.problemDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.problemDescription}</p>
                )}
              </div>

              {/* Issue Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where is the issue located? *
                </label>
                <select
                  name="issueLocation"
                  value={formData.issueLocation}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.issueLocation ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select location</option>
                  {getIssueLocationOptions().map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                {errors.issueLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.issueLocation}</p>
                )}
              </div>

              {/* Problem Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos (Optional)
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Add up to 5 photos to help workers understand the issue
                </p>

                {formData.problemImages.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload photos
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB
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

                {/* Image Preview */}
                {formData.problemImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {formData.problemImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.base64}
                          alt="Problem"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.images && (
                  <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  When do you need this service?
                </h2>
                <p className="text-gray-600">
                  Choose your preferred date and urgency level
                </p>
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Preferred Service Date *
                </label>
                <input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.serviceDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.serviceDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceDate}</p>
                )}
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How urgent is this?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, urgency: level }))}
                      className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-all ${
                        formData.urgency === level
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What's your budget?
                </h2>
                <p className="text-gray-600">
                  Select your approximate budget range for this service
                </p>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <DollarSign size={16} className="inline mr-2" />
                  Budget Range *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['0-5000', '5000-10000', '10000-20000', '20000+'].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, budgetRange: range }))}
                      className={`px-4 py-4 rounded-lg border-2 font-medium transition-all ${
                        formData.budgetRange === range
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      Rs. {range}
                    </button>
                  ))}
                </div>
                {errors.budgetRange && (
                  <p className="mt-1 text-sm text-red-600">{errors.budgetRange}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Location & Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Location & Contact
                </h2>
                <p className="text-gray-600">
                  Confirm your location and contact information
                </p>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  District *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.district ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select district</option>
                  {LOCATION_DATA.map((district) => (
                    <option key={district.district} value={district.district}>
                      {district.district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>

              {/* Town */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Town *
                </label>
                <select
                  name="town"
                  value={formData.town}
                  onChange={handleInputChange}
                  disabled={!formData.district}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.town ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select town</option>
                  {availableTowns.map((town) => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </select>
                {errors.town && (
                  <p className="mt-1 text-sm text-red-600">{errors.town}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="+94 XX XXX XXXX"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.contactPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                )}
              </div>

              {/* Review Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Request</h3>

                {/* Service Type */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="text-base font-medium text-gray-900 capitalize">{category?.name}</p>
                </div>

                {/* Problem */}
                <div className="pb-4 border-b border-gray-200 mt-4">
                  <p className="text-sm text-gray-600">Problem Description</p>
                  <p className="text-base text-gray-900">{formData.problemDescription}</p>
                </div>

                {/* Schedule */}
                <div className="pb-4 border-b border-gray-200 mt-4">
                  <p className="text-sm text-gray-600">Service Date & Urgency</p>
                  <p className="text-base text-gray-900">
                    {formData.serviceDate} • <span className="capitalize">{formData.urgency}</span> Priority
                  </p>
                </div>

                {/* Budget */}
                <div className="pb-4 border-b border-gray-200 mt-4">
                  <p className="text-sm text-gray-600">Budget Range</p>
                  <p className="text-base font-medium text-gray-900">
                    Rs. {formData.budgetRange.replace('-', ' - ')}
                  </p>
                </div>

                {/* Photos */}
                {formData.problemImages.length > 0 && (
                  <div className="pb-4 border-b border-gray-200 mt-4">
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

                {/* Location */}
                <div className="pb-4 border-b border-gray-200 mt-4">
                  <p className="text-sm text-gray-600">Your Location</p>
                  <p className="text-base text-gray-900">{formData.town}, {formData.district}</p>
                </div>

                {/* Contact */}
                {formData.contactPhone && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="text-base font-medium text-gray-900">{formData.contactPhone}</p>
                  </div>
                )}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-indigo-900">
                  <strong>Next Steps:</strong> After submitting, you'll see a list of available workers 
                  in {formData.town}. You can view their profiles, ratings, and send your quote request to 
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
                  <span>Creating Request...</span>
                </>
              ) : currentStep === 4 ? (
                <>
                  <span>Submit Request</span>
                  <ArrowRight size={20} />
                </>
              ) : (
                <>
                  <span>Next</span>
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
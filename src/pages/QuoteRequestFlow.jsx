import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, X, MapPin, Calendar, DollarSign, AlertCircle, Clock } from 'lucide-react';
import apiService from '../services/apiService';
import { LOCATION_DATA } from '../utils/locationData';
import ImageUpload from '../components/customer/ImageUpload';

/**
 * ✅ CRITICAL FIX: Quote Request Flow Component
 * 
 * URGENCY FIX:
 * - Frontend was sending: 'medium' 
 * - Backend expects: ['low', 'normal', 'high', 'emergency']
 * - Fixed: Changed 'medium' to 'normal' to match backend enum
 * - Simplified to just two options: "Not Urgent" (normal) and "Urgent" (high)
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
    urgency: 'normal', // ✅ FIXED: Changed default from 'medium' to 'normal'
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

  const handleImageUpload = (images) => {
    setFormData(prev => ({ ...prev, problemImages: images }));
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

      // ✅ CRITICAL: Ensure urgency is a valid enum value
      // Backend expects: ['low', 'normal', 'high', 'emergency']
      const requestData = {
        serviceType: formData.serviceType,
        problemDescription: formData.problemDescription,
        issueLocation: formData.issueLocation,
        scheduledDate: formData.serviceDate,
        serviceDate: formData.serviceDate,
        urgency: formData.urgency, // ✅ Now sends 'normal' or 'high' instead of 'medium'
        budgetRange: formData.budgetRange,
        problemImages: imageData,
        serviceLocation: serviceLocation,
        contactPhone: formData.contactPhone,
      };

      console.log('Request data prepared:', {
        serviceType: requestData.serviceType,
        issueLocation: requestData.issueLocation,
        urgency: requestData.urgency, // ✅ Verify urgency value
        imageCount: requestData.problemImages.length,
        location: requestData.serviceLocation
      });

      // Submit quote request
      const response = await apiService.post('/bookings/quote-request', requestData);

      console.log('✅ Raw API response:', response);

      // Access response data correctly
      if (!response || !response.data || !response.data.quoteRequest) {
        throw new Error('Invalid response structure from server');
      }

      const quoteRequest = response.data.quoteRequest;

      console.log('✅ Quote request created:', {
        id: quoteRequest._id,
        serviceType: quoteRequest.serviceType,
        urgency: quoteRequest.urgency,
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
                  {getIssueLocationOptions().map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {errors.issueLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.issueLocation}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Photos (Optional)
                </label>
                <ImageUpload
                  images={formData.problemImages}
                  setImages={handleImageUpload}
                  maxImages={5}
                  maxSizeMB={5}
                />
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

              {/* ✅ FIXED: Urgency Level - Only 2 options matching backend enum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How urgent is this? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Not Urgent - maps to 'normal' */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, urgency: 'normal' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.urgency === 'normal'
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-50'
                        : 'border-gray-200 hover:border-blue-400 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        formData.urgency === 'normal' ? 'bg-blue-200' : 'bg-blue-100'
                      }`}>
                        <Clock className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-blue-700">
                          Not Urgent
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          Can wait 3-7 days
                        </div>
                      </div>
                      {formData.urgency === 'normal' && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Urgent - maps to 'high' */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, urgency: 'high' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.urgency === 'high'
                        ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-600 ring-opacity-50'
                        : 'border-gray-200 hover:border-orange-400 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        formData.urgency === 'high' ? 'bg-orange-200' : 'bg-orange-100'
                      }`}>
                        <AlertCircle className="h-5 w-5 text-orange-700" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-orange-700">
                          Urgent
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          Need within 1-2 days
                        </div>
                      </div>
                      {formData.urgency === 'high' && (
                        <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
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
                  This helps us match you with the right workers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <DollarSign size={16} className="inline mr-2" />
                  Budget Range *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: '0-5000', label: 'Rs. 0 - 5,000' },
                    { value: '5000-10000', label: 'Rs. 5,000 - 10,000' },
                    { value: '10000-25000', label: 'Rs. 10,000 - 25,000' },
                    { value: '25000-50000', label: 'Rs. 25,000 - 50,000' },
                    { value: '50000+', label: 'Rs. 50,000+' },
                  ].map((budget) => (
                    <button
                      key={budget.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, budgetRange: budget.value }))}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        formData.budgetRange === budget.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {budget.label}
                    </button>
                  ))}
                </div>
                {errors.budgetRange && (
                  <p className="mt-2 text-sm text-red-600">{errors.budgetRange}</p>
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
                  {LOCATION_DATA.map((location) => (
                    <option key={location.district} value={location.district}>
                      {location.district}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
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
                    {formData.serviceDate} • {formData.urgency === 'normal' ? 'Not Urgent' : 'Urgent'}
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
                    <p className="text-sm text-gray-600">Photos ({formData.problemImages.length})</p>
                    <div className="flex gap-2 mt-2">
                      {formData.problemImages.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.preview || img.base64}
                          alt={`Problem ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                      {formData.problemImages.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600">
                          +{formData.problemImages.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Your Location</p>
                  <p className="text-base text-gray-900">
                    {formData.town}, {formData.district}
                  </p>
                </div>
              </div>

              {/* Next Steps Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-900 font-medium">Next Steps:</p>
                <p className="text-sm text-blue-700 mt-1">
                  After submitting, you'll see a list of available workers in {formData.town}. You can view their profiles, 
                  ratings, and send your quote request to workers you prefer.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={20} className="inline mr-2" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Calendar, AlertCircle } from 'lucide-react';
import storage from '../utils/storage';
import apiService from '../services/apiService';
import ImageUpload from '../components/quote/ImageUpload';

/**
 * Quote Request Flow Component - COMPLETE FIX
 * Multi-step form for customers to create quote requests
 * 
 * ✅ FIXED: Correct API endpoint with /api/v1 prefix
 * ✅ FIXED: ImageUpload component integration
 * ✅ FIXED: issueLocation dropdown with proper enum values
 * ✅ FIXED: Proper error handling
 */
const QuoteRequestFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCategory = location.state?.category;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    serviceType: selectedCategory?.id || '',
    problemDescription: '',
    issueLocation: '', // Will be one of the enum values
    serviceDate: '',
    urgency: 'normal',
    budgetRange: '',
    problemImages: [], // Array of {id, filename, base64, size}
    town: '',
    district: '',
    contactPhone: ''
  });

  // ✅ FIXED: Issue location options matching MongoDB enum exactly
  const issueLocationOptions = [
    { value: 'Kitchen', label: 'Kitchen' },
    { value: 'Bathroom', label: 'Bathroom' },
    { value: 'Living room', label: 'Living Room' },
    { value: 'Bedroom', label: 'Bedroom' },
    { value: 'Garage', label: 'Garage' },
    { value: 'Basement', label: 'Basement' },
    { value: 'Outdoor area', label: 'Outdoor Area' },
    { value: 'Rooftop', label: 'Rooftop' },
    { value: 'Other', label: 'Other' }
  ];

  // Sri Lankan locations by district
  const sriLankanLocations = {
    'Colombo': ['Colombo', 'Dehiwala', 'Mount Lavinia', 'Moratuwa', 'Kotte', 'Maharagama', 'Nugegoda', 'Piliyandala'],
    'Gampaha': ['Gampaha', 'Negombo', 'Katunayake', 'Ja-Ela', 'Wattala', 'Kelaniya', 'Kadawatha', 'Ragama', 'Veyangoda'],
    'Kalutara': ['Kalutara', 'Panadura', 'Horana', 'Beruwala', 'Aluthgama', 'Wadduwa', 'Bandaragama'],
    'Kandy': ['Kandy', 'Peradeniya', 'Gampola', 'Nawalapitiya', 'Katugastota', 'Akurana'],
    'Matale': ['Matale', 'Dambulla', 'Sigiriya', 'Galewela'],
    'Nuwara Eliya': ['Nuwara Eliya', 'Hatton', 'Nanuoya', 'Talawakelle'],
    'Galle': ['Galle', 'Hikkaduwa', 'Ambalangoda', 'Elpitiya', 'Bentota'],
    'Matara': ['Matara', 'Weligama', 'Mirissa', 'Kamburugamuwa'],
    'Hambantota': ['Hambantota', 'Tangalle', 'Tissamaharama'],
    'Jaffna': ['Jaffna', 'Chavakachcheri', 'Point Pedro', 'Valvettithurai'],
    'Kilinochchi': ['Kilinochchi', 'Pallai', 'Paranthan'],
    'Mannar': ['Mannar', 'Madhu'],
    'Vavuniya': ['Vavuniya', 'Cheddikulam'],
    'Mullaitivu': ['Mullaitivu', 'Oddusuddan'],
    'Batticaloa': ['Batticaloa', 'Kattankudy', 'Eravur'],
    'Ampara': ['Ampara', 'Kalmunai', 'Sammanthurai'],
    'Trincomalee': ['Trincomalee', 'Kinniya', 'Muttur'],
    'Kurunegala': ['Kurunegala', 'Kuliyapitiya', 'Pannala', 'Narammala'],
    'Puttalam': ['Puttalam', 'Chilaw', 'Wennappuwa', 'Anamaduwa'],
    'Anuradhapura': ['Anuradhapura', 'Kekirawa', 'Medawachchiya'],
    'Polonnaruwa': ['Polonnaruwa', 'Kaduruwela', 'Medirigiriya'],
    'Badulla': ['Badulla', 'Bandarawela', 'Haputale', 'Welimada'],
    'Monaragala': ['Monaragala', 'Wellawaya', 'Bibile'],
    'Ratnapura': ['Ratnapura', 'Embilipitiya', 'Balangoda', 'Pelmadulla'],
    'Kegalle': ['Kegalle', 'Mawanella', 'Warakapola', 'Rambukkana']
  };

  const urgencyOptions = [
    { value: 'normal', label: 'Normal (Within a week)' },
    { value: 'high', label: 'Urgent (Within 2-3 days)' },
    { value: 'emergency', label: 'Emergency (ASAP)' }
  ];

  const budgetRanges = [
    { value: '0-5000', label: 'Rs. 0 - 5,000' },
    { value: '5000-10000', label: 'Rs. 5,000 - 10,000' },
    { value: '10000-20000', label: 'Rs. 10,000 - 20,000' },
    { value: '20000-50000', label: 'Rs. 20,000 - 50,000' },
    { value: '50000+', label: 'Rs. 50,000+' }
  ];

  // Validate current step
  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.serviceType) {
        newErrors.serviceType = 'Please select a service type';
      }
    }

    if (currentStep === 2) {
      if (!formData.problemDescription || formData.problemDescription.trim().length < 20) {
        newErrors.problemDescription = 'Please provide a detailed description (at least 20 characters)';
      }
      if (!formData.issueLocation) {
        newErrors.issueLocation = 'Please select where the issue is located';
      }
      if (!formData.serviceDate) {
        newErrors.serviceDate = 'Please select a preferred service date';
      }
      const today = new Date().toISOString().split('T')[0];
      if (formData.serviceDate < today) {
        newErrors.serviceDate = 'Service date cannot be in the past';
      }
      if (!formData.budgetRange) {
        newErrors.budgetRange = 'Please select a budget range';
      }
    }

    if (currentStep === 3) {
      if (!formData.district) {
        newErrors.district = 'Please select your district';
      }
      if (!formData.town) {
        newErrors.town = 'Please select your town/city';
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
        city: formData.town, // ✅ FIXED: Backend expects 'city' field
        district: formData.district,
        address: `${formData.town}, ${formData.district}`,
        coordinates: null
      };

      // ✅ FIXED: Prepare request data with correct field names
      const requestData = {
        serviceType: formData.serviceType,
        problemDescription: formData.problemDescription,
        issueLocation: formData.issueLocation, // ✅ Now uses proper enum value
        scheduledDate: formData.serviceDate, // ✅ FIXED: Backend expects 'scheduledDate'
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

      // ✅ FIXED: Submit quote request with correct endpoint
      const response = await apiService.post('/api/v1/bookings/quote-request', requestData);

      console.log('✅ Quote request created:', response);

      // Navigate to worker listing
      navigate('/customer/find-workers', {
        state: {
          quoteRequestId: response.data.quoteRequest._id,
          serviceType: formData.serviceType,
          location: serviceLocation,
          category: selectedCategory
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

  // Get minimum date for service date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Handle image updates
  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      problemImages: newImages
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a Quote</h1>
          <p className="text-gray-600">
            {selectedCategory?.name} - Step {currentStep} of 4
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service</span>
            <span>Details</span>
            <span>Location</span>
            <span>Review</span>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Service Type</h2>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-lg font-medium text-indigo-900">
                    {selectedCategory?.name}
                  </p>
                  <p className="text-sm text-indigo-700 mt-1">
                    {selectedCategory?.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Problem Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem Details</h2>

              {/* Problem Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description *
                </label>
                <textarea
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  placeholder="Describe the problem in detail..."
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.problemDescription ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.problemDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.problemDescription}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.problemDescription.length} characters (minimum 20)
                </p>
              </div>

              {/* ✅ FIXED: Issue Location Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Location in House *
                </label>
                <select
                  value={formData.issueLocation}
                  onChange={(e) => setFormData({ ...formData, issueLocation: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.issueLocation ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select location</option>
                  {issueLocationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.issueLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.issueLocation}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Where in your property is the problem located?
                </p>
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Service Date *
                </label>
                <input
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                  min={getMinDate()}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                <div className="space-y-2">
                  {urgencyOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={option.value}
                        checked={formData.urgency === option.value}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="mr-3"
                      />
                      <span className="text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range *
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.budgetRange ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                {errors.budgetRange && (
                  <p className="mt-1 text-sm text-red-600">{errors.budgetRange}</p>
                )}
              </div>

              {/* Image Upload Component */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Photos (Optional)
                </label>
                <ImageUpload
                  images={formData.problemImages}
                  setImages={handleImagesChange}
                  maxImages={5}
                  maxSizeMB={5}
                />
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Location</h2>

              {/* District Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => {
                    setFormData({ ...formData, district: e.target.value, town: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.district ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select district</option>
                  {Object.keys(sriLankanLocations).sort().map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>

              {/* Town/City Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Town/City *
                </label>
                <select
                  value={formData.town}
                  onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                  disabled={!formData.district}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.town ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select town/city</option>
                  {formData.district &&
                    sriLankanLocations[formData.district].map((town) => (
                      <option key={town} value={town}>
                        {town}
                      </option>
                    ))}
                </select>
                {errors.town && (
                  <p className="mt-1 text-sm text-red-600">{errors.town}</p>
                )}
              </div>

              {/* Contact Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  If different from your registered phone number
                </p>
              </div>

              {formData.district && formData.town && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Location Selected
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {formData.town}, {formData.district}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Request</h2>

              <div className="space-y-4">
                {/* Service Type */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="text-base font-medium text-gray-900">{selectedCategory?.name}</p>
                </div>

                {/* Problem Description */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Problem Description</p>
                  <p className="text-base text-gray-900">{formData.problemDescription}</p>
                </div>

                {/* Issue Location */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Issue Location</p>
                  <p className="text-base text-gray-900">{formData.issueLocation}</p>
                </div>

                {/* Service Date & Urgency */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Preferred Service Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(formData.serviceDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Urgency</p>
                  <p className="text-base text-gray-900 capitalize">{formData.urgency}</p>
                </div>

                {/* Budget Range */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Budget Range</p>
                  <p className="text-base font-medium text-gray-900">
                    Rs. {formData.budgetRange.replace('-', ' - ')}
                  </p>
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

                {/* Location */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Your Location</p>
                  <p className="text-base text-gray-900">{formData.town}, {formData.district}</p>
                </div>

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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Creating Request...
                </>
              ) : currentStep === 4 ? (
                <>
                  Submit Request
                  <ArrowRight size={20} />
                </>
              ) : (
                <>
                  Next
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
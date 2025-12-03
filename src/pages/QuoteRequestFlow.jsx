import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Calendar, AlertCircle, Upload, X } from 'lucide-react';
import storage from '../utils/storage';
import apiService from '../services/apiService';
import ImageUpload from '../components/quote/ImageUpload';

/**
 * Quote Request Flow Component - UPDATED
 * Multi-step form for customers to create quote requests
 * 
 * ✅ FIXED: Removed GPS location system
 * ✅ FIXED: Added manual town/location selection
 * ✅ FIXED: Proper navigation to worker listing
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
    issueLocation: '',
    serviceDate: '',
    urgency: 'normal',
    budgetRange: '',
    problemImages: [],
    // ✅ CHANGED: Manual location instead of GPS
    town: '', // Customer's town/city
    district: '', // Customer's district
    contactPhone: ''
  });

  // ✅ NEW: Sri Lankan towns/cities by district
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
    'Trincomalee': ['Trincomalee', 'Kinniya', 'Mutur'],
    'Kurunegala': ['Kurunegala', 'Kuliyapitiya', 'Narammala', 'Wariyapola'],
    'Puttalam': ['Puttalam', 'Chilaw', 'Wennappuwa', 'Nattandiya'],
    'Anuradhapura': ['Anuradhapura', 'Kekirawa', 'Medawachchiya'],
    'Polonnaruwa': ['Polonnaruwa', 'Kaduruwela', 'Hingurakgoda'],
    'Badulla': ['Badulla', 'Bandarawela', 'Haputale', 'Welimada'],
    'Monaragala': ['Monaragala', 'Wellawaya', 'Buttala'],
    'Ratnapura': ['Ratnapura', 'Embilipitiya', 'Balangoda', 'Pelmadulla'],
    'Kegalle': ['Kegalle', 'Mawanella', 'Warakapola']
  };

  const locationOptions = [
    'Kitchen',
    'Bathroom',
    'Living room',
    'Bedroom',
    'Garage',
    'Basement',
    'Outdoor area',
    'Rooftop',
    'Other'
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low - Within a week' },
    { value: 'normal', label: 'Normal - Within 2-3 days' },
    { value: 'high', label: 'High - Within 24 hours' },
    { value: 'emergency', label: 'Emergency - ASAP' }
  ];

  const budgetOptions = [
    { value: '1000-3000', label: 'Rs. 1,000 - 3,000' },
    { value: '3000-5000', label: 'Rs. 3,000 - 5,000' },
    { value: '5000-10000', label: 'Rs. 5,000 - 10,000' },
    { value: '10000-20000', label: 'Rs. 10,000 - 20,000' },
    { value: '20000-50000', label: 'Rs. 20,000 - 50,000' },
    { value: '50000+', label: 'Rs. 50,000+' }
  ];

  // Load user data on mount
  useEffect(() => {
    if (!selectedCategory) {
      navigate('/customer/service-selection');
      return;
    }
    
    loadUserData();
  }, [selectedCategory, navigate]);

  const loadUserData = () => {
    const user = storage.getUserData();
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactPhone: user.phoneNumber || ''
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

    // ✅ NEW: When district changes, reset town
    if (name === 'district') {
      setFormData(prev => ({
        ...prev,
        town: ''
      }));
    }
  };

  // ✅ NEW: Handle image uploads
  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      problemImages: images
    }));
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
      const today = new Date().toISOString().split('T')[0];
      if (formData.serviceDate < today) {
        newErrors.serviceDate = 'Service date cannot be in the past';
      }
      if (!formData.budgetRange) {
        newErrors.budgetRange = 'Please select a budget range';
      }
    }

    if (currentStep === 3) {
      // ✅ NEW: Validate manual location
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

      // ✅ Prepare Base64 images
      const imageData = formData.problemImages.map((img) => img.base64);

      // ✅ Prepare location object with manual location
      const serviceLocation = {
        town: formData.town,
        district: formData.district,
        address: `${formData.town}, ${formData.district}`,
        // For future geolocation, we can add approximate coordinates based on town
        coordinates: null
      };

      // ✅ Prepare request data
      const requestData = {
        serviceType: formData.serviceType,
        problemDescription: formData.problemDescription,
        issueLocation: formData.issueLocation,
        serviceDate: formData.serviceDate,
        urgency: formData.urgency,
        budgetRange: formData.budgetRange,
        problemImages: imageData,
        serviceLocation: serviceLocation, // ✅ Manual location instead of GPS
        contactPhone: formData.contactPhone,
      };

      console.log('Request data prepared:', {
        serviceType: requestData.serviceType,
        imageCount: requestData.problemImages.length,
        location: requestData.serviceLocation
      });

      // ✅ Submit quote request
      const response = await apiService.post('/bookings/quote-request', requestData);

      console.log('✅ Quote request created:', response.data);

      // ✅ Navigate to worker listing with quote request ID and location
      navigate('/customer/find-workers', {
        state: {
          quoteRequestId: response.data.data.quoteRequest._id,
          serviceType: formData.serviceType,
          location: serviceLocation,
          category: selectedCategory
        }
      });

    } catch (error) {
      console.error('❌ Error creating quote request:', error);
      
      setErrors({
        submit: error.response?.data?.message || 'Failed to create quote request. Please try again.'
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
                  step <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Service</span>
            <span>Details</span>
            <span>Location</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Step 1: Service Type (if not pre-selected) */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Service Type
              </h2>
              <p className="text-gray-600 mb-4">
                Selected: <span className="font-medium text-indigo-600">{selectedCategory?.name}</span>
              </p>
              <input
                type="hidden"
                name="serviceType"
                value={formData.serviceType}
              />
            </div>
          )}

          {/* Step 2: Problem Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tell us about your problem
              </h2>

              {/* Problem Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description *
                </label>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.problemDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Please describe the problem in detail (minimum 20 characters)"
                />
                {errors.problemDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.problemDescription}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.problemDescription.length} characters
                </p>
              </div>

              {/* Issue Location in House */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where is the issue located? *
                </label>
                <select
                  name="issueLocation"
                  value={formData.issueLocation}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.issueLocation ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select location</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {errors.issueLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.issueLocation}</p>
                )}
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Service Date *
                </label>
                <input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.serviceDate ? 'border-red-500' : 'border-gray-300'
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {urgencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range *
                </label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.budgetRange ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select budget range</option>
                  {budgetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.budgetRange && (
                  <p className="mt-1 text-sm text-red-600">{errors.budgetRange}</p>
                )}
              </div>

              {/* Problem Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Photos (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Photos help workers understand the problem better and provide accurate quotes.
                </p>
                <ImageUpload
                  images={formData.problemImages}
                  onChange={handleImagesChange}
                  maxImages={5}
                />
              </div>
            </div>
          )}

          {/* Step 3: Manual Location Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Location
              </h2>
              <p className="text-gray-600 mb-4">
                We need your location to find nearby workers.
              </p>

              {/* District Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your district</option>
                  {Object.keys(sriLankanLocations).sort().map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>

              {/* Town Selection */}
              {formData.district && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Town/City *
                  </label>
                  <select
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.town ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your town/city</option>
                    {sriLankanLocations[formData.district].map((town) => (
                      <option key={town} value={town}>{town}</option>
                    ))}
                  </select>
                  {errors.town && (
                    <p className="mt-1 text-sm text-red-600">{errors.town}</p>
                  )}
                </div>
              )}

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+94 XX XXX XXXX"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Workers will use this number to contact you
                </p>
              </div>

              {/* Location Info Box */}
              {formData.district && formData.town && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Location selected
                      </p>
                      <p className="text-sm text-green-700">
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Review Your Request
              </h2>

              {/* Display Error */}
              {errors.submit && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Service Type */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="text-base font-medium text-gray-900">{selectedCategory?.name}</p>
                </div>

                {/* Problem Description */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Problem Description</p>
                  <p className="text-base text-gray-900">{formData.problemDescription}</p>
                </div>

                {/* Issue Location */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Issue Location</p>
                  <p className="text-base text-gray-900">{formData.issueLocation}</p>
                </div>

                {/* Service Date */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Preferred Service Date</p>
                  <p className="text-base text-gray-900">
                    {new Date(formData.serviceDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Urgency */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Urgency</p>
                  <p className="text-base text-gray-900 capitalize">{formData.urgency}</p>
                </div>

                {/* Budget */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Budget Range</p>
                  <p className="text-base text-gray-900">
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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  {currentStep === 4 ? 'Submit & Find Workers' : 'Next'}
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/common';
import { 
  Wrench, Hammer, Zap, Paintbrush, Building, Camera, 
  MapPin, Clock, DollarSign, Check, X 
} from 'lucide-react';

/**
 * Worker Registration Flow Component
 * Multi-step registration for workers with 7 steps
 */
const WorkerRegistrationFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tempUserData, setTempUserData] = useState(null);

  const totalSteps = 7;

  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1: Service Type
    serviceType: '',
    
    // Step 2: Personal Info (from tempUserData)
    // These will be populated from session storage
    
    // Step 3: Business Information (optional)
    businessName: '',
    businessAddress: '',
    city: '',
    stateProvince: 'sri lanka',
    postalCode: '',
    website: '',
    
    // Step 4: Experience & Skills
    yearsOfExperience: '',
    specializations: [],
    languagesSpoken: [],
    bio: '',
    
    // Step 5: Service Area & Location
    serviceAddress: '',
    serviceCity: '',
    serviceProvince: 'sri lanka',
    servicePostalCode: '',
    serviceRadius: '10',
    
    // Step 6: Pricing
    dailyWage: '',
    halfDayRate: '',
    minimumCharge: '',
    overtimeHourlyRate: '',
    
    // Step 7: Availability & Settings
    availableDays: [],
    workingHours: {
      startTime: '08:00',
      endTime: '18:00'
    },
    availableOnWeekends: false,
    emergencyServices: false,
    ownTools: false,
    vehicleAvailable: false,
    certified: false,
    insured: false,
    whatsappAvailable: false,
  });

  // Service categories
  const serviceCategories = [
    { id: 'plumbing', label: 'Plumbing Services', icon: Wrench },
    { id: 'electrical', label: 'Electrical Services', icon: Zap },
    { id: 'carpentry', label: 'Carpentry Services', icon: Hammer },
    { id: 'painting', label: 'Painting Services', icon: Paintbrush },
    { id: 'construction', label: 'Construction', icon: Building },
    { id: 'photography', label: 'Photography', icon: Camera },
  ];

  // Specializations by service type
  const specializationsByService = {
    electrical: [
      'Wiring Installation',
      'Circuit Breaker Repair',
      'Outlet Installation',
      'Lighting Installation',
      'Electrical Panel Upgrade',
      'Emergency Electrical'
    ],
    plumbing: [
      'Pipe Repair',
      'Drain Cleaning',
      'Toilet Repair',
      'Faucet Installation',
      'Water Heater Service',
      'Emergency Plumbing'
    ],
    carpentry: [
      'Furniture Making',
      'Door Installation',
      'Window Repair',
      'Cabinet Installation',
      'Deck Building',
      'Custom Woodwork'
    ],
    painting: [
      'Interior Painting',
      'Exterior Painting',
      'Wall Texture',
      'Spray Painting',
      'Commercial Painting',
      'Decorative Painting'
    ],
  };

  // Languages
  const languages = ['English', 'Sinhala', 'Tamil', 'Arabic', 'Chinese', 'Hindi', 'Other'];

  // Days of the week
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    // Get temporary user data from session storage
    const storedData = sessionStorage.getItem('tempUserData');
    if (!storedData) {
      // If no temp data, redirect to signup
      navigate('/signup');
      return;
    }
    const userData = JSON.parse(storedData);
    setTempUserData(userData);
    
    // Pre-fill personal info from temp data
    setFormData(prev => ({
      ...prev,
      serviceAddress: userData.address,
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1: // Service Type
        if (!formData.serviceType) {
          newErrors.serviceType = 'Please select a service type';
        }
        break;

      case 2: // Personal Info (already validated, just display)
        break;

      case 3: // Business Information (all optional)
        break;

      case 4: // Experience & Skills
        if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
          newErrors.yearsOfExperience = 'Please enter years of experience';
        }
        if (formData.specializations.length === 0) {
          newErrors.specializations = 'Please select at least one specialization';
        }
        if (formData.languagesSpoken.length === 0) {
          newErrors.languagesSpoken = 'Please select at least one language';
        }
        if (!formData.bio || formData.bio.length < 50) {
          newErrors.bio = 'Please provide a bio (at least 50 characters)';
        }
        break;

      case 5: // Service Area
        if (!formData.serviceAddress) {
          newErrors.serviceAddress = 'Address is required';
        }
        if (!formData.serviceCity) {
          newErrors.serviceCity = 'City is required';
        }
        if (!formData.servicePostalCode) {
          newErrors.servicePostalCode = 'Postal code is required';
        }
        if (!formData.serviceRadius || formData.serviceRadius < 1) {
          newErrors.serviceRadius = 'Service radius must be at least 1 km';
        }
        break;

      case 6: // Pricing
        if (!formData.dailyWage || formData.dailyWage < 500) {
          newErrors.dailyWage = 'Daily wage must be at least LKR 500';
        }
        if (!formData.halfDayRate || formData.halfDayRate < 250) {
          newErrors.halfDayRate = 'Half day rate must be at least LKR 250';
        }
        if (!formData.minimumCharge || formData.minimumCharge < 100) {
          newErrors.minimumCharge = 'Minimum charge must be at least LKR 100';
        }
        if (!formData.overtimeHourlyRate || formData.overtimeHourlyRate < 50) {
          newErrors.overtimeHourlyRate = 'Overtime rate must be at least LKR 50';
        }
        break;

      case 7: // Availability
        // Optional validations
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === 3) {
        // Business info step is optional, can skip
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    // Only allow skip on business information step
    if (currentStep === 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep() || !tempUserData) return;

    setLoading(true);

    try {
      // Prepare worker registration data
      const workerData = {
        // Personal info from tempUserData
        firstName: tempUserData.firstName,
        lastName: tempUserData.lastName,
        name: tempUserData.name,
        email: tempUserData.email,
        phoneNumber: tempUserData.phoneNumber,
        address: tempUserData.address,
        role: 'worker',
        firebaseUid: tempUserData.firebaseUid,
        
        // Service info
        serviceCategory: formData.serviceType,
        
        // Business info (optional)
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        city: formData.city,
        stateProvince: formData.stateProvince,
        postalCode: formData.postalCode,
        website: formData.website,
        
        // Experience & Skills
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        specializations: formData.specializations,
        languagesSpoken: formData.languagesSpoken,
        bio: formData.bio,
        
        // Service area
        serviceArea: {
          address: formData.serviceAddress,
          city: formData.serviceCity,
          province: formData.serviceProvince,
          postalCode: formData.servicePostalCode,
          radiusKm: parseInt(formData.serviceRadius),
        },
        
        // Pricing
        pricing: {
          dailyWage: parseFloat(formData.dailyWage),
          halfDayRate: parseFloat(formData.halfDayRate),
          minimumCharge: parseFloat(formData.minimumCharge),
          overtimeHourlyRate: parseFloat(formData.overtimeHourlyRate),
        },
        
        // Availability
        availability: {
          workingDays: formData.availableDays,
          workingHours: formData.workingHours,
          availableOnWeekends: formData.availableOnWeekends,
        },
        
        // Settings
        emergencyServices: formData.emergencyServices,
        ownTools: formData.ownTools,
        vehicleAvailable: formData.vehicleAvailable,
        certified: formData.certified,
        insured: formData.insured,
        whatsappAvailable: formData.whatsappAvailable,
      };

      // Create worker account in backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempUserData.idToken}`,
        },
        body: JSON.stringify(workerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Worker registration failed');
      }

      // Store auth token and user data
      sessionStorage.setItem('authToken', tempUserData.idToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.removeItem('tempUserData');

      // Show success message
      alert('Registration completed successfully!');

      // Navigate to worker dashboard
      navigate('/worker/dashboard');
    } catch (error) {
      console.error('Worker registration error:', error);
      alert('Failed to complete registration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!tempUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Worker Registration</h1>
          <p className="text-gray-600 mt-2">
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Service Type' :
              currentStep === 2 ? 'Personal Info' :
              currentStep === 3 ? 'Business Info' :
              currentStep === 4 ? 'Experience & Skills' :
              currentStep === 5 ? 'Service Area' :
              currentStep === 6 ? 'Pricing' :
              'Availability & Settings'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What type of service do you provide?
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Select the main service category that best describes your expertise
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {serviceCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFormData({ ...formData, serviceType: category.id })}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.serviceType === category.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <Icon className="h-10 w-10 text-indigo-600 mb-3" />
                      <p className="font-medium text-gray-900">{category.label}</p>
                    </button>
                  );
                })}
              </div>
              
              {errors.serviceType && (
                <p className="text-sm text-red-600 mt-2">{errors.serviceType}</p>
              )}
            </div>
          )}

          {/* Step 2: Personal Information (Display Only) */}
          {currentStep === 2 && tempUserData && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Information from your account
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={tempUserData.firstName}
                    disabled
                  />
                  <Input
                    label="Last Name"
                    value={tempUserData.lastName}
                    disabled
                  />
                </div>
                
                <Input
                  label="Email"
                  value={tempUserData.email}
                  disabled
                />
                
                <Input
                  label="Phone Number"
                  value={tempUserData.phoneNumber}
                  disabled
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800">
                  These details are from your account and cannot be changed here.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Business Information (Optional) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Business Information
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                This step is optional. You can skip if you don't have a registered business.
              </p>

              <Input
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="ramod electric"
              />

              <Input
                label="Business Address"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                placeholder="loku road, big town"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="kandy"
                />
                <Input
                  label="State/Province"
                  name="stateProvince"
                  value={formData.stateProvince}
                  onChange={handleChange}
                  placeholder="sri lanka"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postal Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="1234"
                />
                <Input
                  label="Website (Optional)"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="www.etric.com"
                />
              </div>
            </div>
          )}

          {/* Step 4: Experience & Skills */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Experience & Skills
              </h2>

              <Input
                label="Years of Experience"
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                error={errors.yearsOfExperience}
                placeholder="11"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Specializations <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Select all specializations that apply to your skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {(specializationsByService[formData.serviceType] || []).map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleArrayToggle('specializations', spec)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.specializations.includes(spec)
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {formData.specializations.includes(spec) && (
                        <Check className="inline h-4 w-4 mr-1" />
                      )}
                      {spec}
                    </button>
                  ))}
                </div>
                {errors.specializations && (
                  <p className="text-sm text-red-600 mt-2">{errors.specializations}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Languages Spoken
                </label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleArrayToggle('languagesSpoken', lang)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.languagesSpoken.includes(lang)
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {formData.languagesSpoken.includes(lang) && (
                        <Check className="inline h-4 w-4 mr-1" />
                      )}
                      {lang}
                    </button>
                  ))}
                </div>
                {errors.languagesSpoken && (
                  <p className="text-sm text-red-600 mt-2">{errors.languagesSpoken}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio / Professional Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="I am a skilled and reliable electrical technician with experience in repairing wiring systems and fixing power issues. I always focus on safety, quality, and customer satisfaction while completing my work efficiently"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.bio.length} / 500 characters (minimum 50)
                </p>
                {errors.bio && (
                  <p className="text-sm text-red-600 mt-1">{errors.bio}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Service Area & Location */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Location & Service Area
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Some information is from your account
              </p>

              <Input
                label="Address"
                name="serviceAddress"
                value={formData.serviceAddress}
                onChange={handleChange}
                error={errors.serviceAddress}
                placeholder="loku road, big town"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City/Town"
                  name="serviceCity"
                  value={formData.serviceCity}
                  onChange={handleChange}
                  error={errors.serviceCity}
                  placeholder="kandy"
                  required
                />
                <Input
                  label="Province"
                  name="serviceProvince"
                  value={formData.serviceProvince}
                  onChange={handleChange}
                  placeholder="sri lanka"
                  required
                />
              </div>

              <Input
                label="Postal Code"
                name="servicePostalCode"
                value={formData.servicePostalCode}
                onChange={handleChange}
                error={errors.servicePostalCode}
                placeholder="1234"
                required
              />

              <Input
                label="Service Radius (km)"
                type="number"
                name="serviceRadius"
                value={formData.serviceRadius}
                onChange={handleChange}
                error={errors.serviceRadius}
                helperText="How far are you willing to travel for jobs?"
                placeholder="10"
                required
              />

              <Input
                label="Website (Optional)"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="www.etric.com"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800">
                  Address and City are from your account. Please provide Province and Service Radius.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Pricing */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pricing
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Set your rates in Sri Lankan Rupees (LKR)
              </p>

              <Input
                label="Daily Wage (LKR)"
                type="number"
                name="dailyWage"
                value={formData.dailyWage}
                onChange={handleChange}
                error={errors.dailyWage}
                placeholder="3000"
                required
              />

              <Input
                label="Half Day Rate (LKR)"
                type="number"
                name="halfDayRate"
                value={formData.halfDayRate}
                onChange={handleChange}
                error={errors.halfDayRate}
                placeholder="1500"
                required
              />

              <Input
                label="Minimum Charge (LKR)"
                type="number"
                name="minimumCharge"
                value={formData.minimumCharge}
                onChange={handleChange}
                error={errors.minimumCharge}
                placeholder="500"
                required
              />

              <Input
                label="Overtime Hourly Rate (LKR)"
                type="number"
                name="overtimeHourlyRate"
                value={formData.overtimeHourlyRate}
                onChange={handleChange}
                error={errors.overtimeHourlyRate}
                placeholder="400"
                required
              />
            </div>
          )}

          {/* Step 7: Availability & Settings */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Availability & Settings
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Days
                </label>
                <div className="space-y-2">
                  {weekDays.map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.availableDays.includes(day)}
                        onChange={() => handleArrayToggle('availableDays', day)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Working Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Time"
                    type="time"
                    name="startTime"
                    value={formData.workingHours.startTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      workingHours: { ...formData.workingHours, startTime: e.target.value }
                    })}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    name="endTime"
                    value={formData.workingHours.endTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      workingHours: { ...formData.workingHours, endTime: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="availableOnWeekends"
                    checked={formData.availableOnWeekends}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Available on Weekends</span>
                    <p className="text-sm text-gray-500">Do you work on Saturday and Sunday?</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="emergencyServices"
                    checked={formData.emergencyServices}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Emergency Services</span>
                    <p className="text-sm text-gray-500">Available for urgent/emergency calls</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="ownTools"
                    checked={formData.ownTools}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Own Tools</span>
                    <p className="text-sm text-gray-500">I have my own tools and equipment</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="vehicleAvailable"
                    checked={formData.vehicleAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Vehicle Available</span>
                    <p className="text-sm text-gray-500">I have transportation to job sites</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="certified"
                    checked={formData.certified}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Certified</span>
                    <p className="text-sm text-gray-500">I have relevant certifications</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="insured"
                    checked={formData.insured}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Insured</span>
                    <p className="text-sm text-gray-500">I have liability insurance</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="whatsappAvailable"
                    checked={formData.whatsappAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">WhatsApp Available</span>
                    <p className="text-sm text-gray-500">Customers can contact me via WhatsApp</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
            >
              Previous
            </Button>

            <div className="flex space-x-3">
              {currentStep === 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Completing...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {currentStep === totalSteps && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-900">Almost Done!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Click "Complete Registration" to finish setting up your worker profile.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerRegistrationFlow;
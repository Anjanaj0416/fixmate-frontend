import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/common';
import {
  Wrench, Hammer, Zap, Paintbrush, Building, Camera,
  MapPin, Clock, DollarSign, Check, X, AlertCircle
} from 'lucide-react';

/**
 * Worker Registration Flow Component
 * Multi-step registration for workers with 7 steps
 * 
 * ✅ FIXED: Sends FLAT data structure to match Worker model schema
 */
const WorkerRegistrationFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tempUserData, setTempUserData] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
    stateProvince: 'Western',
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
    serviceProvince: 'Western',
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
    construction: [
      'Foundation Work',
      'Framing',
      'Roofing',
      'Concrete Work',
      'Demolition',
      'General Construction'
    ],
    photography: [
      'Event Photography',
      'Portrait Photography',
      'Product Photography',
      'Real Estate Photography',
      'Wedding Photography',
      'Commercial Photography'
    ]
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
      console.log('⚠️ No temp user data found, redirecting to signup...');
      navigate('/signup');
      return;
    }
    
    try {
      const userData = JSON.parse(storedData);
      console.log('✅ Loaded temp user data:', {
        email: userData.email,
        firebaseUid: userData.firebaseUid ? '✅ Present' : '❌ Missing',
        idToken: userData.idToken ? '✅ Present' : '❌ Missing'
      });
      
      setTempUserData(userData);

      // Pre-fill personal info from temp data
      setFormData(prev => ({
        ...prev,
        serviceAddress: userData.address || '',
      }));
    } catch (error) {
      console.error('❌ Error parsing temp user data:', error);
      navigate('/signup');
    }
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
        if (formData.availableDays.length === 0) {
          newErrors.availableDays = 'Please select at least one available day';
        }
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
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSkip = () => {
    // Only allow skip on business information step
    if (currentStep === 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep() || !tempUserData) {
      console.error('❌ Validation failed or no temp user data');
      return;
    }

    setLoading(true);
    setRegistrationError(null);

    try {
      console.log('\n🚀 Starting worker registration...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // ✅ CRITICAL: Verify we have required data
      if (!tempUserData.firebaseUid) {
        throw new Error('Missing Firebase UID. Please sign up again.');
      }
      if (!tempUserData.email) {
        throw new Error('Missing email. Please sign up again.');
      }
      if (!tempUserData.idToken) {
        throw new Error('Missing authentication token. Please sign up again.');
      }

      console.log('✅ Temp user data validated:', {
        email: tempUserData.email,
        firebaseUid: tempUserData.firebaseUid.substring(0, 10) + '...',
        hasToken: !!tempUserData.idToken
      });

      // ✅ FIXED: Prepare worker registration data with FLAT structure
      // This matches the Worker model schema requirements
      const workerData = {
        // Basic user info
        firstName: tempUserData.firstName || '',
        lastName: tempUserData.lastName || '',
        fullName: tempUserData.fullName || tempUserData.name || `${tempUserData.firstName || ''} ${tempUserData.lastName || ''}`.trim(),
        email: tempUserData.email,
        phoneNumber: tempUserData.phoneNumber || '',
        address: tempUserData.address || '',
        role: 'worker',
        firebaseUid: tempUserData.firebaseUid,

        // Service info (FLAT - not nested)
        serviceCategory: formData.serviceType,
        specializations: formData.specializations || [],
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0,
        languagesSpoken: formData.languagesSpoken || ['English'],
        bio: formData.bio || '',

        // Business info (FLAT - optional)
        businessName: formData.businessName || '',
        businessAddress: formData.businessAddress || '',
        city: formData.city || formData.serviceCity || '',
        stateProvince: formData.stateProvince || 'Western',
        postalCode: formData.postalCode || '',
        website: formData.website || '',

        // Service area (FLAT fields - backend will build serviceLocations array)
        serviceAddress: formData.serviceAddress || '',
        serviceCity: formData.serviceCity || '',
        serviceProvince: formData.serviceProvince || 'Western',
        servicePostalCode: formData.servicePostalCode || '',
        serviceRadius: formData.serviceRadius ? parseFloat(formData.serviceRadius) : 10,

        // Pricing (FLAT fields - backend will calculate hourlyRate from dailyWage)
        dailyWage: formData.dailyWage ? parseFloat(formData.dailyWage) : 3000,
        halfDayRate: formData.halfDayRate ? parseFloat(formData.halfDayRate) : (parseFloat(formData.dailyWage || 3000) * 0.6),
        minimumCharge: formData.minimumCharge ? parseFloat(formData.minimumCharge) : 1000,
        overtimeHourlyRate: formData.overtimeHourlyRate ? parseFloat(formData.overtimeHourlyRate) : 200,

        // Availability (FLAT - backend will build workingHours object)
        availableDays: formData.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: formData.workingHours || { startTime: '08:00', endTime: '18:00' },

        // Settings (FLAT booleans)
        availableOnWeekends: formData.availableOnWeekends || false,
        emergencyServices: formData.emergencyServices || false,
        ownTools: formData.ownTools || false,
        vehicleAvailable: formData.vehicleAvailable || false,
        certified: formData.certified || false,
        insured: formData.insured || false,
        whatsappAvailable: formData.whatsappAvailable || false,
      };

      console.log('\n📤 Sending FLAT worker data structure:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Basic Info:', {
        role: workerData.role,
        email: workerData.email,
        fullName: workerData.fullName,
        firebaseUid: workerData.firebaseUid.substring(0, 10) + '...'
      });
      console.log('Service Info:', {
        serviceCategory: workerData.serviceCategory,
        specializations: workerData.specializations,
        yearsOfExperience: workerData.yearsOfExperience
      });
      console.log('Pricing (FLAT):', {
        dailyWage: workerData.dailyWage,
        halfDayRate: workerData.halfDayRate,
        // Note: Backend will convert dailyWage to hourlyRate
      });
      console.log('Availability (FLAT):', {
        availableDays: workerData.availableDays,
        workingHours: workerData.workingHours,
        // Note: Backend will build structured workingHours object
      });
      console.log('Settings (FLAT booleans):', {
        emergencyServices: workerData.emergencyServices,
        ownTools: workerData.ownTools,
        certified: workerData.certified
      });

      // ✅ CRITICAL FIX: Build proper API endpoint
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Remove any trailing slashes
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      
      // Build full endpoint with /api/v1 prefix
      const endpoint = `${cleanBaseUrl}/api/v1/auth/signup`;
      
      console.log('\n🔗 API Configuration:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Base URL from env:', import.meta.env.VITE_API_URL || '(not set)');
      console.log('Clean Base URL:', cleanBaseUrl);
      console.log('Full Endpoint:', endpoint);
      console.log('Expected:', 'http://localhost:5001/api/v1/auth/signup');
      console.log('Match:', endpoint === 'http://localhost:5001/api/v1/auth/signup' ? '✅ YES' : '❌ NO');

      // Create worker account in backend
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempUserData.idToken}`,
        },
        body: JSON.stringify(workerData),
      });

      console.log('\n📨 Response received:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Status:', response.status, response.statusText);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('❌ Failed to parse response as JSON:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('\n❌ Registration failed:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Status:', response.status);
        console.error('Message:', data.message || 'Unknown error');
        console.error('Details:', data);
        
        // Handle specific error cases
        if (data.message === 'User already registered') {
          throw new Error('This email is already registered. If you created an account but didn\'t complete worker registration, please contact support or delete the existing user from the database first.');
        }
        
        throw new Error(data.message || `Registration failed with status ${response.status}`);
      }

      console.log('\n✅ Registration successful!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('User ID:', data.data?.user?.id || 'N/A');
      console.log('Email:', data.data?.user?.email || workerData.email);
      console.log('Role:', data.data?.user?.role || 'worker');

      // Clear session storage
      sessionStorage.removeItem('tempUserData');
      console.log('✅ Cleared temp user data from session storage');

      // Show success message
      setRegistrationSuccess(true);
      
      // Redirect to worker dashboard after 2 seconds
      console.log('🔄 Redirecting to worker dashboard...');
      setTimeout(() => {
        navigate('/worker/dashboard');
      }, 2000);

    } catch (error) {
      console.error('\n❌ Worker registration error:');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      
      setRegistrationError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tempUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Worker Registration</h1>
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {registrationError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-900">Registration Error</h3>
                <p className="text-sm text-red-700 mt-1">{registrationError}</p>
                {registrationError.includes('already registered') && (
                  <p className="text-sm text-red-600 mt-2">
                    💡 <strong>Solution:</strong> Run the cleanup script to remove partial registration, then try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {registrationSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-900">Registration Successful!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your worker profile has been created. Redirecting to your dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select Your Service Type
              </h2>
              
              {errors.serviceType && (
                <p className="text-sm text-red-600">{errors.serviceType}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, serviceType: category.id });
                        setErrors({ ...errors, serviceType: '' });
                      }}
                      className={`p-6 border-2 rounded-lg text-left transition-all ${
                        formData.serviceType === category.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <Icon className="h-8 w-8 text-indigo-600 mb-3" />
                      <h3 className="font-semibold text-gray-900">{category.label}</h3>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Personal Info (Display) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Full Name:</span>
                  <span className="text-sm text-gray-900">
                    {tempUserData.fullName || `${tempUserData.firstName} ${tempUserData.lastName}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="text-sm text-gray-900">{tempUserData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <span className="text-sm text-gray-900">{tempUserData.phoneNumber}</span>
                </div>
                {tempUserData.address && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Address:</span>
                    <span className="text-sm text-gray-900">{tempUserData.address}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                This information was provided during signup and cannot be changed here.
              </p>
            </div>
          )}

          {/* Step 3: Business Information (Optional) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Business Information
                <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
              </h2>

              <Input
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g., ABC Plumbing Services"
              />

              <Input
                label="Business Address"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                placeholder="Street address"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Colombo"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    name="stateProvince"
                    value={formData.stateProvince}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Western">North Western</option>
                    <option value="North Central">North Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Postal Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g., 00100"
                />
                <Input
                  label="Website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
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
                name="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                error={errors.yearsOfExperience}
                placeholder="e.g., 5"
                min="0"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Specializations *
                </label>
                {errors.specializations && (
                  <p className="text-sm text-red-600 mb-2">{errors.specializations}</p>
                )}
                <div className="space-y-2">
                  {(specializationsByService[formData.serviceType] || []).map((spec) => (
                    <label key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(spec)}
                        onChange={() => handleArrayToggle('specializations', spec)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Languages Spoken *
                </label>
                {errors.languagesSpoken && (
                  <p className="text-sm text-red-600 mb-2">{errors.languagesSpoken}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <label key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.languagesSpoken.includes(lang)}
                        onChange={() => handleArrayToggle('languagesSpoken', lang)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio *
                </label>
                {errors.bio && (
                  <p className="text-sm text-red-600 mb-2">{errors.bio}</p>
                )}
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Tell potential customers about yourself, your experience, and what makes you stand out... (minimum 50 characters)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.bio.length}/50 characters minimum
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Service Area */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Service Area & Location
              </h2>

              <Input
                label="Service Address"
                name="serviceAddress"
                value={formData.serviceAddress}
                onChange={handleChange}
                error={errors.serviceAddress}
                placeholder="Where are you primarily based?"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Service City"
                  name="serviceCity"
                  value={formData.serviceCity}
                  onChange={handleChange}
                  error={errors.serviceCity}
                  placeholder="e.g., Colombo"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Province
                  </label>
                  <select
                    name="serviceProvince"
                    value={formData.serviceProvince}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Western">North Western</option>
                    <option value="North Central">North Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Postal Code"
                  name="servicePostalCode"
                  value={formData.servicePostalCode}
                  onChange={handleChange}
                  error={errors.servicePostalCode}
                  placeholder="e.g., 00100"
                  required
                />
                <Input
                  label="Service Radius (km)"
                  name="serviceRadius"
                  type="number"
                  value={formData.serviceRadius}
                  onChange={handleChange}
                  error={errors.serviceRadius}
                  placeholder="How far will you travel?"
                  min="1"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 6: Pricing */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pricing
              </h2>

              <Input
                label="Daily Wage (LKR)"
                name="dailyWage"
                type="number"
                value={formData.dailyWage}
                onChange={handleChange}
                error={errors.dailyWage}
                placeholder="e.g., 3000"
                min="500"
                required
              />

              <Input
                label="Half Day Rate (LKR)"
                name="halfDayRate"
                type="number"
                value={formData.halfDayRate}
                onChange={handleChange}
                error={errors.halfDayRate}
                placeholder="e.g., 1800"
                min="250"
                required
              />

              <Input
                label="Minimum Charge (LKR)"
                name="minimumCharge"
                type="number"
                value={formData.minimumCharge}
                onChange={handleChange}
                error={errors.minimumCharge}
                placeholder="e.g., 1000"
                min="100"
                required
              />

              <Input
                label="Overtime Hourly Rate (LKR)"
                name="overtimeHourlyRate"
                type="number"
                value={formData.overtimeHourlyRate}
                onChange={handleChange}
                error={errors.overtimeHourlyRate}
                placeholder="e.g., 200"
                min="50"
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
                  Available Days *
                </label>
                {errors.availableDays && (
                  <p className="text-sm text-red-600 mb-2">{errors.availableDays}</p>
                )}
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
                  {loading ? 'Completing Registration...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {currentStep === totalSteps && !registrationSuccess && (
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
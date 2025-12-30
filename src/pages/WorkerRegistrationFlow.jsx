import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/common';
import {
  Wrench, Hammer, Zap, Paintbrush, Building, Camera, MapPin, 
  Clock, DollarSign, Check, X, AlertCircle, Upload, FileText,
  Award, CreditCard, Shield, Image as ImageIcon
} from 'lucide-react';
import { getAuth } from 'firebase/auth';

/**
 * ✅ IMPROVED Worker Registration Flow
 * 
 * Complete data collection matching Worker model requirements
 * 
 * Steps:
 * 1. Service Category & Specializations
 * 2. Personal Info (Review)
 * 3. Experience & Bio
 * 4. Service Locations (Fixed)
 * 5. Working Hours & Availability
 * 6. Pricing
 * 7. Portfolio Upload (NEW)
 * 8. Certifications (NEW - Optional)
 * 9. Bank Details (NEW)
 * 10. Review & Submit
 */

const ImprovedWorkerRegistrationFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tempUserData, setTempUserData] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const totalSteps = 10;

  // ==========================================
  // FORM DATA STATE
  // ==========================================
  const [formData, setFormData] = useState({
    // Step 1: Service Category & Specializations
    serviceCategories: [], // Changed to array for multi-select
    specializations: [],
    customSpecializations: '', // For free text additions

    // Step 3: Experience & Bio
    experience: '',
    bio: '',
    skills: [],
    languagesSpoken: [],

    // Step 4: Service Locations
    serviceLocations: [], // Array of {city, district} objects

    // Step 5: Working Hours
    availability: true,
    workingHours: {
      monday: { start: '08:00', end: '18:00', available: true },
      tuesday: { start: '08:00', end: '18:00', available: true },
      wednesday: { start: '08:00', end: '18:00', available: true },
      thursday: { start: '08:00', end: '18:00', available: true },
      friday: { start: '08:00', end: '18:00', available: true },
      saturday: { start: '08:00', end: '18:00', available: false },
      sunday: { start: '08:00', end: '18:00', available: false }
    },

    // Step 6: Pricing
    hourlyRate: '',

    // Step 7: Portfolio
    portfolio: [], // Array of {imageUrl, caption, uploadedAt}

    // Step 8: Certifications (Optional)
    certifications: [], // Array of {name, issuedBy, issuedDate, imageUrl}

    // Step 9: Bank Details
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchName: ''
    }
  });

  // ==========================================
  // CONFIGURATION DATA
  // ==========================================

  // Service categories matching Worker model enum
  const serviceCategories = [
    { id: 'plumbing', label: 'Plumbing', icon: Wrench },
    { id: 'electrical', label: 'Electrical', icon: Zap },
    { id: 'carpentry', label: 'Carpentry', icon: Hammer },
    { id: 'painting', label: 'Painting', icon: Paintbrush },
    { id: 'masonry', label: 'Masonry', icon: Building },
    { id: 'welding', label: 'Welding', icon: Hammer },
    { id: 'air-conditioning', label: 'Air Conditioning', icon: Zap },
    { id: 'appliance-repair', label: 'Appliance Repair', icon: Wrench },
    { id: 'landscaping', label: 'Landscaping', icon: Building },
    { id: 'roofing', label: 'Roofing', icon: Building },
    { id: 'flooring', label: 'Flooring', icon: Building },
    { id: 'pest-control', label: 'Pest Control', icon: Shield },
    { id: 'cleaning', label: 'Cleaning', icon: Wrench },
    { id: 'moving', label: 'Moving', icon: Building },
    { id: 'other', label: 'Other', icon: Wrench }
  ];

  // Specializations by service category
  const specializationsByCategory = {
    'plumbing': [
      'Pipe Repair', 'Drain Cleaning', 'Toilet Repair', 'Faucet Installation',
      'Water Heater Service', 'Leak Detection', 'Bathroom Fitting'
    ],
    'electrical': [
      'Wiring Installation', 'Circuit Breaker Repair', 'Outlet Installation',
      'Lighting Installation', 'Electrical Panel Upgrade', 'Emergency Electrical',
      'Fan Installation', 'Generator Service'
    ],
    'air-conditioning': [
      'AC Installation', 'AC Repair', 'AC Maintenance', 'AC Gas Filling',
      'Split AC', 'Window AC', 'Central AC', 'Duct Cleaning'
    ],
    'carpentry': [
      'Furniture Making', 'Cabinet Installation', 'Door Installation',
      'Window Installation', 'Deck Building', 'Custom Woodwork'
    ],
    'painting': [
      'Interior Painting', 'Exterior Painting', 'Wall Texture',
      'Wood Staining', 'Commercial Painting', 'Decorative Painting'
    ],
    'masonry': [
      'Bricklaying', 'Concrete Work', 'Stone Work', 'Plastering',
      'Tiling', 'Wall Building', 'Foundation Work'
    ],
    'welding': [
      'Metal Fabrication', 'Gate Making', 'Grill Work', 'Structural Welding',
      'Stainless Steel Work', 'Aluminum Welding'
    ],
    'appliance-repair': [
      'Washing Machine Repair', 'Refrigerator Repair', 'Microwave Repair',
      'Oven Repair', 'Dishwasher Repair', 'TV Repair'
    ]
  };

  // Sri Lankan cities and districts for service locations
  const sriLankanLocations = [
    // Western Province
    { city: 'Colombo', district: 'Colombo' },
    { city: 'Dehiwala-Mount Lavinia', district: 'Colombo' },
    { city: 'Moratuwa', district: 'Colombo' },
    { city: 'Negombo', district: 'Gampaha' },
    { city: 'Gampaha', district: 'Gampaha' },
    { city: 'Katunayake', district: 'Gampaha' },
    { city: 'Ja-Ela', district: 'Gampaha' },
    { city: 'Wattala', district: 'Gampaha' },
    { city: 'Kalutara', district: 'Kalutara' },
    { city: 'Panadura', district: 'Kalutara' },
    
    // Central Province
    { city: 'Kandy', district: 'Kandy' },
    { city: 'Matale', district: 'Matale' },
    { city: 'Nuwara Eliya', district: 'Nuwara Eliya' },
    
    // Southern Province
    { city: 'Galle', district: 'Galle' },
    { city: 'Matara', district: 'Matara' },
    { city: 'Hambantota', district: 'Hambantota' },
    
    // Add more as needed
  ];

  // Skills options
  const skillOptions = [
    'Problem Solving', 'Customer Service', 'Time Management',
    'Quality Workmanship', 'Safety Conscious', 'Team Work',
    'Project Management', 'Technical Documentation'
  ];

  // Languages spoken in Sri Lanka
  const languageOptions = [
    'Sinhala', 'Tamil', 'English'
  ];

  // Banks in Sri Lanka
  const sriLankanBanks = [
    'Bank of Ceylon', 'People\'s Bank', 'Commercial Bank',
    'Hatton National Bank', 'Sampath Bank', 'Nations Trust Bank',
    'DFCC Bank', 'Union Bank', 'Pan Asia Bank', 'Seylan Bank'
  ];

  // ==========================================
  // LIFECYCLE METHODS
  // ==========================================

  useEffect(() => {
    // Load temp user data from session storage
    const tempData = sessionStorage.getItem('tempUserData');
    if (tempData) {
      try {
        const parsedData = JSON.parse(tempData);
        setTempUserData(parsedData);
        console.log('✅ Loaded temp user data:', parsedData);
      } catch (error) {
        console.error('❌ Error parsing temp user data:', error);
        navigate('/signup');
      }
    } else {
      console.error('❌ No temp user data found');
      navigate('/signup');
    }
  }, [navigate]);

  // ==========================================
  // VALIDATION FUNCTIONS
  // ==========================================

  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1: // Service Category & Specializations
        if (formData.serviceCategories.length === 0) {
          newErrors.serviceCategories = 'Please select at least one service category';
        }
        if (formData.specializations.length === 0 && !formData.customSpecializations) {
          newErrors.specializations = 'Please select or add specializations';
        }
        break;

      case 3: // Experience & Bio
        if (!formData.experience || formData.experience < 0) {
          newErrors.experience = 'Please enter years of experience (0 for beginner)';
        }
        if (!formData.bio || formData.bio.trim().length < 50) {
          newErrors.bio = 'Please write a bio (minimum 50 characters)';
        }
        if (formData.bio && formData.bio.length > 500) {
          newErrors.bio = 'Bio must be 500 characters or less';
        }
        break;

      case 4: // Service Locations
        if (formData.serviceLocations.length === 0) {
          newErrors.serviceLocations = 'Please select at least one service location';
        }
        break;

      case 5: // Working Hours - No validation needed (has defaults)
        break;

      case 6: // Pricing
        if (!formData.hourlyRate || formData.hourlyRate <= 0) {
          newErrors.hourlyRate = 'Please enter a valid hourly rate';
        }
        if (formData.hourlyRate && formData.hourlyRate < 100) {
          newErrors.hourlyRate = 'Hourly rate seems too low (minimum Rs. 100)';
        }
        if (formData.hourlyRate && formData.hourlyRate > 10000) {
          newErrors.hourlyRate = 'Hourly rate seems too high (maximum Rs. 10,000)';
        }
        break;

      case 7: // Portfolio
        if (formData.portfolio.length === 0) {
          newErrors.portfolio = 'Please upload at least one portfolio image';
        }
        break;

      case 8: // Certifications (Optional - no validation)
        break;

      case 9: // Bank Details
        if (!formData.bankDetails.accountName || formData.bankDetails.accountName.trim().length < 3) {
          newErrors.accountName = 'Please enter account name';
        }
        if (!formData.bankDetails.accountNumber || formData.bankDetails.accountNumber.length < 5) {
          newErrors.accountNumber = 'Please enter valid account number';
        }
        if (!formData.bankDetails.bankName) {
          newErrors.bankName = 'Please select a bank';
        }
        if (!formData.bankDetails.branchName || formData.bankDetails.branchName.trim().length < 2) {
          newErrors.branchName = 'Please enter branch name';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // NAVIGATION HANDLERS
  // ==========================================

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
    window.scrollTo(0, 0);
  };

  const handleSkipOptional = () => {
    // Only allow skip on certifications step
    if (currentStep === 8) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // ==========================================
  // FILE UPLOAD HANDLERS
  // ==========================================

  const handlePortfolioImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.portfolio.length + files.length > 10) {
      setErrors({ ...errors, portfolio: 'Maximum 10 images allowed' });
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors({ ...errors, portfolio: 'Image size must be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = {
          imageUrl: reader.result, // Base64
          caption: '',
          uploadedAt: new Date()
        };

        setFormData(prev => ({
          ...prev,
          portfolio: [...prev.portfolio, newImage]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePortfolioCaptionChange = (index, caption) => {
    const updated = [...formData.portfolio];
    updated[index].caption = caption;
    setFormData({ ...formData, portfolio: updated });
  };

  const handlePortfolioDelete = (index) => {
    const updated = formData.portfolio.filter((_, i) => i !== index);
    setFormData({ ...formData, portfolio: updated });
  };

  const handleCertificationImageUpload = (e, index) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, certifications: 'Certificate image must be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...formData.certifications];
      updated[index].imageUrl = reader.result;
      setFormData({ ...formData, certifications: updated });
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // CERTIFICATION HANDLERS
  // ==========================================

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: '',
          issuedBy: '',
          issuedDate: '',
          imageUrl: ''
        }
      ]
    }));
  };

  const updateCertification = (index, field, value) => {
    const updated = [...formData.certifications];
    updated[index][field] = value;
    setFormData({ ...formData, certifications: updated });
  };

  const removeCertification = (index) => {
    const updated = formData.certifications.filter((_, i) => i !== index);
    setFormData({ ...formData, certifications: updated });
  };

  // ==========================================
  // SERVICE LOCATION HANDLERS
  // ==========================================

  const toggleServiceLocation = (location) => {
    const exists = formData.serviceLocations.find(
      loc => loc.city === location.city && loc.district === location.district
    );

    if (exists) {
      // Remove location
      setFormData(prev => ({
        ...prev,
        serviceLocations: prev.serviceLocations.filter(
          loc => !(loc.city === location.city && loc.district === location.district)
        )
      }));
    } else {
      // Add location (max 5)
      if (formData.serviceLocations.length < 5) {
        setFormData(prev => ({
          ...prev,
          serviceLocations: [...prev.serviceLocations, location]
        }));
      } else {
        setErrors({ ...errors, serviceLocations: 'Maximum 5 locations allowed' });
      }
    }
  };

  // ==========================================
  // SPECIALIZATION HANDLERS
  // ==========================================

  const toggleSpecialization = (spec) => {
    if (formData.specializations.includes(spec)) {
      setFormData(prev => ({
        ...prev,
        specializations: prev.specializations.filter(s => s !== spec)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, spec]
      }));
    }
  };

  const addCustomSpecialization = () => {
    if (formData.customSpecializations.trim()) {
      const customs = formData.customSpecializations
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      setFormData(prev => ({
        ...prev,
        specializations: [...new Set([...prev.specializations, ...customs])],
        customSpecializations: ''
      }));
    }
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================

  const handleSubmit = async () => {
    if (!validateStep() || !tempUserData) {
      console.error('❌ Validation failed or no temp user data');
      return;
    }

    setLoading(true);
    setRegistrationError(null);

    try {
      console.log('\n🚀 Starting worker registration with complete data...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Get fresh Firebase token
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user found. Please sign up again.');
      }

      console.log('🔄 Refreshing Firebase token...');
      const freshToken = await currentUser.getIdToken(true);
      console.log('✅ Fresh token obtained');

      // Prepare complete worker data
      const workerData = {
        // Basic user info
        firstName: tempUserData.firstName || '',
        lastName: tempUserData.lastName || '',
        fullName: tempUserData.fullName || tempUserData.name || 
                 `${tempUserData.firstName || ''} ${tempUserData.lastName || ''}`.trim(),
        email: tempUserData.email,
        phoneNumber: tempUserData.phoneNumber || '',
        address: tempUserData.address || '',
        role: 'worker',
        firebaseUid: tempUserData.firebaseUid,

        // ✅ Service information
        serviceCategories: formData.serviceCategories,
        specializations: formData.specializations,

        // ✅ Experience & skills
        experience: parseInt(formData.experience, 10) || 0,
        bio: formData.bio.trim(),
        skills: formData.skills,

        // ✅ Service locations (correct format!)
        serviceLocations: formData.serviceLocations,

        // ✅ Pricing
        hourlyRate: parseInt(formData.hourlyRate, 10),

        // ✅ Availability & working hours
        availability: formData.availability,
        workingHours: formData.workingHours,

        // ✅ Portfolio
        portfolio: formData.portfolio,

        // ✅ Certifications (if any)
        certifications: formData.certifications.filter(cert => 
          cert.name && cert.issuedBy
        ),

        // ✅ Bank details
        bankDetails: {
          ...formData.bankDetails,
          isVerified: false // Will be verified by admin
        },

        // Set profile status
        profileStatus: 'pending-review', // Changed from 'incomplete'
        
        // Initialize auto-calculated fields
        rating: { average: 0, count: 0 },
        completedJobs: 0,
        totalEarnings: 0,
        responseTime: 0,
        acceptanceRate: 0,
        isVerified: false
      };

      console.log('📦 Complete Worker Data:', JSON.stringify({
        serviceCategories: workerData.serviceCategories,
        specializations: workerData.specializations,
        experience: workerData.experience,
        hourlyRate: workerData.hourlyRate,
        serviceLocations: workerData.serviceLocations,
        portfolioCount: workerData.portfolio.length,
        certificationsCount: workerData.certifications.length,
        bankDetails: {
          accountName: workerData.bankDetails.accountName,
          bankName: workerData.bankDetails.bankName
        },
        profileStatus: workerData.profileStatus
      }, null, 2));

      // Make API call
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${apiUrl}/auth/signup`;

      console.log('🌐 Making API request to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${freshToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workerData)
      });

      const data = await response.json();

      console.log('📥 Registration response:', {
        status: response.status,
        success: data.success,
        message: data.message
      });

      if (!response.ok) {
        throw new Error(data.message || `Registration failed: ${response.status}`);
      }

      console.log('✅ Worker registration successful!');
      setRegistrationSuccess(true);

      // ✅ CRITICAL FIX: Clear ALL old auth data first
      console.log('🧹 Clearing old auth data...');
      sessionStorage.clear();
      localStorage.clear();

      // Save user data to storage
      const userDataToSave = {
        id: data.data?.user?.id,
        email: data.data?.user?.email,
        fullName: data.data?.user?.fullName,
        role: 'worker', // ✅ Ensure role is 'worker'
        firebaseUid: data.data?.user?.firebaseUid,
        workerId: data.data?.worker?.id
      };

      console.log('💾 Saving new worker data to storage:', {
        email: userDataToSave.email,
        role: userDataToSave.role,
        workerId: userDataToSave.workerId
      });

      // Save to both storages
      sessionStorage.setItem('authToken', freshToken);
      localStorage.setItem('authToken', freshToken);
      sessionStorage.setItem('user', JSON.stringify(userDataToSave));
      localStorage.setItem('user', JSON.stringify(userDataToSave));

      console.log('✅ Worker data saved successfully');
      console.log('🎯 Navigating to worker dashboard...');

      // Navigate with page reload to ensure fresh state
      setTimeout(() => {
        window.location.href = '/worker/dashboard';
      }, 1500);

    } catch (error) {
      console.error('❌ Worker registration error:', error);

      let errorMessage = 'Registration failed. ';

      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if backend is running on port 5001.';
      } else if (error.message.includes('already exists')) {
        errorMessage = 'This account already exists. Please login instead.';
      } else if (error.message.includes('token')) {
        errorMessage = 'Authentication token expired. Please sign up again.';
        setTimeout(() => {
          sessionStorage.removeItem('tempUserData');
          navigate('/signup');
        }, 3000);
      } else {
        errorMessage += error.message;
      }

      setRegistrationError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderProgressBar = () => (
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
      <div className="mt-2 text-xs text-gray-500">
        {Math.round((currentStep / totalSteps) * 100)}% Complete
      </div>
    </div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between mt-8">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={loading}
        >
          Previous
        </Button>
      )}
      
      <div className="flex-1" />
      
      {currentStep === 8 && ( // Certifications step is optional
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkipOptional}
          disabled={loading}
          className="mr-2"
        >
          Skip (Optional)
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
          {loading ? 'Submitting...' : 'Complete Registration'}
        </Button>
      )}
    </div>
  );

  // ==========================================
  // LOADING STATE
  // ==========================================

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

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderProgressBar()}

        {/* Error Message */}
        {registrationError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-900">Registration Error</h3>
                <p className="text-sm text-red-700 mt-1">{registrationError}</p>
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
          
          {/* STEP 1: Service Category & Specializations */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Select Your Service Categories
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Choose all services you offer (you can select multiple)
                </p>
              </div>

              {errors.serviceCategories && (
                <p className="text-sm text-red-600">{errors.serviceCategories}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {serviceCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = formData.serviceCategories.includes(category.id);
                  
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setFormData(prev => ({
                            ...prev,
                            serviceCategories: prev.serviceCategories.filter(id => id !== category.id)
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            serviceCategories: [...prev.serviceCategories, category.id]
                          }));
                        }
                        setErrors({ ...errors, serviceCategories: '' });
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <Icon className="h-6 w-6 text-indigo-600 mb-2" />
                      <h3 className="font-medium text-gray-900 text-sm">{category.label}</h3>
                    </button>
                  );
                })}
              </div>

              {/* Specializations */}
              {formData.serviceCategories.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select Your Specializations
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose specific skills within your service categories
                  </p>

                  {errors.specializations && (
                    <p className="text-sm text-red-600 mb-2">{errors.specializations}</p>
                  )}

                  {formData.serviceCategories.map(categoryId => {
                    const specs = specializationsByCategory[categoryId] || [];
                    if (specs.length === 0) return null;

                    return (
                      <div key={categoryId} className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                          {categoryId.replace('-', ' ')} Specializations:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {specs.map(spec => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSpecialization(spec)}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                formData.specializations.includes(spec)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Specializations */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Custom Specializations (comma-separated)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.customSpecializations}
                        onChange={(e) => setFormData({ ...formData, customSpecializations: e.target.value })}
                        placeholder="e.g., Custom Furniture, Vintage Restoration"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCustomSpecialization}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Selected Specializations */}
                  {formData.specializations.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Selected Specializations ({formData.specializations.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.specializations.map(spec => (
                          <span
                            key={spec}
                            className="inline-flex items-center px-2 py-1 bg-white rounded text-sm text-blue-900"
                          >
                            {spec}
                            <button
                              type="button"
                              onClick={() => toggleSpecialization(spec)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Personal Info Review */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Review Personal Information
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                This information was provided during signup and cannot be changed here.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Full Name:</span>
                  <span className="text-sm text-gray-900">
                    {tempUserData.fullName || `${tempUserData.firstName} ${tempUserData.lastName}`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="text-sm text-gray-900">{tempUserData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <span className="text-sm text-gray-900">{tempUserData.phoneNumber}</span>
                </div>
                {tempUserData.address && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">Address:</span>
                    <span className="text-sm text-gray-900">{tempUserData.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ℹ️ You can update your personal information later from your profile settings.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Experience & Bio */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Experience & Professional Bio
              </h2>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="0 for beginner, 1-50 for experienced"
                  error={errors.experience}
                />
                {errors.experience && (
                  <p className="text-sm text-red-600 mt-1">{errors.experience}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio *
                  <span className="text-gray-500 ml-2 font-normal">
                    ({formData.bio.length}/500 characters)
                  </span>
                </label>
                <textarea
                  rows="6"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell customers about your experience, expertise, and what makes you unique..."
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.bio ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  maxLength="500"
                />
                {errors.bio && (
                  <p className="text-sm text-red-600 mt-1">{errors.bio}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 50 characters. This will be displayed on your public profile.
                </p>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Skills (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (formData.skills.includes(skill)) {
                          setFormData(prev => ({
                            ...prev,
                            skills: prev.skills.filter(s => s !== skill)
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skills: [...prev.skills, skill]
                          }));
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        formData.skills.includes(skill)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages Spoken */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        const currentLangs = formData.skills.filter(s => languageOptions.includes(s));
                        const otherSkills = formData.skills.filter(s => !languageOptions.includes(s));
                        
                        if (currentLangs.includes(lang)) {
                          setFormData(prev => ({
                            ...prev,
                            skills: [...otherSkills, ...currentLangs.filter(l => l !== lang)]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skills: [...otherSkills, ...currentLangs, lang]
                          }));
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        formData.skills.includes(lang)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Service Locations */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Service Locations
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select cities/areas where you provide services (maximum 5)
                </p>
              </div>

              {errors.serviceLocations && (
                <p className="text-sm text-red-600">{errors.serviceLocations}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sriLankanLocations.map((location, index) => {
                  const isSelected = formData.serviceLocations.some(
                    loc => loc.city === location.city && loc.district === location.district
                  );
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleServiceLocation(location)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{location.city}</p>
                          <p className="text-xs text-gray-600">{location.district} District</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Locations Summary */}
              {formData.serviceLocations.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Selected Service Locations ({formData.serviceLocations.length}/5):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.serviceLocations.map((loc, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm text-blue-900"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {loc.city}, {loc.district}
                        <button
                          type="button"
                          onClick={() => toggleServiceLocation(loc)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Working Hours & Availability */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Working Hours & Availability
              </h2>

              {/* Overall Availability Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Currently Available for Work</p>
                  <p className="text-sm text-gray-600">Toggle this off if you're not taking new jobs</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, availability: !formData.availability })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.availability ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.availability ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Day-by-Day Schedule */}
              <div className="space-y-3">
                <p className="font-medium text-gray-900">Weekly Schedule</p>
                {Object.keys(formData.workingHours).map(day => (
                  <div key={day} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    <div className="w-28">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.workingHours[day].available}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: {
                                  ...prev.workingHours[day],
                                  available: e.target.checked
                                }
                              }
                            }));
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </span>
                      </label>
                    </div>
                    
                    {formData.workingHours[day].available && (
                      <div className="flex items-center gap-2 flex-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          value={formData.workingHours[day].start}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: {
                                  ...prev.workingHours[day],
                                  start: e.target.value
                                }
                              }
                            }));
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData.workingHours[day].end}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: {
                                  ...prev.workingHours[day],
                                  end: e.target.value
                                }
                              }
                            }));
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
                    
                    {!formData.workingHours[day].available && (
                      <span className="text-sm text-gray-500 flex-1">Not available</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Set Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = {};
                    Object.keys(formData.workingHours).forEach(day => {
                      updated[day] = {
                        start: '08:00',
                        end: '18:00',
                        available: day !== 'sunday'
                      };
                    });
                    setFormData({ ...formData, workingHours: updated });
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  Mon-Sat (8AM-6PM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {};
                    Object.keys(formData.workingHours).forEach(day => {
                      updated[day] = {
                        start: '08:00',
                        end: '18:00',
                        available: true
                      };
                    });
                    setFormData({ ...formData, workingHours: updated });
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  7 Days (8AM-6PM)
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Pricing */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Set Your Pricing
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Set your hourly rate. Customers will see this on your profile.
                </p>
              </div>

              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (LKR) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">Rs.</span>
                  </div>
                  <Input
                    type="number"
                    min="100"
                    max="10000"
                    step="50"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="500"
                    className="pl-16"
                    error={errors.hourlyRate}
                  />
                </div>
                {errors.hourlyRate && (
                  <p className="text-sm text-red-600 mt-1">{errors.hourlyRate}</p>
                )}

                {/* Estimated Daily Rate */}
                {formData.hourlyRate && formData.hourlyRate > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Estimated daily rate (8 hours):</strong> Rs. {parseInt(formData.hourlyRate) * 8}
                    </p>
                  </div>
                )}

                {/* Pricing Guidelines */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">💡 Pricing Guidelines:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Entry level (0-2 years): Rs. 300-500/hour</li>
                    <li>• Intermediate (3-5 years): Rs. 500-800/hour</li>
                    <li>• Expert (5+ years): Rs. 800-1,500/hour</li>
                    <li>• Specialist/Licensed: Rs. 1,500+/hour</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Portfolio Upload */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Portfolio & Work Samples
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Upload photos of your previous work (minimum 1, maximum 10 images)
                </p>
              </div>

              {errors.portfolio && (
                <p className="text-sm text-red-600">{errors.portfolio}</p>
              )}

              {/* Upload Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioImageUpload}
                  className="hidden"
                  id="portfolio-upload"
                />
                <label
                  htmlFor="portfolio-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB each • {formData.portfolio.length}/10 uploaded
                  </p>
                </label>
              </div>

              {/* Portfolio Grid */}
              {formData.portfolio.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.portfolio.map((item, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={item.imageUrl}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handlePortfolioDelete(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <input
                        type="text"
                        value={item.caption || ''}
                        onChange={(e) => handlePortfolioCaptionChange(index, e.target.value)}
                        placeholder="Add caption (optional)"
                        className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Certifications (Optional) */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Certifications & Licenses
                  <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Add any professional certifications or licenses you hold
                </p>
              </div>

              {formData.certifications.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    No certifications added yet
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCertification}
                  >
                    Add Certification
                  </Button>
                </div>
              )}

              {formData.certifications.map((cert, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">Certification #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Certification Name"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      placeholder="e.g., Licensed Electrician"
                    />
                    <Input
                      label="Issued By"
                      value={cert.issuedBy}
                      onChange={(e) => updateCertification(index, 'issuedBy', e.target.value)}
                      placeholder="e.g., Ministry of Power"
                    />
                  </div>

                  <Input
                    label="Issue Date"
                    type="date"
                    value={cert.issuedDate}
                    onChange={(e) => updateCertification(index, 'issuedDate', e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Certificate Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCertificationImageUpload(e, index)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {cert.imageUrl && (
                      <img
                        src={cert.imageUrl}
                        alt="Certificate"
                        className="mt-2 h-32 object-cover rounded border border-gray-200"
                      />
                    )}
                  </div>
                </div>
              ))}

              {formData.certifications.length > 0 && formData.certifications.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCertification}
                  className="w-full"
                >
                  + Add Another Certification
                </Button>
              )}
            </div>
          )}

          {/* STEP 9: Bank Details */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Bank Account Details
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  This information is required for receiving payments from customers
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <Input
                    value={formData.bankDetails.accountName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountName: e.target.value }
                    })}
                    placeholder="Account holder name (as per bank records)"
                    error={errors.accountName}
                  />
                  {errors.accountName && (
                    <p className="text-sm text-red-600 mt-1">{errors.accountName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <Input
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                    })}
                    placeholder="Enter account number"
                    error={errors.accountNumber}
                  />
                  {errors.accountNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <select
                    value={formData.bankDetails.bankName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                    })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.bankName ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-indigo-500 focus:border-indigo-500`}
                  >
                    <option value="">Select a bank</option>
                    {sriLankanBanks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                  {errors.bankName && (
                    <p className="text-sm text-red-600 mt-1">{errors.bankName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name *
                  </label>
                  <Input
                    value={formData.bankDetails.branchName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, branchName: e.target.value }
                    })}
                    placeholder="e.g., Colombo Fort, Kandy Main"
                    error={errors.branchName}
                  />
                  {errors.branchName && (
                    <p className="text-sm text-red-600 mt-1">{errors.branchName}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-900">
                      <strong>Security Notice:</strong> Your bank details will be verified by our admin team and kept secure. They will only be used for processing payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Review & Submit */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Review Your Information
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Please review all information before submitting. You can edit later from your profile.
                </p>
              </div>

              <div className="space-y-4">
                {/* Service Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Service Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Categories:</strong> {formData.serviceCategories.join(', ')}</p>
                    <p><strong>Specializations:</strong> {formData.specializations.slice(0, 5).join(', ')}
                      {formData.specializations.length > 5 && ` (+${formData.specializations.length - 5} more)`}
                    </p>
                  </div>
                </div>

                {/* Experience */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Experience & Bio</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Experience:</strong> {formData.experience} years</p>
                    <p><strong>Bio:</strong> {formData.bio.substring(0, 150)}...</p>
                  </div>
                </div>

                {/* Locations */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Service Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.serviceLocations.map((loc, i) => (
                      <span key={i} className="px-2 py-1 bg-white rounded text-sm">
                        {loc.city}, {loc.district}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Pricing</h3>
                  <p className="text-sm">
                    <strong>Hourly Rate:</strong> Rs. {formData.hourlyRate}/hour
                  </p>
                </div>

                {/* Portfolio */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Portfolio</h3>
                  <p className="text-sm">{formData.portfolio.length} images uploaded</p>
                </div>

                {/* Bank */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Bank Details</h3>
                  <p className="text-sm">
                    <strong>Bank:</strong> {formData.bankDetails.bankName} ({formData.bankDetails.branchName})
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ℹ️ After submission, your profile will be reviewed by our team. You'll be notified once approved and can start receiving job requests.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {renderNavigationButtons()}
        </div>
      </div>
    </div>
  );
};

export default ImprovedWorkerRegistrationFlow;
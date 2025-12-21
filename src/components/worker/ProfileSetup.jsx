import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '../common';

/**
 * Profile Setup Component
 * Multi-step profile setup wizard for workers
 */
const ProfileSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [profileData, setProfileData] = useState({
    // Step 1: Basic Info
    bio: '',
    serviceCategory: '',
    skills: [],
    experience: '',
    
    // Step 2: Service Details
    hourlyRate: '',
    serviceAreas: [],
    availability: {
      monday: { available: true, from: '08:00', to: '18:00' },
      tuesday: { available: true, from: '08:00', to: '18:00' },
      wednesday: { available: true, from: '08:00', to: '18:00' },
      thursday: { available: true, from: '08:00', to: '18:00' },
      friday: { available: true, from: '08:00', to: '18:00' },
      saturday: { available: false, from: '', to: '' },
      sunday: { available: false, from: '', to: '' },
    },
    
    // Step 3: Verification
    idType: 'nic',
    idNumber: '',
    idDocument: null,
    businessLicense: null,
    certifications: [],
  });

  const totalSteps = 3;

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/workers/profile`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfileData(prev => ({ ...prev, ...data.profile }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSkillAdd = (skill) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const handleSkillRemove = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        },
      },
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setProfileData(prev => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!profileData.bio || profileData.bio.length < 50) {
        newErrors.bio = 'Bio must be at least 50 characters';
      }
      if (!profileData.serviceCategory) {
        newErrors.serviceCategory = 'Please select a service category';
      }
      if (profileData.skills.length === 0) {
        newErrors.skills = 'Please add at least one skill';
      }
      if (!profileData.experience) {
        newErrors.experience = 'Please enter your years of experience';
      }
    }

    if (step === 2) {
      if (!profileData.hourlyRate || profileData.hourlyRate < 100) {
        newErrors.hourlyRate = 'Hourly rate must be at least LKR 100';
      }
      if (profileData.serviceAreas.length === 0) {
        newErrors.serviceAreas = 'Please select at least one service area';
      }
    }

    if (step === 3) {
      if (!profileData.idNumber) {
        newErrors.idNumber = 'ID number is required';
      }
      if (!profileData.idDocument) {
        newErrors.idDocument = 'Please upload your ID document';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(profileData).forEach(key => {
        if (key === 'skills' || key === 'serviceAreas') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else if (key === 'availability') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else if (profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        } else if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/workers/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        navigate('/worker/dashboard');
      } else {
        const data = await response.json();
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const serviceCategories = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'AC Repair',
    'Appliance Repair', 'Cleaning', 'Pest Control', 'Gardening',
    'Masonry', 'Roofing', 'Welding',
  ];

  const cities = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Setup</h1>
          <p className="text-gray-600">Complete your profile to start receiving bookings</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={step >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
              Basic Info
            </span>
            <span className={step >= 2 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
              Service Details
            </span>
            <span className={step >= 3 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
              Verification
            </span>
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <Input
              type="textarea"
              name="bio"
              label="Professional Bio"
              value={profileData.bio}
              onChange={handleChange}
              error={errors.bio}
              placeholder="Tell customers about yourself and your experience..."
              rows={4}
              maxLength={500}
              helperText="Minimum 50 characters"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Category <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceCategory"
                value={profileData.serviceCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {serviceCategories.map(cat => (
                  <option key={cat} value={cat.toLowerCase().replace(' ', '_')}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.serviceCategory && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceCategory}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a skill and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSkillAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill)}
                      className="ml-2 text-indigo-500 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.skills && (
                <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
              )}
            </div>

            <Input
              type="number"
              name="experience"
              label="Years of Experience"
              value={profileData.experience}
              onChange={handleChange}
              error={errors.experience}
              placeholder="5"
              min="0"
            />
          </div>
        )}

        {/* Step 2: Service Details */}
        {step === 2 && (
          <div className="space-y-6">
            <Input
              type="number"
              name="hourlyRate"
              label="Hourly Rate (LKR)"
              value={profileData.hourlyRate}
              onChange={handleChange}
              error={errors.hourlyRate}
              placeholder="1500"
              min="100"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Areas <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {cities.map(city => (
                  <label key={city} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.serviceAreas.includes(city)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProfileData(prev => ({
                            ...prev,
                            serviceAreas: [...prev.serviceAreas, city],
                          }));
                        } else {
                          setProfileData(prev => ({
                            ...prev,
                            serviceAreas: prev.serviceAreas.filter(a => a !== city),
                          }));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{city}</span>
                  </label>
                ))}
              </div>
              {errors.serviceAreas && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceAreas}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Weekly Availability
              </label>
              <div className="space-y-3">
                {Object.keys(profileData.availability).map(day => (
                  <div key={day} className="flex items-center space-x-4">
                    <label className="flex items-center w-32">
                      <input
                        type="checkbox"
                        checked={profileData.availability[day].available}
                        onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{day}</span>
                    </label>
                    {profileData.availability[day].available && (
                      <>
                        <input
                          type="time"
                          value={profileData.availability[day].from}
                          onChange={(e) => handleAvailabilityChange(day, 'from', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={profileData.availability[day].to}
                          onChange={(e) => handleAvailabilityChange(day, 'to', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Type <span className="text-red-500">*</span>
              </label>
              <select
                name="idType"
                value={profileData.idType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="nic">National Identity Card (NIC)</option>
                <option value="passport">Passport</option>
                <option value="license">Driving License</option>
              </select>
            </div>

            <Input
              type="text"
              name="idNumber"
              label="ID Number"
              value={profileData.idNumber}
              onChange={handleChange}
              error={errors.idNumber}
              placeholder="199812345678"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Document <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'idDocument')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {profileData.idDocument && (
                <p className="mt-1 text-sm text-gray-600">
                  Selected: {profileData.idDocument.name}
                </p>
              )}
              {errors.idDocument && (
                <p className="mt-1 text-sm text-red-600">{errors.idDocument}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business License (Optional)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'businessLicense')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {profileData.businessLicense && (
                <p className="mt-1 text-sm text-gray-600">
                  Selected: {profileData.businessLicense.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Verification Process:</strong> Your documents will be reviewed within 24-48 hours.
                You'll be notified once your profile is verified.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || loading}
          >
            Back
          </Button>
          
          {step < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
            >
              Complete Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileSetup;
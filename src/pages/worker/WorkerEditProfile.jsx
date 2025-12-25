import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  MapPin, 
  DollarSign,
  Save,
  ArrowLeft,
  Loader
} from 'lucide-react';

/**
 * Worker Edit Profile Page
 * Allows workers to edit their profile information
 */
const WorkerEditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Service Details
    serviceCategories: [],
    specializations: [],
    experience: 0,
    hourlyRate: 0,
    bio: '',
    skills: [],
    
    // Location
    serviceAreas: [],
    
    // Basic Info (from User model)
    address: ''
  });

  // Available service categories
  const availableCategories = [
    'plumbing',
    'electrical',
    'carpentry',
    'painting',
    'masonry',
    'welding',
    'ac-repair',
    'appliance-repair'
  ];

  // Specializations by category
  const specializationsByCategory = {
    plumbing: [
      'Pipe Repair',
      'Drain Cleaning',
      'Faucet Installation',
      'Toilet Repair',
      'Water Heater Service',
      'Emergency Plumbing'
    ],
    electrical: [
      'Wiring',
      'Circuit Repair',
      'Light Installation',
      'Panel Upgrade',
      'Emergency Electrical'
    ],
    carpentry: [
      'Furniture Making',
      'Door Installation',
      'Window Installation',
      'Custom Woodwork'
    ],
    painting: [
      'Interior Painting',
      'Exterior Painting',
      'Wall Finishing',
      'Decorative Painting'
    ],
    masonry: [
      'Brick Work',
      'Concrete Work',
      'Stone Work',
      'Plastering'
    ],
    welding: [
      'Metal Fabrication',
      'Repair Welding',
      'Custom Metal Work'
    ],
    'ac-repair': [
      'AC Installation',
      'AC Maintenance',
      'AC Repair',
      'Refrigeration'
    ],
    'appliance-repair': [
      'Washing Machine',
      'Refrigerator',
      'Oven',
      'Microwave'
    ]
  };

  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  const fetchWorkerProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${API_BASE_URL}/workers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setFormData({
          serviceCategories: data.data.serviceCategories || [],
          specializations: data.data.specializations || [],
          experience: data.data.experience || 0,
          hourlyRate: data.data.hourlyRate || 0,
          bio: data.data.bio || '',
          skills: data.data.skills || [],
          serviceAreas: data.data.serviceAreas || [],
          address: data.data.userId?.address || ''
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const categories = prev.serviceCategories.includes(category)
        ? prev.serviceCategories.filter(c => c !== category)
        : [...prev.serviceCategories, category];
      
      return { ...prev, serviceCategories: categories };
    });
  };

  const handleSpecializationToggle = (specialization) => {
    setFormData(prev => {
      const specializations = prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization];
      
      return { ...prev, specializations };
    });
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newSkill = e.target.value.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
        e.target.value = '';
      }
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${API_BASE_URL}/workers/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceCategories: formData.serviceCategories,
          specializations: formData.specializations,
          experience: parseInt(formData.experience),
          hourlyRate: parseFloat(formData.hourlyRate),
          bio: formData.bio,
          skills: formData.skills,
          serviceAreas: formData.serviceAreas
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/worker/profile');
        }, 1500);
      }

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/worker/profile')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update your professional information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">✓ Profile updated successfully! Redirecting...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Service Categories</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableCategories.map(category => (
                <label
                  key={category}
                  className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.serviceCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm capitalize">{category.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specializations */}
          {formData.serviceCategories.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Specializations</h2>
              {formData.serviceCategories.map(category => (
                <div key={category} className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2 capitalize">
                    {category.replace('-', ' ')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specializationsByCategory[category]?.map(spec => (
                      <label
                        key={spec}
                        className="flex items-center space-x-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(spec)}
                          onChange={() => handleSpecializationToggle(spec)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span>{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience and Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (LKR)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Bio</h2>
            </div>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              placeholder="Tell customers about yourself, your experience, and what makes you unique..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            <input
              type="text"
              placeholder="Type a skill and press Enter"
              onKeyDown={handleSkillAdd}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/worker/profile')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerEditProfile;
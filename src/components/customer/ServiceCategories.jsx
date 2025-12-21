import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card } from '../common';

/**
 * Service Categories Component
 * Display available service categories with icons and descriptions
 */
const ServiceCategories = ({ onCategorySelect, variant = 'grid' }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Service category data with icons
  const categoryData = [
    {
      id: 'plumbing',
      name: 'Plumbing',
      description: 'Pipe repairs, leaks, installations',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: 'blue',
      popular: true,
    },
    {
      id: 'electrical',
      name: 'Electrical',
      description: 'Wiring, repairs, installations',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'yellow',
      popular: true,
    },
    {
      id: 'carpentry',
      name: 'Carpentry',
      description: 'Furniture, doors, woodwork',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'brown',
    },
    {
      id: 'painting',
      name: 'Painting',
      description: 'Interior, exterior, decorative',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      color: 'purple',
      popular: true,
    },
    {
      id: 'ac_repair',
      name: 'AC Repair',
      description: 'AC servicing, repairs, installation',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'cyan',
    },
    {
      id: 'appliance_repair',
      name: 'Appliance Repair',
      description: 'Washing machine, fridge, etc.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'gray',
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      description: 'Home, office, deep cleaning',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'green',
    },
    {
      id: 'pest_control',
      name: 'Pest Control',
      description: 'Termite, mosquito, rodent control',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'red',
    },
    {
      id: 'gardening',
      name: 'Gardening',
      description: 'Landscaping, lawn care, plants',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      id: 'masonry',
      name: 'Masonry',
      description: 'Brick work, plastering, tiles',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'orange',
    },
    {
      id: 'roofing',
      name: 'Roofing',
      description: 'Roof repairs, leak fixing',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'red',
    },
    {
      id: 'welding',
      name: 'Welding',
      description: 'Metal work, gate repairs',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
      color: 'orange',
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/categories`);
      // const data = await response.json();
      
      // For now, use static data
      setCategories(categoryData);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      // Still set categories as fallback
      setCategories(categoryData);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    
    if (onCategorySelect) {
      onCategorySelect(category);
    } else {
      // Navigate to workers list with category filter
      navigate(`/find-workers?category=${category.id}`);
    }
  };

  // Color variants
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
    brown: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    cyan: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200',
    gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    red: 'bg-red-100 text-red-600 hover:bg-red-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchCategories}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <div className="space-y-6">
        {/* Popular categories */}
        {categories.some(cat => cat.popular) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Services
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories
                .filter(cat => cat.popular)
                .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedCategory === category.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center mb-3 ${
                        colorClasses[category.color]
                      }`}
                    >
                      {category.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* All categories */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  selectedCategory === category.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-lg flex items-center justify-center mb-3 ${
                    colorClasses[category.color]
                  }`}
                >
                  {category.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {category.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List variant (compact)
  if (variant === 'list') {
    return (
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`w-full flex items-center p-4 rounded-lg border transition-all ${
              selectedCategory === category.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                colorClasses[category.color]
              }`}
            >
              {category.icon}
            </div>
            <div className="text-left flex-1">
              <h4 className="font-semibold text-gray-900">{category.name}</h4>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            {category.popular && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded">
                Popular
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return null;
};

ServiceCategories.propTypes = {
  onCategorySelect: PropTypes.func,
  variant: PropTypes.oneOf(['grid', 'list']),
};

export default ServiceCategories;
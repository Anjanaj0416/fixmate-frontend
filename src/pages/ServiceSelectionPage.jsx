import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ServiceCategories from '../components/customer/ServiceCategories';

/**
 * Service Selection Page
 * First step in the quote request flow
 * Displays service categories for customer to choose
 */
const ServiceSelectionPage = () => {
  const navigate = useNavigate();

  const handleCategorySelect = (category) => {
    // Only pass serializable data (no React elements)
    const serializableCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      popular: category.popular
    };
    
    navigate('/customer/quote-request', { state: { category: serializableCategory } });
  };

  const handleBack = () => {
    navigate('/customer/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              What service do you need?
            </h1>
            <p className="text-gray-600">
              Select a category to get started with your quote request
            </p>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ServiceCategories 
          onCategorySelect={handleCategorySelect}
          variant="grid"
        />

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            How it works:
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Select your service type and describe your problem</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>We'll show you available workers in your area</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Choose workers and send them your quote request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Compare quotes and hire the best worker for you</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
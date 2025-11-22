import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import WorkerList from '../../components/customer/WorkerList';
import ServiceCategories from '../../components/customer/ServiceCategories';
import AIAssistant from '../../components/customer/AIAssistant';
import { workerService } from '../../services/workerService';

const FindWorkers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minRating: searchParams.get('minRating') || 0,
    sortBy: searchParams.get('sortBy') || 'relevance'
  });
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [filters]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await workerService.searchWorkers(filters);
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleCategorySelect = (category) => {
    handleFilterChange('category', category);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Skilled Workers
          </h1>
          <p className="text-gray-600">
            Browse through our verified professionals or use AI to find the perfect match
          </p>
        </div>

        {/* AI Assistant Toggle */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAI(!showAI)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {showAI ? 'Hide' : 'Use'} AI Assistant ✨
          </Button>
        </div>

        {/* AI Assistant */}
        {showAI && (
          <div className="mb-8">
            <AIAssistant onMatch={(workers) => setWorkers(workers)} />
          </div>
        )}

        {/* Service Categories */}
        <div className="mb-8">
          <ServiceCategories
            selectedCategory={filters.category}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                icon={<Search className="w-5 h-5" />}
                placeholder="Search by service, skill, or worker name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <Input
                icon={<MapPin className="w-5 h-5" />}
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="relevance">Most Relevant</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price">Lowest Price</option>
            </select>

            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="0">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* Workers List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <WorkerList workers={workers} />
        )}

        {!loading && workers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No workers found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={() => setFilters({ search: '', category: '', location: '', minRating: 0, sortBy: 'relevance' })}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindWorkers;
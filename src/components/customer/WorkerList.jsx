import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import WorkerCard from './WorkerCard';
import { Input, Button, Spinner } from '../common';

/**
 * Worker List Component
 * Display filtered and sorted list of workers
 */
const WorkerList = ({ initialCategory, initialLocation }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    category: initialCategory || searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minRating: searchParams.get('minRating') || '',
    maxDistance: searchParams.get('maxDistance') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    available: searchParams.get('available') === 'true',
    verified: searchParams.get('verified') === 'true',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [filters, page]);

  // Fetch workers from API
  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== false)
        ),
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/workers/search?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch workers');
      }

      const data = await response.json();

      if (page === 1) {
        setWorkers(data.data);
      } else {
        setWorkers(prev => [...prev, ...data.data]);
      }

      setHasMore(data.pagination.hasNextPage);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
    setPage(1);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterName, value);
    } else {
      newParams.delete(filterName);
    }
    setSearchParams(newParams);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  // Handle load more
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Handle favorite worker
  const handleFavorite = async (workerId, isFavorite) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/customers/favorites/${workerId}`,
        {
          method: isFavorite ? 'POST' : 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      // Update local state
      setWorkers(prev =>
        prev.map(worker =>
          worker.id === workerId
            ? { ...worker, isFavorite }
            : worker
        )
      );
    } catch (err) {
      console.error('Error updating favorite:', err);
      alert('Failed to update favorite');
    }
  };

  // Sort options
  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Nearest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'jobs', label: 'Most Jobs Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Input */}
          <div className="flex space-x-4">
            <Input
              type="text"
              name="search"
              placeholder="Search workers by name or service..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              iconPosition="left"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              }
            >
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              {/* Max Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Distance
                </label>
                <select
                  value={filters.maxDistance}
                  onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Distance</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.available}
                    onChange={(e) => handleFilterChange('available', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available Now</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => handleFilterChange('verified', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Verified Only</span>
                </label>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results Count */}
      {!loading && workers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{workers.length}</span> workers
            {filters.category && (
              <span> in <span className="font-semibold">{filters.category}</span></span>
            )}
          </p>
        </div>
      )}

      {/* Workers Grid */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Loading workers..." />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchWorkers}>Try Again</Button>
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No workers found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search criteria
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setFilters({
                category: '',
                search: '',
                minRating: '',
                maxDistance: '',
                sortBy: 'rating',
                available: false,
                verified: false,
              });
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onFavorite={handleFavorite}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                loading={loading && page > 1}
                disabled={loading}
              >
                Load More Workers
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

WorkerList.propTypes = {
  initialCategory: PropTypes.string,
  initialLocation: PropTypes.object,
};

export default WorkerList;
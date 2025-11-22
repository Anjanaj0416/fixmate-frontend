import React, { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import WorkerCard from '../../components/customer/WorkerCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      // TODO: Implement favorites API
      // const response = await userService.getFavorites();
      // setFavorites(response.data);
      setFavorites([]);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (workerId) => {
    // TODO: Implement remove from favorites
    setFavorites(favorites.filter(f => f._id !== workerId));
  };

  const filteredFavorites = favorites.filter(worker =>
    worker.userId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.serviceOffered.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Heart className="inline w-8 h-8 text-red-500 mr-2" />
            My Favorite Workers
          </h1>
          <p className="text-gray-600">
            Quick access to your trusted professionals
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {filteredFavorites.length === 0 ? (
          <Card className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorite workers yet
            </h3>
            <p className="text-gray-600 mb-4">
              Save your favorite workers for quick booking next time
            </p>
            <Button onClick={() => window.location.href = '/customer/find-workers'}>
              Find Workers
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((worker) => (
              <WorkerCard
                key={worker._id}
                worker={worker}
                showFavorite
                isFavorite
                onToggleFavorite={() => handleRemoveFavorite(worker._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
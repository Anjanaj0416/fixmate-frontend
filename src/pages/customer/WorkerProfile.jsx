import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Briefcase,
  Clock,
  CheckCircle,
  Heart,
  Share2,
  MessageCircle,
  Calendar,
  Award,
  Shield
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import ReviewForm from '../../components/customer/ReviewForm';
import PortfolioGallery from '../../components/worker/PortfolioGallery';
import { workerService } from '../../services/workerService';
import { reviewService } from '../../services/reviewService';
import { bookingService } from '../../services/bookingService';

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchWorkerData();
  }, [id]);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const [workerRes, reviewsRes] = await Promise.all([
        workerService.getWorkerById(id),
        reviewService.getWorkerReviews(id)
      ]);
      setWorker(workerRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate('/customer/bookings/new', { state: { workerId: id } });
  };

  const handleFavoriteToggle = async () => {
    // TODO: Implement favorites
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Worker not found</p>
        <Button onClick={() => navigate('/customer/find-workers')} className="mt-4">
          Back to Search
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <Card className="mb-6">
          <div className="md:flex items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <img
                src={worker.userId?.profileImageUrl || '/default-avatar.png'}
                alt={worker.userId?.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {worker.isVerified && (
                <div className="flex items-center justify-center mt-2">
                  <Shield className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Verified</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {worker.userId?.fullName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">{worker.serviceOffered.join(', ')}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {worker.serviceArea.city}
                    </span>
                    <span className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {worker.yearsOfExperience} years exp
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavoriteToggle}
                    icon={<Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Share2 className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-lg font-semibold">{worker.rating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-600">({worker.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  <span className="font-medium">{worker.completedBookings} jobs completed</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleBookNow} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/chat/${worker.userId._id}`)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'portfolio', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <Card>
                <h2 className="text-xl font-bold mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{worker.bio}</p>

                <h3 className="font-semibold text-lg mb-3">Skills & Services</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {worker.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <h3 className="font-semibold text-lg mb-3">Certifications</h3>
                <div className="space-y-2">
                  {worker.certifications && worker.certifications.length > 0 ? (
                    worker.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <Award className="w-4 h-4 mr-2 text-indigo-600" />
                        {cert}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No certifications listed</p>
                  )}
                </div>
              </Card>
            )}

            {activeTab === 'portfolio' && (
              <Card>
                <h2 className="text-xl font-bold mb-4">Portfolio</h2>
                <PortfolioGallery workerId={id} viewOnly />
              </Card>
            )}

            {activeTab === 'reviews' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Reviews ({reviews.length})</h2>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <img
                              src={review.customerId?.profileImageUrl || '/default-avatar.png'}
                              alt={review.customerId?.fullName}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{review.customerId?.fullName}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                {review.rating.toFixed(1)}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <h3 className="font-semibold text-lg mb-4">Pricing</h3>
              <div className="text-center py-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{worker.hourlyRate ? `Rs. ${worker.hourlyRate}` : 'N/A'}</p>
                <p className="text-gray-600 text-sm">per hour (average)</p>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Final price may vary based on job complexity
              </p>
            </Card>

            {/* Availability */}
            <Card>
              <h3 className="font-semibold text-lg mb-4">Availability</h3>
              <div className="space-y-2 text-sm">
                {worker.availability.map((day, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{day}</span>
                    <span className="text-green-600 font-medium">Available</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Response Time */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">Quick Responder</p>
                  <p className="text-sm text-gray-600">Usually replies within 2 hours</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
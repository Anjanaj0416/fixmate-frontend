import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Wrench, 
  Users, 
  Star, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Zap,
  Clock,
  MapPin
} from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    workers: 1250,
    bookings: 5800,
    cities: 15
  });

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/panel');
      }
    }
  }, [user, navigate]);

  const services = [
    { icon: '🔧', name: 'Plumbing', description: 'Professional plumbers for all your needs' },
    { icon: '⚡', name: 'Electrical', description: 'Licensed electricians at your service' },
    { icon: '🔨', name: 'Carpentry', description: 'Skilled carpenters for furniture & repairs' },
    { icon: '🎨', name: 'Painting', description: 'Expert painters for your home' },
    { icon: '🌡️', name: 'AC Service', description: 'AC installation & repair specialists' },
    { icon: '🚿', name: 'Cleaning', description: 'Professional cleaning services' },
    { icon: '🌳', name: 'Gardening', description: 'Garden maintenance experts' },
    { icon: '🔩', name: 'Welding', description: 'Professional welding services' }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'AI-Powered Matching',
      description: 'Our AI finds the perfect worker for your specific needs'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Workers',
      description: 'All workers are background-checked and verified'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Quality Guaranteed',
      description: 'Read reviews and ratings from real customers'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Quick Response',
      description: 'Get responses from workers within hours'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Post Your Job',
      description: 'Describe your problem and upload images'
    },
    {
      step: '2',
      title: 'Get Matched',
      description: 'Our AI recommends the best workers'
    },
    {
      step: '3',
      title: 'Choose & Book',
      description: 'Review profiles, ratings, and book'
    },
    {
      step: '4',
      title: 'Job Done',
      description: 'Worker completes the job and you pay'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">AI-Powered Platform</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                Find Skilled Workers in
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300"> Sri Lanka</span>
              </h1>
              
              <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
                Connect with verified professionals for all your home service needs. 
                From plumbing to electrical work, we've got you covered.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold">{stats.workers}+</div>
                  <div className="text-indigo-200 text-sm">Skilled Workers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.bookings}+</div>
                  <div className="text-indigo-200 text-sm">Jobs Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.cities}+</div>
                  <div className="text-indigo-200 text-sm">Cities Covered</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                  <img 
                    src="/assets/images/hero-illustration.svg" 
                    alt="Worker illustration"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-gray-600">
              Expert professionals for every job
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => navigate('/login')}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border border-gray-200"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3"
            >
              View All Services <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose FixMate?
            </h2>
            <p className="text-xl text-gray-600">
              The smartest way to find skilled workers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your job done in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-bold rounded-full mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 transform -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of satisfied customers who trust FixMate for their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/login')}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Find Workers Now
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-10 py-4 text-lg font-semibold rounded-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Wrench className="w-8 h-8 text-indigo-500 mr-2" />
                <span className="text-2xl font-bold text-white">FixMate</span>
              </div>
              <p className="text-gray-400">
                Your trusted platform for finding skilled workers in Sri Lanka.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Find Workers</a></li>
                <li><a href="#" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">For Workers</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Join as Worker</a></li>
                <li><a href="#" className="hover:text-white transition">Benefits</a></li>
                <li><a href="#" className="hover:text-white transition">Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FixMate. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;
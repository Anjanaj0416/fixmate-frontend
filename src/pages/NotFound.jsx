import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white mb-4">404</h1>
          <div className="flex items-center justify-center mb-6">
            <Search className="w-16 h-16 text-indigo-200" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              icon={<Home className="w-5 h-5 mr-2" />}
            >
              Go to Home
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
              icon={<ArrowLeft className="w-5 h-5 mr-2" />}
            >
              Go Back
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              Need help? Here are some useful links:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <a
                href="/"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Home
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="/login"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Login
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="/signup"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign Up
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="#"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Help Center
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-white text-sm">
          If you believe this is an error, please contact support
        </p>
      </div>

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

export default NotFound;
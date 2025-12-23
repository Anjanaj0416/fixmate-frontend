import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, ArrowLeft } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    // Redirect based on user role
    if (user.role === 'customer') {
      navigate('/customer/dashboard');
    } else if (user.role === 'worker') {
      navigate('/worker/dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin/panel');
    }
  };

  const handleBackToHome = () => {
    console.log('🏠 Back to Home button clicked');
    try {
      navigate('/');
      console.log('✅ Navigation to home successful');
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home button - FIXED */}
        <button
          type="button"
          onClick={handleBackToHome}
          className="flex items-center text-white mb-6 hover:text-indigo-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Home</span>
        </button>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Wrench className="w-10 h-10 text-white mr-3" />
              <h1 className="text-3xl font-bold text-white">FixMate</h1>
            </div>
            <p className="text-indigo-100 text-lg">Welcome back!</p>
          </div>

          {/* Login form */}
          <div className="p-8">
            <LoginForm onSuccess={handleLoginSuccess} />

            {/* Signup link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Forgot password link */}
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-700">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-700">Help</a>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 text-center text-white text-sm">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
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

export default Login;
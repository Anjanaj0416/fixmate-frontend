import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import ChatBox from '../components/chat/ChatBox';
import apiService from '../services/apiService';

/**
 * Customer Chat Page Component
 * Allows customers to chat with workers
 */
const CustomerChatPage = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState(null);
  const [workerUser, setWorkerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadWorkerData();
    loadCurrentUser();
  }, [workerId]);

  const loadCurrentUser = () => {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadWorkerData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📥 Loading worker data for chat:', workerId);

      // Fetch worker profile
      const response = await apiService.get(`/workers/${workerId}/profile`);
      
      let workerData = null;
      if (response.data?.data?.worker) {
        workerData = response.data.data.worker;
      } else if (response.data?.worker) {
        workerData = response.data.worker;
      } else if (response.data?.data) {
        workerData = response.data.data;
      } else {
        workerData = response.data;
      }

      console.log('✅ Worker data loaded:', workerData);

      if (!workerData) {
        throw new Error('Worker not found');
      }

      setWorker(workerData);

      // Extract user info for chat
      if (workerData.userId) {
        setWorkerUser({
          _id: workerData.userId._id || workerData.userId.id,
          id: workerData.userId._id || workerData.userId.id,
          name: workerData.userId.fullName || workerData.userId.name,
          profileImage: workerData.userId.profileImage,
          isOnline: workerData.userId.isOnline || false
        });
      }

    } catch (error) {
      console.error('❌ Error loading worker:', error);
      setError('Failed to load worker information');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePhoneCall = () => {
    if (worker?.userId?.phoneNumber) {
      window.location.href = `tel:${worker.userId.phoneNumber}`;
    } else {
      alert('Phone number not available');
    }
  };

  const handleVideoCall = () => {
    alert('Video calling feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error || !worker || !workerUser || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            <p className="font-medium">{error || 'Unable to load chat'}</p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            
            {/* Worker Info */}
            <div className="flex items-center gap-3">
              {workerUser.profileImage ? (
                <img
                  src={workerUser.profileImage}
                  alt={workerUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {workerUser.name?.charAt(0).toUpperCase() || 'W'}
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-gray-900">{workerUser.name}</h3>
                <p className="text-xs text-gray-500">
                  {workerUser.isOnline ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Online
                    </span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePhoneCall}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Call"
            >
              <Phone size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleVideoCall}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Video call (coming soon)"
            >
              <Video size={20} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 overflow-hidden">
        <ChatBox
          recipientUser={workerUser}
          currentUser={currentUser}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default CustomerChatPage;
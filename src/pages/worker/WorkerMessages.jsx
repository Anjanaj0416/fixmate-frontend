import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, ArrowLeft, User } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

/**
 * Worker Messages Page
 * Displays all conversations between worker and customers
 */
const WorkerMessages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hasInitialized = useRef(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadConversations();
    }
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('📡 Fetching worker conversations...');

      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Conversations response:', data);

      if (data.success && data.data) {
        const conversationsData = data.data.conversations || data.data || [];
        console.log('💬 Total conversations before dedup:', conversationsData.length);

        // Remove duplicates based on conversationId
        const uniqueConversations = removeDuplicates(conversationsData);
        console.log('✅ Unique conversations:', uniqueConversations.length);

        setConversations(uniqueConversations);
      }

    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      setError(error.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const removeDuplicates = (conversations) => {
    const seen = new Map();
    
    conversations.forEach(conv => {
      const id = conv.conversationId || conv._id;
      if (!seen.has(id) || 
          (conv.lastMessage?.timestamp > seen.get(id).lastMessage?.timestamp)) {
        seen.set(id, conv);
      }
    });
    
    return Array.from(seen.values());
  };

  const getToken = () => {
    return localStorage.getItem('fixmate_auth_token') || 
           sessionStorage.getItem('authToken') ||
           sessionStorage.getItem('fixmate_auth_token');
  };

  const getCurrentUserId = () => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user._id || user.id;
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    return null;
  };

  const handleConversationClick = (conversation) => {
    const otherUserId = getOtherUserId(conversation);
    
    if (!otherUserId) {
      alert('Cannot open conversation. User information is missing. Please try again.');
      return;
    }

    console.log('💬 Opening chat with customer:', otherUserId);
    navigate(`/worker/chat/${otherUserId}`);
  };

  const getOtherUserId = (conversation) => {
    const currentUserId = getCurrentUserId();
    
    // Try to get from otherUser first
    if (conversation.otherUser) {
      return conversation.otherUser._id || conversation.otherUser.id;
    }
    
    // Fallback: extract from lastMessage
    if (conversation.lastMessage) {
      const senderId = conversation.lastMessage.senderId?._id || conversation.lastMessage.senderId;
      const receiverId = conversation.lastMessage.receiverId?._id || conversation.lastMessage.receiverId;
      
      return senderId === currentUserId ? receiverId : senderId;
    }
    
    return null;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getOtherUserName = (conversation) => {
    return conversation.otherUser?.fullName || 
           conversation.otherUser?.name || 
           'Customer';
  };

  const getOtherUserImage = (conversation) => {
    return conversation.otherUser?.profileImage || 
           conversation.otherUser?.avatar || 
           null;
  };

  const getLastMessagePreview = (conversation) => {
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) return 'No messages yet';

    let preview = '';
    
    const currentUserId = getCurrentUserId();
    const isSentByMe = lastMessage.senderId === currentUserId || 
                       lastMessage.senderId?._id === currentUserId;

    if (isSentByMe) {
      preview = 'You: ';
    }

    if (lastMessage.messageType === 'text') {
      preview += lastMessage.message || lastMessage.content || '';
    } else if (lastMessage.messageType === 'image') {
      preview += '📷 Photo';
    } else if (lastMessage.messageType === 'file') {
      preview += '📎 File';
    } else if (lastMessage.messageType === 'location') {
      preview += '📍 Location';
    } else {
      preview += 'Message';
    }

    return preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = getOtherUserName(conv).toLowerCase();
    const preview = getLastMessagePreview(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || 
           preview.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/worker/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">Chat with your customers</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadConversations}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Messages from customers will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.conversationId || conversation._id}
                onClick={() => handleConversationClick(conversation)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 border border-gray-100 hover:border-indigo-200"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {getOtherUserImage(conversation) ? (
                      <img
                        src={getOtherUserImage(conversation)}
                        alt={getOtherUserName(conversation)}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {getOtherUserName(conversation)}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessage?.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {getLastMessagePreview(conversation)}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <div className="bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerMessages;
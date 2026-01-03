import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  User,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

/**
 * Customer Messages Page - ULTIMATE FIX v2
 * ✅ Fixed: React 18 double rendering
 * ✅ Fixed: Backend duplicate conversations  
 * ✅ Fixed: Proper React key usage
 * ✅ Fixed: Component remounting prevention
 * ✅ CRITICAL FIX: Added clickable={true} prop for Card component
 * ✅ CRITICAL FIX: Fixed authentication token issue
 */
const CustomerMessages = () => {
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);
  const hasInitialized = useRef(false);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Debug: Verify navigate function on mount
  useEffect(() => {
    console.log('🔧 Navigate function check:', typeof navigate);
  }, [navigate]);

  useEffect(() => {
    // ✅ CRITICAL: Prevent double fetch in React 18 Strict Mode
    if (hasInitialized.current) {
      console.log('⏭️ Skipping duplicate useEffect call (Strict Mode)');
      return;
    }
    
    hasInitialized.current = true;
    isMounted.current = true;
    loadConversations();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadConversations = async () => {
    // ✅ Prevent multiple simultaneous fetches
    if (fetchInProgress.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }

    try {
      fetchInProgress.current = true;
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('fixmate_auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      console.log('📥 Loading conversations...');
      console.log('🔑 Token exists:', !!token);

      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Raw API response:', data);

      if (!isMounted.current) return; // Component unmounted

      if (data.success && data.data) {
        let conversationsData = [];
        
        // Extract conversations array
        if (Array.isArray(data.data.conversations)) {
          conversationsData = data.data.conversations;
        } else if (Array.isArray(data.data)) {
          conversationsData = data.data;
        } else if (Array.isArray(data)) {
          conversationsData = data;
        }

        console.log('💬 Extracted conversations:', conversationsData);
        console.log('📊 Count before dedup:', conversationsData.length);
        
        // ✅ CRITICAL: Remove duplicates by conversationId
        const uniqueConversations = removeDuplicates(conversationsData);
        console.log('📊 Count after dedup:', uniqueConversations.length);
        console.log('✅ Unique conversations:', uniqueConversations);
        
        setConversations(uniqueConversations);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to load conversations');
        setConversations([]);
      }
    } finally {
      fetchInProgress.current = false;
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // ✅ Enhanced duplicate removal with detailed logging
  const removeDuplicates = (conversationsArray) => {
    if (!Array.isArray(conversationsArray)) {
      console.warn('⚠️ Invalid conversations array:', conversationsArray);
      return [];
    }

    const seen = new Map();
    const duplicates = [];

    conversationsArray.forEach((conv, index) => {
      // Try multiple ID fields
      const id = conv.conversationId || conv._id || conv.id;
      
      if (!id) {
        console.warn(`⚠️ Conversation at index ${index} has no ID:`, conv);
        return;
      }

      if (seen.has(id)) {
        duplicates.push({ id, index });
        console.log(`🔄 Duplicate found: ${id} at index ${index}`);
      } else {
        seen.set(id, conv);
      }
    });

    if (duplicates.length > 0) {
      console.log(`🗑️ Removed ${duplicates.length} duplicates:`, duplicates);
    }

    return Array.from(seen.values());
  };

  const handleRefresh = () => {
    if (!fetchInProgress.current) {
      setRefreshing(true);
      loadConversations();
    }
  };

  // ✅ CRITICAL FIX: Enhanced conversation click handler with extensive debugging
  const handleConversationClick = (conversation) => {
    console.log('🎯 CONVERSATION CLICK EVENT TRIGGERED');
    console.log('📊 Full conversation data:', conversation);
    
    // Extract other user ID with multiple fallbacks
    const otherUserId = 
      conversation.otherUser?._id || 
      conversation.otherUser?.id ||
      conversation.otherUserId ||
      conversation.participantId;
    
    console.log('🔍 Extracted otherUserId:', otherUserId);
    console.log('🔍 conversation.otherUser:', conversation.otherUser);
    
    if (!otherUserId) {
      console.error('❌ Cannot open chat - other user ID missing:', conversation);
      alert('Unable to open chat. User information missing.');
      return;
    }

    const chatPath = `/customer/chat/${otherUserId}`;
    console.log('✅ Navigating to:', chatPath);
    navigate(chatPath);
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
           'Unknown User';
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
    
    // Check if current user sent the message
    const currentUserId = getCurrentUserId();
    const isSentByMe = lastMessage.senderId === currentUserId || 
                       lastMessage.senderId?._id === currentUserId;

    if (isSentByMe) {
      preview = 'You: ';
    }

    // Add message content
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

    // Truncate if too long
    return preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
  };

  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user._id || user.id;
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
    return null;
  };

  // ✅ CRITICAL: Use useMemo to prevent re-filtering on every render
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conversation => {
      const otherUserName = getOtherUserName(conversation).toLowerCase();
      const lastMessageText = (conversation.lastMessage?.message || '').toLowerCase();
      return otherUserName.includes(query) || lastMessageText.includes(query);
    });
  }, [conversations, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              {conversations.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {conversations.length}
                </span>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || fetchInProgress.current}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh conversations"
            >
              <Loader2 className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <div className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error loading conversations</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={loadConversations}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {filteredConversations.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try searching with different keywords' 
                  : 'Start a conversation with a worker from your bookings'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => navigate('/customer/bookings')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Bookings
                </button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation, index) => {
              // ✅ CRITICAL: Use ONLY conversationId or _id (most stable)
              const conversationKey = conversation.conversationId || conversation._id;
              
              if (!conversationKey) {
                console.error('⚠️ Conversation missing key:', conversation);
                return null;
              }
              
              console.log(`📋 Rendering conversation ${index}:`, {
                conversationId: conversation.conversationId,
                otherUserId: conversation.otherUser?._id || conversation.otherUser?.id,
                otherUserName: conversation.otherUser?.fullName
              });

              return (
                <Card
                  key={conversationKey}
                  hover={true}
                  clickable={true}
                  onClick={() => {
                    console.log('🖱️ CARD CLICKED - Index:', index);
                    handleConversationClick(conversation);
                  }}
                  className="cursor-pointer"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {getOtherUserImage(conversation) ? (
                          <img
                            src={getOtherUserImage(conversation)}
                            alt={getOtherUserName(conversation)}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {getOtherUserName(conversation).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {getOtherUserName(conversation)}
                          </h3>
                          <div className="flex items-center gap-1 text-gray-500 text-sm flex-shrink-0 ml-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTime(conversation.lastMessage?.timestamp || conversation.lastMessage?.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {getLastMessagePreview(conversation)}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {conversation.unreadCount > 0 && (
                              <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMessages;
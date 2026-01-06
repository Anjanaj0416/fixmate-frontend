import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon,
  Phone,
  Video,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { auth } from '../config/firebase';

const API_BASE_URL = 'http://localhost:5001';

/**
 * CustomerChatPage Component - WITH TOKEN REFRESH FIX
 * ✅ Automatic token refresh on mount
 * ✅ Manual refresh button for expired tokens
 * ✅ Proper error handling and user feedback
 */
const CustomerChatPage = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // State
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshingAuth, setRefreshingAuth] = useState(false);

  // ✅ NEW: Refresh Firebase auth token
  const refreshAuthToken = async () => {
    try {
      setRefreshingAuth(true);
      console.log('🔄 Refreshing auth token...');
      
      const user = auth.currentUser;
      
      if (!user) {
        console.error('❌ No user logged in');
        navigate('/login');
        return false;
      }

      // Force token refresh
      const token = await user.getIdToken(true);
      
      // Save to all storage locations
      localStorage.setItem('fixmate_auth_token', token);
      localStorage.setItem('authToken', token);
      sessionStorage.setItem('fixmate_auth_token', token);
      sessionStorage.setItem('authToken', token);
      
      console.log('✅ Auth token refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
      return false;
    } finally {
      setRefreshingAuth(false);
    }
  };

  // ✅ FIXED: Get current user ID using correct storage keys
  const getCurrentUserId = () => {
    try {
      const userStr = sessionStorage.getItem('user') || 
                     localStorage.getItem('user') ||
                     sessionStorage.getItem('fixmate_user') ||
                     localStorage.getItem('fixmate_user') ||
                     sessionStorage.getItem('userData') ||
                     localStorage.getItem('userData');
      
      if (!userStr) {
        console.log('❌ No user data found in storage');
        return null;
      }
      
      const parsed = JSON.parse(userStr);
      const userId = parsed._id || parsed.id;
      console.log('👤 Current User ID:', userId);
      return userId;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  // ✅ FIXED: Get auth token using correct storage keys
  const getToken = () => {
    return sessionStorage.getItem('authToken') ||
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('fixmate_auth_token') ||
           localStorage.getItem('fixmate_auth_token');
  };

  // Load current user
  const loadCurrentUser = () => {
    try {
      const userStr = sessionStorage.getItem('user') || 
                     localStorage.getItem('user') ||
                     sessionStorage.getItem('fixmate_user') ||
                     localStorage.getItem('fixmate_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('✅ Current user loaded:', user);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('❌ Error loading current user:', error);
    }
  };

  // ✅ FIXED: Check if message is from current user
  const isMyMessage = (message) => {
    const currentUserId = getCurrentUserId();
    
    if (!currentUserId || !message) {
      console.log('⚠️ Missing data for comparison');
      return false;
    }

    // Extract sender ID - handle both object and string formats
    let senderId = message.senderId;
    if (typeof senderId === 'object' && senderId !== null) {
      senderId = senderId._id || senderId.id;
    }

    // Convert both to strings for comparison
    const senderIdStr = String(senderId);
    const currentUserIdStr = String(currentUserId);

    const isMatch = senderIdStr === currentUserIdStr;
    
    return isMatch;
  };

  // Load messages with token refresh
  const loadMessages = async (retryCount = 0) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Please login to view messages');
      }

      console.log('📥 Loading conversation with worker:', workerId);

      const response = await fetch(`${API_BASE_URL}/chat/conversations/${workerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // ✅ NEW: Handle 401 by refreshing token
      if (response.status === 401 && retryCount === 0) {
        console.log('🔄 Token expired, attempting refresh...');
        const refreshed = await refreshAuthToken();
        
        if (refreshed) {
          console.log('✅ Token refreshed, retrying request...');
          return await loadMessages(1); // Retry once
        } else {
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Messages loaded:', data);

      if (data.success && data.data) {
        let messagesData = [];
        if (Array.isArray(data.data.messages)) {
          messagesData = data.data.messages;
        } else if (Array.isArray(data.data)) {
          messagesData = data.data;
        }

        setMessages(messagesData);

        // Get other user info from first message
        if (messagesData.length > 0) {
          const currentUserId = getCurrentUserId();
          const firstMessage = messagesData[0];
          
          // Get sender ID
          let senderId = firstMessage.senderId;
          if (typeof senderId === 'object' && senderId !== null) {
            senderId = senderId._id || senderId.id;
          }
          
          // Determine who is the other user
          const otherUserData = String(senderId) === String(currentUserId)
            ? firstMessage.receiverId 
            : firstMessage.senderId;
          
          console.log('👥 Other user:', otherUserData);
          setOtherUser(otherUserData);
        } else {
          await loadWorkerProfile();
        }

        await markMessagesAsRead();
      }
      
      // Clear error if successful
      setError(null);
      
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setError(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Load worker profile (fallback when no messages exist)
  const loadWorkerProfile = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/workers/${workerId}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        let workerData = null;
        if (data.data?.worker) {
          workerData = data.data.worker;
        } else if (data.worker) {
          workerData = data.worker;
        } else if (data.data) {
          workerData = data.data;
        }

        if (workerData?.userId) {
          setOtherUser({
            _id: workerData.userId._id || workerData.userId.id,
            fullName: workerData.userId.fullName || workerData.userId.name,
            name: workerData.userId.fullName || workerData.userId.name,
            profileImage: workerData.userId.profileImage,
            role: 'worker'
          });
        }
      }
    } catch (error) {
      console.error('Error loading worker profile:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      const token = getToken();
      const currentUserId = getCurrentUserId();
      const conversationId = [currentUserId, workerId].sort().join('_');

      await fetch(`${API_BASE_URL}/chat/messages/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversationId })
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send message with token refresh
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedImage) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Please login to send messages');
      }

      const messageData = {
        receiverId: workerId,
        message: newMessage.trim(),
        messageType: selectedImage ? 'image' : 'text',
        mediaUrl: selectedImage || undefined
      };

      console.log('📤 Sending message:', messageData);

      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      // ✅ NEW: Handle 401 by refreshing token
      if (response.status === 401) {
        console.log('🔄 Token expired, attempting refresh...');
        const refreshed = await refreshAuthToken();
        
        if (refreshed) {
          console.log('✅ Token refreshed, retrying send...');
          // Retry sending
          return await handleSendMessage(e);
        } else {
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Message sent:', data);

      // Add message to local state immediately
      if (data.success && data.data?.message) {
        setMessages(prev => [...prev, data.data.message]);
      }

      // Clear input
      setNewMessage('');
      setSelectedImage(null);

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ✅ NEW: Manual refresh handler
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setError(null);
    const refreshed = await refreshAuthToken();
    
    if (refreshed) {
      setLoading(true);
      await loadMessages();
    } else {
      setError('Failed to refresh session. Please login again.');
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
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
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Format date separator
  const formatDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Check if should show date separator
  const shouldShowDateSeparator = (currentMsg, previousMsg) => {
    if (!previousMsg) return true;
    const currentDate = new Date(currentMsg.timestamp || currentMsg.createdAt);
    const previousDate = new Date(previousMsg.timestamp || previousMsg.createdAt);
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  // Handle phone call
  const handlePhoneCall = () => {
    if (otherUser?.phoneNumber) {
      window.location.href = `tel:${otherUser.phoneNumber}`;
    } else {
      alert('Phone number not available');
    }
  };

  // Handle video call
  const handleVideoCall = () => {
    alert('Video calling feature coming soon!');
  };

  // ✅ NEW: Load with token refresh on mount
  useEffect(() => {
    loadCurrentUser();
    
    // Refresh token immediately on mount
    refreshAuthToken().then(() => {
      loadMessages();
    });
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [workerId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back button and user info */}
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => navigate('/customer/messages')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>

              {/* User Avatar and Name */}
              {otherUser ? (
                <div className="flex items-center gap-3">
                  {otherUser.profileImage ? (
                    <img
                      src={otherUser.profileImage}
                      alt={otherUser.fullName || otherUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {(otherUser.fullName || otherUser.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {otherUser.fullName || otherUser.name || 'User'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Service Provider
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePhoneCall}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Phone className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                onClick={handleVideoCall}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Video className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* ✅ NEW: Enhanced error display with refresh button */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error: {error}</p>
                  {error.includes('Session expired') && (
                    <p className="text-sm text-red-600 mt-1">
                      Your session has expired. Click refresh to continue.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshingAuth}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshingAuth ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={loadMessages}
                    className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-600">
                Start the conversation by sending a message below
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isMine = isMyMessage(message);
                const showDateSeparator = shouldShowDateSeparator(
                  message, 
                  index > 0 ? messages[index - 1] : null
                );

                return (
                  <React.Fragment key={message._id || index}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                          {formatDateSeparator(message.timestamp || message.createdAt)}
                        </div>
                      </div>
                    )}

                    {/* Message Bubble - FIXED ALIGNMENT */}
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%]`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isMine
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          {message.messageType === 'image' && message.mediaUrl && (
                            <img
                              src={message.mediaUrl}
                              alt="Shared image"
                              className="rounded-lg mb-2 max-w-full"
                            />
                          )}

                          {message.message && (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.message}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-xs ${
                              isMine ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp || message.createdAt)}
                            </span>
                            {isMine && (
                              <span className="text-xs text-indigo-200">
                                {message.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={selectedImage}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                rows="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32"
                style={{ minHeight: '42px' }}
              />
            </div>

            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && !selectedImage)}
              className={`p-2 rounded-full flex-shrink-0 transition-colors ${
                sending || (!newMessage.trim() && !selectedImage)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerChatPage;
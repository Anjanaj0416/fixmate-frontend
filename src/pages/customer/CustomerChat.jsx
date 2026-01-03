import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001';

/**
 * CustomerChat Component
 * Displays conversation messages and allows sending replies
 */
const CustomerChat = () => {
  const { userId } = useParams(); // The other user's ID from URL
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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get current user ID from storage
  const getCurrentUserId = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed._id || parsed.id;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  // Load messages
  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('fixmate_auth_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('userToken');

      if (!token) {
        throw new Error('Please login to view messages');
      }

      console.log('📥 Loading conversation with user:', userId);

      const response = await fetch(`${API_BASE_URL}/chat/conversations/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Messages loaded:', data);

      if (data.success && data.data) {
        // Extract messages
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
          
          // Determine who is the other user
          const otherUserData = firstMessage.senderId?._id === currentUserId 
            ? firstMessage.receiverId 
            : firstMessage.senderId;
          
          setOtherUser(otherUserData);
        }

        // Mark messages as read
        await markMessagesAsRead();
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setError(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('fixmate_auth_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('userToken');

      // Generate conversation ID (this should match backend logic)
      const currentUserId = getCurrentUserId();
      const conversationId = [currentUserId, userId].sort().join('_');

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

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedImage) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const token = localStorage.getItem('fixmate_auth_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('userToken');

      if (!token) {
        throw new Error('Please login to send messages');
      }

      const messageData = {
        receiverId: userId,
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

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Message sent:', data);

      // Add message to local state immediately for better UX
      if (data.success && data.data?.message) {
        setMessages(prev => [...prev, data.data.message]);
      }

      // Clear input
      setNewMessage('');
      setSelectedImage(null);

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);

      // Reload messages to get updated data
      await loadMessages();
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to server first
      // For now, we'll use a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Check if should show date separator
  const shouldShowDateSeparator = (currentMsg, previousMsg) => {
    if (!previousMsg) return true;
    
    const currentDate = new Date(currentMsg.timestamp || currentMsg.createdAt);
    const previousDate = new Date(previousMsg.timestamp || previousMsg.createdAt);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  // Load messages on mount and set up auto-refresh
  useEffect(() => {
    loadMessages();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get current user ID for message comparison
  const currentUserId = getCurrentUserId();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
                      {otherUser.role === 'worker' ? 'Service Provider' : 'Customer'}
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
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Info className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            // Loading state
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error: {error}</p>
              <button
                onClick={loadMessages}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            // Empty state
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
            // Messages list
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.senderId?._id === currentUserId || 
                              message.senderId === currentUserId;
                const showDateSeparator = shouldShowDateSeparator(
                  message, 
                  index > 0 ? messages[index - 1] : null
                );

                return (
                  <React.Fragment key={message._id || index}>
                    {/* Date Separator */}
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                          {formatDateSeparator(message.timestamp || message.createdAt)}
                        </div>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          {/* Image if present */}
                          {message.messageType === 'image' && message.mediaUrl && (
                            <img
                              src={message.mediaUrl}
                              alt="Shared image"
                              className="rounded-lg mb-2 max-w-full"
                            />
                          )}

                          {/* Message text */}
                          {message.message && (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.message}
                            </p>
                          )}

                          {/* Time and read status */}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-xs ${
                              isOwn ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp || message.createdAt)}
                            </span>
                            {isOwn && (
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
          {/* Image preview */}
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
            {/* Attachment button */}
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

            {/* Message input */}
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

            {/* Send button */}
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

export default CustomerChat;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  User,
  CheckCheck,
  Check
} from 'lucide-react';

/**
 * Worker Chat Page - FINAL FIXED VERSION
 * ✅ Uses correct storage keys: 'user' and 'fixmate_user'
 * ✅ Proper message alignment based on sender ID
 */
const WorkerChatPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (customerId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [customerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ FIXED: Get token using correct storage keys
  const getToken = () => {
    return sessionStorage.getItem('authToken') ||
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('fixmate_auth_token') ||
           localStorage.getItem('fixmate_auth_token');
  };

  // ✅ FIXED: Get current user ID using correct storage keys
  const getCurrentUserId = () => {
    const userStr = sessionStorage.getItem('user') || 
                   localStorage.getItem('user') ||
                   sessionStorage.getItem('fixmate_user') ||
                   localStorage.getItem('fixmate_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user._id || user.id;
        console.log('👤 Current Worker ID:', userId);
        return userId;
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    console.log('❌ No user data found in storage');
    return null;
  };

  // ✅ FIXED: Check if message is from current user (worker)
  const isMyMessage = (message) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId || !message) {
      console.log('⚠️ Missing data for comparison');
      return false;
    }

    // Get sender ID - handle both object and string formats
    let senderId = message.senderId;
    if (typeof senderId === 'object' && senderId !== null) {
      senderId = senderId._id || senderId.id;
    }

    // Convert both to strings for comparison
    const senderIdStr = String(senderId);
    const currentUserIdStr = String(currentUserId);
    
    const isMatch = senderIdStr === currentUserIdStr;

    console.log('🔍 Message Ownership:', {
      currentUser: currentUserIdStr,
      sender: senderIdStr,
      isMatch: isMatch,
      message: message.message?.substring(0, 20)
    });

    return isMatch;
  };

  const loadMessages = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chat/conversations/${customerId}`, {
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
      console.log('📨 Messages response:', data);

      if (data.success && data.data) {
        const messagesData = data.data.messages || [];
        setMessages(messagesData);

        if (messagesData.length > 0) {
          const firstMessage = messagesData[0];
          const currentUserId = getCurrentUserId();
          
          // Get sender ID - handle object format
          let senderId = firstMessage.senderId;
          if (typeof senderId === 'object' && senderId !== null) {
            senderId = senderId._id || senderId.id;
          }
          
          const otherUserData = String(senderId) === String(currentUserId)
            ? firstMessage.receiverId 
            : firstMessage.senderId;
          
          setOtherUser(otherUserData);
        } else {
          await loadCustomerProfile();
        }

        await markMessagesAsRead();
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setError(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerProfile = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/users/${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.user) {
          setOtherUser(data.data.user);
        }
      }
    } catch (error) {
      console.error('Error loading customer profile:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const token = getToken();
      const currentUserId = getCurrentUserId();
      const conversationId = [currentUserId, customerId].sort().join('_');

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
        receiverId: customerId,
        message: newMessage.trim(),
        messageType: selectedImage ? 'image' : 'text'
      };

      if (selectedImage) {
        const base64Image = await convertToBase64(selectedImage);
        messageData.mediaUrl = base64Image;
      }

      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('✅ Message sent:', data);

      setNewMessage('');
      setSelectedImage(null);
      
      await loadMessages();

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between p-4">
            {/* Back Button & User Info */}
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => navigate('/worker/messages')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>

              {otherUser ? (
                <div className="flex items-center gap-3">
                  {otherUser.profileImage ? (
                    <img
                      src={otherUser.profileImage}
                      alt={otherUser.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {otherUser.fullName || otherUser.name}
                    </h3>
                    <p className="text-xs text-gray-500">Customer</p>
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
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : error ? (
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">Send a message to start the conversation</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-full">
                      <p className="text-xs text-gray-600 font-medium">{date}</p>
                    </div>
                  </div>

                  {/* Messages - FIXED ALIGNMENT */}
                  <div className="space-y-3">
                    {dateMessages.map((message, index) => {
                      const isMine = isMyMessage(message);
                      return (
                        <div
                          key={message._id || index}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%]`}>
                            {/* Message Bubble */}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isMine
                                  ? 'bg-indigo-600 text-white rounded-br-none'
                                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                              }`}
                            >
                              {message.messageType === 'image' && message.mediaUrl && (
                                <img
                                  src={message.mediaUrl}
                                  alt="Sent image"
                                  className="rounded-lg mb-2 max-w-full"
                                />
                              )}
                              <p className="text-sm break-words whitespace-pre-wrap">
                                {message.message}
                              </p>
                            </div>

                            {/* Time & Status */}
                            <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </span>
                              {isMine && (
                                <span>
                                  {message.isRead ? (
                                    <CheckCheck className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <Check className="w-4 h-4 text-gray-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto p-4">
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="h-20 rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <ImageIcon className="w-6 h-6" />
            </button>

            <div className="flex-1 relative">
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
                disabled={sending}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>

            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && !selectedImage)}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerChatPage;
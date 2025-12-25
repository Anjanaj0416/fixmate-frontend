import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Send, Paperclip } from 'lucide-react';

/**
 * ChatBox Component - FINAL FIXED VERSION for FixMate
 * Uses correct storage key: 'fixmate_auth_token'
 */
const ChatBox = ({ recipientUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (recipientUser?._id || recipientUser?.id) {
      loadMessages();
      // Auto-refresh messages every 3 seconds
      intervalRef.current = setInterval(loadMessages, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recipientUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setError('');
      const recipientId = recipientUser._id || recipientUser.id;
      
      // ✅ CRITICAL FIX: Use correct storage key
      const token = localStorage.getItem('fixmate_auth_token') || 
                    sessionStorage.getItem('fixmate_auth_token');

      if (!token) {
        console.error('❌ No authentication token found');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('📥 Loading messages for user:', recipientId);
      console.log('🔑 Token found (length):', token.length);

      const response = await fetch(
        `http://localhost:5001/chat/conversations/${recipientId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Chat response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          // No messages yet - this is normal
          setMessages([]);
          setLoading(false);
          return;
        }
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Messages loaded:', data);

      // Extract messages from response
      let messagesList = [];
      if (data?.data?.messages) {
        messagesList = data.data.messages;
      } else if (data?.messages) {
        messagesList = data.messages;
      } else if (Array.isArray(data?.data)) {
        messagesList = data.data;
      } else if (Array.isArray(data)) {
        messagesList = data;
      }

      setMessages(messagesList);
      setLoading(false);

      // Mark messages as read
      if (messagesList.length > 0) {
        const conversationId = messagesList[0].conversationId;
        await markAsRead(conversationId);
      }

    } catch (error) {
      console.error('❌ Error loading messages:', error);
      if (error.message !== 'HTTP 404') {
        setError(error.message || 'Failed to load messages');
      }
      setLoading(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      // ✅ CRITICAL FIX: Use correct storage key
      const token = localStorage.getItem('fixmate_auth_token') || 
                    sessionStorage.getItem('fixmate_auth_token');

      if (!token) return;

      await fetch('http://localhost:5001/chat/messages/read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversationId })
      });
    } catch (error) {
      console.warn('Failed to mark as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      setError('');

      const recipientId = recipientUser._id || recipientUser.id;
      
      // ✅ CRITICAL FIX: Use correct storage key
      const token = localStorage.getItem('fixmate_auth_token') || 
                    sessionStorage.getItem('fixmate_auth_token');

      if (!token) {
        throw new Error('No authentication token. Please log in again.');
      }

      console.log('📤 Sending message:', {
        receiverId: recipientId,
        message: newMessage.trim()
      });

      const response = await fetch('http://localhost:5001/chat/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: recipientId,
          message: newMessage.trim(),
          messageType: 'text'
        })
      });

      console.log('📤 Send message response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      console.log('✅ Message sent successfully:', data);

      setNewMessage('');
      
      // Reload messages immediately to show the new one
      await loadMessages();

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError(error.message || 'Failed to send message');
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
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

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp || message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const renderMessage = (message, isOwn) => {
    const senderName = message.senderId?.fullName || message.senderId?.name || 'Unknown';
    const senderImage = message.senderId?.profileImage;

    return (
      <div
        key={message._id}
        className={`flex items-end gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        {!isOwn && (
          <div className="flex-shrink-0">
            {senderImage ? (
              <img
                src={senderImage}
                alt={senderName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600">
                {senderName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 rounded-bl-none'
            }`}
          >
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.message}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp || message.createdAt)}
            </span>
            {isOwn && (
              <span className="text-xs">
                {message.isRead ? (
                  <span className="text-blue-600" title="Read">✓✓</span>
                ) : message.isDelivered ? (
                  <span className="text-gray-400" title="Delivered">✓✓</span>
                ) : (
                  <span className="text-gray-400" title="Sent">✓</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-600">
                Start a conversation with {recipientUser?.name}
              </p>
            </div>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDate(new Date(date))}
                </div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message) => {
                const isOwn =
                  (message.senderId?._id || message.senderId) === (currentUser?._id || currentUser?.uid) ||
                  message.senderId === (currentUser?._id || currentUser?.uid);
                return renderMessage(message, isOwn);
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Attach file (coming soon)"
            onClick={() => alert('File attachments coming soon!')}
            disabled={sending}
          >
            <Paperclip size={20} />
          </button>

          {/* Message Input */}
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
              disabled={sending}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32"
              style={{ minHeight: '44px' }}
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
              newMessage.trim() && !sending
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="Send message"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* Hint Text */}
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

ChatBox.propTypes = {
  recipientUser: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    profileImage: PropTypes.string,
    isOnline: PropTypes.bool,
  }).isRequired,
  currentUser: PropTypes.shape({
    _id: PropTypes.string,
    uid: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

export default ChatBox;
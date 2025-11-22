import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Send,
  Paperclip,
  Smile,
  X,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Image as ImageIcon,
  CheckCheck,
  Check
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatBox = ({ conversationId, recipientUser, onBack, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (conversationId || recipientUser) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [conversationId, recipientUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userId = recipientUser?._id || recipientUser?.id;

      const response = await fetch(
        `http://localhost:5001/api/v1/chat/conversations/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data.data.messages || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = recipientUser?._id || recipientUser?.id;

      await fetch('http://localhost:5001/api/v1/chat/messages/read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversationId: userId })
      });
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleSendMessage = async (messageData) => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = recipientUser?._id || recipientUser?.id;

      const response = await fetch('http://localhost:5001/api/v1/chat/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: userId,
          message: messageData.text,
          attachments: messageData.attachments
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages(prev => [...prev, data.data.message]);
      scrollToBottom();
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message: ' + err.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `http://localhost:5001/api/v1/chat/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete message');

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      console.error('Delete message error:', err);
      alert('Failed to delete message: ' + err.message);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `http://localhost:5001/api/v1/chat/messages/${messageId}/reaction`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ emoji })
        }
      );

      if (!response.ok) throw new Error('Failed to add reaction');

      const data = await response.json();
      setMessages(prev =>
        prev.map(msg => (msg._id === messageId ? data.data.message : msg))
      );
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Chat</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMessages}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Back Button (Mobile) */}
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-lg">
                  {recipientUser?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {recipientUser?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {recipientUser?.name || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-500">
                {recipientUser?.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                    View Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                    Clear Chat
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600">
                    Block User
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
      >
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId === currentUser?.uid || message.senderId === currentUser?._id}
                showAvatar={
                  index === 0 ||
                  dateMessages[index - 1].senderId !== message.senderId
                }
                onDelete={() => handleDeleteMessage(message._id)}
                onReaction={(emoji) => handleReaction(message._id, emoji)}
              />
            ))}
          </div>
        ))}

        {messages.length === 0 && (
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
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

ChatBox.propTypes = {
  conversationId: PropTypes.string,
  recipientUser: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    isOnline: PropTypes.bool
  }).isRequired,
  onBack: PropTypes.func,
  currentUser: PropTypes.object.isRequired
};

export default ChatBox;
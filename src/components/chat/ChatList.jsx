import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Search,
  MessageSquare,
  MoreVertical,
  Archive,
  Trash2,
  CheckCheck,
  Check,
  Clock,
  Pin
} from 'lucide-react';

const ChatList = ({ onSelectConversation, selectedConversationId, currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showOptions, setShowOptions] = useState(null);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterConversations();
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        'http://localhost:5001/api/v1/chat/conversations',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      setConversations(data.data.conversations || []);
      setFilteredConversations(data.data.conversations || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        'http://localhost:5001/api/v1/chat/unread-count',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch unread count');

      const data = await response.json();
      setUnreadCount(data.data.count || 0);
    } catch (err) {
      console.error('Fetch unread count error:', err);
    }
  };

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conv => {
      const otherUser = getOtherUser(conv);
      return (
        otherUser?.name?.toLowerCase().includes(query) ||
        conv.lastMessage?.message?.toLowerCase().includes(query)
      );
    });

    setFilteredConversations(filtered);
  };

  const getOtherUser = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    
    return conversation.participants.find(
      p => p._id !== currentUser?.uid && p._id !== currentUser?._id
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getMessageStatus = (message) => {
    if (!message || message.senderId === currentUser?.uid || message.senderId === currentUser?._id) {
      // Message sent by current user
      if (message?.isRead) {
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      } else if (message?.isDelivered) {
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      } else {
        return <Check className="w-4 h-4 text-gray-400" />;
      }
    }
    return null;
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      // Implement delete conversation API call
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    } catch (err) {
      console.error('Delete conversation error:', err);
      alert('Failed to delete conversation');
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Conversations</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchConversations}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
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

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div>
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const isSelected = conversation._id === selectedConversationId;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`flex items-center p-4 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 ${
                    isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mr-3">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    {otherUser?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {otherUser?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(conversation.lastMessage?.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 flex-1 min-w-0">
                        {getMessageStatus(conversation.lastMessage)}
                        <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                          {conversation.lastMessage?.message || 'No messages yet'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                        {hasUnread && (
                          <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                        
                        {conversation.isPinned && (
                          <Pin className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options Menu */}
                  <div className="relative ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptions(showOptions === conversation._id ? null : conversation._id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>

                    {showOptions === conversation._id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implement pin/unpin
                            setShowOptions(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center"
                        >
                          <Pin className="w-4 h-4 mr-2" />
                          {conversation.isPinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implement archive
                            setShowOptions(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation._id);
                            setShowOptions(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Start a conversation to get connected'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ChatList.propTypes = {
  onSelectConversation: PropTypes.func.isRequired,
  selectedConversationId: PropTypes.string,
  currentUser: PropTypes.object.isRequired
};

export default ChatList;
import api, { createFormData } from './api';

/**
 * Chat Service
 * Handles real-time messaging functionality
 */

class ChatService {

  // ============= CONVERSATIONS =============

  /**
   * Get all conversations
   */
  async getConversations(page = 1, limit = 20) {
    try {
      const params = { page, limit };
      const response = await api.get('/chat/conversations', { params });
      return response.data;
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId) {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  }

  /**
   * Create or get conversation with user
   */
  async getOrCreateConversation(userId) {
    try {
      const response = await api.post('/chat/conversations', {
        participantId: userId
      });
      return response.data;
    } catch (error) {
      console.error('Create conversation error:', error);
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId) {
    try {
      const response = await api.delete(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Delete conversation error:', error);
      throw error;
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Archive conversation error:', error);
      throw error;
    }
  }

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(conversationId) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/unarchive`);
      return response.data;
    } catch (error) {
      console.error('Unarchive conversation error:', error);
      throw error;
    }
  }

  // ============= MESSAGES =============

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const params = { page, limit };
      const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  /**
   * Send a text message
   */
  async sendMessage(conversationId, messageData) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Send a message with attachment
   */
  async sendMessageWithAttachment(conversationId, messageData, file) {
    try {
      const formData = createFormData({
        content: messageData.content,
        replyTo: messageData.replyTo,
        attachment: file
      });

      const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Send message with attachment error:', error);
      throw error;
    }
  }

  /**
   * Edit message
   */
  async editMessage(conversationId, messageId, newContent) {
    try {
      const response = await api.put(`/chat/messages/${messageId}`, {
        content: newContent
      });
      return response.data;
    } catch (error) {
      console.error('Edit message error:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  }

  /**
   * React to message
   */
  async reactToMessage(messageId, reaction) {
    try {
      const response = await api.post(`/chat/messages/${messageId}/react`, {
        reaction
      });
      return response.data;
    } catch (error) {
      console.error('React to message error:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId, reaction) {
    try {
      const response = await api.delete(`/chat/messages/${messageId}/react`, {
        data: { reaction }
      });
      return response.data;
    } catch (error) {
      console.error('Remove reaction error:', error);
      throw error;
    }
  }

  // ============= READ RECEIPTS =============

  /**
   * Mark message as read
   */
  async markAsRead(conversationId, messageId) {
    try {
      const response = await api.post(`/chat/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark conversation as read error:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/chat/unread-count');
      return response.data;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  /**
   * Get unread messages
   */
  async getUnreadMessages() {
    try {
      const response = await api.get('/chat/unread');
      return response.data;
    } catch (error) {
      console.error('Get unread messages error:', error);
      throw error;
    }
  }

  // ============= TYPING INDICATORS =============

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(conversationId) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/typing`);
      return response.data;
    } catch (error) {
      console.error('Send typing indicator error:', error);
      throw error;
    }
  }

  /**
   * Stop typing indicator
   */
  async stopTypingIndicator(conversationId) {
    try {
      const response = await api.delete(`/chat/conversations/${conversationId}/typing`);
      return response.data;
    } catch (error) {
      console.error('Stop typing indicator error:', error);
      throw error;
    }
  }

  // ============= SEARCH =============

  /**
   * Search messages
   */
  async searchMessages(query, conversationId = null) {
    try {
      const params = { query };
      if (conversationId) params.conversationId = conversationId;
      
      const response = await api.get('/chat/search', { params });
      return response.data;
    } catch (error) {
      console.error('Search messages error:', error);
      throw error;
    }
  }

  // ============= ATTACHMENTS =============

  /**
   * Upload attachment
   */
  async uploadAttachment(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/chat/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload attachment error:', error);
      throw error;
    }
  }

  /**
   * Get attachment
   */
  async getAttachment(attachmentId) {
    try {
      const response = await api.get(`/chat/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error('Get attachment error:', error);
      throw error;
    }
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(attachmentId) {
    try {
      const response = await api.delete(`/chat/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete attachment error:', error);
      throw error;
    }
  }

  // ============= MUTE/BLOCK =============

  /**
   * Mute conversation
   */
  async muteConversation(conversationId, duration) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/mute`, {
        duration
      });
      return response.data;
    } catch (error) {
      console.error('Mute conversation error:', error);
      throw error;
    }
  }

  /**
   * Unmute conversation
   */
  async unmuteConversation(conversationId) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/unmute`);
      return response.data;
    } catch (error) {
      console.error('Unmute conversation error:', error);
      throw error;
    }
  }

  /**
   * Block user
   */
  async blockUser(userId) {
    try {
      const response = await api.post(`/chat/block/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Block user error:', error);
      throw error;
    }
  }

  /**
   * Unblock user
   */
  async unblockUser(userId) {
    try {
      const response = await api.delete(`/chat/block/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Unblock user error:', error);
      throw error;
    }
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers() {
    try {
      const response = await api.get('/chat/blocked');
      return response.data;
    } catch (error) {
      console.error('Get blocked users error:', error);
      throw error;
    }
  }

  // ============= REPORT =============

  /**
   * Report message
   */
  async reportMessage(messageId, reason) {
    try {
      const response = await api.post(`/chat/messages/${messageId}/report`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Report message error:', error);
      throw error;
    }
  }

  /**
   * Report conversation
   */
  async reportConversation(conversationId, reason) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/report`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Report conversation error:', error);
      throw error;
    }
  }

  // ============= HELPER METHODS =============

  /**
   * Format message timestamp
   */
  formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  /**
   * Format conversation preview
   */
  formatConversationPreview(conversation) {
    const lastMessage = conversation.lastMessage;
    
    if (!lastMessage) {
      return 'No messages yet';
    }

    let preview = lastMessage.content;
    
    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      const attachment = lastMessage.attachments[0];
      if (attachment.type === 'image') {
        preview = '📷 Image';
      } else if (attachment.type === 'video') {
        preview = '🎥 Video';
      } else if (attachment.type === 'audio') {
        preview = '🎵 Audio';
      } else {
        preview = '📎 File';
      }
    }

    // Truncate if too long
    if (preview.length > 50) {
      preview = preview.substring(0, 47) + '...';
    }

    return preview;
  }

  /**
   * Validate message content
   */
  validateMessage(content, attachment = null) {
    const errors = {};

    if (!content && !attachment) {
      errors.message = 'Message cannot be empty';
    }

    if (content && content.length > 5000) {
      errors.message = 'Message is too long (max 5000 characters)';
    }

    if (attachment && attachment.size > 10 * 1024 * 1024) { // 10MB
      errors.attachment = 'File is too large (max 10MB)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get file type icon
   */
  getFileIcon(fileType) {
    const iconMap = {
      'image/jpeg': '🖼️',
      'image/png': '🖼️',
      'image/gif': '🖼️',
      'video/mp4': '🎥',
      'video/mpeg': '🎥',
      'audio/mpeg': '🎵',
      'audio/wav': '🎵',
      'application/pdf': '📄',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'application/vnd.ms-excel': '📊',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
      'text/plain': '📄',
      'application/zip': '📦',
      'application/x-rar-compressed': '📦'
    };

    return iconMap[fileType] || '📎';
  }

  /**
   * Check if user is online
   */
  isUserOnline(lastSeen) {
    if (!lastSeen) return false;
    
    const lastSeenTime = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now - lastSeenTime) / (1000 * 60);
    
    return diffInMinutes < 5; // Consider online if active in last 5 minutes
  }

  /**
   * Format online status
   */
  formatOnlineStatus(lastSeen) {
    if (!lastSeen) return 'Offline';
    
    if (this.isUserOnline(lastSeen)) {
      return 'Online';
    }
    
    const lastSeenTime = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now - lastSeenTime) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;
    
    if (diffInMinutes < 60) {
      return `Active ${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `Active ${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `Active ${Math.floor(diffInDays)}d ago`;
    } else {
      return 'Offline';
    }
  }
}

// Export singleton instance
export default new ChatService();
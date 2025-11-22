import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  MoreVertical,
  Trash2,
  Copy,
  Reply,
  Edit,
  CheckCheck,
  Check,
  Image as ImageIcon,
  File,
  Download
} from 'lucide-react';

const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  onDelete,
  onReaction,
  onReply
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ['👍', '❤️', '😊', '😂', '😮', '😢', '🔥', '👏'];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.message);
    setShowOptions(false);
    // Could show a toast notification here
  };

  const getMessageStatus = () => {
    if (!isOwn) return null;

    if (message.isRead) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else if (message.isDelivered) {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleReactionClick = (emoji) => {
    if (onReaction) {
      onReaction(emoji);
    }
    setShowReactions(false);
  };

  const renderAttachment = (attachment) => {
    const isImage = attachment.type?.startsWith('image/') || 
                    attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
      return (
        <div className="mb-2">
          <img
            src={attachment.url}
            alt="Attachment"
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(attachment.url, '_blank')}
          />
        </div>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors mb-2"
      >
        <File className="w-5 h-5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name || 'File'}</p>
          {attachment.size && (
            <p className="text-xs opacity-75">
              {(attachment.size / 1024).toFixed(2)} KB
            </p>
          )}
        </div>
        <Download className="w-4 h-4" />
      </a>
    );
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0 h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-semibold">
              {message.senderName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}

        {/* Message Content */}
        <div className={`relative ${isOwn ? 'mr-2' : 'ml-2'}`}>
          {/* Message Bubble */}
          <div
            className={`relative px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
            }`}
          >
            {/* Reply Reference (if exists) */}
            {message.replyTo && (
              <div className={`mb-2 pb-2 border-b ${
                isOwn ? 'border-indigo-500' : 'border-gray-200'
              }`}>
                <p className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                  Replying to:
                </p>
                <p className={`text-sm ${isOwn ? 'text-indigo-100' : 'text-gray-600'} truncate`}>
                  {message.replyTo.message}
                </p>
              </div>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index}>
                    {renderAttachment(attachment)}
                  </div>
                ))}
              </div>
            )}

            {/* Message Text */}
            {message.message && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.message}
              </p>
            )}

            {/* Edited Indicator */}
            {message.isEdited && (
              <span className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-gray-400'} ml-2`}>
                (edited)
              </span>
            )}

            {/* Time and Status */}
            <div className={`flex items-center justify-end space-x-1 mt-1`}>
              <span className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                {formatTime(message.createdAt)}
              </span>
              {getMessageStatus()}
            </div>

            {/* Options Button */}
            <div className="absolute top-0 -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Options Menu */}
            {showOptions && (
              <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-8 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10`}>
                {onReply && (
                  <button
                    onClick={() => {
                      onReply(message);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center"
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </button>
                )}
                <button
                  onClick={handleCopyMessage}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </button>
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                >
                  Add Reaction
                </button>
                {isOwn && (
                  <>
                    <button
                      onClick={() => {
                        // Handle edit
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete();
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex items-center space-x-1 mt-1">
              {message.reactions.map((reaction, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs flex items-center space-x-1"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-600">{reaction.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactions && (
            <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
              <div className="flex space-x-2">
                {reactions.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleReactionClick(emoji)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spacer for own messages */}
        {showAvatar && isOwn && (
          <div className="flex-shrink-0 w-8"></div>
        )}
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    message: PropTypes.string,
    senderId: PropTypes.string.isRequired,
    senderName: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    isRead: PropTypes.bool,
    isDelivered: PropTypes.bool,
    isEdited: PropTypes.bool,
    attachments: PropTypes.array,
    reactions: PropTypes.array,
    replyTo: PropTypes.object
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  showAvatar: PropTypes.bool,
  onDelete: PropTypes.func,
  onReaction: PropTypes.func,
  onReply: PropTypes.func
};

export default MessageBubble;
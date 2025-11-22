import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Send,
  Paperclip,
  Smile,
  X,
  Image as ImageIcon,
  File,
  Mic,
  StopCircle
} from 'lucide-react';

const ChatInput = ({ onSendMessage, replyTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💪', '🦾',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() && attachments.length === 0) return;

    const messageData = {
      text: message.trim(),
      attachments: attachments,
      replyTo: replyTo?._id
    };

    onSendMessage(messageData);
    setMessage('');
    setAttachments([]);
    if (onCancelReply) onCancelReply();
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Process files and create preview
    const newAttachments = await Promise.all(
      files.map(async (file) => {
        const preview = file.type.startsWith('image/')
          ? await createImagePreview(file)
          : null;

        return {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview
        };
      })
    );

    setAttachments([...attachments, ...newAttachments]);
  };

  const createImagePreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = message.slice(0, cursorPosition);
    const textAfterCursor = message.slice(cursorPosition);
    
    setMessage(textBeforeCursor + emoji + textAfterCursor);
    setShowEmojiPicker(false);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.selectionStart = cursorPosition + emoji.length;
      textarea.selectionEnd = cursorPosition + emoji.length;
      textarea.focus();
    }, 0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
        
        setAttachments([...attachments, {
          file: audioFile,
          name: 'Voice Message',
          size: audioBlob.size,
          type: 'audio/webm',
          preview: null
        }]);
      };

      mediaRecorder.start();
      setRecording(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (recording) {
      recording.stop();
      recording.stream.getTracks().forEach(track => track.stop());
      setRecording(null);
      setIsRecording(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-3 p-3 bg-gray-50 border-l-4 border-indigo-600 rounded flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Replying to {replyTo.senderName}</p>
            <p className="text-sm text-gray-700 truncate">{replyTo.message}</p>
          </div>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="relative bg-gray-100 rounded-lg p-2 flex items-center space-x-2 max-w-xs"
            >
              {attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt={attachment.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <File className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-72 max-h-64 overflow-y-auto z-10">
                <div className="grid grid-cols-8 gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32 overflow-y-auto"
          />
        </div>

        {/* Voice Recording or Send Button */}
        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex-shrink-0 animate-pulse"
            title="Stop recording"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        ) : message.trim() || attachments.length > 0 ? (
          <button
            type="submit"
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex-shrink-0"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="p-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors flex-shrink-0"
            title="Record voice message"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  replyTo: PropTypes.object,
  onCancelReply: PropTypes.func
};

export default ChatInput;
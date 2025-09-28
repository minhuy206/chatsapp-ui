import React, { useState, useRef, useEffect } from 'react';
import type { ChatInputProps } from '@/types/chat.types';
import { Send, Paperclip, Mic, Square } from 'lucide-react';

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log('File upload clicked');
  };

  const toggleRecording = () => {
    // TODO: Implement voice recording
    setIsRecording(!isRecording);
    console.log('Voice recording toggled:', !isRecording);
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {/* Input Area */}
        <div className="flex items-end space-x-2 p-3">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={handleFileUpload}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="block w-full resize-none border-0 bg-transparent px-0 py-1.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 sm:text-sm"
              style={{
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            />
          </div>

          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            className={`flex-shrink-0 p-2 rounded-md transition-colors ${
              isRecording
                ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            {isRecording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!canSend}
            className={`flex-shrink-0 p-2 rounded-md transition-colors ${
              canSend
                ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                : 'text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Character Count */}
        {message.length > 0 && (
          <div className="px-3 pb-2">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className={message.length > 4000 ? 'text-red-500' : ''}>
                {message.length}/4000
              </span>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-600 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">Recording... Click to stop</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Instructions */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        AI models can make mistakes. Verify important information and think critically about responses.
      </div>
    </form>
  );
};
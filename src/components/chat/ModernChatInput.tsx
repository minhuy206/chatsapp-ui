import React, { useState, useRef, useEffect } from 'react';
import type { ChatInputProps } from '@/types/chat.types';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Mic, Square, Loader2 } from 'lucide-react';

export const ModernChatInput: React.FC<ChatInputProps> = ({
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200">
          {/* Input Container */}
          <div className="flex items-end space-x-3 p-4">
            {/* Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFileUpload}
              disabled={disabled}
              className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

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
                className="block w-full resize-none border-0 bg-transparent px-0 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:outline-none text-base leading-relaxed"
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}
              />
            </div>

            {/* Voice Recording Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleRecording}
              disabled={disabled}
              className={`h-9 w-9 rounded-xl transition-all duration-200 ${
                isRecording
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!canSend}
              size="icon"
              className={`h-9 w-9 rounded-xl transition-all duration-200 ${
                canSend
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Character Count */}
          {message.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 dark:text-slate-500">
                  Press Enter to send, Shift+Enter for new line
                </span>
                <span className={`font-medium ${
                  message.length > 4000
                    ? 'text-red-500'
                    : message.length > 3500
                    ? 'text-amber-500'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {message.length}/4000
                </span>
              </div>
            </div>
          )}

          {/* Recording Overlay */}
          {isRecording && (
            <div className="absolute inset-0 bg-red-50/90 dark:bg-red-900/20 backdrop-blur-sm border-2 border-red-300 dark:border-red-600 rounded-2xl flex items-center justify-center">
              <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
                </div>
                <span className="font-medium">Recording... Click to stop</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
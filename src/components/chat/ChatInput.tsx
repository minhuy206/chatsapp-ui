import React, { useState, useRef, useEffect } from 'react';
import type { ChatInputProps } from '@/types/chat.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, Mic, Square, Zap, Crown } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="relative space-y-3">
      <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
        {/* Arena Battle Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Battle Command</span>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs px-2 py-0">
              <Zap className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-end space-x-3 p-4">
          {/* Attachment Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleFileUpload}
            disabled={disabled}
            className="flex-shrink-0 h-10 w-10 p-0"
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
              className="block w-full resize-none border-0 bg-transparent px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-0 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 transition-colors"
              style={{
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            />
          </div>

          {/* Voice Recording Button */}
          <Button
            type="button"
            variant={isRecording ? "destructive" : "ghost"}
            size="sm"
            onClick={toggleRecording}
            disabled={disabled}
            className="flex-shrink-0 h-10 w-10 p-0"
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
            size="sm"
            className={`flex-shrink-0 h-10 w-10 p-0 ${
              canSend
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : ''
            }`}
            title="Launch Battle"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Enhanced Character Count */}
        {message.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <Zap className="h-3 w-3" />
                <span>Enter to battle • Shift+Enter for new line</span>
              </div>
              <Badge
                variant={message.length > 4000 ? "destructive" : "secondary"}
                className="text-xs px-2 py-0"
              >
                {message.length}/4000
              </Badge>
            </div>
          </div>
        )}

        {/* Enhanced Recording Indicator */}
        {isRecording && (
          <div className="absolute inset-0 bg-red-50/90 dark:bg-red-900/30 backdrop-blur-sm border-2 border-red-300 dark:border-red-600 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="font-semibold">Recording Active</span>
              <Badge variant="destructive" className="text-xs">Click to stop</Badge>
            </div>
          </div>
        )}
      </Card>

      {/* Arena Instructions */}
      <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1">
          <Crown className="h-3 w-3 text-amber-500" />
          <span>AI Arena Mode</span>
        </div>
        <span>•</span>
        <span>Models compete for the best response</span>
        <span>•</span>
        <span>Verify important information</span>
      </div>
    </form>
  );
};
import React, { useState } from 'react';
import { useChatStore } from '@/stores/chat.store';
import type { Message } from '@/types/chat.types';
import { User, Bot, Copy, Check, MoreHorizontal } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  showModelBadge?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  showModelBadge = false,
}) => {
  const { availableModels } = useChatStore();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const model = message.model ? availableModels.find(m => m.id === message.model) : null;
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex items-start space-x-3 group ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gray-200 dark:bg-gray-600'
            : 'bg-blue-100 dark:bg-blue-900'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        {/* Model Badge */}
        {showModelBadge && model && !isUser && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {model.name}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative ${isUser ? 'ml-auto' : ''} max-w-3xl`}>
          <div
            className={`rounded-lg p-3 shadow-sm border ${
              isUser
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700'
            }`}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            {/* Message Content */}
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>

            {/* Message Actions */}
            {showMenu && (
              <div className={`absolute top-2 ${isUser ? 'left-2' : 'right-2'} flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 p-1`}>
                <button
                  onClick={handleCopy}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>

                <button
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
                  title="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Metadata */}
        <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400 ${
          isUser ? 'justify-end' : ''
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {message.isStreaming && (
            <>
              <span>•</span>
              <span className="text-green-500">Streaming</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
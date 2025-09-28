import React from 'react';
import { useChatStore } from '@/stores/chat.store';
import { MessageList } from './MessageList';
import { StreamingIndicator } from './StreamingIndicator';
import type { ChatColumnProps } from '@/types/chat.types';
import { Bot, Zap, AlertCircle } from 'lucide-react';

export const ChatColumn: React.FC<ChatColumnProps> = ({
  modelId,
  className = '',
}) => {
  const {
    availableModels,
    stopStreaming,
    conversations,
    activeConversationId,
    streamingStates
  } = useChatStore();

  const conversation = activeConversationId
    ? conversations.find(c => c.id === activeConversationId)
    : null;

  const streamingState = streamingStates[modelId] || {
    isStreaming: false,
    status: 'disconnected' as const,
    currentMessage: '',
  };

  const model = availableModels.find(m => m.id === modelId);

  if (!model) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Model not found</p>
        </div>
      </div>
    );
  }

  // Filter messages for this specific model or user messages
  const relevantMessages = conversation?.messages.filter(
    msg => msg.role === 'user' || msg.modelId === modelId || msg.model === modelId
  ) || [];

  const handleStopStreaming = () => {
    stopStreaming(modelId);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{model.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{model.provider}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className={`w-2 h-2 rounded-full ${
            streamingState.status === 'connected' || streamingState.status === 'generating'
              ? 'bg-green-500'
              : streamingState.status === 'connecting'
              ? 'bg-yellow-500'
              : streamingState.status === 'error'
              ? 'bg-red-500'
              : 'bg-gray-300'
          }`} />

          {/* Performance indicator */}
          {streamingState.isStreaming && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Zap className="h-3 w-3" />
              <span>Streaming</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={relevantMessages}
          modelId={modelId}
          isStreaming={streamingState.isStreaming}
          streamingContent={streamingState.currentMessage}
        />
      </div>

      {/* Streaming Status */}
      {streamingState.isStreaming && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <StreamingIndicator
            status={streamingState.status}
            model={model.name}
            className="mb-2"
          />

          <button
            onClick={handleStopStreaming}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Stop generating
          </button>
        </div>
      )}

      {/* Error State */}
      {streamingState.status === 'error' && streamingState.error && (
        <div className="border-t border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Error</span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {streamingState.error}
          </p>
        </div>
      )}

      {/* Model Info Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{model.description}</span>
          <span>{relevantMessages.filter(m => m.role === 'assistant').length} responses</span>
        </div>
      </div>
    </div>
  );
};
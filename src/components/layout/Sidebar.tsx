import React, { useState } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { ModelSelector } from '@/components/models/ModelSelector';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
  History,
  Bot,
  Settings,
  Trash2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    conversations,
    activeConversationId,
    availableModels,
    selectedModels,
    setActiveConversation,
    createConversation,
    toggleModel,
  } = useChatStore();

  const handleNewConversation = () => {
    if (selectedModels.length > 0) {
      createConversation(selectedModels);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="mt-6 space-y-2">
          <button
            onClick={handleNewConversation}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="New Conversation"
          >
            <Plus className="h-5 w-5" />
          </button>

          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="History"
          >
            <History className="h-5 w-5" />
          </button>

          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Models"
          >
            <Bot className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* New Conversation Button */}
        <button
          onClick={handleNewConversation}
          disabled={selectedModels.length === 0}
          className="w-full mt-3 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </button>
      </div>

      {/* Model Selection */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <Bot className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">AI Models</h3>
        </div>

        <ModelSelector
          availableModels={availableModels}
          selectedModels={selectedModels}
          onModelToggle={toggleModel}
          maxModels={3}
        />
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <History className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Recent Chats</h3>
          </div>

          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No conversations yet
              </div>
            ) : (
              conversations
                .slice()
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversationId === conversation.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.title}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{conversation.messages.length} messages</span>
                        <span>•</span>
                        <span>{conversation.models.length} models</span>
                      </div>

                      {conversation.messages.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.messages[conversation.messages.length - 1].content}
                        </p>
                      )}
                    </div>

                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement delete conversation
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </button>
      </div>
    </div>
  );
};
import React from 'react';
import { useChatStore, useActiveConversation } from '@/stores/chat.store';
import { MessageSquare, Settings, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const { selectedModels, availableModels } = useChatStore();
  const activeConversation = useActiveConversation();
  const selectedModelData = availableModels.filter(model => selectedModels.includes(model.id));

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and conversation info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              ChatApp AI
            </h1>
          </div>

          {activeConversation && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>•</span>
              <span>{activeConversation.title}</span>
              <span>•</span>
              <span>{activeConversation.messages.length} messages</span>
            </div>
          )}
        </div>

        {/* Center - Model indicators */}
        <div className="flex items-center space-x-2">
          {selectedModelData.map((model) => (
            <div
              key={model.id}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">{model.name}</span>
            </div>
          ))}

          {selectedModels.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No models selected
            </div>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2">
          {/* Performance indicator */}
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Zap className="h-4 w-4" />
            <span>Real-time</span>
          </div>

          {/* Settings */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
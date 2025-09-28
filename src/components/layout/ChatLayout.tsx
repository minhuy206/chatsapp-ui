import React from 'react';
import { useChatStore } from '@/stores/chat.store';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatColumn } from '@/components/chat/ChatColumn';
import { ChatInput } from '@/components/chat/ChatInput';
import { Settings, Plus } from 'lucide-react';

export const ChatLayout: React.FC = () => {
  const {
    activeConversationId,
    selectedModels,
    createConversation,
    addMessage,
    startStreaming,
  } = useChatStore();

  const { availableModels } = useChatStore();
  const selectedModelData = availableModels.filter(model => selectedModels.includes(model.id));

  // Note: Manual conversation creation to avoid infinite loops

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      // Create conversation if none exists
      let conversationId = activeConversationId;
      if (!conversationId && selectedModels.length > 0) {
        console.log('Creating new conversation...');
        conversationId = await createConversation(selectedModels);
        if (!conversationId) {
          console.error('Failed to create conversation');
          return;
        }
      }

      if (!conversationId) {
        console.error('No conversation ID available');
        return;
      }

      // Add user message
      console.log('Adding user message...');
      const messageId = await addMessage(conversationId, {
        content: content.trim(),
        role: 'user',
        conversationId,
      });

      if (!messageId) {
        console.error('Failed to add message');
        return;
      }

      // Start streaming for selected models
      if (selectedModels.length > 0) {
        console.log('Starting streaming for models:', selectedModels);
        startStreaming(conversationId, messageId, selectedModels);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewConversation = async () => {
    if (selectedModels.length > 0) {
      try {
        await createConversation(selectedModels);
      } catch (error) {
        console.error('Error creating new conversation:', error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {selectedModelData.length === 0 ? (
            // No models selected state
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No models selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Select one or more AI models to start chatting
                </p>
                <button
                  onClick={() => console.log('Open model selector')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Models
                </button>
              </div>
            </div>
          ) : (
            // Chat columns
            <div className="flex-1 grid gap-4 p-4" style={{
              gridTemplateColumns: `repeat(${Math.min(selectedModelData.length, 3)}, 1fr)`
            }}>
              {selectedModelData.map((model) => (
                <ChatColumn
                  key={model.id}
                  modelId={model.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat Input */}
        {selectedModelData.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto p-4">
              <ChatInput
                onSendMessage={handleSendMessage}
                placeholder={activeConversationId
                  ? `Message ${selectedModelData.length} model${selectedModelData.length > 1 ? 's' : ''}...`
                  : `Start a new conversation with ${selectedModelData.length} model${selectedModelData.length > 1 ? 's' : ''}...`
                }
              />
            </div>
          </div>
        )}

        {/* Floating New Conversation Button */}
        {selectedModels.length > 0 && (
          <button
            onClick={handleNewConversation}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="New Conversation"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};
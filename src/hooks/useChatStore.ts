import { useCallback } from 'react';
import { useChatStore as useStore } from '@/stores/chat.store';
import type { ModelConfig } from '@/types/chat.types';

/**
 * Enhanced hook for chat store with convenience methods
 */
export const useChatStore = () => {
  const store = useStore();

  // Send message to all selected models
  const sendMessageToModels = useCallback(async (content: string) => {
    const { activeConversationId, selectedModels, addMessage, startStreaming } = store;

    if (!activeConversationId || !content.trim() || selectedModels.length === 0) {
      return null;
    }

    // Add user message
    const messageId = await addMessage(activeConversationId, {
      content: content.trim(),
      role: 'user',
      conversationId: activeConversationId,
    });

    // Start streaming for all selected models
    await startStreaming(activeConversationId, messageId, selectedModels);

    return messageId;
  }, [store]);

  // Create conversation with selected models
  const createConversationWithModels = useCallback((title?: string) => {
    const { selectedModels, createConversation } = store;

    if (selectedModels.length === 0) {
      throw new Error('No models selected');
    }

    createConversation(selectedModels);

    // Update title if provided
    if (title && store.activeConversationId) {
      const conversation = store.conversations.find(c => c.id === store.activeConversationId);
      if (conversation) {
        conversation.title = title;
      }
    }
  }, [store]);

  // Get conversation by ID
  const getConversation = useCallback((id: string) => {
    return store.conversations.find(c => c.id === id);
  }, [store.conversations]);

  // Get model by ID
  const getModel = useCallback((id: string) => {
    return store.availableModels.find(m => m.id === id);
  }, [store.availableModels]);

  // Get selected model data
  const getSelectedModels = useCallback(() => {
    return store.availableModels.filter(model =>
      store.selectedModels.includes(model.id)
    );
  }, [store.availableModels, store.selectedModels]);

  // Update model configuration
  const updateModelConfiguration = useCallback((modelId: string, config: Partial<ModelConfig>) => {
    const model = getModel(modelId);
    if (model) {
      store.updateModelConfig(modelId, {
        ...model.config,
        ...config,
      });
    }
  }, [getModel, store]);

  // Get streaming status for all models
  const getStreamingStatus = useCallback(() => {
    return store.selectedModels.map(modelId => ({
      modelId,
      ...store.streamingStates[modelId],
    }));
  }, [store.selectedModels, store.streamingStates]);

  // Check if any model is streaming
  const isAnyModelStreaming = useCallback(() => {
    return Object.values(store.streamingStates).some(state => state?.isStreaming);
  }, [store.streamingStates]);

  // Stop all streaming
  const stopAllStreaming = useCallback(() => {
    Object.keys(store.streamingStates).forEach(modelId => {
      if (store.streamingStates[modelId]?.isStreaming) {
        store.stopStreaming(modelId);
      }
    });
  }, [store]);

  // Get conversation statistics
  const getConversationStats = useCallback((conversationId?: string) => {
    const targetId = conversationId || store.activeConversationId;
    const conversation = targetId ? getConversation(targetId) : null;

    if (!conversation) {
      return {
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        modelResponses: {},
        duration: 0,
      };
    }

    const userMessages = conversation.messages.filter(m => m.role === 'user');
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant');

    const modelResponses: Record<string, number> = {};
    assistantMessages.forEach(msg => {
      if (msg.model) {
        modelResponses[msg.model] = (modelResponses[msg.model] || 0) + 1;
      }
    });

    const duration = new Date().getTime() - new Date(conversation.createdAt).getTime();

    return {
      totalMessages: conversation.messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      modelResponses,
      duration,
    };
  }, [store.activeConversationId, getConversation]);

  // Clear conversation history
  const clearConversation = useCallback((conversationId?: string) => {
    const targetId = conversationId || store.activeConversationId;
    if (!targetId) return;

    const conversation = getConversation(targetId);
    if (conversation) {
      conversation.messages = [];
      conversation.updatedAt = new Date();
    }
  }, [store.activeConversationId, getConversation]);

  // Delete conversation
  const deleteConversation = useCallback((conversationId: string) => {
    const newConversations = store.conversations.filter(c => c.id !== conversationId);

    // This would typically be handled by the store's delete action
    // For now, we'll just log it as this is a convenience hook
    console.log('Delete conversation:', conversationId, 'New conversations length:', newConversations.length);
  }, [store]);

  return {
    // Original store methods and state
    ...store,

    // Enhanced convenience methods
    sendMessageToModels,
    createConversationWithModels,
    getConversation,
    getModel,
    getSelectedModels,
    updateModelConfiguration,
    getStreamingStatus,
    isAnyModelStreaming,
    stopAllStreaming,
    getConversationStats,
    clearConversation,
    deleteConversation,
  };
};
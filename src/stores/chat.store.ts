import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ChatStore,
  Conversation,
  Message,
  AIModel,
  StreamingState,
  WebSocketConnection,
  ModelConfig
} from '@/types/chat.types';
import { webSocketStreamingClient, initializeConversationStreaming } from '@/services/websocket.service';
import { ChatAPIService } from '@/services/api.service';

// Default available models
const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Latest GPT-4 model with improved capabilities',
    enabled: true,
    config: {
      temperature: 0.7,
      maxTokens: 4000,
    },
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Advanced reasoning and analysis capabilities',
    enabled: true,
    config: {
      temperature: 0.7,
      maxTokens: 4000,
    },
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Google\'s most capable AI model',
    enabled: true,
    config: {
      temperature: 0.7,
      maxTokens: 4000,
    },
  },
];

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    conversations: [],
    activeConversationId: null,
    selectedModels: ['gpt-4o', 'claude-3.5-sonnet'],
    availableModels: DEFAULT_MODELS,
    streamingStates: {},
    wsConnections: {},

    // Conversation management
    createConversation: async (models: string[]) => {
      try {
        console.log('Creating conversation with models:', models);

        // Create conversation in Rails backend
        const response = await ChatAPIService.createConversation({
          title: 'New Conversation',
          models
        });

        const conversation: Conversation = {
          id: response.id,
          title: response.title,
          messages: [],
          models: response.models,
          createdAt: new Date(response.created_at),
          updatedAt: new Date(response.updated_at),
        };

        set((state) => ({
          conversations: [...state.conversations, conversation],
          activeConversationId: response.id,
          selectedModels: models,
        }));

        // Initialize streaming states for selected models
        models.forEach(modelId => {
          get().updateStreamingState(modelId, {
            isStreaming: false,
            status: 'disconnected',
            currentMessage: '',
          });
        });

        console.log('Conversation created successfully:', conversation);
        return response.id;
      } catch (error) {
        console.error('Failed to create conversation:', error);
        // Fall back to local creation if API fails
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: 'New Conversation (Local)',
          messages: [],
          models,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          conversations: [...state.conversations, conversation],
          activeConversationId: id,
          selectedModels: models,
        }));

        return id;
      }
    },

    setActiveConversation: (id: string) => {
      const conversation = get().conversations.find(c => c.id === id);
      if (conversation) {
        set({
          activeConversationId: id,
          selectedModels: conversation.models,
        });
      }
    },

    addMessage: async (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
      try {
        console.log('Adding message to conversation:', { conversationId, message });

        // Create message in Rails backend
        const response = await ChatAPIService.createMessage(conversationId, {
          content: message.content,
          role: message.role
        });

        const newMessage: Message = {
          id: response.id,
          content: response.content,
          role: response.role,
          conversationId: response.conversation_id,
          timestamp: new Date(response.created_at),
          modelId: message.modelId,
          metadata: message.metadata,
        };

        set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));

        console.log('Message created successfully:', newMessage);
        return newMessage.id;
      } catch (error) {
        console.error('Failed to create message:', error);
        // Fall back to local creation if API fails
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));

        return newMessage.id;
      }
    },

    updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => {
      set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                updatedAt: new Date(),
              }
            : conv
        ),
      }));
    },

    // Model management
    addModel: (modelId: string) => {
      const state = get();
      if (!state.selectedModels.includes(modelId)) {
        set({
          selectedModels: [...state.selectedModels, modelId],
        });

        // Initialize streaming state
        get().updateStreamingState(modelId, {
          isStreaming: false,
          status: 'disconnected',
          currentMessage: '',
        });
      }
    },

    removeModel: (modelId: string) => {
      const state = get();

      // Disconnect WebSocket if connected
      get().disconnectWebSocket(modelId);

      set({
        selectedModels: state.selectedModels.filter(id => id !== modelId),
        streamingStates: Object.fromEntries(
          Object.entries(state.streamingStates).filter(([key]) => key !== modelId)
        ),
        wsConnections: Object.fromEntries(
          Object.entries(state.wsConnections).filter(([key]) => key !== modelId)
        ),
      });
    },

    toggleModel: (modelId: string) => {
      const state = get();
      if (state.selectedModels.includes(modelId)) {
        get().removeModel(modelId);
      } else {
        get().addModel(modelId);
      }
    },

    updateModelConfig: (modelId: string, config: ModelConfig) => {
      set((state) => ({
        availableModels: state.availableModels.map(model =>
          model.id === modelId
            ? { ...model, config: { ...model.config, ...config } }
            : model
        ),
      }));
    },

    // Streaming management
    startStreaming: async (conversationId: string, messageId: string, models: string[]) => {
      console.log('[Store] Starting streaming for:', { conversationId, messageId, models });

      // Convert string IDs to numbers for backend
      const conversationIdNum = parseInt(conversationId);
      const messageIdNum = parseInt(messageId);

      // Update streaming states to connecting
      models.forEach(modelId => {
        get().updateStreamingState(modelId, {
          isStreaming: true,
          status: 'connecting',
          currentMessage: '',
          messageId,
        });
      });

      try {
        // Initialize streaming with backend first
        const initResult = await initializeConversationStreaming(conversationIdNum, messageIdNum);

        if (!initResult.success) {
          console.error('[Store] Failed to initialize streaming:', initResult.error);
          models.forEach(modelId => {
            get().updateStreamingState(modelId, {
              isStreaming: false,
              status: 'error',
              error: initResult.error || 'Failed to initialize streaming',
            });
          });
          return;
        }

        console.log('[Store] Streaming initialized successfully:', initResult);

        // Connect WebSocket if not connected
        if (!webSocketStreamingClient.isConnected()) {
          webSocketStreamingClient.connect();
        }

        // For now, treat all models as one conversation stream
        // The backend handles multiple models internally
        const subscriptionKey = webSocketStreamingClient.subscribeToConversation(
          conversationIdNum,
          messageIdNum,
          {
            onConnected: () => {
              console.log('[Store] WebSocket connected');
              models.forEach(modelId => {
                get().updateStreamingState(modelId, { status: 'connected' });
              });
            },

            onStreamingConnected: (data) => {
              console.log('[Store] Streaming connection established:', data);
              models.forEach(modelId => {
                get().updateStreamingState(modelId, {
                  status: 'generating',
                  connectionId: data.connection_id,
                });
              });
            },

            onToken: (content) => {
              // Update all selected models with the streaming content
              models.forEach(modelId => {
                const currentState = get().streamingStates[modelId];
                if (currentState) {
                  get().updateStreamingState(modelId, {
                    currentMessage: currentState.currentMessage + content,
                  });
                }
              });
            },

            onComplete: (fullContent) => {
              console.log('[Store] Streaming complete:', fullContent);

              // Update all models as complete but keep the message for a moment
              models.forEach(modelId => {
                get().updateStreamingState(modelId, {
                  isStreaming: false,
                  status: 'complete',
                  currentMessage: fullContent, // Keep the content visible briefly
                });
              });

              // Add the completed assistant message to the conversation for each model
              if (fullContent) {
                models.forEach(modelId => {
                  const assistantMessage: Omit<Message, 'id' | 'timestamp'> = {
                    content: fullContent,
                    role: 'assistant',
                    conversationId: conversationId,
                    modelId: modelId, // Set for each model
                    model: modelId, // Also set the legacy field for compatibility
                    isStreaming: false,
                  };

                  // Add the message locally (don't call API again since backend already has it)
                  const newMessage: Message = {
                    ...assistantMessage,
                    id: `assistant_${modelId}_${Date.now()}`, // Unique ID per model
                    timestamp: new Date(),
                  };

                  set((state) => ({
                    conversations: state.conversations.map(conv =>
                      conv.id === conversationId
                        ? {
                            ...conv,
                            messages: [...conv.messages, newMessage],
                            updatedAt: new Date(),
                          }
                        : conv
                    ),
                  }));

                  console.log(`[Store] Assistant message added for ${modelId}:`, newMessage);
                });

                // Clear streaming messages after a short delay to ensure smooth transition
                setTimeout(() => {
                  models.forEach(modelId => {
                    get().updateStreamingState(modelId, {
                      currentMessage: '', // Clear streaming content now that permanent message exists
                    });
                  });
                }, 100); // 100ms delay
              }
            },

            onStatus: (status) => {
              models.forEach(modelId => {
                get().updateStreamingState(modelId, {
                  status: status as StreamingState['status']
                });
              });
            },

            onError: (error) => {
              console.error('[Store] Streaming error:', error);
              models.forEach(modelId => {
                get().updateStreamingState(modelId, {
                  isStreaming: false,
                  status: 'error',
                  error,
                });
              });
            },

            onDisconnected: () => {
              console.log('[Store] WebSocket disconnected');
              models.forEach(modelId => {
                get().updateStreamingState(modelId, {
                  isStreaming: false,
                  status: 'disconnected',
                });
              });
            },
          }
        );

        console.log('[Store] WebSocket subscription created:', subscriptionKey);

      } catch (error) {
        console.error('[Store] Failed to start streaming:', error);
        models.forEach(modelId => {
          get().updateStreamingState(modelId, {
            isStreaming: false,
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to start streaming',
          });
        });
      }
    },

    stopStreaming: (modelId: string) => {
      const state = get();
      const streamingState = state.streamingStates[modelId];

      if (streamingState?.messageId && state.activeConversationId) {
        const conversationIdNum = parseInt(state.activeConversationId);
        const messageIdNum = parseInt(streamingState.messageId);
        const subscriptionKey = `conversation_${conversationIdNum}_${messageIdNum}`;

        webSocketStreamingClient.unsubscribe(subscriptionKey);
      }

      get().updateStreamingState(modelId, {
        isStreaming: false,
        status: 'disconnected',
      });
    },

    updateStreamingState: (modelId: string, updates: Partial<StreamingState>) => {
      set((state) => ({
        streamingStates: {
          ...state.streamingStates,
          [modelId]: {
            ...state.streamingStates[modelId],
            ...updates,
          },
        },
      }));
    },

    // WebSocket management
    connectWebSocket: async (modelId: string) => {
      try {
        if (!webSocketStreamingClient.isConnected()) {
          webSocketStreamingClient.connect();
        }

        const connection: WebSocketConnection = {
          url: 'ws://localhost:3200/cable', // Default URL
          cable: webSocketStreamingClient,
          subscription: null,
          connected: true,
          reconnectAttempts: 0,
          lastConnected: new Date(),
        };

        set((state) => ({
          wsConnections: {
            ...state.wsConnections,
            [modelId]: connection,
          },
        }));

        get().updateStreamingState(modelId, { status: 'connected' });
      } catch (error) {
        console.error(`Failed to connect WebSocket for model ${modelId}:`, error);
        get().updateStreamingState(modelId, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    },

    disconnectWebSocket: (modelId: string) => {
      const state = get();
      const connection = state.wsConnections[modelId];

      if (connection) {
        // Stop any active streaming
        get().stopStreaming(modelId);

        set((state) => ({
          wsConnections: Object.fromEntries(
            Object.entries(state.wsConnections).filter(([key]) => key !== modelId)
          ),
        }));
      }

      get().updateStreamingState(modelId, { status: 'disconnected' });
    },

    reconnectWebSocket: async (modelId: string) => {
      const state = get();
      const connection = state.wsConnections[modelId];

      if (connection) {
        connection.reconnectAttempts += 1;
        get().disconnectWebSocket(modelId);

        // Wait before reconnecting
        await new Promise(resolve => setTimeout(resolve, 1000 * connection.reconnectAttempts));

        await get().connectWebSocket(modelId);
      }
    },
  }))
);

// Selector hooks for common use cases
export const useActiveConversation = () => {
  return useChatStore((state) => {
    const activeId = state.activeConversationId;
    return activeId ? state.conversations.find(c => c.id === activeId) : null;
  });
};

export const useStreamingState = (modelId: string) => {
  return useChatStore((state) => state.streamingStates[modelId] || {
    isStreaming: false,
    status: 'disconnected',
    currentMessage: '',
  });
};

export const useSelectedModels = () => {
  return useChatStore((state) => {
    const selectedIds = state.selectedModels;
    return state.availableModels.filter(model => selectedIds.includes(model.id));
  });
};
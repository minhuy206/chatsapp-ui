import { useCallback, useRef, useEffect } from 'react';
import { useChatStore, useStreamingState } from '@/stores/chat.store';
import { startConversationStreaming } from '@/services/websocket.service';

interface UseStreamingMessageOptions {
  modelId: string;
  conversationId: string;
  onTokenReceived?: (token: string) => void;
  onMessageComplete?: (fullMessage: string) => void;
  onError?: (error: string) => void;
}

export const useStreamingMessage = ({
  modelId,
  conversationId,
  onTokenReceived,
  onMessageComplete,
  onError,
}: UseStreamingMessageOptions) => {
  const {
    addMessage,
    updateMessage,
    updateStreamingState,
    stopStreaming,
  } = useChatStore();

  const streamingState = useStreamingState(modelId);
  const messageRef = useRef<string | null>(null);
  const tokenBufferRef = useRef<string>('');
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start streaming for a specific message
  const startStreaming = useCallback(async (messageId: string) => {
    try {
      updateStreamingState(modelId, {
        isStreaming: true,
        status: 'connecting',
        currentMessage: '',
        messageId,
      });

      // Clear any existing state
      tokenBufferRef.current = '';
      messageRef.current = null;

      await startConversationStreaming(conversationId, messageId, {
        onConnected: () => {
          updateStreamingState(modelId, { status: 'connected' });
        },

        onStreamingConnected: (data) => {
          updateStreamingState(modelId, {
            status: 'generating',
            connectionId: data.connection_id,
          });
        },

        onToken: (content) => {
          // Add token to buffer
          tokenBufferRef.current += content;

          // Update streaming state immediately for real-time display
          updateStreamingState(modelId, {
            currentMessage: streamingState.currentMessage + content,
          });

          // Call external callback
          onTokenReceived?.(content);

          // Debounced flush to avoid too many UI updates
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current);
          }

          flushTimerRef.current = setTimeout(() => {
            flushTokenBuffer();
          }, 100); // 100ms debounce
        },

        onComplete: (fullContent) => {
          // Clear any pending flush
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current);
            flushTimerRef.current = null;
          }

          // Update the actual message in the store
          if (messageRef.current) {
            updateMessage(conversationId, messageRef.current, {
              content: fullContent,
              isStreaming: false,
            });
          } else {
            // Create new message if it doesn't exist
            addMessage(conversationId, {
              content: fullContent,
              role: 'assistant',
              model: modelId,
              conversationId,
              isStreaming: false,
            });
            messageRef.current = null;
          }

          // Update streaming state
          updateStreamingState(modelId, {
            isStreaming: false,
            status: 'complete',
            currentMessage: fullContent,
          });

          // Call external callback
          onMessageComplete?.(fullContent);

          // Clear references
          tokenBufferRef.current = '';
          messageRef.current = null;
        },

        onStatus: (status) => {
          updateStreamingState(modelId, {
            status: status as any,
          });
        },

        onError: (error) => {
          // Clear any pending operations
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current);
            flushTimerRef.current = null;
          }

          updateStreamingState(modelId, {
            isStreaming: false,
            status: 'error',
            error,
          });

          // Call external callback
          onError?.(error);

          // Clear references
          tokenBufferRef.current = '';
          messageRef.current = null;
        },

        onDisconnected: () => {
          if (streamingState.isStreaming) {
            updateStreamingState(modelId, {
              isStreaming: false,
              status: 'disconnected',
            });
          }
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start streaming';

      updateStreamingState(modelId, {
        isStreaming: false,
        status: 'error',
        error: errorMessage,
      });

      onError?.(errorMessage);
    }
  }, [
    modelId,
    conversationId,
    updateStreamingState,
    addMessage,
    updateMessage,
    streamingState.currentMessage,
    onTokenReceived,
    onMessageComplete,
    onError,
  ]);

  // Flush token buffer to create/update message
  const flushTokenBuffer = useCallback(() => {
    if (tokenBufferRef.current) {
      tokenBufferRef.current = '';

      if (messageRef.current) {
        // Update existing message
        updateMessage(conversationId, messageRef.current, {
          content: streamingState.currentMessage,
          isStreaming: true,
        });
      } else {
        // Create new streaming message
        addMessage(conversationId, {
          content: streamingState.currentMessage,
          role: 'assistant',
          model: modelId,
          conversationId,
          isStreaming: true,
        });
        messageRef.current = null;
      }
    }
  }, [conversationId, modelId, streamingState.currentMessage, addMessage, updateMessage]);

  // Stop streaming
  const handleStopStreaming = useCallback(() => {
    // Clear any pending flush
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    // Flush any remaining tokens
    if (tokenBufferRef.current || streamingState.currentMessage) {
      flushTokenBuffer();
    }

    // Stop the streaming
    stopStreaming(modelId);

    // Clear references
    tokenBufferRef.current = '';
    messageRef.current = null;
  }, [modelId, stopStreaming, flushTokenBuffer, streamingState.currentMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, []);

  return {
    startStreaming,
    stopStreaming: handleStopStreaming,
    isStreaming: streamingState.isStreaming,
    status: streamingState.status,
    currentMessage: streamingState.currentMessage,
    error: streamingState.error,
  };
};
import { useEffect, useCallback, useRef } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { webSocketClient } from '@/services/websocket.service';

export const useWebSocketConnection = () => {
  const {
    selectedModels,
    wsConnections,
    connectWebSocket,
    disconnectWebSocket,
    reconnectWebSocket,
  } = useChatStore();

  const reconnectTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Connect WebSocket for all selected models
  const connectAll = useCallback(async () => {
    if (!webSocketClient.isConnected()) {
      webSocketClient.connect();
    }

    for (const modelId of selectedModels) {
      if (!wsConnections[modelId]?.connected) {
        await connectWebSocket(modelId);
      }
    }
  }, [selectedModels, wsConnections, connectWebSocket]);

  // Disconnect WebSocket for a specific model
  const disconnect = useCallback((modelId: string) => {
    disconnectWebSocket(modelId);

    // Clear any pending reconnection timer
    const timer = reconnectTimers.current.get(modelId);
    if (timer) {
      clearTimeout(timer);
      reconnectTimers.current.delete(modelId);
    }
  }, [disconnectWebSocket]);

  // Disconnect all WebSocket connections
  const disconnectAll = useCallback(() => {
    selectedModels.forEach(modelId => {
      disconnect(modelId);
    });

    webSocketClient.disconnect();
  }, [selectedModels, disconnect]);

  // Reconnect with exponential backoff
  const reconnectWithBackoff = useCallback(async (modelId: string, attempt: number = 1) => {
    const maxAttempts = 5;
    const baseDelay = 1000;

    if (attempt > maxAttempts) {
      console.error(`Max reconnection attempts reached for model ${modelId}`);
      return;
    }

    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000); // Cap at 30 seconds

    const timer = setTimeout(async () => {
      try {
        await reconnectWebSocket(modelId);
        reconnectTimers.current.delete(modelId);
      } catch (error) {
        console.error(`Reconnection attempt ${attempt} failed for model ${modelId}:`, error);
        reconnectWithBackoff(modelId, attempt + 1);
      }
    }, delay);

    reconnectTimers.current.set(modelId, timer);
  }, [reconnectWebSocket]);

  // Check connection health
  const checkConnectionHealth = useCallback(() => {
    return selectedModels.every(modelId => {
      const connection = wsConnections[modelId];
      return connection && connection.connected;
    });
  }, [selectedModels, wsConnections]);

  // Get connection status for a specific model
  const getConnectionStatus = useCallback((modelId: string) => {
    const connection = wsConnections[modelId];
    if (!connection) return 'disconnected';
    return connection.connected ? 'connected' : 'disconnected';
  }, [wsConnections]);

  // Auto-connect when selected models change
  useEffect(() => {
    if (selectedModels.length > 0) {
      connectAll().catch(error => {
        console.error('Failed to connect WebSocket:', error);
      });
    }

    return () => {
      // Cleanup timers on unmount
      reconnectTimers.current.forEach(timer => clearTimeout(timer));
      reconnectTimers.current.clear();
    };
  }, [selectedModels, connectAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectAll();
    };
  }, [disconnectAll]);

  return {
    connectAll,
    disconnect,
    disconnectAll,
    reconnectWithBackoff,
    checkConnectionHealth,
    getConnectionStatus,
    isConnected: webSocketClient.isConnected(),
    activeConnections: Object.keys(wsConnections).filter(
      modelId => wsConnections[modelId]?.connected
    ),
  };
};
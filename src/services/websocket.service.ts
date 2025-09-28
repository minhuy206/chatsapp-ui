/**
 * WebSocket Streaming Service for Chatsapp API
 * Based on Rails ActionCable for real-time AI response streaming
 */
import { createConsumer, Consumer, Subscription } from '@rails/actioncable'

export interface WebSocketStreamingConfig {
  websocketUrl: string
  retryConfig?: {
    maxAttempts: number
    initialDelay: number
    maxDelay: number
  }
}

export interface StreamingCallbacks {
  onConnected?: () => void
  onDisconnected?: () => void
  onStreamingConnected?: (data: any) => void
  onToken?: (content: string, data?: any) => void
  onStatus?: (status: string, data?: any) => void
  onComplete?: (fullContent: string, data?: any) => void
  onError?: (error: string, data?: any) => void
}

export class ChatWebSocketClient {
  private websocketUrl: string
  private cable: Consumer | null = null
  private subscriptions: Map<string, Subscription> = new Map()
  private readonly retryConfig: Required<WebSocketStreamingConfig['retryConfig']>

  constructor(config: WebSocketStreamingConfig) {
    this.websocketUrl = config.websocketUrl
    this.retryConfig = {
      maxAttempts: config.retryConfig?.maxAttempts ?? 5,
      initialDelay: config.retryConfig?.initialDelay ?? 1000,
      maxDelay: config.retryConfig?.maxDelay ?? 30000,
      ...config.retryConfig
    }
    // Note: retryConfig stored for future retry implementation
  }

  connect(): void {
    if (this.cable) {
      console.warn('[WebSocket] Already connected')
      return
    }

    this.cable = createConsumer(this.websocketUrl)
    console.log('[WebSocket] Connected to:', this.websocketUrl)
  }

  /**
   * Subscribe to conversation streaming
   */
  subscribeToConversation(
    conversationId: number,
    messageId: number,
    callbacks: StreamingCallbacks = {}
  ): string {
    if (!this.cable) {
      throw new Error('[WebSocket] Must connect() before subscribing')
    }

    const subscriptionKey = `conversation_${conversationId}_${messageId}`

    // Unsubscribe if already exists
    this.unsubscribe(subscriptionKey)

    const subscription = this.cable.subscriptions.create(
      {
        channel: 'StreamingChannel',
        conversation_id: conversationId,
        message_id: messageId
      },
      {
        connected: () => {
          console.log('[WebSocket] Subscribed to StreamingChannel')
          callbacks.onConnected?.()
        },

        disconnected: () => {
          console.log('[WebSocket] Disconnected from StreamingChannel')
          callbacks.onDisconnected?.()
          this.subscriptions.delete(subscriptionKey)
        },

        rejected: () => {
          console.error(
            '[WebSocket] Subscription rejected - check authentication/parameters'
          )
          console.error(
            `[WebSocket] Failed for conversation_id: ${conversationId}, message_id: ${messageId}`
          )
          callbacks.onError?.('Subscription rejected', {})
          this.subscriptions.delete(subscriptionKey)
        },

        received: (data: any) => {
          console.log('[WebSocket] Received data:', data)
          this.handleStreamingData(data, callbacks)
        }
      }
    )

    this.subscriptions.set(subscriptionKey, subscription)
    console.log(`[WebSocket] Created subscription: ${subscriptionKey}`)

    return subscriptionKey
  }

  /**
   * Handle incoming streaming data based on type
   */
  private handleStreamingData(data: any, callbacks: StreamingCallbacks): void {
    // Handle nested data structure from ActionCable
    let streamData = data
    if (data.event && data.data) {
      try {
        streamData = JSON.parse(data.data)
      } catch (e) {
        console.warn('[WebSocket] Failed to parse nested data:', data)
        streamData = data
      }
    }

    switch (streamData.type) {
      case 'connected':
        console.log(
          '[WebSocket] Streaming connection established:',
          streamData.connection_id
        )
        callbacks.onStreamingConnected?.(streamData)
        break

      case 'token':
        console.log('[WebSocket] Token received:', streamData.content)
        callbacks.onToken?.(streamData.content, streamData)
        break

      case 'message_complete':
        console.log(
          '[WebSocket] Message complete:',
          streamData.content?.length,
          'characters'
        )
        callbacks.onComplete?.(streamData.content, streamData)
        break

      case 'status':
        console.log('[WebSocket] Status update:', streamData.status)
        callbacks.onStatus?.(streamData.status, streamData)
        break

      case 'error':
        console.error('[WebSocket] Streaming error:', streamData.message)
        callbacks.onError?.(streamData.message, streamData)
        break

      default:
        console.log(
          '[WebSocket] Unknown message type:',
          streamData.type,
          streamData
        )
        break
    }
  }

  /**
   * Unsubscribe from a specific subscription
   */
  unsubscribe(subscriptionKey: string): void {
    const subscription = this.subscriptions.get(subscriptionKey)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionKey)
      console.log(`[WebSocket] Unsubscribed from: ${subscriptionKey}`)
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe()
      console.log(`[WebSocket] Unsubscribed from: ${key}`)
    })
    this.subscriptions.clear()
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.unsubscribeAll()

    if (this.cable) {
      this.cable.disconnect()
      this.cable = null
      console.log('[WebSocket] Disconnected from WebSocket')
    }
  }

  /**
   * Check if connected to WebSocket
   */
  isConnected(): boolean {
    return this.cable !== null
  }

  /**
   * Get number of active subscriptions
   */
  getActiveSubscriptionCount(): number {
    return this.subscriptions.size
  }

  /**
   * Get retry configuration
   */
  getRetryConfig(): Required<WebSocketStreamingConfig['retryConfig']> {
    return this.retryConfig
  }
}

/**
 * Default WebSocket streaming client instance
 */
export const webSocketStreamingClient = new ChatWebSocketClient({
  websocketUrl: 'ws://localhost:3200/cable',
  retryConfig: {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000
  }
})

/**
 * Initialize streaming for a conversation
 * This function handles the WebSocket streaming initiation API call
 */
export async function initializeConversationStreaming(
  conversationId: number,
  messageId: number
): Promise<{
  success: boolean
  connectionId?: string
  streamName?: string
  error?: string
}> {
  try {
    const apiBaseUrl = 'http://localhost:3200'
    const response = await fetch(
      `${apiBaseUrl}/api/v1/conversations/${conversationId}/stream?message_id=${messageId}&transport=websocket`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      console.log('[WebSocket] Streaming initiated:', data)
      return {
        success: true,
        connectionId: data.connection_id,
        streamName: data.stream_name
      }
    } else {
      const errorText = await response.text()
      console.error(
        '[WebSocket] Failed to initiate streaming:',
        response.status,
        errorText
      )
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      }
    }
  } catch (error) {
    console.error('[WebSocket] Error initiating streaming:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Legacy compatibility exports
export const webSocketClient = webSocketStreamingClient

// Helper function to start streaming for a conversation (legacy compatibility)
export async function startConversationStreaming(
  conversationId: string,
  messageId: string,
  callbacks: StreamingCallbacks
): Promise<void> {
  const conversationIdNum = parseInt(conversationId)
  const messageIdNum = parseInt(messageId)

  try {
    // Initialize streaming
    const initResponse = await initializeConversationStreaming(
      conversationIdNum,
      messageIdNum
    )

    if (!initResponse.success) {
      throw new Error(initResponse.error || 'Failed to initialize streaming')
    }

    // Connect if not already connected
    if (!webSocketStreamingClient.isConnected()) {
      webSocketStreamingClient.connect()
    }

    // Subscribe to streaming
    webSocketStreamingClient.subscribeToConversation(
      conversationIdNum,
      messageIdNum,
      callbacks
    )
  } catch (error) {
    console.error('Failed to start conversation streaming:', error)
    callbacks.onError?.(
      error instanceof Error ? error.message : 'Failed to start streaming',
      {}
    )
  }
}

export default ChatWebSocketClient

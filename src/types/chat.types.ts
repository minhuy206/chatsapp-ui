export interface Message {
  id: string; // Keep as string for frontend compatibility
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
  modelId?: string;
  conversationId: string;
  conversation_id?: number; // Backend compatibility
  isStreaming?: boolean;
  // Backend fields
  created_at?: string;
  updated_at?: string;
  model_a_response?: string;
  model_b_response?: string;
  comparison_vote?: number;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  responseTime?: number;
  finishReason?: string;
}

export interface StreamingMessage {
  type: 'connected' | 'token' | 'message_complete' | 'status' | 'error';
  content?: string;
  model?: string;
  message_id?: string;
  connection_id?: string;
  conversation_id?: string;
  status?: 'connecting' | 'generating' | 'complete';
  timestamp?: string;
  message?: string; // for error messages
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  enabled: boolean;
  config?: ModelConfig;
}

export interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  models: string[]; // Array of model IDs participating in this conversation
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedModels: string[];
  availableModels: AIModel[];
  streamingStates: Record<string, StreamingState>; // model_id -> streaming state
  wsConnections: Record<string, WebSocketConnection>; // model_id -> connection
}

export interface StreamingState {
  isStreaming: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'generating' | 'complete' | 'error';
  currentMessage: string;
  messageId?: string;
  connectionId?: string;
  error?: string;
}

export interface WebSocketConnection {
  url: string;
  cable: any; // ActionCable connection
  subscription: any; // ActionCable subscription
  connected: boolean;
  reconnectAttempts: number;
  lastConnected?: Date;
}

export interface ChatActions {
  // Conversation management
  createConversation: (models: string[]) => Promise<string>;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => Promise<string>;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;

  // Model management
  addModel: (modelId: string) => void;
  removeModel: (modelId: string) => void;
  toggleModel: (modelId: string) => void;
  updateModelConfig: (modelId: string, config: ModelConfig) => void;

  // Streaming management
  startStreaming: (conversationId: string, messageId: string, models: string[]) => void;
  stopStreaming: (modelId: string) => void;
  updateStreamingState: (modelId: string, state: Partial<StreamingState>) => void;

  // WebSocket management
  connectWebSocket: (modelId: string) => void;
  disconnectWebSocket: (modelId: string) => void;
  reconnectWebSocket: (modelId: string) => void;
}

export type ChatStore = ChatState & ChatActions;

// WebSocket message types based on the API guide
export interface WSInitResponse {
  status: 'websocket_initiated';
  connection_id: string;
  websocket_url: string;
  channel: string;
  message: string;
  stream_name: string;
}

export interface WSInfoResponse {
  websocket_url: string;
  channel: string;
  message: string;
  example: {
    javascript: string;
  };
}

// UI Component props
export interface ChatColumnProps {
  modelId: string;
  className?: string;
}

export interface MessageListProps {
  messages: Message[];
  modelId?: string;
  isStreaming?: boolean;
  streamingContent?: string;
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ModelSelectorProps {
  availableModels: AIModel[];
  selectedModels: string[];
  onModelToggle: (modelId: string) => void;
  maxModels?: number;
}

export interface StreamingIndicatorProps {
  status: StreamingState['status'];
  model?: string;
  className?: string;
}
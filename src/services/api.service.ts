const API_BASE_URL = 'https://api-chatsapp.minhuy.dev';

export class APIError extends Error {
  public status: number;
  public errors?: string[];

  constructor(
    message: string,
    status: number,
    errors?: string[]
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.errors = errors;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.errors
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error', 0);
  }
}

// Conversations API
export const conversationsAPI = {
  // GET /api/v1/conversations
  list: () =>
    apiRequest<{
      conversations: Array<{
        id: number;
        title: string;
        ai_model: string;
        comparison_mode: boolean;
        model_a?: string;
        model_b?: string;
        created_at: string;
        updated_at: string;
      }>;
      ai_models: string[];
    }>('/api/v1/conversations'),

  // POST /api/v1/conversations
  create: (data: { title: string; ai_model: string }) =>
    apiRequest<{
      conversation: {
        id: number;
        title: string;
        ai_model: string;
        comparison_mode: boolean;
        model_a?: string;
        model_b?: string;
        created_at: string;
        updated_at: string;
      };
      message: string;
    }>('/api/v1/conversations', {
      method: 'POST',
      body: JSON.stringify({ conversation: data }),
    }),

  // GET /conversations/{id}
  get: (id: string) =>
    apiRequest<{
      conversation: {
        id: number;
        title: string;
        ai_model: string;
        comparison_mode: boolean;
        model_a?: string;
        model_b?: string;
        created_at: string;
        updated_at: string;
      };
      messages: Array<{
        id: number;
        content: string;
        role: 'user' | 'assistant';
        conversation_id: number;
        model_a_response?: string;
        model_b_response?: string;
        comparison_vote?: number;
        created_at: string;
        updated_at: string;
      }>;
    }>(`/conversations/${id}`),
};

// Messages API
export const messagesAPI = {
  // POST /conversations/{conversation_id}/messages
  create: (conversationId: string, content: string) =>
    apiRequest<{
      message: {
        id: number;
        content: string;
        role: 'user' | 'assistant';
        conversation_id: number;
        model_a_response?: string;
        model_b_response?: string;
        comparison_vote?: number;
        created_at: string;
        updated_at: string;
      };
      conversation: {
        id: number;
        title: string;
        ai_model: string;
        comparison_mode: boolean;
        model_a?: string;
        model_b?: string;
        created_at: string;
        updated_at: string;
      };
      status: 'processing';
    }>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: { content } }),
    }),
};

// Legacy ChatAPIService for compatibility
export const ChatAPIService = {
  async createConversation(data: { title: string; models: string[] }) {
    // Use the first model as primary for Rails backend
    const primaryModel = data.models[0] || 'gpt-4o';
    const result = await conversationsAPI.create({
      title: data.title,
      ai_model: primaryModel
    });

    return {
      id: result.conversation.id.toString(),
      title: result.conversation.title,
      models: data.models, // Keep the original models array
      created_at: result.conversation.created_at,
      updated_at: result.conversation.updated_at,
    };
  },

  async createMessage(conversationId: string, data: { content: string; role: 'user' | 'assistant' }) {
    const result = await messagesAPI.create(conversationId, data.content);

    return {
      id: result.message.id.toString(),
      content: result.message.content,
      role: result.message.role,
      conversation_id: result.message.conversation_id.toString(),
      created_at: result.message.created_at,
      updated_at: result.message.updated_at,
    };
  }
};
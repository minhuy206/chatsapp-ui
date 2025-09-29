import React, { useState, useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare,
  Settings,
  MoreVertical,
  Plus,
  Zap,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const SingleThreadChat: React.FC = () => {
  const {
    availableModels,
    activeConversationId,
    createConversation,
    addMessage,
    startStreaming,
    streamingStates,
    conversations,
  } = useChatStore();

  // Start with the first available model
  const [selectedModelId, setSelectedModelId] = useState(
    availableModels.find(m => m.enabled)?.id || ''
  );

  const conversation = activeConversationId
    ? conversations.find(c => c.id === activeConversationId)
    : null;

  const selectedModel = availableModels.find(m => m.id === selectedModelId);
  const streamingState = streamingStates[selectedModelId];

  // Filter messages to show user messages and messages from the currently selected model
  const relevantMessages = conversation?.messages.filter(
    msg => msg.role === 'user' || msg.modelId === selectedModelId || msg.model === selectedModelId
  ) || [];

  useEffect(() => {
    // If no conversation exists, create one with the selected model
    if (!activeConversationId && selectedModelId) {
      createConversation([selectedModelId]);
    }
  }, [selectedModelId, activeConversationId, createConversation]);

  const handleModelChange = async (newModelId: string) => {
    setSelectedModelId(newModelId);

    // If there's an active conversation, update it to include the new model
    if (activeConversationId) {
      // For now, we'll keep the same conversation but switch the active model
      // In a more sophisticated implementation, you might want to create a new conversation
      // or maintain separate conversation threads per model
    } else {
      // Create a new conversation with the selected model
      await createConversation([newModelId]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedModelId) return;

    try {
      // Create conversation if none exists
      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = await createConversation([selectedModelId]);
        if (!conversationId) {
          console.error('Failed to create conversation');
          return;
        }
      }

      // Add user message
      const messageId = await addMessage(conversationId, {
        content: content.trim(),
        role: 'user',
        conversationId,
      });

      if (!messageId) {
        console.error('Failed to add message');
        return;
      }

      // Start streaming for the selected model
      startStreaming(conversationId, messageId, [selectedModelId]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewConversation = async () => {
    if (selectedModelId) {
      try {
        await createConversation([selectedModelId]);
      } catch (error) {
        console.error('Error creating new conversation:', error);
      }
    }
  };

  if (!selectedModel) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No Models Available</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Please configure at least one AI model to start chatting.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header with Model Selector */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  ChatApp
                </h1>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Single Thread Chat</span>
                  {conversation && (
                    <>
                      <span>•</span>
                      <span>{relevantMessages.filter(m => m.role === 'user').length} messages</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-xs">
              <ModelSelector
                selectedModelId={selectedModelId}
                onModelChange={handleModelChange}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleNewConversation}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNewConversation}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Model Status Bar */}
        {streamingState && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    streamingState.status === 'connected' || streamingState.status === 'generating'
                      ? 'bg-emerald-500'
                      : streamingState.status === 'connecting'
                      ? 'bg-amber-500'
                      : streamingState.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-slate-300'
                  }`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {streamingState.status === 'generating' ? 'Generating...' : streamingState.status}
                  </span>
                </div>

                {streamingState.isStreaming && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="h-3 w-3 mr-1 animate-pulse" />
                    Active
                  </Badge>
                )}
              </div>

              {streamingState.error && (
                <div className="text-xs text-red-600 dark:text-red-400">
                  {streamingState.error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {relevantMessages.length === 0 && !streamingState?.isStreaming ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Start a conversation
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Send a message to <span className="font-medium">{selectedModel.name}</span> to begin your conversation.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">
                  {selectedModel.provider}
                </Badge>
                <Badge variant="outline">
                  {selectedModel.config?.temperature ? `temp: ${selectedModel.config.temperature}` : 'default settings'}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <MessageList
            messages={relevantMessages}
            modelId={selectedModelId}
            isStreaming={streamingState?.isStreaming || false}
            streamingContent={streamingState?.currentMessage || ''}
          />
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="p-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            placeholder={`Message ${selectedModel.name}...`}
            disabled={streamingState?.isStreaming}
          />

          <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-4">
              <span>Chatting with {selectedModel.name}</span>
              <span>•</span>
              <span className="capitalize">{streamingState?.status || 'ready'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Powered by {selectedModel.provider}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
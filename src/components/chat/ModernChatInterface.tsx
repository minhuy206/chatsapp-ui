import React, { useState, useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { ModernMessageList } from './ModernMessageList';
import { ModernChatInput } from './ModernChatInput';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Settings,
  MoreVertical,
  Plus,
  Zap,
  Sparkles,
  Brain
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ModernChatInterface: React.FC = () => {
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'OpenAI': return '🤖';
      case 'Anthropic': return '🧠';
      case 'Google': return '🔍';
      default: return '⚡';
    }
  };

  const getStatusColor = (modelId: string) => {
    const status = streamingStates[modelId]?.status;
    switch (status) {
      case 'connected':
      case 'generating':
        return 'text-emerald-500';
      case 'connecting':
        return 'text-amber-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusDot = (modelId: string) => {
    const status = streamingStates[modelId]?.status;
    switch (status) {
      case 'connected':
      case 'generating':
        return 'bg-emerald-500';
      case 'connecting':
        return 'bg-amber-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-slate-300';
    }
  };

  if (!selectedModel) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Models Available
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Please configure at least one AI model to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/50">
      {/* Modern Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4 flex-1">
            {/* Model Selector */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-lg">
                  {getProviderIcon(selectedModel.provider)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {selectedModel.name}
                </h1>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge variant="outline" className="px-2 py-0.5 text-[10px] border-slate-200 dark:border-slate-700">
                    {selectedModel.provider}
                  </Badge>
                  <div className={`flex items-center space-x-1.5 ${getStatusColor(selectedModelId)}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedModelId)}`} />
                    <span className="capitalize font-medium">
                      {streamingState?.status === 'generating' ? 'Thinking...' : streamingState?.status || 'ready'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Switcher */}
            <div className="flex-1 max-w-xs">
              <Select value={selectedModelId} onValueChange={handleModelChange}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.filter(model => model.enabled).map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getProviderIcon(model.provider)}</span>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-slate-500">{model.provider}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleNewConversation}
              variant="outline"
              size="sm"
              className="hidden sm:flex bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
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

        {/* Conversation Info */}
        {conversation && (
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{relevantMessages.filter(m => m.role === 'user').length} messages</span>
              </span>
              {streamingState?.isStreaming && (
                <Badge variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  <Zap className="h-3 w-3 mr-1 animate-pulse" />
                  Generating
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {relevantMessages.length === 0 && !streamingState?.isStreaming ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-lg">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-12 w-12 text-blue-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">{getProviderIcon(selectedModel.provider)}</span>
                </div>
              </div>

              <h3 className="text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
                Ready to chat with {selectedModel.name}?
              </h3>

              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                Start a conversation and experience the power of advanced AI. Ask questions, get creative, or just chat naturally.
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  {selectedModel.provider}
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  {selectedModel.config?.temperature ? `Temperature: ${selectedModel.config.temperature}` : 'Default settings'}
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  Ready to chat
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <ModernMessageList
            messages={relevantMessages}
            modelId={selectedModelId}
            isStreaming={streamingState?.isStreaming || false}
            streamingContent={streamingState?.currentMessage || ''}
          />
        )}
      </div>

      {/* Modern Input Area */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <ModernChatInput
              onSendMessage={handleSendMessage}
              placeholder={`Message ${selectedModel.name}...`}
              disabled={streamingState?.isStreaming}
            />

            <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <span className="font-medium">{selectedModel.name}</span>
                  <span>•</span>
                  <span className={`capitalize ${getStatusColor(selectedModelId)}`}>
                    {streamingState?.status === 'generating' ? 'thinking' : streamingState?.status || 'ready'}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Powered by {selectedModel.provider}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
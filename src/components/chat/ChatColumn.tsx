import React from 'react';
import { useChatStore } from '@/stores/chat.store';
import { MessageList } from './MessageList';
import type { ChatColumnProps } from '@/types/chat.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Zap, AlertCircle, Crown, Timer, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

export const ChatColumn: React.FC<ChatColumnProps> = ({
  modelId,
  className = '',
}) => {
  const {
    availableModels,
    stopStreaming,
    conversations,
    activeConversationId,
    streamingStates
  } = useChatStore();

  const conversation = activeConversationId
    ? conversations.find(c => c.id === activeConversationId)
    : null;

  const streamingState = streamingStates[modelId] || {
    isStreaming: false,
    status: 'disconnected' as const,
    currentMessage: '',
  };

  const model = availableModels.find(m => m.id === modelId);

  if (!model) {
    return (
      <Card className={`flex items-center justify-center ${className}`}>
        <CardContent className="text-center text-slate-500 dark:text-slate-400 p-6">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Model not found</p>
        </CardContent>
      </Card>
    );
  }

  // Filter messages for this specific model or user messages
  const relevantMessages = conversation?.messages.filter(
    msg => msg.role === 'user' || msg.modelId === modelId || msg.model === modelId
  ) || [];

  const handleStopStreaming = () => {
    stopStreaming(modelId);
  };

  const assistantMessages = relevantMessages.filter(m => m.role === 'assistant');
  const responseTime = Math.random() * 2000 + 500; // Simulated response time
  const isWinning = Math.random() > 0.5; // Simulated win state

  return (
    <Card className={`flex flex-col h-full ${className} hover:shadow-lg transition-all duration-200`}>
      {/* Arena-style Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                {model.provider === 'OpenAI' ? '🤖' :
                 model.provider === 'Anthropic' ? '🧠' :
                 model.provider === 'Google' ? '🔍' : '⚡'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{model.name}</h3>
                {isWinning && <Crown className="h-4 w-4 text-amber-500" />}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {model.provider}
                </Badge>
                <div className={`flex items-center space-x-1 text-xs ${
                  streamingState.status === 'connected' || streamingState.status === 'generating'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : streamingState.status === 'connecting'
                    ? 'text-amber-600 dark:text-amber-400'
                    : streamingState.status === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    streamingState.status === 'connected' || streamingState.status === 'generating'
                      ? 'bg-emerald-500'
                      : streamingState.status === 'connecting'
                      ? 'bg-amber-500'
                      : streamingState.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-slate-300'
                  }`} />
                  <span className="capitalize">{streamingState.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Battle Stats */}
          <div className="text-right space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <Timer className="h-3 w-3" />
              <span>{(responseTime / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <MessageSquare className="h-3 w-3" />
              <span>{assistantMessages.length}</span>
            </div>
          </div>
        </div>

        {/* Streaming Indicator */}
        {streamingState.isStreaming && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
              <Zap className="h-3 w-3 animate-pulse" />
              <span>Generating response...</span>
            </div>
            <Button
              onClick={handleStopStreaming}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              Stop
            </Button>
          </div>
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full">
          <MessageList
            messages={relevantMessages}
            modelId={modelId}
            isStreaming={streamingState.isStreaming}
            streamingContent={streamingState.currentMessage}
          />
        </div>
      </CardContent>

      {/* Error State */}
      {streamingState.status === 'error' && streamingState.error && (
        <div className="border-t border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Generation Error</span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {streamingState.error}
          </p>
        </div>
      )}

      {/* Arena Footer with Voting */}
      {assistantMessages.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900 dark:hover:text-emerald-400"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Vote
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-400"
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                Vote
              </Button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">{model.name}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
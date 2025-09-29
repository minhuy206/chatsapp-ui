import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import type { MessageListProps } from '@/types/chat.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Sparkles } from 'lucide-react';

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming = false,
  streamingContent = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
              <span className="text-xs">⚡</span>
            </div>
          </div>
          <p className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Ready for Battle</p>
          <p className="text-sm">Send your first message to begin the AI showdown</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div
        ref={containerRef}
        className="p-4 space-y-4"
      >
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            showModelBadge={message.role === 'assistant'}
          />
        ))}

        {/* Arena-style Streaming Message */}
        {isStreaming && streamingContent && (
          <div className="flex items-start space-x-3 animate-in fade-in duration-300">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900">
                <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="prose dark:prose-invert max-w-none prose-sm">
                  <div className="whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                    {streamingContent}
                    <span className="animate-pulse bg-gradient-to-r from-blue-500 to-purple-500 w-0.5 h-4 inline-block ml-1">|</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-medium">Generating...</span>
                </span>
                <span className="font-mono text-[10px]">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Loading indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex items-start space-x-3 animate-in fade-in duration-300">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900">
                <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Thinking...</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
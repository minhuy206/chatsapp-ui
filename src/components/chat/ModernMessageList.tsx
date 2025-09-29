import React, { useEffect, useRef } from 'react';
import { ModernMessageItem } from './ModernMessageItem';
import type { MessageListProps } from '@/types/chat.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export const ModernMessageList: React.FC<MessageListProps> = ({
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

  return (
    <ScrollArea className="flex-1 h-full">
      <div
        ref={containerRef}
        className="p-6 space-y-6 max-w-4xl mx-auto"
      >
        {messages.map((message) => (
          <ModernMessageItem
            key={message.id}
            message={message}
            showModelBadge={message.role === 'assistant'}
          />
        ))}

        {/* Modern Streaming Message */}
        {isStreaming && streamingContent && (
          <div className="flex items-start space-x-4 animate-in fade-in duration-300">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-sm">
                <div className="prose dark:prose-invert max-w-none prose-sm">
                  <div className="whitespace-pre-wrap text-slate-900 dark:text-slate-100 leading-relaxed">
                    {streamingContent}
                    <span className="animate-pulse bg-gradient-to-r from-blue-500 to-purple-500 w-0.5 h-5 inline-block ml-1 rounded-full">|</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-medium">Generating response...</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modern Loading indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex items-start space-x-4 animate-in fade-in duration-300">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800">
                <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-sm">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Thinking...
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Preparing response</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
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
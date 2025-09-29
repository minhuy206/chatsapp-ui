import React from 'react';
import type { Message } from '@/types/chat.types';

interface MessageItemProps {
  message: Message;
  showModelBadge?: boolean;
}
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal, User, Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ModernMessageItem: React.FC<MessageItemProps> = ({
  message,
  showModelBadge = false,
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const getProviderIcon = (modelId?: string) => {
    if (!modelId) return '🤖';
    if (modelId.includes('gpt')) return '🤖';
    if (modelId.includes('claude')) return '🧠';
    if (modelId.includes('gemini')) return '🔍';
    return '⚡';
  };

  return (
    <div className={`flex items-start space-x-4 group ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
            <span className="text-sm">{getProviderIcon(message.modelId || message.model)}</span>
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex-1 min-w-0 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`${isUser ? 'max-w-lg' : 'w-full'}`}>
          {/* Message Header */}
          <div className={`flex items-center space-x-2 mb-2 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && showModelBadge && message.modelId && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {message.modelId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </Badge>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* Message Content */}
          <div
            className={`rounded-2xl p-4 shadow-sm ${
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-12'
                : 'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            <div className={`prose max-w-none prose-sm ${
              isUser
                ? 'prose-invert'
                : 'dark:prose-invert prose-slate'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            </div>
          </div>

          {/* Message Actions */}
          {isAssistant && (
            <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-emerald-600 hover:text-emerald-700"
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Good
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-red-600 hover:text-red-700"
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Poor
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy message
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bot className="h-3 w-3 mr-2" />
                    Regenerate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
            <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
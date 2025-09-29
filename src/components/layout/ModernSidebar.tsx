import React, { useState } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Search,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ModernSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    availableModels,
  } = useChatStore();

  const handleNewConversation = async () => {
    // Default to first available model
    const defaultModelId = availableModels.find(m => m.enabled)?.id;
    if (defaultModelId) {
      await createConversation([defaultModelId]);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(msg =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center py-4 space-y-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewConversation}
          className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              ChatApp
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleNewConversation}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-xl h-11 font-medium transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recent
            </h3>
            {conversations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {conversations.length}
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 pb-4 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                </p>
                <p className="text-xs text-slate-400">
                  {searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
                </p>
              </div>
            ) : (
              filteredConversations
                .slice()
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      activeConversationId === conversation.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-700/50 shadow-sm'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 mt-0.5">
                        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-xs">
                          <MessageSquare className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {conversation.title}
                          </h4>
                          <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                            {formatTimeAgo(conversation.updatedAt)}
                          </span>
                        </div>

                        {conversation.messages.length > 0 && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {conversation.messages[conversation.messages.length - 1].content}
                          </p>
                        )}

                        <div className="mt-2 flex items-center space-x-3 text-xs text-slate-400">
                          <span>{conversation.messages.length} messages</span>
                          <span>•</span>
                          <span>{conversation.models.join(', ')}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        >
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
};
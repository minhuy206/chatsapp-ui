import React from 'react';
import { useChatStore } from '@/stores/chat.store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, Zap } from 'lucide-react';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onModelChange,
  className = '',
}) => {
  const { availableModels, streamingStates } = useChatStore();

  const selectedModel = availableModels.find(m => m.id === selectedModelId);

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
        return 'text-emerald-600 dark:text-emerald-400';
      case 'connecting':
        return 'text-amber-600 dark:text-amber-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <Select value={selectedModelId} onValueChange={onModelChange}>
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue>
          {selectedModel && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-xs">
                  {getProviderIcon(selectedModel.provider)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-medium">{selectedModel.name}</div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    {selectedModel.provider}
                  </Badge>
                  <div className={`flex items-center space-x-1 ${getStatusColor(selectedModelId)}`}>
                    <div className={`w-1 h-1 rounded-full ${
                      streamingStates[selectedModelId]?.status === 'connected' ||
                      streamingStates[selectedModelId]?.status === 'generating'
                        ? 'bg-emerald-500'
                        : streamingStates[selectedModelId]?.status === 'connecting'
                        ? 'bg-amber-500'
                        : streamingStates[selectedModelId]?.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-slate-300'
                    }`} />
                    <span className="capitalize">{streamingStates[selectedModelId]?.status || 'ready'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableModels.filter(model => model.enabled).map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center space-x-3 w-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                  {getProviderIcon(model.provider)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{model.name}</span>
                  {selectedModelId === model.id && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                  {streamingStates[model.id]?.isStreaming && (
                    <Zap className="h-3 w-3 text-blue-500 animate-pulse" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    {model.provider}
                  </Badge>
                  <span>{model.description}</span>
                </div>
                <div className={`flex items-center space-x-1 text-xs mt-1 ${getStatusColor(model.id)}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    streamingStates[model.id]?.status === 'connected' ||
                    streamingStates[model.id]?.status === 'generating'
                      ? 'bg-emerald-500'
                      : streamingStates[model.id]?.status === 'connecting'
                      ? 'bg-amber-500'
                      : streamingStates[model.id]?.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-slate-300'
                  }`} />
                  <span className="capitalize">{streamingStates[model.id]?.status || 'ready'}</span>
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
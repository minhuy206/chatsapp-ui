import React from 'react';
import type { AIModel } from '@/types/chat.types';
import { Check, Settings, Zap, Brain, Clock } from 'lucide-react';

interface ModelCardProps {
  model: AIModel;
  isSelected: boolean;
  canToggle: boolean;
  onToggle: () => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isSelected,
  canToggle,
  onToggle,
}) => {
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      case 'google':
        return '🔍';
      default:
        return '⚡';
    }
  };

  const getModelCapabilities = (modelId: string) => {
    // This would typically come from the model configuration or API
    switch (modelId) {
      case 'gpt-4o':
        return {
          speed: 'Fast',
          reasoning: 'Excellent',
          creativity: 'High',
        };
      case 'claude-3.5-sonnet':
        return {
          speed: 'Medium',
          reasoning: 'Excellent',
          creativity: 'High',
        };
      case 'gemini-pro':
        return {
          speed: 'Fast',
          reasoning: 'Good',
          creativity: 'Medium',
        };
      default:
        return {
          speed: 'Unknown',
          reasoning: 'Unknown',
          creativity: 'Unknown',
        };
    }
  };

  const capabilities = getModelCapabilities(model.id);

  return (
    <div
      className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-white dark:bg-gray-800 ring-2 ring-blue-500 ring-opacity-20 shadow-sm'
          : canToggle
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
      }`}
      onClick={onToggle}
    >
      {/* Selection Indicator */}
      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-500'
          : 'border-gray-300 dark:border-gray-600'
      }`}>
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>

      {/* Model Header */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="text-2xl">{getProviderIcon(model.provider)}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {model.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {model.provider}
          </p>
        </div>
      </div>

      {/* Model Description */}
      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
        {model.description}
      </p>

      {/* Capabilities */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="h-3 w-3 text-gray-400" />
          </div>
          <div className="text-xs">
            <div className="font-medium text-gray-900 dark:text-white">Speed</div>
            <div className="text-gray-500 dark:text-gray-400">{capabilities.speed}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Brain className="h-3 w-3 text-gray-400" />
          </div>
          <div className="text-xs">
            <div className="font-medium text-gray-900 dark:text-white">Reasoning</div>
            <div className="text-gray-500 dark:text-gray-400">{capabilities.reasoning}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-3 w-3 text-gray-400" />
          </div>
          <div className="text-xs">
            <div className="font-medium text-gray-900 dark:text-white">Creative</div>
            <div className="text-gray-500 dark:text-gray-400">{capabilities.creativity}</div>
          </div>
        </div>
      </div>

      {/* Model Configuration */}
      {model.config && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Temp: {model.config.temperature || 0.7}</span>
          <span>Max: {model.config.maxTokens || 4000}</span>
          <button
            className="p-1 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open model settings
            }}
            title="Configure model"
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>
      )}

      {!canToggle && !isSelected && (
        <div className="absolute inset-0 rounded-lg bg-gray-500 bg-opacity-10 pointer-events-none" />
      )}
    </div>
  );
};
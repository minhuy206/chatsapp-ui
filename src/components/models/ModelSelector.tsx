import React from 'react';
import type { ModelSelectorProps } from '@/types/chat.types';
import { ModelCard } from './ModelCard';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  availableModels,
  selectedModels,
  onModelToggle,
  maxModels = 3,
}) => {
  const enabledModels = availableModels.filter(model => model.enabled);
  const selectedCount = selectedModels.length;
  const isMaxReached = selectedCount >= maxModels;

  return (
    <div className="space-y-3">
      {/* Selection Status */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          {selectedCount} of {maxModels} models selected
        </span>

        {selectedCount > 0 && (
          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ready to chat</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${
            selectedCount === 0
              ? 'bg-gray-300 dark:bg-gray-600'
              : selectedCount < maxModels
              ? 'bg-blue-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${(selectedCount / maxModels) * 100}%` }}
        />
      </div>

      {/* Model List */}
      <div className="space-y-2">
        {enabledModels.length === 0 ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No models available
            </p>
          </div>
        ) : (
          enabledModels.map((model) => {
            const isSelected = selectedModels.includes(model.id);
            const canToggle = isSelected || !isMaxReached;

            return (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={isSelected}
                canToggle={canToggle}
                onToggle={() => canToggle && onModelToggle(model.id)}
              />
            );
          })
        )}
      </div>

      {/* Max Models Warning */}
      {isMaxReached && (
        <div className="flex items-start space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-700 dark:text-amber-300">
            <p className="font-medium">Maximum models selected</p>
            <p>You can compare up to {maxModels} models at once. Deselect a model to choose a different one.</p>
          </div>
        </div>
      )}

      {/* Selection Info */}
      {selectedCount > 1 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          💡 You can compare responses from {selectedCount} models side by side
        </div>
      )}
    </div>
  );
};
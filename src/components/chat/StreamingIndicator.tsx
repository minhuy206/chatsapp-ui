import React from 'react';
import type { StreamingIndicatorProps } from '@/types/chat.types';
import {
  Wifi,
  WifiOff,
  Loader2,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  status,
  model,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          color: 'text-gray-500 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          animate: false,
        };

      case 'connecting':
        return {
          icon: Loader2,
          text: 'Connecting...',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          animate: true,
        };

      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          animate: false,
        };

      case 'generating':
        return {
          icon: Zap,
          text: 'Generating response...',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          animate: true,
        };

      case 'complete':
        return {
          icon: CheckCircle,
          text: 'Complete',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          animate: false,
        };

      case 'error':
        return {
          icon: XCircle,
          text: 'Error',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          animate: false,
        };

      default:
        return {
          icon: AlertCircle,
          text: 'Unknown status',
          color: 'text-gray-500 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${config.bgColor} ${className}`}>
      <Icon
        className={`h-4 w-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`}
      />

      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>

        {model && (
          <>
            <span className={`text-sm ${config.color} opacity-60`}>•</span>
            <span className={`text-sm ${config.color} opacity-80`}>
              {model}
            </span>
          </>
        )}
      </div>

      {/* Pulse animation for active states */}
      {(status === 'generating' || status === 'connecting') && (
        <div className="ml-auto">
          <div className={`w-2 h-2 rounded-full ${
            status === 'generating' ? 'bg-blue-500' : 'bg-yellow-500'
          } animate-pulse`} />
        </div>
      )}
    </div>
  );
};
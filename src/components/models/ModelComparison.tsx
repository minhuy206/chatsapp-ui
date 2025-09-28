import React from 'react';
import { useChatStore, useActiveConversation } from '@/stores/chat.store';
import { BarChart3, Clock, Zap, TrendingUp, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

export const ModelComparison: React.FC = () => {
  const { selectedModels, availableModels } = useChatStore();
  const conversation = useActiveConversation();

  const selectedModelData = availableModels.filter(model =>
    selectedModels.includes(model.id)
  );

  if (!conversation || selectedModelData.length < 2) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Model Comparison</h3>
        <p>Select 2 or more models to see comparison metrics</p>
      </div>
    );
  }

  const getModelMetrics = (modelId: string) => {
    const modelMessages = conversation.messages.filter(msg => msg.model === modelId);
    const userMessages = conversation.messages.filter(msg => msg.role === 'user');

    if (modelMessages.length === 0 || userMessages.length === 0) {
      return {
        responseCount: 0,
        avgResponseTime: 0,
        avgResponseLength: 0,
        responsiveness: 0,
      };
    }

    const avgResponseLength = modelMessages.reduce((sum, msg) => sum + msg.content.length, 0) / modelMessages.length;

    // Calculate average response time (simulated for demo)
    const avgResponseTime = Math.random() * 3000 + 1000; // 1-4 seconds

    // Responsiveness score based on response length and frequency
    const responsiveness = Math.min(100, (modelMessages.length / userMessages.length) * 100);

    return {
      responseCount: modelMessages.length,
      avgResponseTime,
      avgResponseLength: Math.round(avgResponseLength),
      responsiveness: Math.round(responsiveness),
    };
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Model Performance Comparison
        </h3>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedModelData.map((model) => {
          const metrics = getModelMetrics(model.id);

          return (
            <div
              key={model.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              {/* Model Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">
                    {model.provider === 'OpenAI' ? '🤖' :
                     model.provider === 'Anthropic' ? '🧠' : '🔍'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{model.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{model.provider}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                {/* Response Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Copy className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Responses</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.responseCount}
                  </span>
                </div>

                {/* Average Response Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg Time</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTime(metrics.avgResponseTime)}
                  </span>
                </div>

                {/* Average Response Length */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg Length</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.avgResponseLength} chars
                  </span>
                </div>

                {/* Responsiveness Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Responsive</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.responsiveness}%
                  </span>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Performance Score</span>
                  <span>{metrics.responsiveness}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.responsiveness}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded transition-colors"
                  title="Rate positively"
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>Good</span>
                </button>

                <button
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Rate negatively"
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span>Poor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {conversation.messages.filter(m => m.role === 'user').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Questions Asked</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {conversation.messages.filter(m => m.role === 'assistant').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Responses</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {selectedModels.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Models Active</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatTime(Date.now() - new Date(conversation.createdAt).getTime())}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Session Duration</div>
          </div>
        </div>
      </div>
    </div>
  );
};
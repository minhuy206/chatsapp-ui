import React from 'react';
import { ModernSidebar } from './ModernSidebar';
import { ModernChatInterface } from '@/components/chat/ModernChatInterface';

export const ChatLayout: React.FC = () => {
  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Modern Sidebar */}
      <div className="flex-shrink-0">
        <ModernSidebar />
      </div>

      {/* Modern Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ModernChatInterface />
      </div>
    </div>
  );
};
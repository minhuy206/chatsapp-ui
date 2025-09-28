import { createFileRoute } from '@tanstack/react-router';
import { ChatLayout } from '@/components/layout/ChatLayout';

export const Route = createFileRoute('/chat')({
  component: Chat,
});

function Chat() {
  return <ChatLayout />;
}
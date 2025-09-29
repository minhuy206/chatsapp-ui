import { createFileRoute } from '@tanstack/react-router';
import { ChatLayout } from '@/components/layout/ChatLayout';
import { ResponsiveWrapper } from '@/components/layout/ResponsiveWrapper';

export const Route = createFileRoute('/chat')({
  component: Chat,
});

function Chat() {
  return (
    <ResponsiveWrapper fullHeight maxWidth="full">
      <ChatLayout />
    </ResponsiveWrapper>
  );
}
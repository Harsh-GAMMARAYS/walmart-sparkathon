import { Navbar } from '@/components/Navbar';
import { ChatInterface } from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ChatInterface />
      </main>
    </>
  );
} 
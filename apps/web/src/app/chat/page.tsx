'use client';

import { Navbar } from '@/components/Navbar';
import { ChatInterface } from '@/components/ChatInterface';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ChatInterface initialQuery={query || undefined} />
      </main>
    </>
  );
} 
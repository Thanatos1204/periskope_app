'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ChatProvider } from '@/lib/chat-context';
import Sidebar from './sidebar';
import ChatList from './chat-list';
import ChatView from './chat-view';
import { initIndexedDB } from '@/lib/indexeddb';
import DebugPanel from './debug-panel';

export default function ChatLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Initialize IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        await initIndexedDB();
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };

    init();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <ChatList />
        <ChatView />
      </div>
      <DebugPanel />
    </ChatProvider>
  );
}